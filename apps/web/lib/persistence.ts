import { ensureDemoAccount, getDemoLedgerSnapshot, getStrategyMarketplace, prisma, recordBacktestRun, recordDecisionAudit, seedBuiltInStrategies, setPortfolioStrategyEnabled } from "@massifx/db";
import type { AgentDecision } from "@massifx/agents";
import type { BacktestResult } from "@massifx/core";
import { builtInStrategyPlugins } from "@massifx/sdk";

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

export async function getStrategyMarketplaceSnapshot() {
  if (!process.env.DATABASE_URL) {
    return {
      persisted: false,
      strategies: builtInStrategyPlugins.map((plugin, index) => ({
        id: plugin.manifest.id,
        name: plugin.manifest.name,
        version: plugin.manifest.version,
        description: plugin.manifest.description,
        author: plugin.manifest.author,
        riskDisclosure: plugin.manifest.riskDisclosure,
        tags: plugin.manifest.tags,
        parameters: plugin.manifest.parameters,
        source: "built_in",
        status: "approved",
        enabled: index === 0 || plugin.manifest.id === "breakout"
      }))
    };
  }

  try {
    const { portfolio } = await ensureDemoAccount();
    await seedBuiltInStrategies();
    const strategies = await getStrategyMarketplace({ portfolioId: portfolio.id });
    return {
      persisted: true,
      strategies: strategies.map((strategy) => ({
        id: strategy.id,
        name: strategy.name,
        version: strategy.version,
        description: strategy.description,
        author: strategy.author,
        riskDisclosure: strategy.riskDisclosure,
        tags: strategy.tags,
        parameters: strategy.parameters,
        source: strategy.source,
        status: strategy.status,
        enabled: Boolean(strategy.activation?.enabled)
      }))
    };
  } catch (error) {
    console.warn("Unable to load persisted strategy marketplace; using SDK fallback.", error);
    return getStrategyMarketplaceFallback();
  }
}

export async function setStrategyActivation(strategyId: string, enabled: boolean) {
  if (!process.env.DATABASE_URL) return { persisted: false, strategyId, enabled };

  try {
    const { portfolio } = await ensureDemoAccount();
    await seedBuiltInStrategies();
    await setPortfolioStrategyEnabled({ portfolioId: portfolio.id, strategyId, enabled });
    return { persisted: true, strategyId, enabled };
  } catch (error) {
    console.warn("Unable to persist strategy activation.", error);
    return { persisted: false, strategyId, enabled };
  }
}

function getStrategyMarketplaceFallback() {
  return {
    persisted: false,
    strategies: builtInStrategyPlugins.map((plugin) => ({
      id: plugin.manifest.id,
      name: plugin.manifest.name,
      version: plugin.manifest.version,
      description: plugin.manifest.description,
      author: plugin.manifest.author,
      riskDisclosure: plugin.manifest.riskDisclosure,
      tags: plugin.manifest.tags,
      parameters: plugin.manifest.parameters,
      source: "built_in",
      status: "approved",
      enabled: plugin.manifest.id === "moving-average-trend" || plugin.manifest.id === "breakout"
    }))
  };
}
