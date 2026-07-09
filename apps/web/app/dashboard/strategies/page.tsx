import Link from "next/link";
import { ArrowLeft, BadgeCheck, Boxes, Code2, ShieldAlert } from "lucide-react";
import { StrategyActivationButton } from "@/components/StrategyActivationButton";
import { getStrategyMarketplaceSnapshot } from "@/lib/persistence";

export default async function StrategiesPage() {
  const marketplace = await getStrategyMarketplaceSnapshot();
  const enabledCount = marketplace.strategies.filter((strategy) => strategy.enabled).length;

  return (
    <main className="min-h-screen bg-ink px-6 py-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <Link className="mb-3 inline-flex items-center gap-2 text-sm text-ice/60 hover:text-mint" href="/dashboard">
              <ArrowLeft size={15} />
              Dashboard
            </Link>
            <p className="text-sm text-mint">Strategy platform</p>
            <h1 className="text-3xl font-semibold">Strategy marketplace</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-ice/70">
              {marketplace.persisted ? "Postgres registry" : "SDK fallback"}
            </div>
            <div className="rounded-md border border-mint/30 bg-mint/10 px-3 py-2 text-sm text-mint">
              {enabledCount} enabled
            </div>
          </div>
        </header>

        <section className="mb-4 grid gap-4 md:grid-cols-3">
          <Metric icon={<Boxes />} label="Registered strategies" value={String(marketplace.strategies.length)} detail="SDK-compatible catalog entries" />
          <Metric icon={<BadgeCheck />} label="Approved" value={String(marketplace.strategies.filter((strategy) => strategy.status === "approved").length)} detail="Ready for paper trading selection" />
          <Metric icon={<ShieldAlert />} label="Execution boundary" value="Paper only" detail="Risk engine remains the final gate" />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          {marketplace.strategies.map((strategy) => (
            <article className="metric-card p-5" key={strategy.id}>
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-ice/55">
                    <span>{strategy.id}</span>
                    <span>v{strategy.version}</span>
                    <span>{strategy.source}</span>
                  </div>
                  <h2 className="text-xl font-semibold">{strategy.name}</h2>
                </div>
                <StrategyActivationButton initialEnabled={strategy.enabled} strategyId={strategy.id} />
              </div>
              <p className="text-sm leading-6 text-ice/70">{strategy.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(Array.isArray(strategy.tags) ? strategy.tags : []).map((tag) => (
                  <span className="rounded-md bg-white/5 px-2 py-1 text-xs text-ice/65" key={String(tag)}>{String(tag)}</span>
                ))}
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="rounded-md bg-black/20 p-3">
                  <div className="mb-1 flex items-center gap-2 text-sm font-semibold"><Code2 size={15} /> Parameters</div>
                  <p className="text-xs text-ice/55">{Array.isArray(strategy.parameters) && strategy.parameters.length > 0 ? `${strategy.parameters.length} configurable fields` : "No parameters"}</p>
                </div>
                <div className="rounded-md bg-black/20 p-3">
                  <div className="mb-1 text-sm font-semibold">Risk disclosure</div>
                  <p className="line-clamp-2 text-xs text-ice/55">{strategy.riskDisclosure}</p>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

function Metric({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
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
