CREATE TABLE "DecisionAudit" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "portfolioId" TEXT,
    "symbol" TEXT NOT NULL,
    "agent" TEXT NOT NULL,
    "regime" TEXT NOT NULL,
    "strategy" TEXT NOT NULL,
    "signal" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "riskScore" DOUBLE PRECISION NOT NULL,
    "suggestedSize" DECIMAL(65,30) NOT NULL,
    "stopLossPct" DOUBLE PRECISION NOT NULL,
    "riskApproved" BOOLEAN NOT NULL,
    "refused" BOOLEAN NOT NULL,
    "riskReasons" JSONB NOT NULL,
    "rationale" TEXT NOT NULL,
    "decisionJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DecisionAudit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BacktestRun" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "portfolioId" TEXT,
    "symbol" TEXT NOT NULL,
    "strategy" TEXT NOT NULL,
    "initialBalance" DECIMAL(65,30) NOT NULL,
    "totalReturn" DOUBLE PRECISION NOT NULL,
    "maxDrawdown" DOUBLE PRECISION NOT NULL,
    "sharpeRatio" DOUBLE PRECISION NOT NULL,
    "winRate" DOUBLE PRECISION NOT NULL,
    "tradeCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BacktestRun_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BacktestEquityPoint" (
    "id" TEXT NOT NULL,
    "backtestId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "equity" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "BacktestEquityPoint_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BacktestTrade" (
    "id" TEXT NOT NULL,
    "backtestId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "entryPrice" DECIMAL(65,30) NOT NULL,
    "exitPrice" DECIMAL(65,30),
    "pnl" DECIMAL(65,30),
    "openedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "strategy" TEXT NOT NULL,

    CONSTRAINT "BacktestTrade_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BacktestEquityPoint_backtestId_timestamp_idx" ON "BacktestEquityPoint"("backtestId", "timestamp");

ALTER TABLE "DecisionAudit" ADD CONSTRAINT "DecisionAudit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DecisionAudit" ADD CONSTRAINT "DecisionAudit_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BacktestRun" ADD CONSTRAINT "BacktestRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BacktestRun" ADD CONSTRAINT "BacktestRun_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BacktestEquityPoint" ADD CONSTRAINT "BacktestEquityPoint_backtestId_fkey" FOREIGN KEY ("backtestId") REFERENCES "BacktestRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BacktestTrade" ADD CONSTRAINT "BacktestTrade_backtestId_fkey" FOREIGN KEY ("backtestId") REFERENCES "BacktestRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
