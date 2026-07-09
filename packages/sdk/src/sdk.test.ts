import { describe, expect, it } from "vitest";
import { generateDemoCandles } from "@massifx/core";
import { createDefaultStrategyRegistry, exampleThirdPartyStrategy, StrategyPluginRegistry, validateStrategyPlugin } from "./index";

describe("strategy SDK", () => {
  it("validates strategy plugins", () => {
    expect(validateStrategyPlugin(exampleThirdPartyStrategy)).toEqual([]);
  });

  it("registers and evaluates built-in plugins", async () => {
    const registry = createDefaultStrategyRegistry();
    const decision = await registry.evaluate("moving-average-trend", {
      symbol: "BTCUSDT",
      candles: generateDemoCandles(),
      portfolioValue: 100000,
      parameters: {}
    });
    expect(decision.strategy).toBe("Trend Following");
  });

  it("allows third-party strategies to use the same runtime contract", async () => {
    const registry = new StrategyPluginRegistry().register(exampleThirdPartyStrategy);
    const decision = await registry.evaluate("community-rsi-reversion", {
      symbol: "BTCUSDT",
      candles: generateDemoCandles(),
      portfolioValue: 100000,
      parameters: { lookback: 14, oversold: 30, overbought: 70 }
    });
    expect(decision.strategy).toBe("Community RSI Reversion");
    expect(decision.confidence).toBeGreaterThanOrEqual(0);
  });
});
