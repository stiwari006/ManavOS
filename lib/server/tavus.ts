import "server-only";
import type { Persona } from "@/lib/types";
import { CLAUDE_MODEL } from "./claude";

/* Tavus Conversational Video. PALs (formerly personas) carry the system prompt
   and layers; we point the LLM layer at Claude via Anthropic's
   OpenAI-compatible endpoint so Claude is the brain behind every face. */
const BASE = process.env.TAVUS_BASE_URL || "https://tavusapi.com/v2";
const KEY = () => process.env.TAVUS_API_KEY || "";
const callbackUrl = () => process.env.PUBLIC_URL ? `${process.env.PUBLIC_URL}/api/webhooks/tavus?token=${encodeURIComponent(process.env.TAVUS_WEBHOOK_TOKEN || "")}` : undefined;
export const tavusReady = () => !!KEY() && !!process.env.TAVUS_DEFAULT_FACE_ID;

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(BASE + path, { ...init, headers: { "x-api-key": KEY(), "content-type": "application/json", ...(init.headers || {}) } });
  if (!res.ok) throw new Error(`Tavus ${res.status}: ${await res.text().catch(() => "")}`);
  return res.status === 204 ? (undefined as T) : res.json();
}

export async function ensurePal(p: Persona): Promise<string> {
  if (p.tavusPalId) return p.tavusPalId;
  const anthropic = process.env.ANTHROPIC_API_KEY;
  const body = {
    pal_name: p.name,
    system_prompt: p.systemPrompt,
    greeting: p.greeting,
    default_face_id: p.faceId || process.env.TAVUS_DEFAULT_FACE_ID,
    pipeline_mode: "full",
    languages: p.languages.length ? p.languages : undefined,
    disclosure_type: "always",
    callback_url: callbackUrl(),
    layers: {
      ...(anthropic ? { llm: { model: CLAUDE_MODEL, base_url: "https://api.anthropic.com/v1/", api_key: anthropic, speculative_inference: true } } : {}),
      perception: { perception_model: p.perception ? "raven-2" : "off" },
    },
  };
  const r = await call<{ pal_id?: string; persona_id?: string }>("/pals", { method: "POST", body: JSON.stringify(body) });
  return (r.pal_id || r.persona_id)!;
}

export async function startConversation(palId: string, opts: { faceId?: string; context?: string; participant?: string; meetingUrl?: string; name?: string }) {
  return call<{ conversation_id: string; conversation_url: string; room_url?: string; status: string }>("/conversations", {
    method: "POST",
    body: JSON.stringify({
      pal_id: palId,
      face_id: opts.faceId || undefined,
      conversation_name: opts.name,
      conversational_context: opts.context || undefined,
      participant_tags: opts.participant ? [opts.participant] : undefined,
      meeting_url: opts.meetingUrl || undefined,
      callback_url: callbackUrl(),
      properties: { max_call_duration: 1800, participant_left_timeout: 30, enable_closed_captions: true },
    }),
  });
}

export const endConversation = (id: string) => call(`/conversations/${id}/end`, { method: "POST" });
export const getConversation = (id: string) =>
  call<{ status: string; events?: { event_type: string; properties?: { transcript?: { role: string; content: string; timestamp?: number }[] } }[] }>(`/conversations/${id}?verbose=true`);

/* Real faces. Each look (aarohi, dev, …) maps to a Tavus face so the marketing
   site, the waiting room and the live call all show the same photoreal human.
   Override with TAVUS_FACES="aarohi=r123,dev=r456,…"; otherwise stock faces
   your plan can use are assigned in order. Cached for an hour. */
export type FaceMedia = { faceId: string; name: string; video: string };
const LOOKS = ["aarohi", "dev", "mira", "omar", "ines", "henry"] as const;
let faceCache: { at: number; map: Record<string, FaceMedia> } | null = null;

export async function faceMap(): Promise<Record<string, FaceMedia>> {
  if (!KEY()) return {};
  if (faceCache && Date.now() - faceCache.at < 3600_000) return faceCache.map;
  try {
    const r = await call<{ data: { face_id: string; face_name: string; thumbnail_video_url?: string; status?: string }[] }>("/faces?face_type=system&verbose=true&limit=60");
    const faces = (r.data || []).filter((f) => f.thumbnail_video_url && f.status !== "error");
    const byId = new Map(faces.map((f) => [f.face_id, f]));
    const pinned = Object.fromEntries((process.env.TAVUS_FACES || "").split(",").map((s) => s.trim().split("=")).filter((p) => p.length === 2));
    const used = new Set(Object.values(pinned));
    const pool = faces.filter((f) => !used.has(f.face_id));
    const map: Record<string, FaceMedia> = {};
    LOOKS.forEach((look) => {
      const f = pinned[look] ? byId.get(pinned[look]) : pool.shift();
      if (f) map[look] = { faceId: f.face_id, name: f.face_name, video: f.thumbnail_video_url! };
    });
    faceCache = { at: Date.now(), map };
    return map;
  } catch {
    return faceCache?.map ?? {};
  }
}

/* Custom faces (Phoenix). Full-body framing needs phoenix-4; others use the default model. */
export async function createFace(o: { name: string; kind: "full" | "head" | "photo"; url: string; callback?: string }) {
  const body: Record<string, unknown> = { face_name: o.name, callback_url: o.callback };
  if (o.kind === "photo") {
    body.train_image_url = o.url; body.auto_fix_training_image = true;
    body.default_voice_id = process.env.TAVUS_DEFAULT_VOICE_ID;
  } else {
    body.train_video_url = o.url;
    if (o.kind === "full") body.model_name = "phoenix-4";
  }
  return call<{ face_id: string; status: string }>("/faces", { method: "POST", body: JSON.stringify(body) });
}
export const getFace = (id: string) => call<{ face_id: string; status: string; thumbnail_video_url?: string; error_message?: string }>(`/faces/${id}`);
export const deleteFace = (id: string) => call<void>(`/faces/${id}`, { method: "DELETE" }).catch(() => undefined);
export const faceCallbackUrl = () => {
  const base = process.env.PUBLIC_URL; if (!base) return undefined;
  const t = process.env.TAVUS_WEBHOOK_TOKEN;
  return `${base}/api/webhooks/tavus${t ? `?token=${encodeURIComponent(t)}` : ""}`;
};
