import { describe, expect, it } from "vitest";
import { generateDemoCandles } from "./sampleData";
import { runBacktest } from "./backtest";
import { trendFollowingStrategy } from "./strategies";
import { evaluateRisk } from "./risk";

describe("MassifX core", () => {
  it("generates strategy decisions", () => {
    const decision = trendFollowingStrategy.evaluate({ symbol: "BTCUSDT", candles: generateDemoCandles(), portfolioValue: 100_000 });
    expect(decision.strategy).toBe("Trend Following");
    expect(decision.confidence).toBeGreaterThanOrEqual(0);
  });

  it("rejects excessive risk", () => {
    const risk = evaluateRisk({
      strategy: "Test",
      signal: "buy",
      confidence: 1,
      riskScore: 0.9,
      suggestedPositionSize: 100_000,
      stopLossPct: 0.2,
      explanation: "Unsafe"
    }, {
      portfolioValue: 100_000,
      dailyPnlPct: -0.04,
      openPositions: 5,
      volatilityScore: 0.9
    });
    expect(risk.approved).toBe(false);
    expect(risk.reasons.length).toBeGreaterThan(1);
  });

  it("runs a backtest", () => {
    const result = runBacktest({ symbol: "BTCUSDT", candles: generateDemoCandles(), strategy: trendFollowingStrategy });
    expect(result.equityCurve.length).toBeGreaterThan(50);
    expect(Number.isFinite(result.totalReturn)).toBe(true);
  });
});
