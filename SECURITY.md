# Security

## Current Controls

- Real trading disabled by default and by design in v1
- `.env.example` documents required variables without secrets
- Risk engine is independent from strategy logic
- Strategy plugins cannot execute trades directly
- Paper execution refuses trades rejected by risk controls
- Demo metrics are labeled simulated
- Agent decisions are stored in an append-style audit ledger when Postgres is configured
- No API keys, private keys, seed phrases, or exchange credentials are committed

## Future Requirements Before Live Trading

- KMS-backed secret storage
- Per-user exchange key encryption
- Withdrawal-disabled exchange keys only
- Formal audit log for every decision, risk result, and order event
- Immutable decision-ledger retention and tamper-evident hashing
- Manual kill switch and global trading halt
- Rate limits, abuse controls, and IP/session monitoring
- Independent security review before enabling any real execution
