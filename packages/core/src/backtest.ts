import { maxDrawdown, returns } from "./math";
import { evaluateRisk } from "./risk";
import type { Strategy } from "./strategies";
import type { BacktestResult, Candle, Trade } from "./types";

export function runBacktest(params: {
  symbol: string;
  candles: Candle[];
  strategy: Strategy;
  initialBalance?: number;
}): BacktestResult {
  const initialBalance = params.initialBalance ?? 100_000;
  let cash = initialBalance;
  let position = 0;
  let entryPrice = 0;
  const trades: Trade[] = [];
  const equityCurve: Array<{ timestamp: number; equity: number }> = [];

  for (let index = 40; index < params.candles.length; index += 1) {
    const window = params.candles.slice(0, index + 1);
    const candle = params.candles[index];
    const equity = cash + position * candle.close;
    const decision = params.strategy.evaluate({ symbol: params.symbol, candles: window, portfolioValue: equity });
    const risk = evaluateRisk(decision, {
      portfolioValue: equity,
      dailyPnlPct: 0,
      openPositions: position === 0 ? 0 : 1,
      volatilityScore: decision.riskScore
    });

    if (position === 0 && decision.signal === "buy" && risk.approved) {
      const allocation = Math.min(risk.cappedPositionSize, cash * 0.25);
      position = allocation / candle.close;
      cash -= allocation;
      entryPrice = candle.close;
      trades.push({
        id: `bt-${index}`,
        symbol: params.symbol,
        side: "buy",
        quantity: position,
        entryPrice,
        openedAt: candle.timestamp,
        strategy: decision.strategy
      });
    }

    if (position > 0 && (decision.signal === "sell" || candle.close <= entryPrice * (1 - decision.stopLossPct))) {
      const proceeds = position * candle.close;
      cash += proceeds;
      const trade = trades.at(-1);
      if (trade && trade.closedAt === undefined) {
        trade.exitPrice = candle.close;
        trade.closedAt = candle.timestamp;
        trade.pnl = (candle.close - trade.entryPrice) * trade.quantity;
      }
      position = 0;
      entryPrice = 0;
    }

    equityCurve.push({ timestamp: candle.timestamp, equity: cash + position * candle.close });
  }

  const finalEquity = equityCurve.at(-1)?.equity ?? initialBalance;
  const closedTrades = trades.filter((trade) => trade.pnl !== undefined);
  const wins = closedTrades.filter((trade) => (trade.pnl ?? 0) > 0).length;
  const equityReturns = returns(equityCurve.map((point) => ({
    timestamp: point.timestamp,
    open: point.equity,
    high: point.equity,
    low: point.equity,
    close: point.equity,
    volume: 0
  })));
  const avg = equityReturns.reduce((sum, value) => sum + value, 0) / (equityReturns.length || 1);
  const variance = equityReturns.reduce((sum, value) => sum + (value - avg) ** 2, 0) / (equityReturns.length || 1);
  const sharpeRatio = variance === 0 ? 0 : (avg / Math.sqrt(variance)) * Math.sqrt(365);

  return {
    totalReturn: (finalEquity - initialBalance) / initialBalance,
    maxDrawdown: maxDrawdown(equityCurve.map((point) => point.equity)),
    sharpeRatio,
    winRate: closedTrades.length === 0 ? 0 : wins / closedTrades.length,
    trades,
    equityCurve
  };
}
