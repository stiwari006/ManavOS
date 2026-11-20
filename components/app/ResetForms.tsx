"use client";
import { useState } from "react";
import { api } from "@/lib/client/api";
import { SiteLink, go } from "@/lib/site/link";

const field = "h-12 w-full rounded-[12px] border border-line bg-card px-4 outline-none focus:border-ink";
const btn = "t-mono mt-6 h-12 w-full rounded-full bg-ink text-paper hover:bg-graphite disabled:opacity-50";

export function ForgotForm() {
  const [sent, setSent] = useState(false); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  if (sent) return (
    <div>
      <p className="t-mono text-mute">Check your inbox</p>
      <h1 className="t-h2 mt-3">Link sent.</h1>
      <p className="mt-4 text-mute">If an account exists for that email, a reset link is on its way. It expires in one hour.</p>
      <SiteLink href="/login" className="mt-6 inline-block underline">Back to log in</SiteLink>
    </div>
  );
  return (
    <form onSubmit={async (e) => {
      e.preventDefault(); setBusy(true); setErr("");
      try { await api.forgot(String(new FormData(e.currentTarget).get("email"))); setSent(true); } catch (x) { setErr((x as Error).message); setBusy(false); }
    }}>
      <p className="t-mono text-mute">Forgot password</p>
      <h1 className="t-h2 mt-3">Reset it.</h1>
      <label className="mt-8 grid gap-1.5"><span className="t-mono text-mute">Work email</span><input name="email" type="email" required autoComplete="email" className={field} /></label>
      {err && <p role="alert" className="mt-4 rounded-[10px] bg-accent-soft px-4 py-3 text-[0.9rem]">{err}</p>}
      <button disabled={busy} className={btn}>{busy ? "Sending…" : "Email me a reset link"}</button>
      <p className="mt-5 text-center text-[0.92rem] text-mute"><SiteLink href="/login" className="text-ink underline">Back to log in</SiteLink></p>
    </form>
  );
}

export function ResetForm() {
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  return (
    <form onSubmit={async (e) => {
      e.preventDefault(); setErr("");
      const f = new FormData(e.currentTarget);
      if (f.get("password") !== f.get("confirm")) { setErr("Passwords don't match."); return; }
      const token = new URLSearchParams(location.search).get("token") || "";
      setBusy(true);
      try { await api.reset(token, String(f.get("password"))); go("/app"); } catch (x) { setErr((x as Error).message); setBusy(false); }
    }}>
      <p className="t-mono text-mute">New password</p>
      <h1 className="t-h2 mt-3">Choose a new one.</h1>
      <div className="mt-8 grid gap-3">
        <label className="grid gap-1.5"><span className="t-mono text-mute">New password</span><input name="password" type="password" required minLength={8} autoComplete="new-password" className={field} /></label>
        <label className="grid gap-1.5"><span className="t-mono text-mute">Confirm</span><input name="confirm" type="password" required minLength={8} autoComplete="new-password" className={field} /></label>
      </div>
      {err && <p role="alert" className="mt-4 rounded-[10px] bg-accent-soft px-4 py-3 text-[0.9rem]">{err}</p>}
      <button disabled={busy} className={btn}>{busy ? "Saving…" : "Save and log in"}</button>
    </form>
  );
}
