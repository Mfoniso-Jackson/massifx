import { produceAgentDecision } from "@massifx/agents";
import { DemoMarketDataProvider } from "@massifx/data";
import { NextResponse } from "next/server";
import { persistAgentDecision } from "@/lib/persistence";

export async function GET() {
  const candles = await new DemoMarketDataProvider().getCandles("BTCUSDT", "1h", 180);
  const decision = await produceAgentDecision({ symbol: "BTCUSDT", candles, portfolioValue: 125_430 });
  const persistence = await persistAgentDecision(decision);
  return NextResponse.json({ ...decision, persistence });
}
