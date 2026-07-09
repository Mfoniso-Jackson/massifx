# Agent Framework

MassifX agents are explainable strategy selectors. They read market context, inspect the registered strategy plugins, select a strategy, and explain the selection. Risk approval remains separate.

## Default Agent

`MassifX Sentinel` detects the current market regime and selects one registered strategy plugin:

- high volatility: `volatility-regime`
- breakout: `breakout`
- trending: `moving-average-trend`
- mean reverting: `mean-reversion`

The agent produces:

- selected strategy ID
- selected strategy name
- market regime
- strategy decision
- risk result
- refusal state
- rationale
- agent reasoning

## Custom Agent Selector

```ts
import { createAgentRuntime } from "@massifx/agents";

const runtime = createAgentRuntime({
  selector: {
    manifest: {
      id: "my-agent",
      name: "My Agent",
      version: "1.0.0",
      description: "Selects strategies from a custom policy.",
      author: "Your Team",
      capabilities: ["strategy_selection", "risk_explanation"]
    },
    decide() {
      return {
        selectedStrategyId: "moving-average-trend",
        reasoning: "Trend conditions are dominant."
      };
    }
  }
});
```

## Execution Boundary

Agents cannot bypass risk controls. Even if an agent selects a strategy with a `buy` or `sell` signal, execution remains paper-only in v1 and must pass the independent risk engine.
