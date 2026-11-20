"use client";
import { DitherHuman } from "./DitherHuman";
import type { PersonaKey } from "@/lib/render/engine";
import { RevealLines } from "./Reveal";
import { useSite } from "./SiteContext";

export function Closing({ lines = ["You haven’t met", "an interviewer", "like this."], persona = "aarohi", topic = "AI Interviewer", label = "ManavOS · Aarohi-1" }: { lines?: string[]; persona?: PersonaKey; topic?: string; label?: string }) {
  const { openAccount, contactAbout } = useSite();
  return (
    <section className="shell pb-[clamp(80px,10vw,140px)]">
      <div className="relative grid overflow-hidden rounded-[20px] bg-accent text-ink md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="relative z-10 flex flex-col justify-between gap-10 p-7 sm:p-12">
          <p className="t-mono">{label}</p>
          <div>
            <RevealLines className="t-h2" lines={lines} />
            <div className="mt-8 flex flex-wrap gap-2">
              <button onClick={() => openAccount("signup")} className="t-mono h-12 rounded-full bg-ink px-6 text-paper hover:bg-graphite">Start building</button>
              <button onClick={() => contactAbout(topic)} className="t-mono h-12 rounded-full border border-ink/30 px-6 hover:border-ink">Talk to a human</button>
            </div>
          </div>
        </div>
        <div className="relative min-h-[360px]">
          <DitherHuman persona={persona} scene={{ frame: [1.25, -2.4, 0.45], key: [-0.6, 0.5, 0.8], rim: [0.9, 0.3, -0.4], bg: 0.95, glow: 0, glowAt: [0.5, 0.5], exposure: 1.15, contrast: 1.25 }}
            dark="#0f0f10" light="#ff4f1f" cell={3} yaw={-0.32} label="Persona portrait" />
        </div>
      </div>
    </section>
  );
}
