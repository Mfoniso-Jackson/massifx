import Link from "next/link";
import { ArrowRight, Bot, ChartCandlestick, LockKeyhole, ShieldCheck } from "lucide-react";
import { SignInPanel } from "@/components/SignInPanel";

const features = [
  "Modular strategy engine",
  "Structured AI agent decisions",
  "Backtesting and equity curves",
  "Risk-first paper execution",
  "Binance-compatible data abstraction",
  "Investor demo mode"
];

export default function Home() {
  return (
    <main className="min-h-screen bg-ink">
      <section className="relative min-h-[92vh] overflow-hidden border-b border-white/10 px-6 py-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(53,224,161,.18),transparent_36%),linear-gradient(145deg,#071013_0%,#10191c_48%,#1d2528_100%)]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-14">
          <nav className="flex items-center justify-between">
            <div className="text-xl font-bold tracking-wide">MassifX</div>
            <Link className="rounded-md border border-white/15 px-4 py-2 text-sm text-ice hover:border-mint" href="/dashboard">
              Dashboard
            </Link>
          </nav>
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.75fr]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-mint/30 bg-mint/10 px-3 py-1 text-sm text-mint">
                <ShieldCheck size={15} />
                Paper trading only in v1
              </div>
              <h1 className="max-w-4xl text-5xl font-semibold leading-tight text-white md:text-7xl">
                MassifX
              </h1>
              <p className="mt-5 max-w-2xl text-xl leading-8 text-ice/86">
                AI quant infrastructure for crypto traders, funds, and autonomous trading agents.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link className="inline-flex items-center gap-2 rounded-md bg-mint px-5 py-3 font-semibold text-ink hover:bg-ice" href="/dashboard">
                  Launch demo <ArrowRight size={18} />
                </Link>
                <a className="rounded-md border border-white/15 px-5 py-3 font-semibold text-ice hover:border-mint" href="#waitlist">
                  Join waitlist
                </a>
              </div>
            </div>
            <div className="metric-card shadow-glow">
              <div className="border-b border-white/10 p-5">
                <p className="text-xs uppercase text-ice/50">MassifX Sentinel</p>
                <h2 className="mt-2 text-2xl font-semibold">Risk gate active</h2>
              </div>
              <div className="grid gap-3 p-5 text-sm">
                {["Regime: trending", "Decision: buy BTCUSDT", "Risk: approved with cap", "Execution: simulated paper order"].map((item) => (
                  <div className="flex items-center justify-between rounded-md bg-white/5 px-3 py-3" key={item}>
                    <span>{item}</span>
                    <span className="h-2 w-2 rounded-full bg-mint" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid gap-4 pb-6 md:grid-cols-3">
            <div className="metric-card p-5"><ChartCandlestick className="mb-4 text-mint" /><h3 className="font-semibold">Market intelligence</h3><p className="mt-2 text-sm text-ice/65">Strategy signals, volatility regimes, and portfolio exposure in one operator view.</p></div>
            <div className="metric-card p-5"><Bot className="mb-4 text-mint" /><h3 className="font-semibold">Agent decisions</h3><p className="mt-2 text-sm text-ice/65">Structured JSON decisions with confidence, risk score, sizing, and explanation.</p></div>
            <div className="metric-card p-5"><LockKeyhole className="mb-4 text-mint" /><h3 className="font-semibold">Execution boundary</h3><p className="mt-2 text-sm text-ice/65">No live trading in v1. Every order path is simulated and risk-gated.</p></div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold">The Problem</h2>
          <p className="mt-4 text-ice/70">Crypto traders stitch together alerts, spreadsheets, dashboards, and exchange screens. That makes strategy research hard to reproduce and risk controls easy to bypass.</p>
        </div>
        <div>
          <h2 className="text-3xl font-semibold">The Solution</h2>
          <p className="mt-4 text-ice/70">MassifX turns strategies, agents, backtests, paper execution, and risk controls into one modular infrastructure layer built for professional workflows.</p>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03] px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-semibold">Core Features</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => <div className="metric-card p-4 text-ice/80" key={feature}>{feature}</div>)}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1fr_0.75fr]">
        <div>
          <h2 className="text-3xl font-semibold">Risk-First Trading Philosophy</h2>
          <p className="mt-4 text-ice/70">Strategies may suggest trades, but the independent risk engine decides whether exposure is allowed. V1 enforces max risk per trade, max daily drawdown, max open positions, stop-loss requirements, and volatility refusal rules.</p>
          <h2 className="mt-12 text-3xl font-semibold">Roadmap</h2>
          <p className="mt-4 text-ice/70">MassifX is designed to grow into institutional dashboards, live execution controls, strategy and agent marketplaces, staking-based access, and decentralized AI trading networks.</p>
        </div>
        <div id="waitlist">
          <h2 className="mb-4 text-3xl font-semibold">Waitlist / Demo Signup</h2>
          <SignInPanel />
        </div>
      </section>
    </main>
  );
}
