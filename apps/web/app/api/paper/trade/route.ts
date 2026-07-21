import { produceAgentDecision } from "@massifx/agents";
import { generateDemoCandles } from "@massifx/core";
import type { PaperAccount, RiskState, StrategyDecision } from "@massifx/core";
import { NextResponse } from "next/server";
import { persistAgentDecision } from "@/lib/persistence";
import { OmniQuantClientUnavailableError, runOmniQuantExecutePaperOrder, runOmniQuantPrepareOrder, runOmniQuantRiskEvaluation } from "@/lib/omniquant_client";

export async function POST() {
  const candles = generateDemoCandles();
  const price = candles.at(-1)?.close ?? 67_000;
  const decision = await produceAgentDecision({ symbol: "BTCUSDT", candles, portfolioValue: 125_430 });
  const persistence = await persistAgentDecision(decision);
  const riskState = {
    portfolioValue: 125_430,
    dailyPnlPct: -0.004,
    openPositions: 1,
    volatilityScore: decision.decision.riskScore
  };
  const account = { balance: 50_000, openPositions: [], trades: [] };

  try {
    const risk = await runOmniQuantRiskEvaluation({
      portfolioId: "demo-paper",
      symbol: "BTCUSDT",
      side: decision.decision.signal === "sell" ? "sell" : "buy",
      notional: decision.decision.suggestedPositionSize,
      leverage: 1,
      stopLoss: decision.decision.stopLossPct,
      marketDataTimestamp: new Date(candles.at(-1)?.timestamp ?? Date.now()).toISOString(),
      decision: decision.decision,
      state: riskState
    });

    if (!risk.approved || decision.decision.signal === "hold") {
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
      portfolioId: "demo-paper",
      signalId: `signal-${decision.selectedStrategyId}`,
      riskApprovalId: risk.id,
      symbol: "BTCUSDT",
      side: decision.decision.signal,
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
      orderId: preparedOrder.id,
      mode: "paper",
      account,
      preparedOrder,
      price,
      strategy: decision.decision.strategy
    });

    return NextResponse.json({
      executed: execution.status === "filled",
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
      decision: decision.decision,
      riskState
    }),
    riskSource: "local-fallback",
    persistence
  });
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
