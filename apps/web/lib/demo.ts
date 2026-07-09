import { produceAgentDecision } from "@massifx/agents";
import { generateDemoCandles, runBacktest, simulatePaperTrade, trendFollowingStrategy } from "@massifx/core";

export function getDemoSnapshot() {
  const candles = generateDemoCandles();
  const portfolioValue = 125_430;
  const agentDecision = produceAgentDecision({ symbol: "BTCUSDT", candles, portfolioValue });
  const backtest = runBacktest({ symbol: "BTCUSDT", candles, strategy: trendFollowingStrategy, initialBalance: 100_000 });
  const paper = simulatePaperTrade({
    account: { balance: 50_000, openPositions: [], trades: [] },
    symbol: "BTCUSDT",
    price: candles.at(-1)?.close ?? 67_000,
    decision: agentDecision.decision,
    riskState: {
      portfolioValue,
      dailyPnlPct: -0.004,
      openPositions: 1,
      volatilityScore: agentDecision.decision.riskScore
    }
  });

  return {
    simulated: true,
    candles,
    portfolio: {
      value: portfolioValue,
      cash: 42_800,
      dailyPnl: 0.84,
      exposure: 0.37,
      openPositions: 2
    },
    strategies: [
      { name: "Trend Following", status: "Active", allocation: "32%", risk: "Moderate" },
      { name: "Mean Reversion", status: "Watching", allocation: "0%", risk: "Low" },
      { name: "Breakout", status: "Armed", allocation: "8%", risk: "Moderate" },
      { name: "Volatility Regime", status: "Guarding", allocation: "Risk gate", risk: "Strict" }
    ],
    signals: [
      { symbol: "BTCUSDT", signal: agentDecision.decision.signal.toUpperCase(), confidence: agentDecision.decision.confidence },
      { symbol: "ETHUSDT", signal: "HOLD", confidence: 0.58 },
      { symbol: "SOLUSDT", signal: "BUY", confidence: 0.64 }
    ],
    agentDecision,
    backtest,
    paper
  };
}
