"use client";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { SiteLink } from "@/lib/site/link";
import { Reveal, RevealLines } from "../Reveal";

const ease = [0.16, 1, 0.3, 1] as const;

/** Page-level hero: eyebrow, 1–3 line headline (one word may be serif italic), lead, CTAs. */
export function PageHero({ eyebrow, lines, accent, lead, children, ctas }: {
  eyebrow: string; lines: string[]; accent?: string; lead?: string; children?: ReactNode;
  ctas?: { label: string; href: string; primary?: boolean }[];
}) {
  return (
    <section className="shell pt-12 sm:pt-20">
      <p className="t-mono text-mute">{eyebrow}</p>
      <div className="mt-5 grid items-end gap-8 lg:grid-cols-12">
        <h1 className="t-display lg:col-span-9">
          {lines.map((l, i) => (
            <span key={i} className="block overflow-hidden pb-[0.06em]">
              <motion.span className="block" initial={{ y: "105%" }} animate={{ y: 0 }} transition={{ duration: 1.1, delay: 0.08 + i * 0.1, ease }}>
                {accent && l.includes(accent) ? <>{l.split(accent)[0]}<span className="serif-i text-[1.08em]">{accent}</span>{l.split(accent)[1]}</> : l}
              </motion.span>
            </span>
          ))}
        </h1>
        {(lead || ctas) && (
          <motion.div className="lg:col-span-3 lg:pb-3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.45, ease }}>
            {lead && <p className="t-lead text-ink/75">{lead}</p>}
            {ctas && (
              <div className="mt-6 flex flex-wrap gap-2">
                {ctas.map((c) => (
                  <SiteLink key={c.label} href={c.href} className={`t-mono group inline-flex h-12 items-center gap-2 rounded-full px-6 ${c.primary ? "bg-ink text-paper hover:bg-graphite" : "border border-ink/20 hover:border-ink"}`}>
                    {c.label}{c.primary && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
                  </SiteLink>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
      {children}
    </section>
  );
}

export function SectionHead({ eyebrow, lines, lead, dark = false }: { eyebrow: string; lines: string[]; lead?: string; dark?: boolean }) {
  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <p className={`t-mono lg:col-span-3 ${dark ? "text-paper/50" : "text-mute"}`}>{eyebrow}</p>
      <div className="lg:col-span-9">
        <RevealLines className="t-h2" lines={lines} />
        {lead && <Reveal delay={0.1}><p className={`t-lead mt-6 max-w-[56ch] ${dark ? "text-paper/65" : "text-ink/70"}`}>{lead}</p></Reveal>}
      </div>
    </div>
  );
}

export function StatRow({ stats, note }: { stats: { v: string; unit?: string; l: string }[]; note?: string }) {
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.v + i} delay={i * 0.07}>
            <div className="relative flex h-full min-h-[210px] flex-col justify-between overflow-hidden rounded-[16px] bg-card p-6">
              <div aria-hidden className="dots absolute -right-6 -top-6 h-40 w-40 rounded-full text-ink/[0.13] [mask-image:radial-gradient(circle,black,transparent_70%)]" />
              <p className="relative text-[clamp(2.8rem,4.6vw,4.2rem)] font-medium leading-none tracking-[-0.06em]">{s.v}{s.unit && <span className="serif-i ml-1.5 text-[0.5em] text-mute">{s.unit}</span>}</p>
              <p className="relative mt-8 max-w-[28ch] text-[0.95rem] leading-snug text-ink/70">{s.l}</p>
            </div>
          </Reveal>
        ))}
      </div>
      {note && <p className="mt-3 text-[0.8rem] text-mute">{note}</p>}
    </div>
  );
}

export function RuledList({ items, cols = 2, dark = false }: { items: { t: string; b: string }[]; cols?: 2 | 3; dark?: boolean }) {
  return (
    <dl className={`grid sm:grid-cols-2 ${cols === 3 ? "lg:grid-cols-3" : ""}`}>
      {items.map((it, i) => (
        <Reveal key={it.t} delay={(i % cols) * 0.06}>
          <div className={`h-full border-t py-7 sm:pr-10 ${dark ? "border-white/10" : "border-line"}`}>
            <dt className="text-[1.3rem] font-medium tracking-[-0.035em]">{it.t}</dt>
            <dd className={`t-body mt-2 max-w-[42ch] ${dark ? "text-paper/60" : "text-ink/65"}`}>{it.b}</dd>
          </div>
        </Reveal>
      ))}
    </dl>
  );
}

export function CodeCard({ code, title }: { code: string; title?: string }) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-white/10 bg-coal text-paper">
      {title && <p className="t-mono border-b border-white/10 px-5 py-3 text-paper/50">{title}</p>}
      <pre className="overflow-x-auto p-5 text-[0.84rem] leading-[1.7]"><code className="font-mono text-paper/85">{code}</code></pre>
    </div>
  );
}
