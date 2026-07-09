import { getServerSession } from "next-auth";
import { Activity, AlertTriangle, BadgeDollarSign, BrainCircuit, ShieldCheck } from "lucide-react";
import { DashboardCharts } from "@/components/DashboardCharts";
import { SignInPanel } from "@/components/SignInPanel";
import { getDemoSnapshot } from "@/lib/demo";

export default async function Dashboard() {
  const session = await getServerSession();
  const demo = getDemoSnapshot();

  if (!session) {
    return (
      <main className="grid min-h-screen place-items-center bg-ink px-6">
        <div className="w-full max-w-md">
          <h1 className="mb-3 text-3xl font-semibold">MassifX demo login</h1>
          <p className="mb-5 text-ice/65">Use the seeded credentials to enter the simulated operator dashboard.</p>
          <SignInPanel />
        </div>
      </main>
    );
  }

  const pnl = [
    { name: "Mon", value: 820 },
    { name: "Tue", value: -240 },
    { name: "Wed", value: 1130 },
    { name: "Thu", value: 540 },
    { name: "Fri", value: 1460 }
  ];

  return (
    <main className="min-h-screen bg-ink px-6 py-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <p className="text-sm text-mint">Simulated investor demo</p>
            <h1 className="text-3xl font-semibold">MassifX command dashboard</h1>
          </div>
          <div className="rounded-md border border-mint/30 bg-mint/10 px-3 py-2 text-sm text-mint">Paper trading only</div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric icon={<BadgeDollarSign />} label="Portfolio value" value={`$${demo.portfolio.value.toLocaleString()}`} detail="+0.84% paper PnL today" />
          <Metric icon={<Activity />} label="Strategy status" value="3 active" detail="1 guard strategy enforcing risk" />
          <Metric icon={<ShieldCheck />} label="Risk exposure" value={`${Math.round(demo.portfolio.exposure * 100)}%`} detail={`${demo.portfolio.openPositions} open positions`} />
          <Metric icon={<BrainCircuit />} label="Agent decision" value={demo.agentDecision.decision.signal.toUpperCase()} detail={demo.agentDecision.selectedStrategy} />
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="metric-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Market signals</h2>
              <span className="text-xs text-ice/55">Demo data</span>
            </div>
            <div className="grid gap-3">
              {demo.signals.map((signal) => (
                <div className="flex items-center justify-between rounded-md bg-white/5 px-3 py-3" key={signal.symbol}>
                  <span className="font-medium">{signal.symbol}</span>
                  <span className="text-sm text-ice/70">{signal.signal} · {Math.round(signal.confidence * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="metric-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle className="text-amber" size={18} />
              <h2 className="font-semibold">Recent agent decision JSON</h2>
            </div>
            <pre className="max-h-72 overflow-auto rounded-md bg-black/30 p-4 text-xs leading-5 text-ice/80">{JSON.stringify(demo.agentDecision, null, 2)}</pre>
          </div>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-4">
          {demo.strategies.map((strategy) => (
            <div className="metric-card p-4" key={strategy.name}>
              <p className="text-sm text-ice/55">{strategy.status}</p>
              <h3 className="mt-2 font-semibold">{strategy.name}</h3>
              <div className="mt-4 flex items-center justify-between text-sm text-ice/70">
                <span>{strategy.allocation}</span>
                <span>{strategy.risk}</span>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-4">
          <DashboardCharts equityCurve={demo.backtest.equityCurve} pnl={pnl} />
        </section>

        <section className="mt-4 grid gap-4 md:grid-cols-4">
          <Metric label="Backtest return" value={`${(demo.backtest.totalReturn * 100).toFixed(2)}%`} detail="Trend strategy sample" />
          <Metric label="Max drawdown" value={`${(demo.backtest.maxDrawdown * 100).toFixed(2)}%`} detail="Risk metric" />
          <Metric label="Sharpe ratio" value={demo.backtest.sharpeRatio.toFixed(2)} detail="Annualized estimate" />
          <Metric label="Paper execution" value={demo.paper.executed ? "Executed" : "Refused"} detail={demo.paper.message} />
        </section>
      </div>
    </main>
  );
}

function Metric({ icon, label, value, detail }: { icon?: React.ReactNode; label: string; value: string; detail: string }) {
  return (
    <div className="metric-card p-5">
      <div className="mb-4 flex items-center justify-between text-ice/55">
        <span className="text-sm">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-semibold">{value}</div>
      <p className="mt-2 text-sm text-ice/60">{detail}</p>
    </div>
  );
}
