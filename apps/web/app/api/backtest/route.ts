import { generateDemoCandles, runBacktest, trendFollowingStrategy } from "@massifx/core";
import { NextResponse } from "next/server";
import { persistBacktest } from "@/lib/persistence";

export async function GET() {
  const result = runBacktest({
    symbol: "BTCUSDT",
    candles: generateDemoCandles(),
    strategy: trendFollowingStrategy,
    initialBalance: 100_000
  });
  const persistence = await persistBacktest(result);
  return NextResponse.json({ ...result, persistence });
}
