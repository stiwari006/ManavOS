"use client";
import { ArrowUp, Mic, MicOff, PhoneOff, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/client/api";
import { PERSONAS, type PersonaKey } from "@/lib/render/engine";
import { SiteLink, go } from "@/lib/site/link";
import type { Conversation, Persona, Turn } from "@/lib/types";
import { DitherHuman } from "../DitherHuman";
import { btnDark, btnLine, card, field, useApp, useParam } from "./AppShell";
import { useSpeech } from "./useSpeech";

type Phase = "listening" | "thinking" | "speaking";

/** Shared voice/text conversation stage: rendered persona, captions, mic, transcript. */
export function VoiceStage({ name, look, turns, onSend, onEnd, endLabel = "End", note, maleVoice }: {
  name: string; look: PersonaKey; turns: Turn[]; note?: string; maleVoice?: boolean;
  onSend: (text: string, onChunk: (s: string) => void) => Promise<string>; onEnd?: () => void; endLabel?: string;
}) {
  const [phase, setPhase] = useState<Phase>("listening");
  const [caption, setCaption] = useState(turns.at(-1)?.role === "assistant" ? turns.at(-1)!.content : "");
  const [draft, setDraft] = useState("");
  const [voiceOn, setVoiceOn] = useState(true);
  const [err, setErr] = useState("");
  const [log, setLog] = useState<Turn[]>(turns);
  const sp = useSpeech("en-US");
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => { setLog(turns); }, [turns]);
  useEffect(() => { box.current?.scrollTo({ top: box.current.scrollHeight, behavior: "smooth" }); }, [log, caption]);

  const speak = async (text: string) => { if (!voiceOn) return; setPhase("speaking"); await sp.say(text, maleVoice ? "male" : "female"); setPhase("listening"); };

  const send = async (text: string) => {
    const t = text.trim(); if (!t || phase === "thinking") return;
    sp.hush(); setErr(""); setDraft("");
    setLog((l) => [...l, { role: "user", content: t, at: Date.now() }]);
    setPhase("thinking"); setCaption("");
    try {
      const full = await onSend(t, (s) => { setCaption(s); setPhase("speaking"); });
      setLog((l) => [...l, { role: "assistant", content: full, at: Date.now() }]);
      setCaption(full);
      if (voiceOn) await speak(full); else setPhase("listening");
    } catch (e) { setErr((e as Error).message); setPhase("listening"); }
  };

  const mic = () => {
    if (sp.listening) { sp.stop(); return; }
    sp.hush();
    if (!sp.listen((t) => send(t))) setErr("Voice input isn't available in this browser. Type instead.");
  };

  const speakingNow = phase === "speaking" || sp.speaking;

  return (
    <div className="grid overflow-hidden rounded-[18px] border border-line bg-ink text-paper lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="relative aspect-[4/5] sm:aspect-[16/11] lg:aspect-auto lg:min-h-[620px]">
        <DitherHuman persona={look} scene="night" dark="#121213" light="#f2efe8" cell={3} yaw={0.15} speaking={speakingNow} follow label={`${name}, speaking`} />
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-ink/70 px-3.5 py-2 backdrop-blur">
          <span className={`h-2 w-2 rounded-full ${sp.listening ? "live-dot bg-accent" : "bg-paper/50"}`} />
          <span className="t-mono">{sp.listening ? "Listening to you" : phase === "thinking" ? "Thinking" : speakingNow ? "Speaking" : "Your turn"}</span>
        </div>
        <button onClick={() => { setVoiceOn(!voiceOn); sp.hush(); }} aria-label={voiceOn ? "Mute persona voice" : "Unmute persona voice"} className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-ink/70 backdrop-blur hover:bg-ink">
          {voiceOn ? <Volume2 className="h-[18px] w-[18px]" /> : <VolumeX className="h-[18px] w-[18px]" />}
        </button>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[28%] bg-gradient-to-t from-ink/90 via-ink/40 to-transparent" />
        {(sp.interim || caption) && <p aria-live="polite" className="absolute inset-x-6 bottom-20 mx-auto w-fit max-w-[52ch] rounded-[10px] bg-black/55 px-3.5 py-2 text-balance text-center text-[0.98rem] leading-snug backdrop-blur-sm sm:text-[1.1rem]">{sp.interim || caption}</p>}
        <div className="absolute inset-x-0 bottom-5 flex justify-center gap-2">
          <button onClick={mic} aria-pressed={sp.listening} aria-label={sp.listening ? "Stop listening" : "Speak"} className={`grid h-12 w-12 place-items-center rounded-full transition ${sp.listening ? "bg-accent text-ink" : "bg-white/15 hover:bg-white/25"}`}>
            {sp.listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
          {onEnd && <button onClick={() => { sp.hush(); onEnd(); }} className="t-mono inline-flex h-12 items-center gap-2 rounded-full bg-accent px-5 text-ink"><PhoneOff className="h-4 w-4" />{endLabel}</button>}
        </div>
      </div>
      <div className="flex min-h-[420px] flex-col border-t border-white/10 lg:border-l lg:border-t-0">
        <div ref={box} className="flex-1 space-y-4 overflow-y-auto p-5" style={{ maxHeight: 520 }}>
          {log.map((t, i) => (
            <div key={i} className={t.role === "user" ? "ml-8 rounded-[12px] bg-white/[0.07] p-3.5" : ""}>
              <p className="t-mono mb-1 text-paper/40">{t.role === "assistant" ? name : "You"}</p>
              <p className="text-[0.95rem] leading-relaxed text-paper/85">{t.content}</p>
            </div>
          ))}
          {phase === "thinking" && <p className="t-mono text-paper/40">{name} is thinking…</p>}
        </div>
        <div className="border-t border-white/10 p-4">
          {err && <p role="alert" className="mb-2 text-[0.85rem] text-accent">{err}</p>}
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); send(draft); }}>
            <label htmlFor="live-input" className="sr-only">Message</label>
            <input id="live-input" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`Say something to ${name}…`} className="h-11 flex-1 rounded-full bg-white/[0.08] px-4 text-paper outline-none placeholder:text-paper/35 focus:bg-white/12" />
            <button disabled={!draft.trim() || phase === "thinking"} aria-label="Send" className="grid h-11 w-11 place-items-center rounded-full bg-paper text-ink disabled:opacity-30"><ArrowUp className="h-[18px] w-[18px]" /></button>
          </form>
          {note && <p className="mt-3 text-[0.78rem] text-paper/40">{note}</p>}
        </div>
      </div>
    </div>
  );
}

/** /app/live — starts (or rejoins) a conversation in the best available mode. */
export function LivePage() {
  const { caps } = useApp();
  const personaId = useParam("persona");
  const convId = useParam("id");
  const [persona, setPersona] = useState<Persona | null>(null);
  const [conv, setConv] = useState<Conversation | null>(null);
  const [participant, setParticipant] = useState("");
  const [context, setContext] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (convId) api.conversations.get(convId).then(async (c) => { setConv(c); setPersona(await api.personas.get(c.personaId)); }).catch((e) => setErr(e.message));
    else if (personaId) api.personas.get(personaId).then(setPersona).catch((e) => setErr(e.message));
  }, [personaId, convId]);

  const start = async (mode?: string) => {
    if (!persona) return;
    setBusy(true); setErr("");
    try { setConv(await api.conversations.create({ personaId: persona.id, participant: participant || undefined, context: context || undefined, meetingUrl: meetingUrl || undefined, mode })); }
    catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };
  const end = async () => { if (!conv) return; const c = await api.conversations.end(conv.id); go(`/app/conversations/view?id=${c.id}`); };

  if (err && !persona) return <p role="alert" className="rounded-[10px] bg-accent-soft px-4 py-3">{err}</p>;
  if (!persona) {
    if (personaId === null && convId === null) return <p className="t-mono text-mute">Loading…</p>;
    return <p className="t-mono text-mute">Loading persona…</p>;
  }
  const lk = (persona.look in PERSONAS ? persona.look : "aarohi") as PersonaKey;

  if (!conv) {
    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="aspect-[4/3] overflow-hidden rounded-[18px] bg-ink"><DitherHuman persona={lk} scene="night" dark="#0f0f10" light="#f2efe8" cell={3} yaw={0.2} follow label={`${persona.name} waiting to start`} /></div>
        <div className={`${card} p-6`}>
          <p className="t-mono text-mute">{persona.role}</p>
          <h1 className="mt-2 text-[2.2rem] font-medium leading-none tracking-[-0.045em]">Talk to {persona.name}</h1>
          <p className="mt-3 text-ink/65">{persona.greeting}</p>
          <div className="mt-6 grid gap-3">
            <label className="grid gap-1.5"><span className="text-[0.88rem]">Participant tag <span className="text-mute">(for memory, optional)</span></span><input value={participant} onChange={(e) => setParticipant(e.target.value)} className={field} placeholder="cand_0412" /></label>
            <label className="grid gap-1.5"><span className="text-[0.88rem]">Context for this session <span className="text-mute">(optional)</span></span><input value={context} onChange={(e) => setContext(e.target.value)} className={field} placeholder="Role: Data analyst, mid-level" /></label>
            {caps.video && <label className="grid gap-1.5"><span className="text-[0.88rem]">Send into a meeting <span className="text-mute">(Meet, Zoom or Teams link, optional)</span></span><input value={meetingUrl} onChange={(e) => setMeetingUrl(e.target.value)} className={field} placeholder="https://meet.google.com/…" /></label>}
          </div>
          {err && <p role="alert" className="mt-4 rounded-[10px] bg-accent-soft px-4 py-3 text-[0.9rem]">{err}</p>}
          <div className="mt-6 flex flex-wrap gap-2">
            <button onClick={() => start()} disabled={busy} className={btnDark}>{busy ? "Connecting…" : caps.video ? "Start video call" : caps.claude ? "Start voice session" : "Start preview"}</button>
            {caps.video && caps.claude && <button onClick={() => start("voice")} disabled={busy} className={btnLine}>Voice only</button>}
          </div>
          <p className="mt-4 text-[0.8rem] text-mute">{caps.video ? "Photoreal video via Tavus, with Claude as the brain. Allow camera and microphone." : caps.claude ? "Rendered persona with your browser's voice, Claude as the brain. Add Tavus keys for photoreal video." : "Preview mode: scripted replies. Add Anthropic and Tavus keys for live sessions."}</p>
        </div>
      </div>
    );
  }

  if (conv.mode === "video" && conv.joinUrl) {
    return (
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="overflow-hidden rounded-[18px] bg-ink">
          <iframe src={conv.joinUrl} title={`Video call with ${persona.name}`} allow="camera; microphone; fullscreen; display-capture; autoplay" className="aspect-[16/10] w-full" />
        </div>
        <div className={`${card} flex flex-col p-5`}>
          <p className="t-mono flex items-center gap-2 text-mute"><span className="live-dot h-2 w-2 rounded-full bg-accent" />Live video</p>
          <p className="mt-2 text-[1.6rem] font-medium tracking-[-0.04em]">{persona.name}</p>
          <p className="text-[0.9rem] text-mute">{persona.role}</p>
          <p className="mt-4 text-[0.88rem] text-ink/65">The transcript and scorecard appear in Conversations when the call ends.</p>
          <a href={conv.joinUrl} target="_blank" rel="noreferrer" className="t-mono mt-4 text-mute underline-offset-4 hover:underline">Open in a new tab</a>
          <button onClick={end} className={`${btnDark} mt-auto`}><PhoneOff className="h-4 w-4" />End call</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div><p className="t-mono text-mute">{conv.mode === "voice" ? "Voice session · Claude" : "Preview session"}</p><h1 className="text-[1.8rem] font-medium tracking-[-0.04em]">{persona.name}</h1></div>
        <SiteLink href="/app/conversations" className="t-mono text-mute hover:text-ink">All conversations</SiteLink>
      </div>
      <VoiceStage name={persona.name} look={lk} turns={conv.transcript} maleVoice={["dev", "omar", "henry"].includes(lk)}
        onSend={(t, c) => api.conversations.turn(conv.id, t, c)} onEnd={end} endLabel="End and score"
        note={conv.mode === "preview" ? "Preview replies are scripted. Connect Claude for real conversation." : "Tap the mic and talk, or type. Replies are spoken with your browser's voice."} />
    </>
  );
}
