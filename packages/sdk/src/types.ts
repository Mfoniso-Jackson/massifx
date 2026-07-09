import type { Candle, RiskState, StrategyContext, StrategyDecision } from "@massifx/core";

export type StrategyParameterType = "number" | "string" | "boolean" | "select";

export interface StrategyParameterDefinition {
  key: string;
  label: string;
  type: StrategyParameterType;
  required?: boolean;
  defaultValue?: number | string | boolean;
  min?: number;
  max?: number;
  options?: string[];
  description?: string;
}

export interface StrategyPluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  riskDisclosure: string;
  tags: string[];
  parameters: StrategyParameterDefinition[];
}

export interface StrategyExecutionContext extends StrategyContext {
  parameters: Record<string, number | string | boolean>;
}

export interface StrategyPlugin {
  manifest: StrategyPluginManifest;
  evaluate(context: StrategyExecutionContext): StrategyDecision | Promise<StrategyDecision>;
}

export interface PluginValidationIssue {
  field: string;
  message: string;
}

export interface StrategyRegistryEntry {
  manifest: StrategyPluginManifest;
  plugin: StrategyPlugin;
}

export interface AgentPluginContext {
  symbol: string;
  candles: Candle[];
  portfolioValue: number;
  riskState?: Partial<RiskState>;
  strategyRegistry: StrategyRegistryEntry[];
}

export interface AgentPluginDecision {
  selectedStrategyId: string;
  reasoning: string;
  refusalReason?: string;
}

export interface AgentPluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  capabilities: Array<"regime_detection" | "strategy_selection" | "risk_explanation" | "research">;
}

export interface AgentPlugin {
  manifest: AgentPluginManifest;
  decide(context: AgentPluginContext): AgentPluginDecision | Promise<AgentPluginDecision>;
}
