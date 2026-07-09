import { generateDemoCandles, runBacktest, trendFollowingStrategy } from "@massifx/core";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(runBacktest({
    symbol: "BTCUSDT",
    candles: generateDemoCandles(),
    strategy: trendFollowingStrategy,
    initialBalance: 100_000
  }));
}
