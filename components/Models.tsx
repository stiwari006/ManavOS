"use client";
import { motion } from "framer-motion";
import { DitherHuman } from "./DitherHuman";
import { SiteLink } from "@/lib/site/link";
import { Reveal, RevealLines } from "./Reveal";

function IrisViz() {
  // attention map: where the model is looking on a face-sized field
  return (
    <svg viewBox="0 0 200 150" className="h-full w-full" aria-hidden>
      <defs>
        <pattern id="irisdots" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1" fill="currentColor" opacity=".25" /></pattern>
      </defs>
      <rect width="200" height="150" fill="url(#irisdots)" />
      {[[70, 62], [130, 62], [100, 104]].map(([x, y], i) => (
        <g key={i}>
          {[26, 17, 9].map((r, k) => (
            <motion.ellipse key={r} cx={x} cy={y} rx={r} ry={r * 0.7} fill="none" stroke="currentColor" strokeWidth={k === 2 ? 1.5 : 0.8}
              initial={{ opacity: 0.2 }} animate={{ opacity: [0.2, 0.9, 0.2] }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.4 + k * 0.15 }} />
          ))}
        </g>
      ))}
      <text x="8" y="142" fontSize="8" fontFamily="DM Mono, monospace" fill="currentColor" opacity=".6">ENGAGEMENT 0.82 · GAZE ON · SMILE</text>
    </svg>
  );
}

function CadenceViz() {
  const bars = Array.from({ length: 34 }, (_, i) => i);
  return (
    <div className="flex h-full flex-col justify-center gap-4 px-5" aria-hidden>
      {(["AI", "You"] as const).map((who, row) => (
        <div key={who} className="flex items-center gap-3">
          <span className="t-mono w-7 text-mute">{who}</span>
          <div className="flex h-10 flex-1 items-center gap-[3px]">
            {bars.map((i) => {
              const on = row === 0 ? i < 15 : i > 18;
              return (
                <motion.span key={i} className={`w-full rounded-full ${on ? "bg-ink" : "bg-ink/15"}`}
                  animate={on ? { height: ["20%", `${30 + ((i * 37) % 70)}%`, "20%"] } : { height: "12%" }}
                  transition={{ duration: 0.9 + (i % 5) * 0.12, repeat: Infinity, ease: "easeInOut" }} />
              );
            })}
          </div>
        </div>
      ))}
      <p className="t-mono text-mute">Turn yielded in 410 ms · no interruption</p>
    </div>
  );
}

function RecallViz() {
  const items = [
    ["Mon", "Practised STAR answers"],
    ["Wed", "Struggled with metrics"],
  ];
  return (
    <div className="flex h-full flex-col justify-center px-5" aria-hidden>
      <div className="relative border-l border-ink/20 pl-5">
        {items.map(([d, t], i) => (
          <motion.div key={d} className="relative py-1.5" initial={{ opacity: 0, x: -6 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.2 }}>
            <span className="absolute -left-[25px] top-[13px] h-2 w-2 rounded-full bg-ink" />
            <span className="t-mono text-mute">{d}</span>
            <p className="text-[0.92rem] tracking-[-0.01em]">{t}</p>
          </motion.div>
        ))}
      </div>
      <p className="mt-2 rounded-[8px] bg-ink px-3 py-2 text-[0.85rem] text-paper">&ldquo;Last time numbers tripped you up. Want to start there?&rdquo;</p>
    </div>
  );
}

const MODELS = [
  { name: "Iris", tag: "Perception", body: "Reads expression, gaze and on-screen context in real time, so the interviewer notices hesitation and adapts.", viz: <IrisViz /> },
  { name: "Lumen", tag: "Rendering", body: "Photoreal faces and, in preview, full bodies: micro-expressions, posture and gesture rendered at video frame rates.", viz: <div className="h-full"><DitherHuman persona="ines" scene="close" dark="#0f0f10" light="#f2efe8" cell={2} yaw={0.35} label="Lumen render close-up" /></div>, dark: true },
  { name: "Cadence", tag: "Conversation", body: "Voice, tone and turn-taking. Knows when you've finished a thought, and when you've only paused to think.", viz: <CadenceViz /> },
  { name: "Recall", tag: "Continuity", body: "Remembers people across sessions, so a coach or tutor picks up exactly where you left off.", viz: <RecallViz /> },
];

export function Models() {
  return (
    <section id="models" className="section border-t border-line">
      <div className="shell">
        <div className="grid gap-6 lg:grid-cols-12">
          <p className="t-mono text-mute lg:col-span-3">The HumanOS models</p>
          <div className="lg:col-span-9">
            <RevealLines className="t-h2" lines={["Four models.", "One presence."]} />
            <Reveal delay={0.1}>
              <p className="t-lead mt-6 max-w-[54ch] text-ink/70">An AI human is more than a talking head. Each layer is built in-house and tuned to work together, with Claude as the reasoning layer by default, or your own LLM.</p>
            </Reveal>
          </div>
        </div>
        <div className="mt-14 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {MODELS.map((m, i) => (
            <Reveal key={m.name} delay={i * 0.08} className="h-full">
              <article className="group flex h-full flex-col overflow-hidden rounded-[16px] border border-line bg-card transition-colors hover:border-ink/40">
                <div className={`h-[200px] overflow-hidden border-b border-line ${m.dark ? "bg-ink" : "bg-paper"}`}>{m.viz}</div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-[1.6rem] font-medium tracking-[-0.04em]">{m.name}</h3>
                    <span className="t-mono rounded-full border border-line px-2.5 py-1 text-mute">{m.tag}</span>
                  </div>
                  <p className="t-body mt-3 text-ink/70">{m.body}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
        <SiteLink href="/models" className="t-mono mt-8 inline-flex h-11 items-center rounded-full border border-ink/20 px-5 hover:border-ink">Explore the models →</SiteLink>
      </div>
    </section>
  );
}
