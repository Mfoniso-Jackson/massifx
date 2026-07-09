import { produceAgentDecision } from "@massifx/agents";
import { DemoMarketDataProvider } from "@massifx/data";
import { NextResponse } from "next/server";

export async function GET() {
  const candles = await new DemoMarketDataProvider().getCandles("BTCUSDT", "1h", 180);
  return NextResponse.json(produceAgentDecision({ symbol: "BTCUSDT", candles, portfolioValue: 125_430 }));
}
