# Strategy SDK

MassifX strategies are plugins. Internal and third-party strategies use the same runtime contract so they can be registered, tested, audited, selected by agents, and gated by risk controls.

## Package

`@massifx/sdk`

## Strategy Plugin Contract

A strategy plugin exports:

- `manifest`: stable metadata, semantic version, parameters, tags, author, and risk disclosure
- `evaluate(context)`: deterministic strategy evaluation returning a `StrategyDecision`

```ts
import type { StrategyPlugin } from "@massifx/sdk";

export const myStrategy: StrategyPlugin = {
  manifest: {
    id: "my-strategy",
    name: "My Strategy",
    version: "1.0.0",
    description: "Explains what market behavior this strategy tries to exploit.",
    author: "Your Team",
    riskDisclosure: "Research and paper trading only. This strategy can lose money.",
    tags: ["trend"],
    parameters: []
  },
  evaluate(context) {
    return {
      strategy: "My Strategy",
      signal: "hold",
      confidence: 0.3,
      riskScore: 0.2,
      suggestedPositionSize: 0,
      stopLossPct: 0.03,
      explanation: "No edge detected."
    };
  }
};
```

## Registration

```ts
import { StrategyPluginRegistry } from "@massifx/sdk";
import { myStrategy } from "./my-strategy";

const registry = new StrategyPluginRegistry().register(myStrategy);
```

The registry validates manifests before accepting plugins. Duplicate plugin IDs are rejected.

## Current Built-Ins

- `moving-average-trend`
- `mean-reversion`
- `breakout`
- `volatility-regime`
- `community-rsi-reversion` example plugin

## Safety

Strategy plugins cannot execute trades directly. They only produce a structured decision. The MassifX risk engine remains the final gate before paper execution and any future live execution.
