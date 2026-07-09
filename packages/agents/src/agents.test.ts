import { describe, expect, it } from "vitest";
import { generateDemoCandles } from "@massifx/core";
import { createAgentRuntime, produceAgentDecision } from "./index";

describe("agent framework", () => {
  it("produces explainable structured decisions", async () => {
    const decision = await produceAgentDecision({
      symbol: "BTCUSDT",
      candles: generateDemoCandles(),
      portfolioValue: 100000
    });
    expect(decision.agent).toBe("MassifX Sentinel");
    expect(decision.selectedStrategyId).toBeTruthy();
    expect(decision.agentReasoning).toContain("regime");
  });

  it("allows custom selectors to choose registered strategies", async () => {
    const runtime = createAgentRuntime({
      selector: {
        manifest: {
          id: "test-selector",
          name: "Test Selector",
          version: "1.0.0",
          description: "Selects a deterministic built-in strategy for tests.",
          author: "MassifX Tests",
          capabilities: ["strategy_selection"]
        },
        decide() {
          return { selectedStrategyId: "moving-average-trend", reasoning: "Test selected trend plugin." };
        }
      }
    });
    const decision = await runtime.decide({
      symbol: "BTCUSDT",
      candles: generateDemoCandles(),
      portfolioValue: 100000
    });
    expect(decision.selectedStrategyId).toBe("moving-average-trend");
  });
});
