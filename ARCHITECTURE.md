# Architecture

MassifX is organized as a pnpm monorepo.

- `apps/web`: Next.js app, landing page, dashboard, auth, and API routes
- `packages/core`: strategy interfaces, risk engine, backtester, paper trading simulator
- `packages/agents`: structured agent decision service
- `packages/data`: exchange/data provider abstraction and Binance-compatible adapter
- `packages/db`: Prisma schema and database client
- `docs`: product, architecture, and security notes

## Request Flow

1. The dashboard requests demo market data and strategy status.
2. API routes call the agent package with OHLCV candles.
3. The agent detects regime, selects a strategy, and emits a structured JSON decision.
4. The risk engine evaluates the decision independently.
5. Agent decisions are written to the decision audit ledger when Postgres is available.
6. Paper trading can simulate execution only when risk approves the trade.
7. Backtests run against supplied OHLCV arrays and return metrics, trades, and equity curve.
8. Backtest runs, trades, and equity points are persisted for the demo portfolio when Postgres is available.

## Persistence Model

The Prisma schema stores users, demo portfolios, paper trades, decision audits, backtest runs, backtest trades, and equity curve points. The web app calls persistence through a small server-side wrapper that degrades to demo-only mode if the database is unavailable.

## Execution Boundary

No live exchange orders exist in v1. Any future live adapter must pass through explicit environment gates, key management, audit logs, and risk controls.
