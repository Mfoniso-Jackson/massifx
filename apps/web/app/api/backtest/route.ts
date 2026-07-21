import { generateDemoCandles, runBacktest, trendFollowingStrategy } from "@massifx/core";
import { NextResponse } from "next/server";
import { runOmniQuantBacktest } from "@/lib/omniquant_client";
import { persistBacktest } from "@/lib/persistence";

export async function GET() {
  const symbol = "BTCUSDT";
  const strategyId = "moving-average-trend";
  const initialBalance = 100_000;
  const candles = generateDemoCandles();
  const result = await runBacktestWithMigrationFallback({
    symbol,
    strategyId,
    initialBalance,
    candles
  });
  const persistence = await persistBacktest(result);
  return NextResponse.json({ ...result, persistence });
}

async function runBacktestWithMigrationFallback(params: {
  symbol: string;
  strategyId: string;
  initialBalance: number;
  candles: ReturnType<typeof generateDemoCandles>;
}) {
  try {
    return await runOmniQuantBacktest(params);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "OmniQuantAI backtest unavailable.";
    const result = runBacktest({
      symbol: params.symbol,
      candles: params.candles,
      strategy: trendFollowingStrategy,
      initialBalance: params.initialBalance
    });

    return {
      ...result,
      engine: {
        provider: "massifx-core-local-fallback",
        reason
      }
    };
  }
}
