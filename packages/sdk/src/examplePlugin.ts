import { clamp, type StrategyDecision } from "@massifx/core";
import type { StrategyPlugin } from "./types";

export const exampleThirdPartyStrategy: StrategyPlugin = {
  manifest: {
    id: "community-rsi-reversion",
    name: "Community RSI Reversion",
    version: "1.0.0",
    description: "Example community strategy that buys oversold RSI conditions and sells overbought conditions.",
    author: "MassifX Example",
    riskDisclosure: "Example strategy only. Not investment advice and not approved for live execution.",
    tags: ["example", "rsi", "mean-reversion"],
    parameters: [
      { key: "lookback", label: "RSI lookback", type: "number", defaultValue: 14, min: 5, max: 50 },
      { key: "oversold", label: "Oversold threshold", type: "number", defaultValue: 30, min: 5, max: 45 },
      { key: "overbought", label: "Overbought threshold", type: "number", defaultValue: 70, min: 55, max: 95 }
    ]
  },
  evaluate({ candles, portfolioValue, parameters }): StrategyDecision {
    const lookback = Number(parameters.lookback ?? 14);
    const oversold = Number(parameters.oversold ?? 30);
    const overbought = Number(parameters.overbought ?? 70);
    const rsi = calculateRsi(candles.map((candle) => candle.close), lookback);
    const signal = rsi < oversold ? "buy" : rsi > overbought ? "sell" : "hold";
    const confidence = signal === "hold" ? 0.32 : clamp(Math.abs(rsi - 50) / 50);
    return {
      strategy: "Community RSI Reversion",
      signal,
      confidence,
      riskScore: clamp(confidence * 0.42),
      suggestedPositionSize: signal === "hold" ? 0 : portfolioValue * clamp(confidence * 0.035, 0.01, 0.035),
      stopLossPct: 0.025,
      explanation: `RSI is ${rsi.toFixed(1)} against ${oversold}/${overbought} thresholds.`
    };
  }
};

function calculateRsi(closes: number[], lookback: number) {
  if (closes.length < lookback + 1) return 50;
  const recent = closes.slice(-(lookback + 1));
  let gains = 0;
  let losses = 0;
  for (let index = 1; index < recent.length; index += 1) {
    const change = recent[index] - recent[index - 1];
    if (change >= 0) gains += change;
    else losses += Math.abs(change);
  }
  if (losses === 0) return 100;
  const relativeStrength = (gains / lookback) / (losses / lookback);
  return 100 - 100 / (1 + relativeStrength);
}
