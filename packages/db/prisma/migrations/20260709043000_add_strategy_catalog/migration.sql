CREATE TABLE "StrategyCatalogEntry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "riskDisclosure" TEXT NOT NULL,
    "tags" JSONB NOT NULL,
    "parameters" JSONB NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StrategyCatalogEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PortfolioStrategy" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "parameters" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioStrategy_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PortfolioStrategy_portfolioId_strategyId_key" ON "PortfolioStrategy"("portfolioId", "strategyId");

ALTER TABLE "PortfolioStrategy" ADD CONSTRAINT "PortfolioStrategy_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PortfolioStrategy" ADD CONSTRAINT "PortfolioStrategy_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "StrategyCatalogEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
