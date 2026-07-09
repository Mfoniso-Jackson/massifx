import {
  breakoutStrategy,
  evaluateRisk,
  meanReversionStrategy,
  strategies,
  trendFollowingStrategy,
  volatilityRegimeStrategy,
  volatilityScore
} from "@massifx/core";
import type { Candle, RiskResult, RiskState, StrategyDecision } from "@massifx/core";

export type MarketRegime = "trending" | "mean_reverting" | "breakout" | "high_volatility";

export interface AgentDecision {
  agent: "MassifX Sentinel";
  symbol: string;
  timestamp: string;
  regime: MarketRegime;
  selectedStrategy: string;
  decision: StrategyDecision;
  risk: RiskResult;
  refused: boolean;
  rationale: string;
}

function detectRegime(candles: Candle[]): MarketRegime {
  const closes = candles.map((candle) => candle.close);
  const last = closes.at(-1) ?? 0;
  const previous = closes.at(-24) ?? last;
  const move = previous === 0 ? 0 : Math.abs((last - previous) / previous);
  const vol = volatilityScore(candles);
  const recent = candles.slice(-25, -1);
  const rangeHigh = Math.max(...recent.map((candle) => candle.high));
  const rangeLow = Math.min(...recent.map((candle) => candle.low));

  if (vol > 0.7) return "high_volatility";
  if (last > rangeHigh || last < rangeLow) return "breakout";
  if (move > 0.035) return "trending";
  return "mean_reverting";
}

export function produceAgentDecision(params: {
  symbol: string;
  candles: Candle[];
  portfolioValue: number;
  riskState?: Partial<RiskState>;
}): AgentDecision {
  const regime = detectRegime(params.candles);
  const strategy =
    regime === "high_volatility" ? volatilityRegimeStrategy :
    regime === "breakout" ? breakoutStrategy :
    regime === "trending" ? trendFollowingStrategy :
    meanReversionStrategy;

  const decision = strategy.evaluate({
    symbol: params.symbol,
    candles: params.candles,
    portfolioValue: params.portfolioValue
  });
  const riskState: RiskState = {
    portfolioValue: params.portfolioValue,
    dailyPnlPct: params.riskState?.dailyPnlPct ?? -0.004,
    openPositions: params.riskState?.openPositions ?? 1,
    volatilityScore: params.riskState?.volatilityScore ?? decision.riskScore
  };
  const risk = evaluateRisk(decision, riskState);
  const refused = !risk.approved || decision.signal === "hold";

  return {
    agent: "MassifX Sentinel",
    symbol: params.symbol,
    timestamp: new Date().toISOString(),
    regime,
    selectedStrategy: decision.strategy,
    decision,
    risk,
    refused,
    rationale: refused
      ? `Trade refused: ${risk.reasons.join(" ") || "agent selected hold."}`
      : `Agent selected ${decision.strategy} in a ${regime} regime with ${(decision.confidence * 100).toFixed(0)}% confidence.`
  };
}

export const availableStrategies = strategies.map((strategy) => strategy.name);
