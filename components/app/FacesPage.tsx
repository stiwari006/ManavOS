"use client";
import { Check, Clock, ImageIcon, Loader2, PersonStanding, Trash2, Upload, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/client/api";
import { SiteLink } from "@/lib/site/link";
import type { Face } from "@/lib/types";
import { PageTitle, ago, btnDark, btnLine, card, field, useApp } from "./AppShell";

const KINDS = [
  { k: "full", icon: PersonStanding, title: "Full body", sub: "Head to toe, vertical video. Best for coaches, hosts and instructors." },
  { k: "head", icon: UserRound, title: "Head & shoulders", sub: "Classic video-call framing. Best for interviewers and support." },
  { k: "photo", icon: ImageIcon, title: "From a photo", sub: "Quickest. One clear, front-facing photo." },
] as const;

const GUIDE: Record<Face["kind"], string[]> = {
  full: [
    "Record vertically (portrait), head to toe in frame. 1080p minimum, 4K ideal, 25+ fps.",
    "One continuous take: 30 seconds talking naturally, then 30 seconds standing still, lips closed, looking at the camera.",
    "Stand still the whole time. No hand gestures or big movements.",
    "Even lighting, plain background, clothes that contrast with it. No hats, glasses or jewelry; hair behind shoulders.",
  ],
  head: [
    "Sit about 3 ft from the camera; face fills at least a quarter of the frame, shoulders and upper chest visible.",
    "One continuous take: 30 seconds talking naturally, then 30 seconds still, lips closed, looking at the camera.",
    "Record with a camera or desktop app (not a browser), 1080p+, 25+ fps. Keep neck and jawline visible.",
    "Even lighting, plain background. No hands near your face, no hats or glasses.",
  ],
  photo: [
    "One sharp, well-lit, front-facing photo. Face and shoulders visible, neutral expression, mouth closed.",
    "No sunglasses, hats or anything covering the face. Plain background works best.",
  ],
};

const STATUS: Record<Face["status"], { label: string; cls: string; icon: typeof Check }> = {
  training: { label: "Training", cls: "bg-paper text-ink", icon: Clock },
  ready: { label: "Ready", cls: "bg-ink text-paper", icon: Check },
  error: { label: "Failed", cls: "bg-accent-soft text-ink", icon: X },
};

export function FacesPage() {
  const { caps } = useApp();
  const [faces, setFaces] = useState<Face[] | null>(null);
  const [max, setMax] = useState(1);
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState("");

  const load = () => api.faces.list().then((d) => { setFaces(d.faces); setMax(d.limit); }).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);
  // Poll while anything is training.
  useEffect(() => {
    if (!faces?.some((f) => f.status === "training")) return;
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [faces]);

  const active = faces?.filter((f) => f.status !== "error").length ?? 0;
  const enabled = caps?.faces;

  return (
    <>
      <PageTitle
        title="Faces"
        sub="Create an AI human from your own footage, then give it to any persona."
        action={enabled && !creating ? <button onClick={() => setCreating(true)} disabled={active >= max} className={btnDark}><Upload size={15} /> Create a face</button> : undefined}
      />
      {!enabled && (
        <div className={`${card} mb-6 p-5 text-[0.95rem]`}>
          Face training turns on once the Tavus API key is added to the server. Until then, personas use the stock faces.
        </div>
      )}
      {err && <p role="alert" className="mb-4 rounded-[10px] bg-accent-soft px-4 py-3 text-[0.9rem]">{err}</p>}
      {creating && <CreateFace uploads={!!caps?.uploads} onDone={() => { setCreating(false); load(); }} onCancel={() => setCreating(false)} />}

      {faces === null ? <p className="text-mute">Loading…</p> : faces.length === 0 && !creating ? (
        <div className={`${card} p-8`}>
          <p className="font-medium">No custom faces yet</p>
          <p className="mt-1 max-w-[52ch] text-mute">Record a one-minute video, upload it, and in a few hours you'll have a photoreal AI human that looks and sounds like the person in it.</p>
          {enabled && <button onClick={() => setCreating(true)} className={`${btnDark} mt-5`}><Upload size={15} /> Create your first face</button>}
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {faces.map((f) => {
            const st = STATUS[f.status]; const Icon = st.icon;
            return (
              <li key={f.id} className={`${card} p-5`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{f.name}</p>
                    <p className="t-mono mt-1 text-mute">{KINDS.find((k) => k.k === f.kind)?.title} · {ago(f.createdAt)}</p>
                  </div>
                  <span className={`t-mono inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 ${st.cls}`}>
                    {f.status === "training" ? <Loader2 size={12} className="animate-spin" /> : <Icon size={12} />}{st.label}
                  </span>
                </div>
                <p className="mt-3 text-[0.88rem] text-mute">
                  {f.status === "training" ? "Usually ready in 3–4 hours. You can leave this page." : f.status === "ready" ? "Ready. Pick it in any persona's Face settings." : f.error}
                </p>
                <p className="mt-2 text-[0.8rem] text-mute">Consent: {f.consent.by}</p>
                <div className="mt-4 flex gap-2">
                  {f.status === "ready" && <SiteLink href="/app/personas/new" className={btnLine}>Use in a persona</SiteLink>}
                  <button
                    aria-label={`Delete ${f.name}`}
                    onClick={async () => { if (confirm(`Delete "${f.name}"? Personas using it go back to a stock face.`)) { await api.faces.remove(f.id); load(); } }}
                    className={`${btnLine} px-3`}
                  ><Trash2 size={15} /></button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-6 text-[0.85rem] text-mute">Your plan includes {max} custom face{max === 1 ? "" : "s"}. <SiteLink href="/app/usage" className="underline">Need more?</SiteLink></p>
    </>
  );
}

function CreateFace({ uploads, onDone, onCancel }: { uploads: boolean; onDone: () => void; onCancel: () => void }) {
  const [kind, setKind] = useState<Face["kind"]>("full");
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [consent, setConsent] = useState<"self" | "permission" | "">("");
  const [consentName, setConsentName] = useState("");
  const [agree, setAgree] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [err, setErr] = useState("");
  const input = useRef<HTMLInputElement>(null);

  const accept = kind === "photo" ? "image/jpeg,image/png" : "video/mp4,video/webm,video/quicktime";
  const ready = name.trim() && (file || url.trim()) && consent && consentName.trim() && agree && progress === null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr("");
    if (file && file.size > 750 * 1024 * 1024) { setErr("Files must be under 750 MB."); return; }
    try {
      setProgress(0);
      const key = file ? await api.faces.upload(file, setProgress) : undefined;
      await api.faces.create({ name: name.trim(), kind, key, url: key ? undefined : url.trim(), consent: consent as "self" | "permission", consentName: consentName.trim() });
      onDone();
    } catch (x) { setErr((x as Error).message); setProgress(null); }
  };

  return (
    <form onSubmit={submit} className={`${card} mb-6 grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_320px]`}>
      <div className="min-w-0">
        <p className="t-mono mb-3 text-mute">1 · Type</p>
        <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Face type">
          {KINDS.map(({ k, icon: Icon, title, sub }) => (
            <button key={k} type="button" role="radio" aria-checked={kind === k} onClick={() => { setKind(k); setFile(null); }}
              className={`rounded-[12px] border-2 p-3.5 text-left transition ${kind === k ? "border-ink" : "border-line hover:border-ink/40"}`}>
              <Icon size={18} /><p className="mt-2 font-medium">{title}</p><p className="mt-1 text-[0.82rem] text-mute">{sub}</p>
            </button>
          ))}
        </div>

        <p className="t-mono mb-3 mt-6 text-mute">2 · Footage</p>
        <label className="grid gap-1.5"><span className="text-[0.88rem]">Face name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className={field} placeholder="Aarohi — yoga teacher" />
        </label>
        {uploads && (
          <div className="mt-3">
            <input ref={input} type="file" accept={accept} className="sr-only" onChange={(e) => { setFile(e.target.files?.[0] || null); setUrl(""); }} />
            <button type="button" onClick={() => input.current?.click()} className="flex w-full flex-col items-center gap-2 rounded-[12px] border-2 border-dashed border-line p-6 text-center hover:border-ink/40">
              <Upload size={20} />
              <span className="font-medium">{file ? file.name : kind === "photo" ? "Choose a photo" : "Choose a video"}</span>
              <span className="text-[0.82rem] text-mute">{file ? `${(file.size / 1048576).toFixed(1)} MB` : kind === "photo" ? ".jpg or .png" : ".mp4, .webm or .mov · up to 750 MB"}</span>
            </button>
          </div>
        )}
        {!file && (
          <label className="mt-3 grid gap-1.5"><span className="text-[0.88rem]">{uploads ? "…or paste a direct link" : "Direct link to the file"} <span className="text-mute">(public https download link)</span></span>
            <input value={url} onChange={(e) => setUrl(e.target.value)} type="url" className={field} placeholder="https://…/recording.mp4" />
          </label>
        )}

        <p className="t-mono mb-3 mt-6 text-mute">3 · Consent</p>
        <fieldset className="grid gap-2">
          <legend className="sr-only">Who is in the footage?</legend>
          {([["self", "This is me."], ["permission", "This is someone else, and I have their written permission."]] as const).map(([v, l]) => (
            <label key={v} className="flex items-center gap-2.5 text-[0.95rem]"><input type="radio" name="consent" checked={consent === v} onChange={() => setConsent(v)} /> {l}</label>
          ))}
        </fieldset>
        <label className="mt-3 grid gap-1.5"><span className="text-[0.88rem]">Full name of the person in the footage</span>
          <input value={consentName} onChange={(e) => setConsentName(e.target.value)} className={field} autoComplete="off" />
        </label>
        <label className="mt-3 flex items-start gap-2.5 text-[0.88rem]">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1" />
          <span>I confirm this AI likeness will always be disclosed as AI, and won't be used to impersonate anyone or deceive people. See the <SiteLink href="/legal/acceptable-use" className="underline">acceptable use policy</SiteLink>.</span>
        </label>

        {err && <p role="alert" className="mt-4 rounded-[10px] bg-accent-soft px-4 py-3 text-[0.9rem]">{err}</p>}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button disabled={!ready} className={btnDark}>{progress === null ? "Start training" : progress < 1 ? `Uploading ${Math.round(progress * 100)}%` : "Starting…"}</button>
          <button type="button" onClick={onCancel} disabled={progress !== null} className={btnLine}>Cancel</button>
        </div>
        {progress !== null && progress < 1 && <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full bg-ink transition-all" style={{ width: `${progress * 100}%` }} /></div>}
      </div>

      <aside className="rounded-[12px] bg-paper p-4">
        <p className="t-mono text-mute">Recording guide</p>
        <ul className="mt-3 grid gap-2.5 text-[0.88rem]">
          {GUIDE[kind].map((g) => <li key={g} className="flex gap-2"><Check size={14} className="mt-1 shrink-0" />{g}</li>)}
        </ul>
        {kind === "full" && <p className="mt-4 text-[0.82rem] text-mute">Full-body faces talk and gesture lightly while standing. They don't perform movements like exercises or dance.</p>}
      </aside>
    </form>
  );
}
