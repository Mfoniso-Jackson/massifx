# Contributing

MassifX is designed as a modular platform. Keep business logic out of UI components and prefer packages for reusable strategy, risk, agent, data, and persistence behavior.

## Local Checks

```bash
pnpm install
pnpm prisma:generate
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

## Strategy Contributions

New strategies should use the `@massifx/sdk` plugin contract. Include:

- stable plugin ID
- semantic version
- parameter schema
- risk disclosure
- deterministic tests
- clear decision explanations

No strategy may place orders or bypass risk controls.

## Security

Never commit secrets, exchange credentials, private keys, or seed phrases. Live execution is out of scope for v1.
