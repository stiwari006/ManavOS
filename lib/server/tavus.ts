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
