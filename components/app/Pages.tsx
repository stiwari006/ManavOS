"use client";
import { ArrowRight, Check, Copy, Plus, RotateCcw, Trash2, Video } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api, type ConvSummary, type DocView, type Usage } from "@/lib/client/api";
import type { PersonaKey } from "@/lib/render/engine";
import { PERSONAS } from "@/lib/render/engine";
import { SiteLink, go } from "@/lib/site/link";
import type { ApiKeyView, Conversation, Persona } from "@/lib/types";
import { DitherHuman } from "../DitherHuman";
import { PageTitle, ago, btnDark, btnLine, card, dur, field, useApp, useParam } from "./AppShell";

const look = (p: Persona) => (p.look in PERSONAS ? p.look : "aarohi") as PersonaKey;

function Empty({ text, action }: { text: string; action?: React.ReactNode }) {
  return <div className={`${card} flex flex-col items-start gap-4 p-8`}><p className="text-ink/65">{text}</p>{action}</div>;
}
function Err({ msg }: { msg: string }) { return msg ? <p role="alert" className="mb-4 rounded-[10px] bg-accent-soft px-4 py-3 text-[0.9rem]">{msg}</p> : null; }

/* ───────── Overview ───────── */
export function OverviewPage() {
  const { user, caps } = useApp();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [convs, setConvs] = useState<ConvSummary[]>([]);
  const [usage, setUsage] = useState<Usage | null>(null);
  useEffect(() => { api.personas.list().then(setPersonas); api.conversations.list().then(setConvs); api.usage().then(setUsage); }, []);
  const status = [
    { k: "Video (Tavus)", on: caps.video, help: "Set TAVUS_API_KEY and TAVUS_DEFAULT_FACE_ID" },
    { k: "Brain (Claude)", on: caps.claude, help: "Set ANTHROPIC_API_KEY" },
  ];
  return (
    <>
      <PageTitle title={`Hi, ${user.name.split(" ")[0]}.`} sub="Talk to a persona, build your own, or start a session through the API." action={<SiteLink href="/app/personas/new" className={btnDark}><Plus className="h-4 w-4" />New persona</SiteLink>} />
      <div className="grid gap-3 md:grid-cols-3">
        <div className={`${card} p-5`}>
          <p className="t-mono text-mute">This month</p>
          <p className="mt-3 text-[2.4rem] font-medium leading-none tracking-[-0.05em]">{usage?.minutes ?? 0}<span className="ml-1 text-[1rem] text-mute">/ {usage?.included ?? 0} min</span></p>
          <div className="mt-4 h-1.5 rounded bg-sand"><div className="h-full rounded bg-ink" style={{ width: `${Math.min(100, ((usage?.minutes ?? 0) / Math.max(1, usage?.included ?? 1)) * 100)}%` }} /></div>
        </div>
        <div className={`${card} p-5`}>
          <p className="t-mono text-mute">Conversations</p>
          <p className="mt-3 text-[2.4rem] font-medium leading-none tracking-[-0.05em]">{usage?.conversations ?? 0}</p>
          <p className="mt-3 text-[0.88rem] text-mute">{personas.length} personas in this workspace</p>
        </div>
        <div className={`${card} p-5`}>
          <p className="t-mono text-mute">Integrations</p>
          <ul className="mt-3 space-y-2">
            {status.map((s) => (
              <li key={s.k} className="flex items-center justify-between gap-3 text-[0.92rem]">
                <span>{s.k}</span>
                <span className={`t-mono rounded-full px-2.5 py-1 ${s.on ? "bg-ink text-paper" : "bg-sand text-mute"}`} title={s.on ? "" : s.help}>{s.on ? "Live" : caps.demo ? "Preview" : "Not set"}</span>
              </li>
            ))}
          </ul>
          {!caps.video && !caps.demo && <p className="mt-3 text-[0.8rem] text-mute">Without Tavus, sessions run in voice mode with a rendered persona.</p>}
        </div>
      </div>

      <h2 className="mb-4 mt-12 text-[1.4rem] font-medium tracking-[-0.03em]">Talk to a persona</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {personas.slice(0, 6).map((p) => (
          <SiteLink key={p.id} href={`/app/live?persona=${p.id}`} className={`${card} group overflow-hidden`}>
            <div className="aspect-[16/10] bg-ink"><DitherHuman persona={look(p)} scene="close" dark="#0f0f10" light="#f2efe8" cell={2} yaw={0.25} label={`${p.name} persona`} /></div>
            <div className="flex items-center justify-between p-4">
              <span><span className="block font-medium">{p.name}</span><span className="text-[0.85rem] text-mute">{p.role}</span></span>
              <Video className="h-5 w-5 transition-transform group-hover:scale-110" strokeWidth={1.5} />
            </div>
          </SiteLink>
        ))}
      </div>

      <div className="mb-4 mt-12 flex items-center justify-between"><h2 className="text-[1.4rem] font-medium tracking-[-0.03em]">Recent conversations</h2><SiteLink href="/app/conversations" className="t-mono text-mute hover:text-ink">View all</SiteLink></div>
      {convs.length ? <ConvTable rows={convs.slice(0, 5)} /> : <Empty text="No conversations yet. Start one from a persona above." />}
    </>
  );
}

function ConvTable({ rows }: { rows: ConvSummary[] }) {
  return (
    <div className={`${card} overflow-x-auto`}>
      <table className="w-full min-w-[640px] text-left text-[0.92rem]">
        <thead><tr className="border-b border-line">{["Persona", "Mode", "Status", "Turns", "Length", "Started", ""].map((h) => <th key={h} className="t-mono px-4 py-3 font-normal text-mute">{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id} className="border-b border-line last:border-0 hover:bg-paper">
              <td className="px-4 py-3 font-medium">{c.personaName}</td>
              <td className="px-4 py-3 capitalize">{c.mode}</td>
              <td className="px-4 py-3"><span className={`t-mono rounded-full px-2 py-1 ${c.status === "active" ? "bg-accent-soft" : "bg-sand"}`}>{c.status}</span></td>
              <td className="px-4 py-3 tabular-nums">{c.turns}</td>
              <td className="px-4 py-3 tabular-nums">{dur(c.seconds)}</td>
              <td className="px-4 py-3 text-mute">{ago(c.startedAt)}</td>
              <td className="px-4 py-3 text-right"><SiteLink href={c.status === "active" ? `/app/live?id=${c.id}` : `/app/conversations/view?id=${c.id}`} className="t-mono underline-offset-4 hover:underline">{c.status === "active" ? "Rejoin" : "Open"}</SiteLink></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ───────── Personas ───────── */
export function PersonasPage() {
  const [list, setList] = useState<Persona[] | null>(null);
  useEffect(() => { api.personas.list().then(setList); }, []);
  return (
    <>
      <PageTitle title="Personas" sub="Each persona is a face, a voice, a personality and the knowledge it can use." action={<SiteLink href="/app/personas/new" className={btnDark}><Plus className="h-4 w-4" />New persona</SiteLink>} />
      {list && !list.length && <Empty text="No personas yet." action={<SiteLink href="/app/personas/new" className={btnDark}>Create your first persona</SiteLink>} />}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list?.map((p) => (
          <div key={p.id} className={`${card} overflow-hidden`}>
            <div className="aspect-[4/3] bg-paper"><DitherHuman persona={look(p)} scene="paper" dark="#0f0f10" light="#faf8f4" cell={2} yaw={0.2} label={`${p.name} persona`} /></div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-[1.2rem] font-medium tracking-[-0.03em]">{p.name}</p><p className="text-[0.88rem] text-mute">{p.role}</p></div>
                {p.stock && <span className="t-mono rounded-full bg-sand px-2 py-1 text-mute">Stock</span>}
              </div>
              <p className="mt-3 line-clamp-2 text-[0.88rem] text-ink/65">{p.systemPrompt}</p>
              <div className="mt-5 flex gap-2">
                <SiteLink href={`/app/live?persona=${p.id}`} className={`${btnDark} flex-1`}>Talk</SiteLink>
                <SiteLink href={`/app/personas/edit?id=${p.id}`} className={`${btnLine} flex-1`}>Edit</SiteLink>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

const LOOKS: { k: PersonaKey; n: string }[] = [{ k: "aarohi", n: "Aarohi" }, { k: "dev", n: "Dev" }, { k: "mira", n: "Mira" }, { k: "omar", n: "Omar" }, { k: "ines", n: "Inès" }, { k: "henry", n: "Henry" }];

export function PersonaEditor() {
  const id = useParam("id");
  const [p, setP] = useState<Partial<Persona>>({ name: "", role: "", look: "aarohi", systemPrompt: "", greeting: "", languages: ["en"], rubric: [], memory: true, perception: true, documentIds: [] });
  const [docs, setDocs] = useState<DocView[]>([]);
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    api.docs.list().then(setDocs);
    if (id) api.personas.get(id).then(setP).catch((e) => setErr(e.message));
  }, [id]);
  const set = (k: keyof Persona, v: unknown) => { setP((x) => ({ ...x, [k]: v })); setSaved(false); };
  const save = async (thenTalk = false) => {
    setErr(""); setBusy(true);
    try {
      if (!p.name?.trim()) throw new Error("Give your persona a name");
      const out = id ? await api.personas.update(id, p) : await api.personas.create(p);
      setSaved(true);
      if (thenTalk) go(`/app/live?persona=${out.id}`); else if (!id) go(`/app/personas/edit?id=${out.id}`);
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };
  return (
    <>
      <PageTitle title={id ? `Edit ${p.name || "persona"}` : "New persona"} sub="Changes apply to the next conversation." action={
        <div className="flex gap-2">
          <button onClick={() => save(false)} disabled={busy} className={btnLine}>{saved ? <><Check className="h-4 w-4" />Saved</> : "Save"}</button>
          <button onClick={() => save(true)} disabled={busy} className={btnDark}>Save and talk</button>
        </div>} />
      <Err msg={err} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className={`${card} p-5`}>
            <p className="t-mono mb-4 text-mute">Identity</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5"><span className="text-[0.88rem]">Name</span><input value={p.name || ""} onChange={(e) => set("name", e.target.value)} className={field} placeholder="Priya" /></label>
              <label className="grid gap-1.5"><span className="text-[0.88rem]">Role</span><input value={p.role || ""} onChange={(e) => set("role", e.target.value)} className={field} placeholder="Onboarding host" /></label>
            </div>
            <p className="mb-2 mt-5 text-[0.88rem]">Face</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6" role="radiogroup" aria-label="Face">
              {LOOKS.map((l) => (
                <button key={l.k} type="button" role="radio" aria-checked={p.look === l.k} onClick={() => set("look", l.k)} className={`overflow-hidden rounded-[10px] border-2 ${p.look === l.k ? "border-ink" : "border-transparent"}`}>
                  <div className="aspect-square bg-paper"><DitherHuman persona={l.k} scene="paper" dark="#0f0f10" light="#faf8f4" cell={2} yaw={0.2} label={l.n} /></div>
                  <span className="block py-1 text-[0.8rem]">{l.n}</span>
                </button>
              ))}
            </div>
            <label className="mt-4 grid gap-1.5"><span className="text-[0.88rem]">Tavus face ID <span className="text-mute">(optional, for a custom video face)</span></span><input value={p.faceId || ""} onChange={(e) => set("faceId", e.target.value)} className={field} placeholder="r4b03c679d42" /></label>
          </section>
          <section className={`${card} p-5`}>
            <p className="t-mono mb-4 text-mute">Personality</p>
            <label className="grid gap-1.5"><span className="text-[0.88rem]">Instructions</span>
              <textarea rows={8} value={p.systemPrompt || ""} onChange={(e) => set("systemPrompt", e.target.value)} className="w-full rounded-[10px] border border-line bg-card p-3.5 outline-none focus:border-ink" placeholder="You are Priya, a friendly onboarding host. You always say you are an AI…" />
            </label>
            <label className="mt-3 grid gap-1.5"><span className="text-[0.88rem]">Greeting</span><input value={p.greeting || ""} onChange={(e) => set("greeting", e.target.value)} className={field} placeholder="Hi, I'm Priya, an AI host. Welcome!" /></label>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5"><span className="text-[0.88rem]">Languages <span className="text-mute">(comma separated)</span></span><input value={(p.languages || []).join(", ")} onChange={(e) => set("languages", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} className={field} /></label>
              <label className="grid gap-1.5"><span className="text-[0.88rem]">Scoring rubric <span className="text-mute">(comma separated)</span></span><input value={(p.rubric || []).join(", ")} onChange={(e) => set("rubric", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} className={field} placeholder="Structure, Clarity" /></label>
            </div>
          </section>
          <section className={`${card} p-5`}>
            <p className="t-mono mb-4 text-mute">Capabilities</p>
            {([["memory", "Memory", "Remember each participant across sessions"], ["perception", "Perception", "See expressions and shared screens (video mode)"]] as const).map(([k, n, d]) => (
              <label key={k} className="flex items-center justify-between gap-4 border-b border-line py-3 last:border-0">
                <span><span className="block">{n}</span><span className="text-[0.85rem] text-mute">{d}</span></span>
                <input type="checkbox" checked={!!p[k]} onChange={(e) => set(k, e.target.checked)} className="h-5 w-5 accent-[var(--color-ink)]" />
              </label>
            ))}
            <p className="mb-2 mt-4 text-[0.88rem]">Knowledge</p>
            {docs.length ? docs.map((d) => (
              <label key={d.id} className="flex items-center gap-3 py-1.5 text-[0.92rem]">
                <input type="checkbox" checked={(p.documentIds || []).includes(d.id)} onChange={(e) => set("documentIds", e.target.checked ? [...(p.documentIds || []), d.id] : (p.documentIds || []).filter((x) => x !== d.id))} className="h-4 w-4 accent-[var(--color-ink)]" />{d.name}
              </label>
            )) : <p className="text-[0.88rem] text-mute">No documents yet. <SiteLink href="/app/knowledge" className="underline">Add some</SiteLink>.</p>}
          </section>
          {id && !p.stock && (
            <button onClick={async () => { if (id) { await api.personas.remove(id); go("/app/personas"); } }} className="t-mono inline-flex items-center gap-2 text-mute hover:text-ink"><Trash2 className="h-4 w-4" />Delete persona</button>
          )}
        </div>
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className={`${card} overflow-hidden`}>
            <div className="aspect-[4/5] bg-ink"><DitherHuman persona={(p.look as PersonaKey) || "aarohi"} scene="night" dark="#0f0f10" light="#f2efe8" cell={3} yaw={0.2} follow label="Persona preview" /></div>
            <div className="p-4"><p className="font-medium">{p.name || "Your persona"}</p><p className="text-[0.85rem] text-mute">{p.greeting || "Greeting appears here"}</p></div>
          </div>
        </aside>
      </div>
    </>
  );
}

/* ───────── Conversations ───────── */
export function ConversationsPage() {
  const [rows, setRows] = useState<ConvSummary[] | null>(null);
  useEffect(() => { api.conversations.list().then(setRows); }, []);
  return (
    <>
      <PageTitle title="Conversations" sub="Every session, with transcript and scorecard." action={<SiteLink href="/app/personas" className={btnDark}>Start a conversation</SiteLink>} />
      {rows && (rows.length ? <ConvTable rows={rows} /> : <Empty text="No conversations yet." action={<SiteLink href="/app/personas" className={btnDark}>Pick a persona</SiteLink>} />)}
    </>
  );
}

export function ConversationView() {
  const id = useParam("id");
  const [c, setC] = useState<Conversation | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!id) return;
    let t: number;
    const load = () => api.conversations.get(id).then((x) => { setC(x); if (x.mode === "video" && !x.transcript.length) t = window.setTimeout(load, 5000); }).catch((e) => setErr(e.message));
    load();
    return () => clearTimeout(t);
  }, [id]);
  if (err) return <Err msg={err} />;
  if (!c) return <p className="t-mono text-mute">Loading…</p>;
  const s = c.scorecard;
  return (
    <>
      <PageTitle title={`${c.personaName} · ${new Date(c.startedAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`} sub={`${c.mode} mode · ${dur(c.seconds)} · ${c.transcript.length} turns`}
        action={<div className="flex gap-2">
          <button disabled={busy} onClick={async () => { setBusy(true); try { setC(await api.conversations.score(c.id)); } catch (e) { setErr((e as Error).message); } setBusy(false); }} className={btnLine}><RotateCcw className="h-4 w-4" />{s ? "Re-score" : "Score"}</button>
          <SiteLink href={`/app/live?persona=${c.personaId}`} className={btnDark}>Talk again</SiteLink>
        </div>} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className={`${card} p-5`}>
          <p className="t-mono mb-4 text-mute">Transcript</p>
          {!c.transcript.length && <p className="text-mute">{c.mode === "video" ? "Waiting for the transcript from the video session… this page refreshes automatically." : "No turns recorded."}</p>}
          <div className="space-y-4">
            {c.transcript.map((t, i) => (
              <div key={i} className={t.role === "user" ? "ml-8 rounded-[12px] bg-paper p-3.5" : ""}>
                <p className="t-mono mb-1 text-mute">{t.role === "assistant" ? c.personaName : c.participant || "Participant"}</p>
                <p className="leading-relaxed">{t.content}</p>
              </div>
            ))}
          </div>
        </section>
        <aside className="space-y-3">
          <section className={`${card} p-5`}>
            <p className="t-mono text-mute">Scorecard</p>
            {s ? (
              <>
                <p className="mt-3 text-[1.5rem] font-medium capitalize tracking-[-0.03em]">{s.recommendation}</p>
                <p className="mt-1 text-[0.92rem] text-ink/70">{s.summary}</p>
                <div className="mt-4 space-y-4">
                  {s.scores.map((x) => (
                    <div key={x.criterion}>
                      <div className="flex justify-between text-[0.92rem]"><span>{x.criterion}</span><span className="tabular-nums">{x.score.toFixed(1)} / 4</span></div>
                      <div className="mt-1.5 h-1.5 rounded bg-sand"><div className="h-full rounded bg-ink" style={{ width: `${(x.score / 4) * 100}%` }} /></div>
                      <p className="mt-1.5 text-[0.82rem] text-mute">&ldquo;{x.evidence}&rdquo;</p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-[0.78rem] text-mute">Scored by {s.model}. Scores support human decisions; review the evidence.</p>
              </>
            ) : <p className="mt-3 text-[0.9rem] text-mute">No scorecard. Add a rubric to the persona, then score this conversation.</p>}
          </section>
          <section className={`${card} p-5`}>
            <p className="t-mono text-mute">Details</p>
            <dl className="mt-3 space-y-2 text-[0.88rem]">
              {[["ID", c.id], ["Source", c.source], ["Participant", c.participant || "–"], ["Video session", c.tavusId || "–"]].map(([k, v]) => <div key={k} className="flex justify-between gap-3"><dt className="text-mute">{k}</dt><dd className="truncate font-mono text-[0.8rem]">{v}</dd></div>)}
            </dl>
          </section>
        </aside>
      </div>
    </>
  );
}

/* ───────── Knowledge ───────── */
export function KnowledgePage() {
  const [docs, setDocs] = useState<DocView[] | null>(null);
  const [mode, setMode] = useState<"text" | "url" | "file">("text");
  const [name, setName] = useState(""); const [text, setText] = useState(""); const [url, setUrl] = useState("");
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const load = () => api.docs.list().then(setDocs);
  useEffect(() => { load(); }, []);
  const add = async () => {
    setErr(""); setBusy(true);
    try { await api.docs.create(mode === "url" ? { name: name || url, url } : { name: name || "Untitled", text }); setName(""); setText(""); setUrl(""); await load(); }
    catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };
  return (
    <>
      <PageTitle title="Knowledge" sub="Documents your personas can draw on. Attach them to a persona in its editor." />
      <div className="grid gap-6 lg:grid-cols-[400px_minmax(0,1fr)]">
        <section className={`${card} p-5 lg:self-start`}>
          <div className="mb-4 flex gap-1" role="tablist">
            {(["text", "file", "url"] as const).map((m) => <button key={m} role="tab" aria-selected={mode === m} onClick={() => setMode(m)} className={`t-mono h-9 rounded-full px-4 ${mode === m ? "bg-ink text-paper" : "hover:bg-sand"}`}>{m === "text" ? "Paste" : m === "file" ? "Upload" : "URL"}</button>)}
          </div>
          <Err msg={err} />
          <label className="grid gap-1.5"><span className="text-[0.88rem]">Name</span><input value={name} onChange={(e) => setName(e.target.value)} className={field} placeholder="Employee handbook" /></label>
          {mode === "text" && <label className="mt-3 grid gap-1.5"><span className="text-[0.88rem]">Content</span><textarea rows={8} value={text} onChange={(e) => setText(e.target.value)} className="w-full rounded-[10px] border border-line bg-card p-3.5 outline-none focus:border-ink" /></label>}
          {mode === "url" && <label className="mt-3 grid gap-1.5"><span className="text-[0.88rem]">Public https URL</span><input value={url} onChange={(e) => setUrl(e.target.value)} className={field} placeholder="https://example.com/faq" /></label>}
          {mode === "file" && (
            <label className="mt-3 grid gap-1.5"><span className="text-[0.88rem]">Text, Markdown or CSV file</span>
              <input type="file" accept=".txt,.md,.csv,.json" className="text-[0.9rem]" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setText(await f.text()); if (!name) setName(f.name); setMode("text"); } }} />
            </label>
          )}
          <button disabled={busy || (mode === "url" ? !url : !text)} onClick={add} className={`${btnDark} mt-4 w-full`}>{busy ? "Adding…" : "Add document"}</button>
        </section>
        <section>
          {docs && !docs.length && <Empty text="No documents yet." />}
          <div className="space-y-2">
            {docs?.map((d) => (
              <div key={d.id} className={`${card} flex items-center justify-between gap-4 p-4`}>
                <div className="min-w-0"><p className="truncate font-medium">{d.name}</p><p className="truncate text-[0.85rem] text-mute">{d.url || `${d.chars.toLocaleString()} characters`} · added {ago(d.createdAt)}</p></div>
                <button aria-label={`Delete ${d.name}`} onClick={async () => { await api.docs.remove(d.id); load(); }} className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-sand"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

/* ───────── API keys ───────── */
export function KeysPage() {
  const [keys, setKeys] = useState<ApiKeyView[] | null>(null);
  const [name, setName] = useState("");
  const [secret, setSecret] = useState("");
  const [copied, setCopied] = useState(false);
  const load = () => api.keys.list().then(setKeys);
  useEffect(() => { load(); }, []);
  const origin = typeof window !== "undefined" ? location.origin : "";
  const curl = `curl -X POST ${origin}/api/v1/conversations \\\n  -H "Authorization: Bearer ${secret || "hos_live_…"}" \\\n  -H "Content-Type: application/json" \\\n  -d '{ "persona_id": "aarohi" }'`;
  return (
    <>
      <PageTitle title="API keys" sub="Use keys from your server only. Never ship them in a browser or mobile app." />
      <section className={`${card} p-5`}>
        <form className="flex flex-wrap gap-2" onSubmit={async (e) => { e.preventDefault(); const r = await api.keys.create(name); setSecret(r.secret); setName(""); load(); }}>
          <label htmlFor="key-name" className="sr-only">Key name</label>
          <input id="key-name" value={name} onChange={(e) => setName(e.target.value)} className={`${field} max-w-[320px] flex-1`} placeholder="Production server" />
          <button className={btnDark}><Plus className="h-4 w-4" />Create key</button>
        </form>
        {secret && (
          <div className="mt-4 rounded-[12px] bg-ink p-4 text-paper">
            <p className="t-mono text-paper/60">Copy this key now. You won&rsquo;t see it again.</p>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 break-all font-mono text-[0.88rem]">{secret}</code>
              <button onClick={async () => { try { await navigator.clipboard.writeText(secret); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {} }} className="t-mono inline-flex h-9 items-center gap-1.5 rounded-full bg-white/10 px-3">{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied ? "Copied" : "Copy"}</button>
            </div>
          </div>
        )}
      </section>
      <div className="mt-4 space-y-2">
        {keys?.map((k) => (
          <div key={k.id} className={`${card} flex items-center justify-between gap-4 p-4`}>
            <div className="min-w-0"><p className="font-medium">{k.name}</p><p className="font-mono text-[0.82rem] text-mute">{k.prefix}… · created {ago(k.createdAt)} · {k.lastUsed ? `used ${ago(k.lastUsed)}` : "never used"}</p></div>
            <button onClick={async () => { await api.keys.remove(k.id); load(); }} className={btnLine}>Revoke</button>
          </div>
        ))}
        {keys && !keys.length && <Empty text="No keys yet." />}
      </div>
      <h2 className="mb-3 mt-10 text-[1.2rem] font-medium tracking-[-0.03em]">Start a conversation</h2>
      <pre className="overflow-x-auto rounded-[12px] bg-ink p-5 text-[0.84rem] leading-[1.7] text-paper"><code>{curl}</code></pre>
      <SiteLink href="/docs/quickstart" className="t-mono mt-3 inline-flex items-center gap-1.5 text-mute hover:text-ink">Full quickstart <ArrowRight className="h-3.5 w-3.5" /></SiteLink>
    </>
  );
}

/* ───────── Usage ───────── */
export function UsagePage() {
  const [u, setU] = useState<Usage | null>(null);
  useEffect(() => { api.usage().then(setU); }, []);
  const days = useMemo(() => {
    if (!u) return [];
    const now = new Date(), out: { d: string; v: number }[] = [];
    for (let i = 13; i >= 0; i--) { const d = new Date(now.getTime() - i * 864e5).toISOString().slice(0, 10); out.push({ d, v: u.days[d] || 0 }); }
    return out;
  }, [u]);
  const max = Math.max(1, ...days.map((d) => d.v));
  if (!u) return <p className="t-mono text-mute">Loading…</p>;
  return (
    <>
      <PageTitle title="Usage" sub={`${u.plan} plan · billing month ${u.month}`} action={<SiteLink href="/pricing" className={btnLine}>Change plan</SiteLink>} />
      <div className="grid gap-3 md:grid-cols-3">
        <div className={`${card} p-5`}><p className="t-mono text-mute">Live minutes</p><p className="mt-3 text-[2.4rem] font-medium leading-none tracking-[-0.05em]">{u.minutes}<span className="ml-1 text-[1rem] text-mute">/ {u.included}</span></p></div>
        <div className={`${card} p-5`}><p className="t-mono text-mute">Conversations</p><p className="mt-3 text-[2.4rem] font-medium leading-none tracking-[-0.05em]">{u.conversations}</p></div>
        <div className={`${card} p-5`}><p className="t-mono text-mute">By mode</p><ul className="mt-3 space-y-1.5 text-[0.92rem]">{Object.entries(u.byMode).map(([k, v]) => <li key={k} className="flex justify-between capitalize"><span>{k}</span><span className="tabular-nums">{v}</span></li>)}</ul></div>
      </div>
      <section className={`${card} mt-3 p-5`}>
        <p className="t-mono text-mute">Minutes per day, last 14 days</p>
        <div className="mt-6 flex h-48 items-end gap-1.5" role="img" aria-label="Minutes per day for the last 14 days">
          {days.map((d) => (
            <div key={d.d} className="flex h-full flex-1 flex-col justify-end gap-1.5">
              <span className="text-center text-[0.72rem] tabular-nums text-mute">{d.v || ""}</span>
              <div className="rounded-t-[4px] bg-ink" style={{ height: `${(d.v / max) * 85}%`, minHeight: d.v ? 4 : 1, opacity: d.v ? 1 : 0.15 }} />
              <span className="text-center text-[0.7rem] text-mute">{Number(d.d.slice(8))}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

/* ───────── Settings ───────── */
export function SettingsPage() {
  const { user, setUser } = useApp();
  const [f, setF] = useState({ name: user.name, company: user.company || "", webhookUrl: user.webhookUrl || "" });
  const [msg, setMsg] = useState(""); const [err, setErr] = useState("");
  return (
    <>
      <PageTitle title="Settings" />
      <form className="max-w-[640px] space-y-6" onSubmit={async (e) => { e.preventDefault(); setErr(""); setMsg(""); try { setUser(await api.settings(f)); setMsg("Saved."); } catch (x) { setErr((x as Error).message); } }}>
        <section className={`${card} p-5`}>
          <p className="t-mono mb-4 text-mute">Profile</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5"><span className="text-[0.88rem]">Name</span><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={field} /></label>
            <label className="grid gap-1.5"><span className="text-[0.88rem]">Company</span><input value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} className={field} /></label>
          </div>
          <p className="mt-3 text-[0.88rem] text-mute">{user.email} · {user.type} account</p>
        </section>
        <section className={`${card} p-5`}>
          <p className="t-mono mb-4 text-mute">Webhooks</p>
          <label className="grid gap-1.5"><span className="text-[0.88rem]">Endpoint URL</span><input value={f.webhookUrl} onChange={(e) => setF({ ...f, webhookUrl: e.target.value })} className={field} placeholder="https://your-app.com/humanos-webhook" /></label>
          <p className="mt-3 text-[0.85rem] text-mute">We sign each request with HMAC-SHA256 in the <code className="font-mono">X-HumanOS-Signature</code> header.</p>
          {user.webhookSecret && <p className="mt-2 break-all font-mono text-[0.82rem]">Signing secret: {user.webhookSecret}</p>}
        </section>
        <Err msg={err} />
        <div className="flex items-center gap-3"><button className={btnDark}>Save changes</button>{msg && <span className="text-[0.9rem] text-mute">{msg}</span>}</div>
      </form>
    </>
  );
}
