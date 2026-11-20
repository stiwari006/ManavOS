"use client";
import { Check } from "lucide-react";
import { useState } from "react";
import { Reveal, RevealLines } from "./Reveal";
import { useSite } from "./SiteContext";
import { api } from "@/lib/client/api";

const TOPICS = ["AI Interviewer", "AI Tutor", "AI Coach", "Healthcare intake", "AI SDR", "Customer experience", "Personal assistant", "Developer API", "Pricing", "Something else"];

export function Contact() {
  const { topic, setTopic } = useSite();
  const [sent, setSent] = useState<null | string>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const field = "h-12 w-full rounded-[12px] border border-line bg-card px-4 outline-none transition focus:border-ink";
  return (
    <section id="contact" className="section">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <p className="t-mono text-mute">Contact</p>
          <RevealLines className="t-h2 mt-5" lines={["Talk to a", "solutions specialist."]} />
          <Reveal delay={0.1}>
            <p className="t-lead mt-6 max-w-[42ch] text-ink/70">Tell us what you&rsquo;re hiring or building for. A person on our team, not a bot, will reply within one business day.</p>
            <p className="mt-8 text-[0.95rem] text-ink/60">Prefer email? <span className="text-ink">hello@humanos.ai</span></p>
          </Reveal>
        </div>
        <Reveal className="lg:col-span-7" delay={0.1}>
          {sent ? (
            <div className="flex h-full min-h-[360px] flex-col items-start justify-center rounded-[16px] border border-line bg-card p-8">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-ink text-paper"><Check className="h-5 w-5" /></span>
              <p className="t-h3 mt-6">Thanks, {sent}.</p>
              <p className="t-body mt-2 max-w-[44ch] text-ink/65">Your note about {topic.toLowerCase()} is with our team. Someone will be in touch within one business day.</p>
              <button onClick={() => setSent(null)} className="t-mono mt-6 h-11 rounded-full border border-line px-5 hover:border-ink">Send another</button>
            </div>
          ) : (
            <form className="grid gap-3 sm:grid-cols-2" onSubmit={async (e) => {
              e.preventDefault(); setErr(""); setBusy(true);
              const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
              try { await api.contact(f); setSent(f.name.split(" ")[0] || "there"); } catch (x) { setErr((x as Error).message); } finally { setBusy(false); }
            }}>
              <label className="grid gap-1.5"><span className="t-mono text-mute">Full name</span><input id="contact-name" name="name" required autoComplete="name" className={field} /></label>
              <label className="grid gap-1.5"><span className="t-mono text-mute">Work email</span><input name="email" type="email" required autoComplete="email" className={field} /></label>
              <label className="grid gap-1.5"><span className="t-mono text-mute">Company</span><input name="company" autoComplete="organization" className={field} /></label>
              <label className="grid gap-1.5"><span className="t-mono text-mute">Interviews per month</span>
                <select name="volume" className={field} defaultValue="100–1,000"><option>Under 100</option><option>100–1,000</option><option>1,000–10,000</option><option>10,000+</option></select>
              </label>
              <label className="grid gap-1.5 sm:col-span-2"><span className="t-mono text-mute">Interested in</span>
                <select name="topic" value={topic} onChange={(e) => setTopic(e.target.value)} className={field}>{TOPICS.map((t) => <option key={t}>{t}</option>)}</select>
              </label>
              <label className="grid gap-1.5 sm:col-span-2"><span className="t-mono text-mute">What are you trying to do?</span>
                <textarea name="message" rows={4} className="w-full rounded-[12px] border border-line bg-card p-4 outline-none transition focus:border-ink" />
              </label>
              <div className="flex flex-wrap items-center justify-between gap-4 sm:col-span-2">
                <p className="text-[0.8rem] text-mute" role={err ? "alert" : undefined}>{err || "We’ll only use this to reply to you."}</p>
                <button disabled={busy} className="t-mono h-12 rounded-full bg-ink px-7 text-paper hover:bg-graphite disabled:opacity-50">{busy ? "Sending…" : "Send to our team"}</button>
              </div>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
