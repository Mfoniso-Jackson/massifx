# MassifX

AI quant infrastructure for crypto traders, funds, and autonomous trading agents.

MassifX v1 is a production-oriented MVP for crypto trading intelligence, strategy evaluation, paper execution, and investor demos. Real-money execution is intentionally disabled.

## Stack

- Next.js, TypeScript, Tailwind, Recharts
- NextAuth credentials demo auth
- PostgreSQL schema via Prisma
- Modular packages for strategy, risk, backtesting, agent decisions, data adapters, and database utilities
- Vitest coverage for core quant logic
- Docker Compose for local Postgres and app runtime

## Local Setup

```bash
pnpm install
cp .env.example .env
pnpm prisma:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Open http://localhost:3000 and sign in with:

- Email: `demo@massifx.ai`
- Password: `massifx-demo-password`

## Useful Commands

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm db:migrate
pnpm db:seed
docker compose up --build
```

## Environment Variables

`DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` are required for a durable deployment. `BINANCE_BASE_URL` defaults to Binance public market data. `ENABLE_LIVE_TRADING` must remain `false` in v1.

## Safety Notice

MassifX v1 is paper trading only. Strategy output is educational and simulated. Do not connect live exchange credentials to this version.

## Persistence

The demo dashboard uses PostgreSQL when `DATABASE_URL` is available. `pnpm db:migrate` creates the user, portfolio, trade, decision audit, and backtest ledger tables. `pnpm db:seed` upserts the demo account, demo paper portfolio, sample paper trades, one audited agent decision, and one persisted backtest run.

If Postgres is not running, the web app falls back to in-memory demo data and clearly labels the ledger as a fallback.
