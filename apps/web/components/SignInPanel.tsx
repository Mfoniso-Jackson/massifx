"use client";

import { signIn } from "next-auth/react";
import { LogIn } from "lucide-react";
import { useState } from "react";

export function SignInPanel() {
  const [email, setEmail] = useState("demo@massifx.ai");
  const [password, setPassword] = useState("massifx-demo-password");

  return (
    <form
      className="metric-card grid gap-3 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        void signIn("credentials", { email, password, callbackUrl: "/dashboard" });
      }}
    >
      <input
        className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-mint"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        type="email"
        aria-label="Email"
      />
      <input
        className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-mint"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        type="password"
        aria-label="Password"
      />
      <button className="inline-flex items-center justify-center gap-2 rounded-md bg-mint px-4 py-2 text-sm font-semibold text-ink hover:bg-ice" type="submit">
        <LogIn size={16} />
        Sign in to demo
      </button>
    </form>
  );
}
