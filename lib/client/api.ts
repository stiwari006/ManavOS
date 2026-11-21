"use client";
import { DEMO } from "@/lib/site/link";
import type { ApiKeyView, Capabilities, Conversation, Doc, Face, Persona, PublicUser } from "@/lib/types";
import { demo } from "./demo";

export type ConvSummary = Omit<Conversation, "transcript"> & { turns: number };
export type DocView = Omit<Doc, "text"> & { chars: number };
export type FaceInput = { name: string; kind: Face["kind"]; key?: string; url?: string; consent: "self" | "permission"; consentName: string };

/** PUT a file straight to the bucket, with progress (0..1). */
function putFile(url: string, file: File, onProgress: (p: number) => void) {
  return new Promise<void>((res, rej) => {
    const x = new XMLHttpRequest();
    x.open("PUT", url); x.setRequestHeader("content-type", file.type);
    x.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    x.onload = () => (x.status < 300 ? res() : rej(new Error(`Upload failed (${x.status})`)));
    x.onerror = () => rej(new Error("Upload failed. Check your connection and try again."));
    x.send(file);
  });
}

export type Usage = { plan: string; month: string; minutes: number; included: number; conversations: number; byMode: Record<string, number>; days: Record<string, number> };

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(path, { ...init, headers: { "content-type": "application/json", ...(init?.headers || {}) } });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || `Request failed (${r.status})`);
  return data as T;
}
const post = <T,>(p: string, b?: unknown) => req<T>(p, { method: "POST", body: JSON.stringify(b ?? {}) });

async function streamText(path: string, b: unknown, onChunk: (s: string) => void) {
  const r = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) });
  if (!r.ok || !r.body) { const d = await r.json().catch(() => ({})); throw new Error(d.error || `Request failed (${r.status})`); }
  const reader = r.body.getReader(), dec = new TextDecoder();
  let full = "";
  for (;;) { const { value, done } = await reader.read(); if (done) break; const t = dec.decode(value, { stream: true }); full += t; onChunk(full); }
  return full;
}

const live = {
  me: () => req<{ user: PublicUser }>("/api/me").then((d) => d.user).catch(() => null),
  signup: (b: Record<string, string>) => post<{ user: PublicUser }>("/api/auth/signup", b).then((d) => d.user),
  login: (b: Record<string, string>) => post<{ user: PublicUser }>("/api/auth/login", b).then((d) => d.user),
  logout: () => post("/api/auth/logout"),
  capabilities: () => req<Capabilities>("/api/capabilities"),
  personas: {
    list: () => req<{ personas: Persona[] }>("/api/personas").then((d) => d.personas),
    get: (id: string) => req<{ persona: Persona }>(`/api/personas/${id}`).then((d) => d.persona),
    create: (b: Partial<Persona>) => post<{ persona: Persona }>("/api/personas", b).then((d) => d.persona),
    update: (id: string, b: Partial<Persona>) => req<{ persona: Persona }>(`/api/personas/${id}`, { method: "PATCH", body: JSON.stringify(b) }).then((d) => d.persona),
    remove: (id: string) => req(`/api/personas/${id}`, { method: "DELETE" }),
  },
  conversations: {
    list: () => req<{ conversations: ConvSummary[] }>("/api/conversations").then((d) => d.conversations),
    get: (id: string) => req<{ conversation: Conversation }>(`/api/conversations/${id}`).then((d) => d.conversation),
    create: (b: { personaId: string; participant?: string; context?: string; mode?: string; meetingUrl?: string }) => post<{ conversation: Conversation }>("/api/conversations", b).then((d) => d.conversation),
    end: (id: string) => post<{ conversation: Conversation }>(`/api/conversations/${id}/end`).then((d) => d.conversation),
    score: (id: string) => post<{ conversation: Conversation }>(`/api/conversations/${id}/score`).then((d) => d.conversation),
    turn: (id: string, text: string, onChunk: (s: string) => void) => streamText(`/api/conversations/${id}/turn`, { text }, onChunk),
  },
  keys: {
    list: () => req<{ keys: ApiKeyView[] }>("/api/keys").then((d) => d.keys),
    create: (name: string) => post<{ key: ApiKeyView; secret: string }>("/api/keys", { name }),
    remove: (id: string) => req(`/api/keys/${id}`, { method: "DELETE" }),
  },
  docs: {
    list: () => req<{ documents: DocView[] }>("/api/documents").then((d) => d.documents),
    create: (b: { name?: string; url?: string; text?: string; tags?: string[] }) => post<{ document: DocView }>("/api/documents", b).then((d) => d.document),
    remove: (id: string) => req(`/api/documents/${id}`, { method: "DELETE" }),
  },
  faces: {
    list: () => req<{ faces: Face[]; limit: number }>("/api/custom-faces"),
    get: (id: string) => req<{ face: Face }>(`/api/custom-faces/${id}`).then((d) => d.face),
    create: (b: FaceInput) => post<{ face: Face }>("/api/custom-faces", b).then((d) => d.face),
    remove: (id: string) => req(`/api/custom-faces/${id}`, { method: "DELETE" }),
    async upload(file: File, onProgress: (p: number) => void) {
      const { key, uploadUrl } = await post<{ key: string; uploadUrl: string }>("/api/custom-faces/upload", { type: file.type, size: file.size });
      await putFile(uploadUrl, file, onProgress);
      return key;
    },
  },
  usage: () => req<Usage>("/api/usage"),
  settings: (b: { name?: string; company?: string; webhookUrl?: string }) => req<{ user: PublicUser }>("/api/settings", { method: "PATCH", body: JSON.stringify(b) }).then((d) => d.user),
  contact: (b: Record<string, string>) => post("/api/contact", b),
  forgot: (email: string) => post("/api/auth/forgot", { email }),
  reset: (token: string, password: string) => post<{ user: PublicUser }>("/api/auth/reset", { token, password }).then((d) => d.user),
  deleteAccount: (password: string) => req("/api/account", { method: "DELETE", body: JSON.stringify({ password }) }),
  exportUrl: "/api/account",
  checkout: (plan: string) => post<{ url: string }>("/api/billing/checkout", { plan }).then((d) => d.url),
  portal: () => post<{ url: string }>("/api/billing/portal").then((d) => d.url),
  tryLive: () => req<{ live: boolean }>("/api/try").then((d) => d.live).catch(() => false),
  tryTurn: (persona: string, turns: { role: "user" | "assistant"; content: string }[], onChunk: (s: string) => void) => streamText("/api/try", { persona, turns }, onChunk),
};

export type Api = typeof live;
export const api: Api = DEMO ? demo : live;
