import { clamp, sma, standardDeviation, volatilityScore } from "./math";
import type { StrategyContext, StrategyDecision } from "./types";

export interface Strategy {
  name: string;
  evaluate(context: StrategyContext): StrategyDecision;
}

const hold = (strategy: string, explanation: string): StrategyDecision => ({
  strategy,
  signal: "hold",
  confidence: 0.35,
  riskScore: 0.25,
  suggestedPositionSize: 0,
  stopLossPct: 0.03,
  explanation
});

export const trendFollowingStrategy: Strategy = {
  name: "Trend Following",
  evaluate({ candles, portfolioValue }) {
    const closes = candles.map((candle) => candle.close);
    const fast = sma(closes, 12);
    const slow = sma(closes, 36);
    if (closes.length < 36) return hold(this.name, "Insufficient candles for trend confirmation.");
    const spread = (fast - slow) / slow;
    const confidence = clamp(Math.abs(spread) * 18);
    const signal = spread > 0.004 ? "buy" : spread < -0.004 ? "sell" : "hold";
    return {
      strategy: this.name,
      signal,
      confidence,
      riskScore: volatilityScore(candles),
      suggestedPositionSize: signal === "hold" ? 0 : portfolioValue * clamp(confidence * 0.08, 0.01, 0.08),
      stopLossPct: 0.035,
      explanation: `Fast average is ${spread >= 0 ? "above" : "below"} the slow average by ${(spread * 100).toFixed(2)}%.`
    };
  }
};

export const meanReversionStrategy: Strategy = {
  name: "Mean Reversion",
  evaluate({ candles, portfolioValue }) {
    const closes = candles.map((candle) => candle.close);
    if (closes.length < 30) return hold(this.name, "Insufficient candles for mean reversion.");
    const mean = sma(closes, 30);
    const sd = standardDeviation(closes.slice(-30));
    const last = closes.at(-1) ?? mean;
    const zScore = sd === 0 ? 0 : (last - mean) / sd;
    const signal = zScore < -1.4 ? "buy" : zScore > 1.4 ? "sell" : "hold";
    const confidence = clamp(Math.abs(zScore) / 3);
    return {
      strategy: this.name,
      signal,
      confidence,
      riskScore: clamp(volatilityScore(candles) + Math.abs(zScore) * 0.08),
      suggestedPositionSize: signal === "hold" ? 0 : portfolioValue * clamp(confidence * 0.06, 0.01, 0.06),
      stopLossPct: 0.025,
      explanation: `Price is ${zScore.toFixed(2)} standard deviations from its 30-candle mean.`
    };
  }
};

export const breakoutStrategy: Strategy = {
  name: "Breakout",
  evaluate({ candles, portfolioValue }) {
    if (candles.length < 25) return hold(this.name, "Insufficient candles for breakout range.");
    const recent = candles.slice(-25, -1);
    const last = candles.at(-1)!;
    const high = Math.max(...recent.map((candle) => candle.high));
    const low = Math.min(...recent.map((candle) => candle.low));
    const upward = last.close > high;
    const downward = last.close < low;
    const signal = upward ? "buy" : downward ? "sell" : "hold";
    const range = high - low || last.close;
    const confidence = clamp(Math.abs(last.close - (upward ? high : low)) / range * 8);
    return {
      strategy: this.name,
      signal,
      confidence,
      riskScore: clamp(volatilityScore(candles) + (signal === "hold" ? 0.05 : 0.12)),
      suggestedPositionSize: signal === "hold" ? 0 : portfolioValue * clamp(confidence * 0.05, 0.01, 0.05),
      stopLossPct: 0.04,
      explanation: signal === "hold" ? "Price remains inside the recent range." : "Price closed outside the recent range."
    };
  }
};

export const volatilityRegimeStrategy: Strategy = {
  name: "Volatility Regime Detection",
  evaluate({ candles }) {
    const vol = volatilityScore(candles);
    const signal = vol > 0.72 ? "hold" : "buy";
    return {
      strategy: this.name,
      signal,
      confidence: vol > 0.72 ? 0.8 : 0.48,
      riskScore: vol,
      suggestedPositionSize: signal === "hold" ? 0 : 1_500,
      stopLossPct: 0.03,
      explanation: vol > 0.72 ? "Volatility is elevated, so the agent should avoid new exposure." : "Volatility is within the system's tradable regime."
    };
  }
};

export const strategies = [trendFollowingStrategy, meanReversionStrategy, breakoutStrategy, volatilityRegimeStrategy];
