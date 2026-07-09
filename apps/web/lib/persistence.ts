import { ensureDemoAccount, getDemoLedgerSnapshot, prisma, recordBacktestRun, recordDecisionAudit } from "@massifx/db";
import type { AgentDecision } from "@massifx/agents";
import type { BacktestResult } from "@massifx/core";

export interface PersistenceContext {
  enabled: boolean;
  userId?: string;
  portfolioId?: string;
  ledger?: Awaited<ReturnType<typeof getDemoLedgerSnapshot>>;
}

export async function getPersistenceContext(): Promise<PersistenceContext> {
  if (!process.env.DATABASE_URL) return { enabled: false };

  try {
    const { user, portfolio } = await ensureDemoAccount();
    const ledger = await getDemoLedgerSnapshot({ portfolioId: portfolio.id });
    return { enabled: true, userId: user.id, portfolioId: portfolio.id, ledger };
  } catch (error) {
    console.warn("MassifX database persistence unavailable; using in-memory demo data.", error);
    return { enabled: false };
  }
}

export async function persistAgentDecision(decision: AgentDecision) {
  if (!process.env.DATABASE_URL) return { persisted: false, auditId: undefined };

  try {
    const { user, portfolio } = await ensureDemoAccount();
    const audit = await recordDecisionAudit({ decision, userId: user.id, portfolioId: portfolio.id });
    return { persisted: true, auditId: audit.id };
  } catch (error) {
    console.warn("Unable to persist MassifX decision audit.", error);
    return { persisted: false, auditId: undefined };
  }
}

export async function persistBacktest(result: BacktestResult) {
  if (!process.env.DATABASE_URL) return { persisted: false, backtestRunId: undefined };

  try {
    const { user, portfolio } = await ensureDemoAccount();
    const run = await recordBacktestRun({
      symbol: "BTCUSDT",
      strategy: "Trend Following",
      initialBalance: 100000,
      result,
      userId: user.id,
      portfolioId: portfolio.id
    });
    return { persisted: true, backtestRunId: run.id };
  } catch (error) {
    console.warn("Unable to persist MassifX backtest run.", error);
    return { persisted: false, backtestRunId: undefined };
  }
}

export async function disconnectPersistence() {
  await prisma.$disconnect();
}
