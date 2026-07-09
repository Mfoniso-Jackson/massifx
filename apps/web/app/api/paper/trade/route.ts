import { produceAgentDecision } from "@massifx/agents";
import { generateDemoCandles, simulatePaperTrade } from "@massifx/core";
import { NextResponse } from "next/server";

export async function POST() {
  const candles = generateDemoCandles();
  const price = candles.at(-1)?.close ?? 67_000;
  const decision = produceAgentDecision({ symbol: "BTCUSDT", candles, portfolioValue: 125_430 });
  return NextResponse.json(simulatePaperTrade({
    account: { balance: 50_000, openPositions: [], trades: [] },
    symbol: "BTCUSDT",
    price,
    decision: decision.decision,
    riskState: {
      portfolioValue: 125_430,
      dailyPnlPct: -0.004,
      openPositions: 1,
      volatilityScore: decision.decision.riskScore
    }
  }));
}
