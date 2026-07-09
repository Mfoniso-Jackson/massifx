import { produceAgentDecision } from "@massifx/agents";
import { generateDemoCandles, runBacktest, trendFollowingStrategy } from "@massifx/core";
import { ensureDemoAccount } from "./demo";
import { prisma } from "./index";
import { recordBacktestRun, recordDecisionAudit } from "./ledger";

async function main() {
  const { user, portfolio } = await ensureDemoAccount();
  const candles = generateDemoCandles();
  const agentDecision = produceAgentDecision({ symbol: "BTCUSDT", candles, portfolioValue: Number(portfolio.balance) });
  await recordDecisionAudit({ decision: agentDecision, userId: user.id, portfolioId: portfolio.id });

  const backtest = runBacktest({
    symbol: "BTCUSDT",
    candles,
    strategy: trendFollowingStrategy,
    initialBalance: 100000
  });
  await recordBacktestRun({
    symbol: "BTCUSDT",
    strategy: trendFollowingStrategy.name,
    initialBalance: 100000,
    result: backtest,
    userId: user.id,
    portfolioId: portfolio.id
  });

  console.log(`Seeded MassifX demo account ${user.email} with portfolio ${portfolio.id}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
