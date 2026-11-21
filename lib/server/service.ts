import "server-only";
import { uploadsReady } from "./s3";
import { createHmac, randomBytes } from "node:crypto";
import { SOLUTIONS } from "@/lib/content/solutions";
import type { Capabilities, Conversation, Face, Persona, Turn, User } from "@/lib/types";
import { claudeReady, scoreTranscript } from "./claude";
import { id, now, repo } from "./db";
import { endConversation, ensurePal, startConversation, tavusReady, faceMap, getFace } from "./tavus";

export const capabilities = (): Capabilities => ({ uploads: uploadsReady(), faces: !!process.env.TAVUS_API_KEY, video: tavusReady(), claude: claudeReady(), demo: false, billing: !!process.env.STRIPE_SECRET_KEY, email: !!process.env.RESEND_API_KEY });

export const PLAN_MINUTES: Record<string, number> = { starter: 25, builder: 250, growth: 2000, enterprise: 1e9 };
/** Live minutes used this calendar month (preview sessions are free). */
export async function minutesUsed(uid: string) {
  const month = new Date().toISOString().slice(0, 7);
  const convs = (await repo.convs.list(uid)).filter((c) => c.startedAt.startsWith(month) && c.mode !== "preview");
  return Math.ceil(convs.reduce((a, c) => a + (c.seconds ?? Math.round((Date.now() - Date.parse(c.startedAt)) / 1000)), 0) / 60);
}
export class QuotaError extends Error {}

const RUBRICS: Record<string, string[]> = {
  "ai-interviewer": ["Structure", "Evidence & metrics", "Ownership", "Clarity"],
  "ai-coach": ["Clarity", "Confidence", "Listening", "Impact"],
  "ai-tutor": ["Understanding", "Engagement", "Progress"],
  "ai-sdr": ["Need", "Timeline", "Authority", "Fit"],
};

async function seedPersonas(ownerId: string) {
  const list = SOLUTIONS.filter((x) => x.slug !== "custom");
  await Promise.all(list.map((s, i) => {
    const t = new Date(Date.now() + i).toISOString();
    return repo.personas.save({
      id: id("per"), ownerId, name: s.personaName, role: s.name, look: s.persona, systemPrompt: s.systemPrompt,
      greeting: s.greeting, languages: ["en"], rubric: RUBRICS[s.slug] || [], memory: true, perception: true,
      documentIds: [], stock: true, createdAt: t, updatedAt: t,
    });
  }));
}

export async function newUser(email: string, name: string, passHash: string, type: User["type"], plan = "starter", company?: string): Promise<User> {
  const u: User = { id: id("usr"), email: email.toLowerCase(), name, company, type, plan, passHash, webhookSecret: "whsec_" + randomBytes(18).toString("hex"), createdAt: now() };
  await repo.users.insert(u);
  await seedPersonas(u.id);
  return u;
}

export const myPersonas = (uid: string) => repo.personas.list(uid);
export const myConversations = (uid: string) => repo.convs.list(uid);

export function personaInput(b: Record<string, unknown>, base?: Persona): Omit<Persona, "id" | "ownerId" | "createdAt"> {
  const str = (k: string, d = "") => (typeof b[k] === "string" ? (b[k] as string).slice(0, k === "systemPrompt" || k === "system_prompt" ? 20000 : 500) : d);
  const arr = (k: string, d: string[] = []) => (Array.isArray(b[k]) ? (b[k] as unknown[]).map(String).slice(0, 20) : d);
  const bool = (k: string, d: boolean) => (typeof b[k] === "boolean" ? (b[k] as boolean) : d);
  return {
    name: str("name", base?.name || "Untitled persona"),
    role: str("role", base?.role || "Custom"),
    look: str("look", base?.look || "aarohi"),
    faceId: str("faceId", str("face_id", base?.faceId || "")) || undefined,
    frame: b.frame === "full" ? "full" : b.frame === "head" ? "head" : base?.frame,
    systemPrompt: str("systemPrompt", str("system_prompt", base?.systemPrompt || "You are a helpful AI persona. Disclose you are an AI.")),
    greeting: str("greeting", base?.greeting || "Hi, I'm an AI persona. How can I help?"),
    languages: arr("languages", base?.languages || ["en"]),
    rubric: arr("rubric", base?.rubric || []),
    memory: bool("memory", base?.memory ?? true),
    perception: bool("perception", base?.perception ?? true),
    documentIds: arr("documentIds", base?.documentIds || []),
    stock: base?.stock,
    tavusPalId: undefined, // re-created on the next video session after an edit
    updatedAt: now(),
  };
}

/** Starts a conversation in the best available mode. */
export async function startSession(ownerId: string, persona: Persona, opts: { participant?: string; context?: string; meetingUrl?: string; source: Conversation["source"]; preferMode?: string }) {
  const conv: Conversation = {
    id: id("conv"), ownerId, personaId: persona.id, personaName: persona.name, mode: "preview", status: "active",
    participant: opts.participant, context: opts.context, transcript: [], startedAt: now(), source: opts.source,
  };
  const wantVideo = opts.preferMode !== "voice" && opts.preferMode !== "preview";
  if (opts.preferMode !== "preview" && (tavusReady() || claudeReady())) {
    const owner = await repo.users.byId(ownerId);
    // Paid plans bill overage; the free plan stops at its included minutes.
    if (owner && (owner.plan === "starter" || !owner.plan) && (await minutesUsed(ownerId)) >= PLAN_MINUTES.starter)
      throw new QuotaError("You've used this month's free minutes. Upgrade your plan to keep talking.");
  }
  if (wantVideo && tavusReady()) {
    const pal = await ensurePal(persona);
    if (persona.tavusPalId !== pal) { persona.tavusPalId = pal; await repo.personas.save(persona); }
    const docs = await repo.docs.getMany(ownerId, persona.documentIds);
    const knowledge = docs.map((d) => d.text).filter(Boolean).join("\n\n").slice(0, 8000);
    const faceId = persona.faceId || (await faceMap())[persona.look]?.faceId;
    const t = await startConversation(pal, { faceId, participant: persona.memory ? opts.participant : undefined, context: [opts.context, knowledge].filter(Boolean).join("\n\n"), meetingUrl: opts.meetingUrl, name: `${persona.name} · ${conv.id}` });
    conv.mode = "video"; conv.tavusId = t.conversation_id; conv.joinUrl = t.conversation_url;
  } else if (opts.preferMode !== "preview" && claudeReady()) {
    conv.mode = "voice";
    conv.transcript.push({ role: "assistant", content: persona.greeting, at: Date.now() });
  } else {
    conv.mode = "preview";
    conv.transcript.push({ role: "assistant", content: persona.greeting, at: Date.now() });
  }
  await repo.convs.save(conv);
  return conv;
}

export async function systemFor(p: Persona, c: Conversation) {
  const docs = (await repo.docs.getMany(p.ownerId, p.documentIds)).filter((d) => d.text).map((d) => `# ${d.name}\n${d.text}`).join("\n\n").slice(0, 30000);
  return [
    p.systemPrompt,
    "You are speaking out loud on a live video call: reply in short, natural spoken sentences, no markdown, no lists, no emoji.",
    "You are an AI and must say so if asked or at the start of the conversation.",
    c.context ? `Context for this conversation: ${c.context}` : "",
    docs ? `Knowledge you may use:\n${docs}` : "",
  ].filter(Boolean).join("\n\n");
}

export async function finishSession(c: Conversation) {
  if (c.status === "ended") return c;
  c.status = "ended"; c.endedAt = now();
  c.seconds = Math.round((Date.parse(c.endedAt) - Date.parse(c.startedAt)) / 1000);
  if (c.tavusId) { try { await endConversation(c.tavusId); } catch { /* already ended */ } }
  await repo.convs.save(c);
  if (c.mode !== "video") await scoreAndNotify(c);
  return c;
}

export async function scoreAndNotify(c: Conversation) {
  const p = await repo.personas.get(c.ownerId, c.personaId);
  if (p && p.rubric.length && claudeReady() && c.transcript.some((t) => t.role === "user")) {
    try { c.scorecard = await scoreTranscript(p.name, p.rubric, c.transcript); await repo.convs.save(c); } catch (e) { console.error("score failed", e); }
  }
  const u = await repo.users.byId(c.ownerId);
  if (u?.webhookUrl) {
    const payload = JSON.stringify({ event: c.scorecard ? "conversation.scored" : "conversation.transcript_ready", conversation_id: c.id, persona_id: c.personaId, transcript: c.transcript, scorecard: c.scorecard ?? null });
    const sig = createHmac("sha256", u.webhookSecret).update(payload).digest("hex");
    await fetch(u.webhookUrl, { method: "POST", headers: { "content-type": "application/json", "x-manavos-signature": sig }, body: payload, signal: AbortSignal.timeout(5000) }).catch(() => {});
  }
}

export async function addTurn(c: Conversation, t: Turn) { c.transcript.push(t); await repo.convs.save(c); }

/** Shape returned by the public API. */
export const apiConversation = (c: Conversation) => ({
  id: c.id, persona_id: c.personaId, status: c.status, mode: c.mode, participant: c.participant ?? null,
  join_url: c.joinUrl ?? (process.env.PUBLIC_URL ? `${process.env.PUBLIC_URL}/app/live/?id=${c.id}` : `/app/live/?id=${c.id}`),
  started_at: c.startedAt, ended_at: c.endedAt ?? null, transcript: c.transcript, scorecard: c.scorecard ?? null,
});
export const apiPersona = (p: Persona) => ({
  id: p.id, name: p.name, role: p.role, look: p.look, face_id: p.faceId ?? null, system_prompt: p.systemPrompt, greeting: p.greeting,
  languages: p.languages, rubric: p.rubric, memory: p.memory, perception: p.perception, created_at: p.createdAt,
});

const FOLLOWUPS = [
  "Thanks, that's helpful. Can you give me a specific example?",
  "What was the hardest part of that, and how did you handle it?",
  "If you did it again, what would you change?",
  "How did you know it had worked?",
  "Got it. Is there anything you'd like to ask me?",
];
/** Scripted reply used when no Claude key is configured. */
export function previewReply(c: Conversation) {
  const n = c.transcript.filter((t) => t.role === "user").length;
  return FOLLOWUPS[(Math.max(1, n) - 1) % FOLLOWUPS.length];
}

/* ---- Custom faces ---- */
export const FACE_LIMIT: Record<string, number> = { starter: 1, builder: 3, growth: 10, enterprise: 100 };
export class FaceLimitError extends Error {}

export async function refreshFace(f: Face): Promise<Face> {
  if (f.status !== "training" || !f.tavusFaceId || !process.env.TAVUS_API_KEY) return f;
  try {
    const t = await getFace(f.tavusFaceId);
    if (t.status === "completed" || t.status === "ready") { f.status = "ready"; f.readyAt = new Date().toISOString(); await repo.faces.save(f); }
    else if (t.status === "error") { f.status = "error"; f.error = t.error_message || "Training failed. Check the recording guide and try again."; await repo.faces.save(f); }
  } catch { /* keep last known status */ }
  return f;
}
