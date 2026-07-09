import { Prisma } from "@prisma/client";
import type { AgentDecision } from "@massifx/agents";
import type { BacktestResult, Trade } from "@massifx/core";
import { prisma, type DbClient } from "./index";

export async function recordDecisionAudit(params: {
  decision: AgentDecision;
  userId?: string;
  portfolioId?: string;
  client?: DbClient;
}) {
  const client = params.client ?? prisma;
  const { decision } = params;
  return client.decisionAudit.create({
    data: {
      userId: params.userId,
      portfolioId: params.portfolioId,
      symbol: decision.symbol,
      agent: decision.agent,
      regime: decision.regime,
      strategy: decision.selectedStrategy,
      signal: decision.decision.signal,
      confidence: decision.decision.confidence,
      riskScore: decision.decision.riskScore,
      suggestedSize: new Prisma.Decimal(decision.decision.suggestedPositionSize),
      stopLossPct: decision.decision.stopLossPct,
      riskApproved: decision.risk.approved,
      refused: decision.refused,
      riskReasons: decision.risk.reasons,
      rationale: decision.rationale,
      decisionJson: decision as unknown as Prisma.InputJsonValue
    }
  });
}

export async function recordBacktestRun(params: {
  symbol: string;
  strategy: string;
  initialBalance: number;
  result: BacktestResult;
  userId?: string;
  portfolioId?: string;
  client?: DbClient;
}) {
  const client = params.client ?? prisma;
  return client.$transaction(async (tx) => {
    const run = await tx.backtestRun.create({
      data: {
        userId: params.userId,
        portfolioId: params.portfolioId,
        symbol: params.symbol,
        strategy: params.strategy,
        initialBalance: new Prisma.Decimal(params.initialBalance),
        totalReturn: params.result.totalReturn,
        maxDrawdown: params.result.maxDrawdown,
        sharpeRatio: params.result.sharpeRatio,
        winRate: params.result.winRate,
        tradeCount: params.result.trades.length
      }
    });

    if (params.result.equityCurve.length > 0) {
      await tx.backtestEquityPoint.createMany({
        data: params.result.equityCurve.map((point) => ({
          backtestId: run.id,
          timestamp: new Date(point.timestamp),
          equity: new Prisma.Decimal(point.equity)
        }))
      });
    }

    const tradeRows = params.result.trades.map((trade) => toBacktestTrade(run.id, trade));
    if (tradeRows.length > 0) await tx.backtestTrade.createMany({ data: tradeRows });

    return tx.backtestRun.findUniqueOrThrow({
      where: { id: run.id },
      include: {
        equityCurve: { orderBy: { timestamp: "asc" } },
        trades: true
      }
    });
  });
}

export async function getDemoLedgerSnapshot(params: {
  portfolioId: string;
  client?: DbClient;
}) {
  const client = params.client ?? prisma;
  const [portfolio, decisionAudits, backtestRuns] = await Promise.all([
    client.portfolio.findUnique({
      where: { id: params.portfolioId },
      include: {
        trades: { orderBy: { openedAt: "desc" } }
      }
    }),
    client.decisionAudit.findMany({
      where: { portfolioId: params.portfolioId },
      orderBy: { createdAt: "desc" },
      take: 6
    }),
    client.backtestRun.findMany({
      where: { portfolioId: params.portfolioId },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        equityCurve: { orderBy: { timestamp: "asc" } },
        trades: true
      }
    })
  ]);

  return { portfolio, decisionAudits, backtestRuns };
}

function toBacktestTrade(backtestId: string, trade: Trade) {
  return {
    backtestId,
    symbol: trade.symbol,
    side: trade.side,
    quantity: new Prisma.Decimal(trade.quantity),
    entryPrice: new Prisma.Decimal(trade.entryPrice),
    exitPrice: trade.exitPrice === undefined ? null : new Prisma.Decimal(trade.exitPrice),
    pnl: trade.pnl === undefined ? null : new Prisma.Decimal(trade.pnl),
    openedAt: new Date(trade.openedAt),
    closedAt: trade.closedAt === undefined ? null : new Date(trade.closedAt),
    strategy: trade.strategy
  };
}
