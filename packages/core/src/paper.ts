import { evaluateRisk } from "./risk";
import type { RiskState, StrategyDecision, Trade } from "./types";

export interface PaperAccount {
  balance: number;
  openPositions: Trade[];
  trades: Trade[];
}

export function simulatePaperTrade(params: {
  account: PaperAccount;
  symbol: string;
  price: number;
  decision: StrategyDecision;
  riskState: RiskState;
}): { account: PaperAccount; executed: boolean; message: string } {
  const risk = evaluateRisk(params.decision, params.riskState);
  if (!risk.approved || params.decision.signal === "hold") {
    return { account: params.account, executed: false, message: risk.reasons.join(" ") || "No executable signal." };
  }

  const allocation = Math.min(risk.cappedPositionSize, params.account.balance);
  const quantity = allocation / params.price;
  const trade: Trade = {
    id: `paper-${Date.now()}`,
    symbol: params.symbol,
    side: params.decision.signal,
    quantity,
    entryPrice: params.price,
    openedAt: Date.now(),
    strategy: params.decision.strategy
  };

  return {
    executed: true,
    message: "Paper trade simulated.",
    account: {
      balance: params.account.balance - allocation,
      openPositions: [...params.account.openPositions, trade],
      trades: [...params.account.trades, trade]
    }
  };
}
