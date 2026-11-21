"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Brain, Code2, Eye, AudioLines, History, MessagesSquare } from "lucide-react";
import { useState } from "react";
import { POSTS } from "@/lib/content/research";
import { SOLUTIONS } from "@/lib/content/solutions";
import { SiteLink } from "@/lib/site/link";
import { Closing } from "../Closing";
import { Developers } from "../Developers";
import { DitherHuman } from "../DitherHuman";
import { Enterprise } from "../Enterprise";
import { Models } from "../Models";
import { PalGallery } from "../PalGallery";
import { CallStage } from "../page/CallStage";
import { SectionHead } from "../page/Blocks";
import { Reveal, RevealLines } from "../Reveal";
import { useSite } from "../SiteContext";

const ease = [0.16, 1, 0.3, 1] as const;

const BUILDS = ["Real-time video agents", "AI interviewers", "AI tutors", "AI coaches", "Patient intake", "AI recruiters", "Support agents", "Sales reps", "Companions", "Museum guides", "Onboarding hosts", "Yoga teachers"];

const CAPS = [
  { icon: MessagesSquare, t: "Real-time conversation", b: "Sub-second turns, natural interruptions, no push-to-talk.", href: "/models/cadence" },
  { icon: Eye, t: "Vision & perception", b: "Reads expression, gaze and shared screens as context.", href: "/models/iris" },
  { icon: AudioLines, t: "Voice intelligence", b: "Tone, pace and emotion that fit the moment, in 40+ languages.", href: "/features/languages" },
  { icon: History, t: "Memory & personalisation", b: "Remembers each person and picks up where you left off.", href: "/models/recall" },
  { icon: Brain, t: "Agent intelligence", b: "Uses tools, takes actions and guides people through tasks.", href: "/features/tools" },
  { icon: Code2, t: "Developer platform", b: "APIs, SDKs, webhooks and embeds. Claude as the default brain.", href: "/developers" },
];

export function HomePage() {
  const { openAccount } = useSite();
  const tabs = SOLUTIONS;
  const [tab, setTab] = useState(0);
  const cur = tabs[tab];

  return (
    <>
      {/* Hero */}
      <section className="shell pt-12 sm:pt-20">
        <div className="grid items-end gap-8 lg:grid-cols-12">
          <h1 className="t-display lg:col-span-8">
            {["The", "human interface", "for AI."].map((l, i) => (
              <span key={l} className="block overflow-hidden pb-[0.06em]">
                <motion.span className="block" initial={{ y: "105%" }} animate={{ y: 0 }} transition={{ duration: 1.1, delay: 0.08 + i * 0.1, ease }}>
                  {i === 1 ? <><span className="serif-i text-[1.08em]">human</span> interface</> : l}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.div className="lg:col-span-4 lg:pb-3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.45, ease }}>
            <p className="t-lead text-ink/75">ManavOS gives your AI a face, a voice and a memory. Real-time, photoreal AI humans that see, listen, remember and act, built with one API.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <button onClick={() => openAccount("signup")} className="t-mono group inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-paper hover:bg-graphite">Start building <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></button>
              <SiteLink href="/try" className="t-mono inline-flex h-12 items-center gap-2 rounded-full border border-ink/20 px-6 hover:border-ink"><span className="live-dot h-2 w-2 rounded-full bg-accent" />Talk to Aarohi</SiteLink>
            </div>
          </motion.div>
        </div>

        <motion.div className="mt-14 grid gap-3 sm:mt-20 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.3, ease }}>
          <CallStage persona="aarohi" name="Aarohi" label="AI Interviewer" script={SOLUTIONS[0].script.length ? SOLUTIONS[0].script : [
            { who: "agent", text: "Hi, I'm Aarohi, an AI interviewer. Tell me about a metric you owned end to end." },
            { who: "you", text: "I owned weekly active subscribers at my last company…" },
            { who: "agent", text: "When it dropped unexpectedly, how did you know it was real?" },
          ]} aspect="aspect-[4/5] sm:aspect-[16/11]" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
            {[SOLUTIONS[1], SOLUTIONS[4]].map((s, k) => (
              <SiteLink key={s.slug} href={`/solutions/${s.slug}`} className="group relative overflow-hidden rounded-[18px] bg-ink">
                <div className="aspect-[4/5] md:aspect-auto md:h-full md:min-h-[200px]">
                  <DitherHuman persona={s.persona} scene={k ? "night" : "close"} dark="#0f0f10" light={k ? "#f2efe8" : "#e7e2d7"} cell={2} yaw={k ? -0.3 : 0.3} label={`${s.personaName}, ${s.name}`} />
                </div>
                <span className="t-mono absolute bottom-3 left-3 rounded-full bg-paper px-3 py-1.5 text-ink">{s.personaName} · {s.name}</span>
              </SiteLink>
            ))}
          </div>
        </motion.div>
      </section>

      <PalGallery />

      {/* What you can build */}
      <section className="section">
        <div className="shell">
          <SectionHead eyebrow="One platform" lines={["Build anything that", "needs a conversation."]} lead="ManavOS is the foundation for AI that meets people face to face. The same models power every persona; you decide who it is and what it does." />
          <Reveal delay={0.1}>
            <ul className="mt-14 flex flex-wrap gap-x-3 gap-y-2 text-[clamp(1.6rem,3.6vw,3.2rem)] font-medium leading-[1.15] tracking-[-0.045em] lg:ml-[25%]">
              {BUILDS.map((b, i) => (
                <li key={b} className={i % 3 === 1 ? "serif-i text-ink/55" : ""}>{b}{i < BUILDS.length - 1 && <span className="text-ink/25">,</span>}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Use-case tabs */}
      <section className="bg-ink text-paper">
        <div className="shell section">
          <SectionHead dark eyebrow="Use cases" lines={["One face for", "every front door."]} />
          <div className="mt-12 flex gap-1.5 overflow-x-auto pb-2" role="tablist" aria-label="Use cases">
            {tabs.map((t, i) => (
              <button key={t.slug} role="tab" aria-selected={tab === i} onClick={() => setTab(i)}
                className={`t-mono h-11 shrink-0 rounded-full px-5 transition ${tab === i ? "bg-paper text-ink" : "bg-white/[0.07] text-paper/70 hover:bg-white/15"}`}>{t.name}</button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={cur.slug} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.45, ease }}
              className="mt-6 grid overflow-hidden rounded-[18px] border border-white/10 md:grid-cols-2">
              <div className="aspect-[4/3] bg-coal md:aspect-auto md:min-h-[460px]">
                <DitherHuman persona={cur.persona} scene="night" dark="#161617" light="#f2efe8" cell={3} yaw={0.22} label={`${cur.personaName}, ${cur.name} persona`} />
              </div>
              <div className="flex flex-col justify-between gap-10 p-7 sm:p-10">
                <div>
                  <p className="t-mono text-paper/50">{cur.eyebrow}</p>
                  <p className="t-h3 mt-4 max-w-[18ch]">{cur.headline.join(" ")}</p>
                  <p className="t-body mt-4 max-w-[46ch] text-paper/65">{cur.sub || "Aarohi runs structured, face-to-face first rounds around the clock, scores every answer against your rubric, and sends the evidence to your ATS."}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <SiteLink href={`/solutions/${cur.slug}`} className="t-mono group inline-flex h-12 items-center gap-2 rounded-full bg-paper px-6 text-ink">Explore {cur.name} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></SiteLink>
                  <SiteLink href={`/try?persona=${cur.slug}`} className="t-mono inline-flex h-12 items-center rounded-full border border-white/20 px-6 hover:border-paper">Talk to {cur.personaName}</SiteLink>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Capabilities */}
      <section className="section">
        <div className="shell">
          <SectionHead eyebrow="Capabilities" lines={["Everything a person", "brings to a conversation."]} />
          <div className="mt-14 grid gap-px overflow-hidden rounded-[18px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {CAPS.map((c, i) => (
              <Reveal key={c.t} delay={(i % 3) * 0.06} className="bg-paper">
                <SiteLink href={c.href} className="group flex h-full min-h-[240px] flex-col justify-between p-7 transition-colors hover:bg-card">
                  <c.icon className="h-6 w-6" strokeWidth={1.5} />
                  <div>
                    <p className="text-[1.45rem] font-medium tracking-[-0.035em]">{c.t}</p>
                    <p className="t-body mt-2 text-ink/65">{c.b}</p>
                    <span className="t-mono mt-5 inline-flex items-center gap-1.5 text-mute group-hover:text-ink">Learn more <ArrowRight className="h-3.5 w-3.5" /></span>
                  </div>
                </SiteLink>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Models />
      <Developers />

      {/* Research */}
      <section className="section">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <RevealLines className="t-h2" lines={["From the", "research desk."]} />
            <SiteLink href="/research" className="t-mono inline-flex h-11 items-center gap-2 rounded-full border border-ink/20 px-5 hover:border-ink">All research <ArrowRight className="h-4 w-4" /></SiteLink>
          </div>
          <div className="mt-12 grid gap-3 md:grid-cols-3">
            {POSTS.slice(0, 3).map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.07}>
                <SiteLink href={`/research/${p.slug}`} className="group flex h-full flex-col rounded-[16px] border border-line bg-card p-6 transition hover:border-ink/40">
                  <div className="flex justify-between"><span className="t-mono text-mute">{p.kind}</span><span className="t-mono text-mute">{p.date}</span></div>
                  <p className="mt-10 flex-1 text-[1.35rem] font-medium leading-tight tracking-[-0.03em]">{p.title}</p>
                  <p className="t-body mt-4 text-ink/60">{p.summary}</p>
                </SiteLink>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Enterprise />
      <Closing lines={["Meet the next", "generation", "of AI."]} label="ManavOS" topic="Something else" />
    </>
  );
}
