import {
  breakoutStrategy,
  meanReversionStrategy,
  strategies,
  trendFollowingStrategy,
  volatilityRegimeStrategy
} from "@massifx/core";
import type { Strategy } from "@massifx/core";
import { StrategyPluginRegistry } from "./registry";
import type { StrategyPlugin } from "./types";

export function createStrategyPlugin(params: {
  id: string;
  description: string;
  tags: string[];
  strategy: Strategy;
}): StrategyPlugin {
  return {
    manifest: {
      id: params.id,
      name: params.strategy.name,
      version: "1.0.0",
      description: params.description,
      author: "MassifX",
      riskDisclosure: "This strategy is for research and paper trading only. It can lose money and must pass MassifX risk controls.",
      tags: params.tags,
      parameters: []
    },
    evaluate(context) {
      return params.strategy.evaluate(context);
    }
  };
}

export const builtInStrategyPlugins = [
  createStrategyPlugin({
    id: "moving-average-trend",
    strategy: trendFollowingStrategy,
    description: "Detects directional momentum using fast and slow moving averages.",
    tags: ["trend", "momentum", "built-in"]
  }),
  createStrategyPlugin({
    id: "mean-reversion",
    strategy: meanReversionStrategy,
    description: "Looks for stretched prices that may revert toward a recent mean.",
    tags: ["mean-reversion", "statistical", "built-in"]
  }),
  createStrategyPlugin({
    id: "breakout",
    strategy: breakoutStrategy,
    description: "Identifies closes outside the recent high/low range.",
    tags: ["breakout", "range", "built-in"]
  }),
  createStrategyPlugin({
    id: "volatility-regime",
    strategy: volatilityRegimeStrategy,
    description: "Classifies volatility and refuses exposure in elevated-risk regimes.",
    tags: ["risk", "volatility", "built-in"]
  })
];

export function createDefaultStrategyRegistry() {
  return new StrategyPluginRegistry().registerMany(builtInStrategyPlugins);
}

export const builtInStrategyNames = strategies.map((strategy) => strategy.name);
