"use client";

import { Power } from "lucide-react";
import { useState } from "react";

export function StrategyActivationButton({ strategyId, initialEnabled }: { strategyId: string; initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [pending, setPending] = useState(false);

  async function toggle() {
    setPending(true);
    const next = !enabled;
    try {
      await fetch(`/api/strategies/${strategyId}/activation`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ enabled: next })
      });
      setEnabled(next);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${enabled ? "bg-mint text-ink" : "border border-white/15 text-ice"}`}
      disabled={pending}
      onClick={toggle}
      type="button"
    >
      <Power size={15} />
      {enabled ? "Enabled" : "Enable"}
    </button>
  );
}
