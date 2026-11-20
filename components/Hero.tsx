"use client";
import { motion } from "framer-motion";
import { ArrowRight, Mic, PhoneOff, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { DitherHuman } from "./DitherHuman";
import { useSite } from "./SiteContext";
import { SiteLink } from "@/lib/site/link";

const SCRIPT = [
  { who: "agent", text: "Tell me about a metric you owned end to end." },
  { who: "you", text: "I owned weekly active subscribers and rebuilt the definition with finance…" },
  { who: "agent", text: "When it dropped unexpectedly, how did you know it was real?" },
  { who: "you", text: "First I checked the pipeline, then segmented by platform…" },
  { who: "agent", text: "Good. How would you explain that to an executive in two minutes?" },
] as const;

const SYNCS = ["Greenhouse", "Lever", "Ashby", "Workday", "SAP SuccessFactors", "Webhooks"];

function useScript() {
  const [i, setI] = useState(0);
  const [chars, setChars] = useState(0);
  useEffect(() => {
    const line = SCRIPT[i].text;
    if (chars < line.length) {
      const t = setTimeout(() => setChars((c) => c + 2), 34);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => { setI((i + 1) % SCRIPT.length); setChars(0); }, 2200);
    return () => clearTimeout(t);
  }, [i, chars]);
  return { line: SCRIPT[i], shown: SCRIPT[i].text.slice(0, chars), typing: chars < SCRIPT[i].text.length, step: i };
}

export function Hero() {
  const { openAccount } = useSite();
  const { line, shown, typing, step } = useScript();
  const agentTalking = line.who === "agent" && typing;
  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <section id="top" className="relative pt-10 sm:pt-16">
      <div className="shell">
        <div className="grid items-end gap-8 lg:grid-cols-12">
          <h1 className="t-display lg:col-span-9">
            {["Every candidate", "gets a real", "interview."].map((l, i) => (
              <span key={l} className="block overflow-hidden pb-[0.06em]">
                <motion.span className="block" initial={{ y: "105%" }} animate={{ y: 0 }} transition={{ duration: 1.1, delay: 0.1 + i * 0.1, ease }}>
                  {i === 1 ? <>gets a <span className="serif-i text-[1.08em]">real</span></> : l}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.div
            className="lg:col-span-3 lg:pb-3"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.5, ease }}
          >
            <p className="t-lead text-ink/75">
              Aarohi is a lifelike AI interviewer. She runs structured, face-to-face first rounds around the clock, scores every answer against your rubric, and sends the evidence to your ATS.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <button onClick={() => openAccount("signup")} className="t-mono group inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-paper hover:bg-graphite">
                Start building <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <a href="#demo" className="t-mono inline-flex h-12 items-center rounded-full border border-ink/20 px-6 hover:border-ink">Try the interview</a>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-line pt-5"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.8 }}
        >
          <p className="t-mono text-mute">Designed to sync with</p>
          {SYNCS.map((s) => (
            <span key={s} className="text-[0.98rem] font-medium tracking-[-0.03em] text-ink/55">{s}</span>
          ))}
        </motion.div>
      </div>

      {/* Interviewing solutions + live call */}
      <div className="shell mt-14 sm:mt-20">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="t-mono mr-2 text-mute">Interviewing solutions</span>
          <a href="#demo" className="t-mono rounded-full border border-line bg-card px-4 py-2.5 hover:border-ink">Recruiter screens</a>
          <SiteLink href="/solutions/ai-coach" className="t-mono rounded-full border border-line bg-card px-4 py-2.5 hover:border-ink">Practice interviews</SiteLink>
          <a href="#contact" className="t-mono rounded-full border border-line bg-card px-4 py-2.5 hover:border-ink">Talk to a specialist</a>
        </div>

        <motion.div
          className="relative overflow-hidden rounded-[18px] bg-ink text-paper shadow-[0_40px_80px_-40px_rgba(15,15,16,.6)]"
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.35, ease }}
        >
          <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-5">
            <span className="t-mono flex items-center gap-2"><span className="live-dot h-2 w-2 rounded-full bg-accent" /> Live · First round</span>
            <span className="t-mono hidden text-paper/50 sm:block">Data analyst · Candidate 0412</span>
            <span className="t-mono tabular-nums text-paper/50">06:41</span>
          </div>

          <div className="relative aspect-[4/5] sm:aspect-[16/9]">
            <DitherHuman persona="aarohi" scene={{ frame: [1.2, -2.2, 0.5], key: [-0.6, 0.45, 0.8], rim: [0.9, 0.35, -0.3], bg: 0.035, glow: 0.2, glowAt: [0.66, 0.22], exposure: 1.05, contrast: 1.2 }}
              dark="#0f0f10" light="#f2efe8" cell={3} yaw={0.12} speaking={agentTalking} follow label="Aarohi, the ManavOS AI interviewer, speaking on a live video call" />

            {/* candidate self-view */}
            <div className="absolute right-3 top-3 w-[26%] min-w-[96px] max-w-[220px] overflow-hidden rounded-[10px] border border-white/15 sm:right-5 sm:top-5">
              <div className="aspect-[3/4]">
                <DitherHuman persona="dev" scene="paper" dark="#161617" light="#e7e2d7" cell={2} yaw={-0.25} speaking={line.who === "you" && typing} label="Candidate self-view" />
              </div>
              <span className="t-mono absolute bottom-1.5 left-2 text-[0.62rem] text-ink">You</span>
            </div>

            {/* live rubric */}
            <div className="absolute left-3 top-3 hidden w-[230px] rounded-[12px] border border-white/10 bg-ink/70 p-4 backdrop-blur md:block sm:left-5 sm:top-5">
              <p className="t-mono text-paper/50">Rubric · live</p>
              {[["Structure", 0.62 + step * 0.05], ["Evidence", 0.48 + step * 0.08], ["Ownership", 0.7 + step * 0.04], ["Clarity", 0.66 + step * 0.05]].map(([k, v]) => (
                <div key={k as string} className="mt-3">
                  <div className="flex justify-between text-[0.8rem]"><span>{k}</span><span className="tabular-nums text-paper/60">{Math.min(4, (v as number) * 4).toFixed(1)}</span></div>
                  <div className="mt-1.5 h-[3px] rounded bg-white/10"><div className="h-full rounded bg-paper transition-[width] duration-700" style={{ width: `${Math.min(100, (v as number) * 100)}%` }} /></div>
                </div>
              ))}
            </div>

            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-ink via-ink/75 to-transparent" />
            {/* captions */}
            <div className="absolute inset-x-3 bottom-20 sm:inset-x-auto sm:bottom-24 sm:left-1/2 sm:w-[min(720px,80%)] sm:-translate-x-1/2">
              <p className="t-mono mb-2 text-center text-paper/50">{line.who === "agent" ? "Aarohi" : "Candidate"}</p>
              <p className={`text-balance text-center text-[1.05rem] leading-snug tracking-[-0.02em] sm:text-[1.45rem] ${line.who === "agent" ? "text-paper" : "text-paper/60"} ${typing ? "caret" : ""}`}>{shown}</p>
            </div>

            {/* call controls */}
            <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2 sm:bottom-6" aria-hidden="true">
              {[Mic, Video].map((I, k) => (
                <span key={k} className="grid h-11 w-11 place-items-center rounded-full bg-white/10"><I className="h-[18px] w-[18px]" /></span>
              ))}
              <span className="grid h-11 w-14 place-items-center rounded-full bg-accent"><PhoneOff className="h-[18px] w-[18px]" /></span>
            </div>
          </div>
        </motion.div>
        <p className="mt-3 text-[0.8rem] text-mute">Real-time render of Aarohi. The conversation is a scripted preview; try the real flow in the <a href="#demo" className="underline underline-offset-2">live demo</a>.</p>
      </div>
    </section>
  );
}
