"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Props {
  equityCurve: Array<{ timestamp: number; equity: number }>;
  pnl: Array<{ name: string; value: number }>;
}

export function DashboardCharts({ equityCurve, pnl }: Props) {
  const equity = equityCurve.map((point) => ({
    time: new Date(point.timestamp).toLocaleDateString("en", { month: "short", day: "numeric" }),
    equity: Math.round(point.equity)
  }));

  return (
    <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
      <section className="metric-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ice">Backtest equity curve</h3>
          <span className="text-xs text-mint">Simulated</span>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={equity}>
              <CartesianGrid stroke="rgba(217,247,255,0.08)" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: "#9fb3b7", fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={24} />
              <YAxis tick={{ fill: "#9fb3b7", fontSize: 11 }} tickLine={false} axisLine={false} width={64} />
              <Tooltip contentStyle={{ background: "#10191c", border: "1px solid rgba(217,247,255,.16)", borderRadius: 8 }} />
              <Area type="monotone" dataKey="equity" stroke="#35e0a1" fill="rgba(53,224,161,.18)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="metric-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ice">Paper PnL</h3>
          <span className="text-xs text-amber">Demo account</span>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pnl}>
              <CartesianGrid stroke="rgba(217,247,255,0.08)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#9fb3b7", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#9fb3b7", fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#10191c", border: "1px solid rgba(217,247,255,.16)", borderRadius: 8 }} />
              <Bar dataKey="value" fill="#f2b84b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
