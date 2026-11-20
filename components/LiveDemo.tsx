"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Mic, MicOff, PhoneOff, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { MockInterviewClient, ROLES, SAMPLE_ANSWERS, type Role } from "@/lib/conversation/mockClient";
import type { ConvState, Signal, Turn } from "@/lib/conversation/types";
import { DitherHuman } from "./DitherHuman";
import { RevealLines } from "./Reveal";

const STATE_LABEL: Record<ConvState, string> = {
  idle: "Ready", connecting: "Connecting…", listening: "Listening", thinking: "Thinking", speaking: "Speaking", ended: "Interview complete",
};

type SR = { start(): void; stop(): void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null; interimResults: boolean; lang: string };

export function LiveDemo() {
  const client = useMemo(() => new MockInterviewClient(), []);
  const [role, setRole] = useState<Role>("Data analyst");
  const [state, setState] = useState<ConvState>("idle");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [partial, setPartial] = useState("");
  const [signals, setSignals] = useState<Signal[]>([]);
  const [draft, setDraft] = useState("");
  const [mic, setMic] = useState(false);
  const [note, setNote] = useState("");
  const [sample, setSample] = useState(0);
  const log = useRef<HTMLDivElement>(null);
  const rec = useRef<SR | null>(null);

  useEffect(() => client.on((e) => {
    if (e.type === "state") setState(e.state);
    if (e.type === "partial") setPartial(e.text);
    if (e.type === "turn") setTurns((t) => [...t, e.turn]);
    if (e.type === "signals") setSignals(e.signals);
  }), [client]);
  useEffect(() => () => client.end(), [client]);
  useEffect(() => { log.current?.scrollTo({ top: log.current.scrollHeight, behavior: "smooth" }); }, [turns, partial]);

  const live = state !== "idle" && state !== "ended";
  const canAnswer = state === "listening";

  const start = () => { setTurns([]); setPartial(""); setDraft(""); setSample(0); setNote(""); client.start({ persona: "aarohi", role }); };
  const send = (text = draft) => { if (!canAnswer || !text.trim()) return; client.send(text.trim()); setDraft(""); };
  const useSample = () => { const a = SAMPLE_ANSWERS[sample % SAMPLE_ANSWERS.length]; setSample((s) => s + 1); send(a); };

  const toggleMic = () => {
    if (mic) { rec.current?.stop(); setMic(false); return; }
    const W = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
    const Ctor = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!Ctor) { setNote("Voice input isn't available in this browser. Type your answer, or use a sample answer."); return; }
    try {
      const r = new Ctor();
      r.lang = "en-US"; r.interimResults = true;
      r.onresult = (e) => setDraft(Array.from(e.results).map((x) => x[0].transcript).join(""));
      r.onend = () => setMic(false);
      r.start(); rec.current = r; setMic(true); setNote("");
    } catch { setNote("Microphone access was blocked. Type your answer instead."); }
  };

  return (
    <section id="demo" className="bg-ink text-paper">
      <div className="shell section">
        <div className="grid gap-6 lg:grid-cols-12">
          <p className="t-mono text-paper/50 lg:col-span-3">Live demo</p>
          <div className="lg:col-span-9">
            <RevealLines className="t-h2" lines={["Sit the interview", "yourself."]} />
            <p className="t-lead mt-6 max-w-[56ch] text-paper/65">Pick a role and answer four questions. Watch Aarohi listen, follow up, and score you in real time against the same rubric every candidate gets.</p>
          </div>
        </div>

        <div className="mt-14 grid overflow-hidden rounded-[18px] border border-white/10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          {/* Stage */}
          <div className="relative aspect-[4/5] bg-coal sm:aspect-[16/11] lg:aspect-auto lg:min-h-[640px]">
            <DitherHuman persona="aarohi" scene="night" dark="#121213" light="#f2efe8" cell={3} yaw={0.18} speaking={state === "speaking"} label="Aarohi, AI interviewer, in the live demo" />
            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-ink/70 px-3.5 py-2 backdrop-blur">
              <span className={`h-2 w-2 rounded-full ${live ? "live-dot bg-accent" : "bg-paper/40"}`} />
              <span className="t-mono">{STATE_LABEL[state]}</span>
            </div>
            <span className="t-mono absolute right-4 top-4 rounded-full bg-ink/70 px-3.5 py-2 text-paper/60 backdrop-blur">Aarohi · AI interviewer</span>

            <AnimatePresence>
              {(state === "idle" || state === "ended") && (
                <motion.div className="absolute inset-0 flex flex-col items-center justify-end gap-4 bg-gradient-to-t from-ink via-ink/40 to-transparent p-6 pb-10 text-center"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {state === "ended" && <p className="max-w-[34ch] text-[1.05rem] text-paper/80">Interview complete. In production, this scorecard and transcript go straight to your ATS.</p>}
                  <div className="flex flex-wrap justify-center gap-1.5" role="radiogroup" aria-label="Role">
                    {(Object.keys(ROLES) as Role[]).map((r) => (
                      <button key={r} role="radio" aria-checked={role === r} onClick={() => setRole(r)}
                        className={`t-mono h-10 rounded-full px-4 transition ${role === r ? "bg-paper text-ink" : "bg-white/10 hover:bg-white/20"}`}>{r}</button>
                    ))}
                  </div>
                  <button onClick={start} className="t-mono inline-flex h-12 items-center gap-2 rounded-full bg-accent px-7 text-ink hover:brightness-110">
                    {state === "ended" ? <><RotateCcw className="h-4 w-4" /> Start again</> : "Start interview"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {live && partial && (
              <p className="absolute inset-x-6 bottom-6 mx-auto max-w-[36ch] text-balance text-center text-[1.1rem] leading-snug tracking-[-0.02em] sm:text-[1.35rem]">{partial}</p>
            )}
          </div>

          {/* Panel */}
          <div className="flex min-h-[560px] flex-col border-t border-white/10 bg-ink lg:border-l lg:border-t-0">
            <div className="border-b border-white/10 p-5">
              <div className="flex items-center justify-between">
                <p className="t-mono text-paper/50">Rubric</p>
                <p className="t-mono text-paper/30">Demo scoring</p>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3">
                {(signals.length ? signals : [{ key: "structure", label: "Structure", value: 0 }, { key: "evidence", label: "Evidence & metrics", value: 0 }, { key: "ownership", label: "Ownership", value: 0 }, { key: "clarity", label: "Clarity", value: 0 }]).map((s) => (
                  <div key={s.key}>
                    <div className="flex justify-between text-[0.82rem]"><span className="text-paper/80">{s.label}</span><span className="tabular-nums text-paper/50">{s.value ? (s.value * 4).toFixed(1) : "–"}</span></div>
                    <div className="mt-1.5 h-[3px] rounded bg-white/10"><div className="h-full rounded bg-paper transition-[width] duration-700" style={{ width: `${s.value * 100}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>

            <div ref={log} className="flex-1 space-y-4 overflow-y-auto p-5" aria-live="polite" style={{ maxHeight: 420 }}>
              {turns.length === 0 && !partial && (
                <p className="t-body text-paper/40">The transcript appears here. Each answer is timestamped and linked to the rubric line it supports.</p>
              )}
              {turns.map((t) => (
                <div key={t.id} className={t.speaker === "candidate" ? "ml-8 rounded-[12px] bg-white/[0.07] p-3.5" : ""}>
                  <p className="t-mono mb-1 text-paper/40">{t.speaker === "agent" ? "Aarohi" : "You"}</p>
                  <p className="text-[0.95rem] leading-relaxed text-paper/85">{t.text}</p>
                </div>
              ))}
              {state === "thinking" && <p className="t-mono text-paper/40">Aarohi is thinking…</p>}
            </div>

            <div className="border-t border-white/10 p-4">
              {note && <p className="mb-3 text-[0.82rem] text-paper/60">{note}</p>}
              <form className="flex items-end gap-2" onSubmit={(e) => { e.preventDefault(); send(); }}>
                <button type="button" onClick={toggleMic} disabled={!canAnswer} aria-pressed={mic} aria-label={mic ? "Stop microphone" : "Answer with microphone"}
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-full transition disabled:opacity-30 ${mic ? "bg-accent text-ink" : "bg-white/10 hover:bg-white/20"}`}>
                  {mic ? <MicOff className="h-[18px] w-[18px]" /> : <Mic className="h-[18px] w-[18px]" />}
                </button>
                <label htmlFor="demo-answer" className="sr-only">Your answer</label>
                <textarea id="demo-answer" rows={1} value={draft} disabled={!canAnswer}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder={canAnswer ? "Type your answer…" : live ? "Wait for the question…" : "Start the interview to answer"}
                  className="min-h-11 flex-1 resize-none rounded-[22px] bg-white/[0.07] px-4 py-2.5 text-paper outline-none placeholder:text-paper/35 focus:bg-white/10 disabled:opacity-50" />
                <button type="submit" disabled={!canAnswer || !draft.trim()} aria-label="Send answer"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-paper text-ink disabled:opacity-30"><ArrowUp className="h-[18px] w-[18px]" /></button>
              </form>
              <div className="mt-3 flex items-center justify-between gap-2">
                <button onClick={useSample} disabled={!canAnswer} className="t-mono inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-paper/70 hover:bg-white/10 disabled:opacity-30">
                  <Sparkles className="h-3.5 w-3.5" /> Use a sample answer
                </button>
                <button onClick={() => client.end()} disabled={!live} className="t-mono inline-flex h-10 items-center gap-1.5 rounded-full bg-white/10 px-4 hover:bg-accent hover:text-ink disabled:opacity-30">
                  <PhoneOff className="h-3.5 w-3.5" /> End
                </button>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-3 text-[0.8rem] text-paper/40">Preview build: questions and scoring run locally on mock data. Production connects real-time video and voice, with Claude reasoning over your rubric.</p>
      </div>
    </section>
  );
}
