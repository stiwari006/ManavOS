"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/client/api";
import { DEMO, SiteLink, go } from "@/lib/site/link";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [type, setType] = useState("developer");
  const [plan, setPlan] = useState("starter");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    if (q.get("type") === "teams") setType("teams");
    if (q.get("plan")) setPlan(q.get("plan")!);
    api.me().then((u) => { if (u) go("/app"); });
  }, []);
  const field = "h-12 w-full rounded-[12px] border border-line bg-card px-4 outline-none focus:border-ink";
  return (
    <form onSubmit={async (e) => {
      e.preventDefault(); setErr(""); setBusy(true);
      const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
      try {
        if (mode === "signup") await api.signup({ ...f, type, plan }); else await api.login(f);
        const next = new URLSearchParams(location.search).get("next");
        go(next && next.startsWith("/app") ? next : "/app");
      } catch (x) { setErr((x as Error).message); setBusy(false); }
    }}>
      <p className="t-mono text-mute">{mode === "signup" ? "Create your workspace" : "Welcome back"}</p>
      <h1 className="t-h2 mt-3">{mode === "signup" ? "Start building." : "Log in."}</h1>
      {mode === "signup" && (
        <div className="mt-8 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Account type">
          {[["developer", "Developer", "API, SDKs, sandbox"], ["teams", "Teams", "No-code personas"]].map(([v, n, d]) => (
            <button type="button" key={v} role="radio" aria-checked={type === v} onClick={() => setType(v)}
              className={`rounded-[12px] border p-4 text-left transition ${type === v ? "border-ink bg-card" : "border-line hover:border-ink/40"}`}>
              <span className="block font-medium">{n}</span><span className="text-[0.85rem] text-mute">{d}</span>
            </button>
          ))}
        </div>
      )}
      <div className="mt-6 grid gap-3">
        {mode === "signup" && <label className="grid gap-1.5"><span className="t-mono text-mute">Full name</span><input name="name" required autoComplete="name" className={field} /></label>}
        {mode === "signup" && <label className="grid gap-1.5"><span className="t-mono text-mute">Company (optional)</span><input name="company" autoComplete="organization" className={field} /></label>}
        <label className="grid gap-1.5"><span className="t-mono text-mute">Work email</span><input name="email" type="email" required autoComplete="email" className={field} /></label>
        <label className="grid gap-1.5"><span className="t-mono text-mute">Password</span><input name="password" type="password" required minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} className={field} /></label>
      </div>
      {mode === "login" && <p className="mt-3 text-right text-[0.88rem]"><SiteLink href="/forgot" className="text-mute underline hover:text-ink">Forgot password?</SiteLink></p>}
      {err && <p role="alert" className="mt-4 rounded-[10px] bg-accent-soft px-4 py-3 text-[0.9rem]">{err}</p>}
      <button disabled={busy} className="t-mono mt-6 h-12 w-full rounded-full bg-ink text-paper hover:bg-graphite disabled:opacity-50">{busy ? "One moment…" : mode === "signup" ? "Create account" : "Log in"}</button>
      <p className="mt-5 text-center text-[0.92rem] text-mute">
        {mode === "signup" ? <>Already have an account? <SiteLink href="/login" className="text-ink underline">Log in</SiteLink></> : <>New to ManavOS? <SiteLink href="/signup" className="text-ink underline">Create an account</SiteLink></>}
      </p>
      {DEMO && <p className="mt-4 text-center text-[0.8rem] text-mute">Preview build: accounts are stored only in this browser.</p>}
    </form>
  );
}
