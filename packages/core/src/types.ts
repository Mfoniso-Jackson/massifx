export type Signal = "buy" | "sell" | "hold";

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StrategyContext {
  symbol: string;
  candles: Candle[];
  portfolioValue: number;
}

export interface StrategyDecision {
  strategy: string;
  signal: Signal;
  confidence: number;
  riskScore: number;
  suggestedPositionSize: number;
  stopLossPct: number;
  explanation: string;
}

export interface RiskLimits {
  maxRiskPerTradePct: number;
  maxDailyDrawdownPct: number;
  maxOpenPositions: number;
  maxVolatilityScore: number;
  requireStopLoss: boolean;
}

export interface RiskState {
  portfolioValue: number;
  dailyPnlPct: number;
  openPositions: number;
  volatilityScore: number;
}

export interface RiskResult {
  approved: boolean;
  reasons: string[];
  cappedPositionSize: number;
}

export interface Trade {
  id: string;
  symbol: string;
  side: Exclude<Signal, "hold">;
  quantity: number;
  entryPrice: number;
  exitPrice?: number;
  pnl?: number;
  openedAt: number;
  closedAt?: number;
  strategy: string;
}

export interface BacktestResult {
  totalReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  winRate: number;
  trades: Trade[];
  equityCurve: Array<{ timestamp: number; equity: number }>;
}
