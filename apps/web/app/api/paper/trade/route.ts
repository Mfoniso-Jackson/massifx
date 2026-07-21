import { produceAgentDecision } from "@massifx/agents";
import { generateDemoCandles } from "@massifx/core";
import type { PaperAccount, RiskState, StrategyDecision } from "@massifx/core";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { persistAgentDecision } from "@/lib/persistence";
import { OmniQuantClientUnavailableError, runOmniQuantExecutePaperOrder, runOmniQuantPrepareOrder, runOmniQuantRiskEvaluation } from "@/lib/omniquant_client";

export async function POST() {
  const workflowRequestId = randomUUID();
  const candles = generateDemoCandles();
  const price = candles.at(-1)?.close ?? 67_000;
  const decision = await produceAgentDecision({ symbol: "BTCUSDT", candles, portfolioValue: 125_430, requestId: workflowRequestId });
  const executableDecision = makePaperDemoExecutableDecision(decision.decision);
  const persistence = await persistAgentDecision(decision);
  const riskState = {
    portfolioValue: 125_430,
    dailyPnlPct: -0.004,
    openPositions: 1,
    volatilityScore: executableDecision.riskScore
  };
  const account = { balance: 50_000, openPositions: [], trades: [] };

  try {
    const risk = await runOmniQuantRiskEvaluation({
      requestId: workflowRequestId,
      portfolioId: "demo-paper",
      symbol: "BTCUSDT",
      side: executableDecision.signal === "sell" ? "sell" : "buy",
      notional: executableDecision.suggestedPositionSize,
      leverage: 1,
      stopLoss: executableDecision.stopLossPct,
      marketDataTimestamp: new Date().toISOString(),
      decision: executableDecision,
      state: riskState
    });

    if (!risk.approved || executableDecision.signal === "hold") {
      return NextResponse.json({
        account,
        executed: false,
        message: risk.reasons.join(" ") || "No executable signal.",
        risk,
        riskSource: "omniquant",
        persistence
      });
    }

    const allocation = Math.min(risk.cappedPositionSize, account.balance);
    const preparedOrder = await runOmniQuantPrepareOrder({
      requestId: workflowRequestId,
      portfolioId: "demo-paper",
      signalId: `signal-${decision.selectedStrategyId}`,
      riskApprovalId: risk.id,
      symbol: "BTCUSDT",
      side: executableDecision.signal,
      type: "market",
      quantity: allocation / price,
      price,
      riskApproved: risk.approved,
      riskReasons: risk.reasons,
      mode: "paper"
    });

    if (preparedOrder.status !== "prepared") {
      return NextResponse.json({
        account,
        executed: false,
        message: preparedOrder.reasons.join(" ") || "Paper order was not prepared.",
        risk,
        preparedOrder,
        riskSource: "omniquant",
        orderSource: "omniquant",
        persistence
      });
    }

    const execution = await runOmniQuantExecutePaperOrder({
      requestId: workflowRequestId,
      orderId: preparedOrder.id,
      mode: "paper",
      account,
      preparedOrder,
      price,
      strategy: executableDecision.strategy
    });

    return NextResponse.json({
      executed: execution.status === "filled",
      workflowRequestId,
      message: execution.message,
      risk,
      preparedOrder,
      execution,
      riskSource: "omniquant",
      orderSource: "omniquant",
      executionSource: "omniquant",
      account: execution.account,
      persistence
    });
  } catch (error) {
    if (!(error instanceof OmniQuantClientUnavailableError)) throw error;
  }

  return NextResponse.json({
    ...await runLocalPaperFallback({
      account,
      price,
      decision: executableDecision,
      riskState
    }),
    workflowRequestId,
    riskSource: "local-fallback",
    persistence
  });
}

function makePaperDemoExecutableDecision(decision: StrategyDecision): StrategyDecision {
  if (decision.signal !== "hold") return decision;
  return {
    ...decision,
    signal: "buy",
    confidence: Math.max(decision.confidence, 0.51),
    suggestedPositionSize: decision.suggestedPositionSize > 0 ? decision.suggestedPositionSize : 5_000,
    stopLossPct: decision.stopLossPct > 0 ? decision.stopLossPct : 0.03,
    explanation: `${decision.explanation} Paper demo uses a guarded minimum-size buy to exercise the private execution pipeline.`
  };
}

async function runLocalPaperFallback(params: {
  account: PaperAccount;
  price: number;
  decision: StrategyDecision;
  riskState: RiskState;
}) {
  const { simulatePaperTrade } = await import("@massifx/core");
  return simulatePaperTrade({
    account: params.account,
    symbol: "BTCUSDT",
    price: params.price,
    decision: params.decision,
    riskState: params.riskState
  });
}
