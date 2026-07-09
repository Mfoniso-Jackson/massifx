import { Prisma } from "@prisma/client";
import { prisma, type DbClient } from "./index";

export const demoUserEmail = process.env.DEMO_USER_EMAIL ?? "demo@massifx.ai";
export const demoPortfolioName = "MassifX Demo Paper Portfolio";

export async function ensureDemoAccount(client: DbClient = prisma) {
  const user = await client.user.upsert({
    where: { email: demoUserEmail },
    update: { name: "MassifX Demo Operator" },
    create: {
      email: demoUserEmail,
      name: "MassifX Demo Operator"
    }
  });

  const portfolio = await client.portfolio.upsert({
    where: {
      id: "demo-paper-portfolio"
    },
    update: {
      userId: user.id,
      name: demoPortfolioName,
      balance: new Prisma.Decimal(125430)
    },
    create: {
      id: "demo-paper-portfolio",
      userId: user.id,
      name: demoPortfolioName,
      balance: new Prisma.Decimal(125430)
    }
  });

  const demoTrades = [
    { id: "demo-trade-btc-1", symbol: "BTCUSDT", side: "buy", quantity: 0.42, entryPrice: 62800, strategy: "Trend Following" },
    { id: "demo-trade-sol-1", symbol: "SOLUSDT", side: "buy", quantity: 24, entryPrice: 142, strategy: "Breakout" }
  ];

  for (const trade of demoTrades) {
    await client.trade.upsert({
      where: { id: trade.id },
      update: {
        portfolioId: portfolio.id,
        symbol: trade.symbol,
        side: trade.side,
        quantity: new Prisma.Decimal(trade.quantity),
        entryPrice: new Prisma.Decimal(trade.entryPrice),
        strategy: trade.strategy
      },
      create: {
        id: trade.id,
        portfolioId: portfolio.id,
        symbol: trade.symbol,
        side: trade.side,
        quantity: new Prisma.Decimal(trade.quantity),
        entryPrice: new Prisma.Decimal(trade.entryPrice),
        strategy: trade.strategy
      }
    });
  }

  return { user, portfolio };
}
