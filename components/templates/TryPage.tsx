"use client";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/client/api";
import { SOLUTIONS } from "@/lib/content/solutions";
import { FEATURED_PALS } from "@/lib/content/pals";
import { SiteLink } from "@/lib/site/link";
import type { Turn } from "@/lib/types";
import { VoiceStage } from "../app/LiveSession";

export function TryPage() {
  const [slug, setSlug] = useState("ai-interviewer");
  const [live, setLive] = useState<boolean | null>(null);
  useEffect(() => {
    const q = new URLSearchParams(location.search).get("persona");
    if (q && SOLUTIONS.some((s) => s.slug === q)) setSlug(q);
    api.tryLive().then(setLive);
  }, []);
  const s = SOLUTIONS.find((x) => x.slug === slug)!;
  const turns = useMemo<Turn[]>(() => [{ role: "assistant", content: s.greeting, at: 0 }], [s]);
  const [history, setHistory] = useState<Turn[]>(turns);
  useEffect(() => setHistory(turns), [turns]);

  return (
    <section className="shell py-10 sm:py-14">
      <p className="t-mono text-mute">Live demo</p>
      <h1 className="t-h2 mt-3">Talk to {s.personaName}.</h1>
      <p className="t-lead mt-4 max-w-[60ch] text-ink/70">Tap the mic and speak, or type. {live ? "Replies come from Claude in real time." : "This preview uses scripted replies; the full product runs on Claude with photoreal video."} Every persona tells you it&rsquo;s an AI.</p>
      <div className="mt-8 flex gap-1.5 overflow-x-auto pb-2" role="radiogroup" aria-label="Persona">
        {FEATURED_PALS.map((x) => (
          <button key={x.slug} role="radio" aria-checked={slug === x.slug} onClick={() => setSlug(x.slug)}
            className={`t-mono h-11 shrink-0 rounded-full px-5 transition ${slug === x.slug ? "bg-ink text-paper" : "border border-line hover:border-ink"}`}>{x.personaName} · {x.name}</button>
        ))}
      </div>
      <div className="mt-4">
        <VoiceStage key={slug} name={s.personaName} look={s.persona} turns={turns} maleVoice={["dev", "omar", "henry"].includes(s.persona)}
          onSend={async (t, onChunk) => {
            const next: Turn[] = [...history, { role: "user", content: t, at: Date.now() }];
            const full = await api.tryTurn(slug, next.map(({ role, content }) => ({ role, content })), onChunk);
            setHistory([...next, { role: "assistant", content: full, at: Date.now() }]);
            return full;
          }}
          note="Demo conversations aren't saved. Sign up to build your own persona." />
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <SiteLink href="/signup" className="t-mono inline-flex h-12 items-center rounded-full bg-ink px-6 text-paper">Build your own</SiteLink>
        <SiteLink href={`/solutions/${slug}`} className="t-mono inline-flex h-12 items-center rounded-full border border-ink/20 px-6 hover:border-ink">About {s.name}</SiteLink>
      </div>
    </section>
  );
}
