import type { RiskLimits, RiskResult, RiskState, StrategyDecision } from "./types";

export const defaultRiskLimits: RiskLimits = {
  maxRiskPerTradePct: 0.01,
  maxDailyDrawdownPct: 0.03,
  maxOpenPositions: 4,
  maxVolatilityScore: 0.7,
  requireStopLoss: true
};

export function evaluateRisk(
  decision: StrategyDecision,
  state: RiskState,
  limits: RiskLimits = defaultRiskLimits
): RiskResult {
  const reasons: string[] = [];
  const maxPositionRisk = state.portfolioValue * limits.maxRiskPerTradePct;
  const stopLossDistance = decision.stopLossPct || 0;
  const positionRisk = decision.suggestedPositionSize * stopLossDistance;

  if (decision.signal === "hold") reasons.push("Decision is hold; no execution required.");
  if (limits.requireStopLoss && stopLossDistance <= 0) reasons.push("Stop-loss is required.");
  if (positionRisk > maxPositionRisk) reasons.push("Suggested position exceeds max risk per trade.");
  if (Math.abs(state.dailyPnlPct) >= limits.maxDailyDrawdownPct && state.dailyPnlPct < 0) reasons.push("Daily drawdown limit reached.");
  if (state.openPositions >= limits.maxOpenPositions) reasons.push("Max open positions reached.");
  if (state.volatilityScore > limits.maxVolatilityScore || decision.riskScore > limits.maxVolatilityScore) reasons.push("Volatility/risk threshold exceeded.");

  const cappedPositionSize = stopLossDistance > 0 ? Math.min(decision.suggestedPositionSize, maxPositionRisk / stopLossDistance) : 0;
  return {
    approved: reasons.length === 0,
    reasons,
    cappedPositionSize
  };
}
