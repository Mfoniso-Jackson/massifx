import type { Candle } from "./types";

export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function sma(values: number[], period: number): number {
  if (values.length < period) return values.at(-1) ?? 0;
  return values.slice(-period).reduce((sum, value) => sum + value, 0) / period;
}

export function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export function returns(candles: Candle[]): number[] {
  return candles.slice(1).map((candle, index) => {
    const previous = candles[index].close;
    return previous === 0 ? 0 : (candle.close - previous) / previous;
  });
}

export function volatilityScore(candles: Candle[], lookback = 24): number {
  const recentReturns = returns(candles).slice(-lookback);
  return clamp(standardDeviation(recentReturns) * 100);
}

export function maxDrawdown(equity: number[]): number {
  let peak = equity[0] ?? 0;
  let worst = 0;
  for (const value of equity) {
    peak = Math.max(peak, value);
    if (peak > 0) worst = Math.min(worst, (value - peak) / peak);
  }
  return Math.abs(worst);
}
