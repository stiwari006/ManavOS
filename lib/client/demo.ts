"use client";
/* Browser-only implementation of the API used by the hosted preview build.
   Same surface as the live API; data lives in localStorage; replies are scripted. */
import { SOLUTIONS } from "@/lib/content/solutions";
import type { ApiKeyView, Capabilities, Conversation, Doc, Persona, PublicUser, Scorecard } from "@/lib/types";
import type { Api, ConvSummary, DocView, Usage } from "./api";

type Store = { user: PublicUser | null; personas: Persona[]; conversations: Conversation[]; keys: ApiKeyView[]; docs: Doc[] };
const KEY = "hos-demo-store";
let mem: Store | null = null;
const rid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 14)}`;
const now = () => new Date().toISOString();
const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms));

function load(): Store {
  if (mem) return mem;
  try { const s = localStorage.getItem(KEY); if (s) mem = JSON.parse(s); } catch {}
  mem ??= { user: null, personas: [], conversations: [], keys: [], docs: [] };
  return mem!;
}
function persist() { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch {} }

function seed(uid: string) {
  const s = load(), t = now();
  s.personas = SOLUTIONS.filter((x) => x.slug !== "custom").map((x) => ({
    id: rid("per"), ownerId: uid, name: x.personaName, role: x.name, look: x.persona, systemPrompt: x.systemPrompt, greeting: x.greeting,
    languages: ["en"], rubric: x.slug === "ai-interviewer" ? ["Structure", "Evidence & metrics", "Ownership", "Clarity"] : x.slug === "ai-coach" ? ["Clarity", "Confidence", "Listening", "Impact"] : [],
    memory: true, perception: true, documentIds: [], stock: true, createdAt: t, updatedAt: t,
  }));
}

const FOLLOWUPS = [
  "Thanks, that's helpful. Can you give me a specific example?",
  "What was the hardest part of that, and how did you handle it?",
  "If you did it again, what would you change?",
  "How did you know it had worked?",
  "Got it. Is there anything you'd like to ask me?",
];

function scoreDemo(c: Conversation, rubric: string[]): Scorecard {
  const user = c.transcript.filter((t) => t.role === "user").map((t) => t.content).join(" ");
  const words = user.split(/\s+/).filter(Boolean).length;
  const nums = (user.match(/\d|%/g) || []).length;
  return {
    scores: rubric.map((r, i) => ({ criterion: r, score: Math.max(1, Math.min(4, Math.round((1.5 + words / 60 + nums * 0.3 + (i % 2) * 0.3) * 10) / 10)), evidence: user.slice(0, 120) || "No answer given." })),
    summary: words < 20 ? "Too little evidence to judge; answers were very short." : "Answers were relevant and reasonably structured. (Preview scoring: connect Claude for real evaluation.)",
    recommendation: words < 20 ? "insufficient evidence" : "hold", model: "preview-heuristic",
  };
}

export const demo: Api = {
  me: async () => load().user,
  signup: async (b) => { const s = load(); s.user = { id: rid("usr"), email: b.email, name: b.name || b.email.split("@")[0], company: b.company, type: b.type === "teams" ? "teams" : "developer", plan: b.plan || "starter", createdAt: now(), webhookSecret: "whsec_preview" }; seed(s.user.id); persist(); return s.user; },
  login: async (b) => { const s = load(); if (!s.user) { return demo.signup(b); } if (s.user.email !== b.email) s.user.email = b.email; persist(); return s.user; },
  logout: async () => { const s = load(); s.user = null; persist(); },
  capabilities: async (): Promise<Capabilities> => ({ video: false, claude: false, demo: true }),
  personas: {
    list: async () => load().personas,
    get: async (id) => { const p = load().personas.find((x) => x.id === id); if (!p) throw new Error("Persona not found"); return p; },
    create: async (b) => { const s = load(), t = now(); const p: Persona = { id: rid("per"), ownerId: s.user?.id || "", name: "Untitled persona", role: "Custom", look: "aarohi", systemPrompt: "", greeting: "Hi, I'm an AI persona.", languages: ["en"], rubric: [], memory: true, perception: true, documentIds: [], createdAt: t, updatedAt: t, ...b }; s.personas.unshift(p); persist(); return p; },
    update: async (id, b) => { const p = load().personas.find((x) => x.id === id); if (!p) throw new Error("Persona not found"); Object.assign(p, b, { updatedAt: now() }); persist(); return p; },
    remove: async (id) => { const s = load(); s.personas = s.personas.filter((x) => x.id !== id); persist(); return {}; },
  },
  conversations: {
    list: async () => load().conversations.map(({ transcript, ...c }) => ({ ...c, turns: transcript.length }) as ConvSummary),
    get: async (id) => { const c = load().conversations.find((x) => x.id === id); if (!c) throw new Error("Conversation not found"); return c; },
    create: async (b) => {
      const s = load(), p = s.personas.find((x) => x.id === b.personaId); if (!p) throw new Error("Persona not found");
      const c: Conversation = { id: rid("conv"), ownerId: s.user?.id || "", personaId: p.id, personaName: p.name, mode: "preview", status: "active", participant: b.participant, context: b.context, transcript: [{ role: "assistant", content: p.greeting, at: Date.now() }], startedAt: now(), source: "app" };
      s.conversations.unshift(c); persist(); await wait(600); return c;
    },
    end: async (id) => {
      const s = load(), c = s.conversations.find((x) => x.id === id)!; const p = s.personas.find((x) => x.id === c.personaId);
      if (c.status !== "ended") { c.status = "ended"; c.endedAt = now(); c.seconds = Math.round((Date.parse(c.endedAt) - Date.parse(c.startedAt)) / 1000); if (p?.rubric.length && c.transcript.some((t) => t.role === "user")) c.scorecard = scoreDemo(c, p.rubric); }
      persist(); return c;
    },
    score: async (id) => { const s = load(), c = s.conversations.find((x) => x.id === id)!; const p = s.personas.find((x) => x.id === c.personaId); if (p?.rubric.length) c.scorecard = scoreDemo(c, p.rubric); persist(); return c; },
    turn: async (id, text, onChunk) => {
      const c = load().conversations.find((x) => x.id === id)!;
      c.transcript.push({ role: "user", content: text, at: Date.now() });
      const n = c.transcript.filter((t) => t.role === "user").length;
      const reply = FOLLOWUPS[(n - 1) % FOLLOWUPS.length];
      await wait(500);
      let out = "";
      for (const w of reply.split(" ")) { out += (out ? " " : "") + w; onChunk(out); await wait(55); }
      c.transcript.push({ role: "assistant", content: reply, at: Date.now() }); persist();
      return reply;
    },
  },
  keys: {
    list: async () => load().keys,
    create: async (name) => { const secret = "hos_test_" + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2); const k: ApiKeyView = { id: rid("key"), ownerId: load().user?.id || "", name: name || "Untitled key", prefix: secret.slice(0, 13), createdAt: now() }; load().keys.unshift(k); persist(); return { key: k, secret }; },
    remove: async (id) => { const s = load(); s.keys = s.keys.filter((k) => k.id !== id); persist(); return {}; },
  },
  docs: {
    list: async () => load().docs.map(({ text, ...d }) => ({ ...d, chars: text?.length ?? 0 }) as DocView),
    create: async (b) => { const d: Doc = { id: rid("doc"), ownerId: load().user?.id || "", name: b.name || b.url || "Untitled", url: b.url, text: b.text || (b.url ? `(Fetched from ${b.url} on the live server)` : ""), tags: b.tags || [], createdAt: now() }; load().docs.unshift(d); persist(); const { text, ...v } = d; return { ...v, chars: text?.length ?? 0 }; },
    remove: async (id) => { const s = load(); s.docs = s.docs.filter((d) => d.id !== id); persist(); return {}; },
  },
  usage: async (): Promise<Usage> => {
    const cs = load().conversations, days: Record<string, number> = {};
    for (const c of cs) days[c.startedAt.slice(0, 10)] = (days[c.startedAt.slice(0, 10)] || 0) + Math.ceil((c.seconds || 60) / 60);
    return { plan: load().user?.plan || "starter", month: now().slice(0, 7), minutes: 0, included: 25, conversations: cs.length, byMode: { video: 0, voice: 0, preview: cs.length }, days };
  },
  settings: async (b) => { const s = load(); Object.assign(s.user!, b); persist(); return s.user!; },
  contact: async () => { await wait(400); return {}; },
  tryLive: async () => false,
  tryTurn: async (_p, turns, onChunk) => {
    const n = turns.filter((t) => t.role === "user").length;
    const reply = FOLLOWUPS[(n - 1) % FOLLOWUPS.length];
    await wait(450); let out = "";
    for (const w of reply.split(" ")) { out += (out ? " " : "") + w; onChunk(out); await wait(55); }
    return reply;
  },
};
