import type { Candle } from "./types";

export function generateDemoCandles(count = 180, start = 64_000): Candle[] {
  return Array.from({ length: count }, (_, index) => {
    const trend = index * 32;
    const cycle = Math.sin(index / 8) * 950;
    const noise = Math.cos(index / 3) * 180;
    const close = start + trend + cycle + noise;
    const open = close - Math.sin(index / 5) * 130;
    return {
      timestamp: Date.now() - (count - index) * 60 * 60 * 1000,
      open,
      high: Math.max(open, close) + 220,
      low: Math.min(open, close) - 220,
      close,
      volume: 1_200 + Math.sin(index / 6) * 240
    };
  });
}
