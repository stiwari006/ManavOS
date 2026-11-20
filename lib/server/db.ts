import "server-only";
import { mkdirSync, readFileSync, renameSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import type { ApiKey, Conversation, Doc, Persona, User } from "@/lib/types";

/* Storage: one record per key, so concurrent writes to different records never clash.
   - On Netlify: Netlify Blobs (persists across deploys, no setup).
   - Elsewhere: a JSON file in DATA_DIR (local dev, or a host with a disk).
   To move to Postgres later, re-implement KV (or the repo below) — callers don't change. */

type KV = {
  get<T>(k: string): Promise<T | null>;
  set(k: string, v: unknown): Promise<void>;
  del(k: string): Promise<void>;
  keys(prefix: string): Promise<string[]>;
};

function fileKV(): KV {
  const FILE = join(process.env.DATA_DIR || join(process.cwd(), ".data"), "kv.json");
  let mem: Record<string, unknown> | null = null;
  const load = () => {
    if (mem) return mem;
    try { mem = existsSync(FILE) ? JSON.parse(readFileSync(FILE, "utf8")) : {}; } catch { mem = {}; }
    return mem!;
  };
  const flush = () => { mkdirSync(dirname(FILE), { recursive: true }); writeFileSync(FILE + ".tmp", JSON.stringify(mem)); renameSync(FILE + ".tmp", FILE); };
  return {
    async get<T>(k: string) { return (load()[k] as T) ?? null; },
    async set(k, v) { load()[k] = v; flush(); },
    async del(k) { delete load()[k]; flush(); },
    async keys(prefix) { return Object.keys(load()).filter((k) => k.startsWith(prefix)); },
  };
}

function blobsKV(): KV {
  // Lazy import so local/other hosts never load the Netlify SDK.
  let storeP: Promise<import("@netlify/blobs").Store> | null = null;
  const store = () => (storeP ??= import("@netlify/blobs").then((m) => m.getStore({ name: "humanos", consistency: "strong" })));
  return {
    async get<T>(k: string) { return ((await (await store()).get(k, { type: "json" })) as T) ?? null; },
    async set(k, v) { await (await store()).setJSON(k, v); },
    async del(k) { await (await store()).delete(k); },
    async keys(prefix) { const { blobs } = await (await store()).list({ prefix }); return blobs.map((b) => b.key); },
  };
}

const useBlobs = process.env.STORAGE === "blobs" || (process.env.STORAGE !== "file" && !!(process.env.NETLIFY_BLOBS_CONTEXT || process.env.NETLIFY || process.env.SITE_ID));
const kv: KV = useBlobs ? blobsKV() : fileKV();

async function many<T>(prefix: string): Promise<T[]> {
  const ks = await kv.keys(prefix);
  return (await Promise.all(ks.map((k) => kv.get<T>(k)))).filter(Boolean) as T[];
}
type Ref = { owner: string; id: string };

export const repo = {
  users: {
    byId: (id: string) => kv.get<User>(`u/${id}`),
    async byEmail(email: string) { const id = await kv.get<string>(`ue/${email.toLowerCase()}`); return id ? kv.get<User>(`u/${id}`) : null; },
    async insert(u: User) { await kv.set(`u/${u.id}`, u); await kv.set(`ue/${u.email}`, u.id); },
    save: (u: User) => kv.set(`u/${u.id}`, u),
    async del(u: User) { await kv.del(`ue/${u.email}`); await kv.del(`u/${u.id}`); },
  },
  resets: {
    put: (hash: string, v: { userId: string; exp: number }) => kv.set(`pr/${hash}`, v),
    get: (hash: string) => kv.get<{ userId: string; exp: number }>(`pr/${hash}`),
    del: (hash: string) => kv.del(`pr/${hash}`),
  },
  personas: {
    list: (owner: string) => many<Persona>(`p/${owner}/`).then((l) => l.sort((a, b) => a.createdAt.localeCompare(b.createdAt))),
    get: (owner: string, id: string) => kv.get<Persona>(`p/${owner}/${id}`),
    save: (p: Persona) => kv.set(`p/${p.ownerId}/${p.id}`, p),
    del: (owner: string, id: string) => kv.del(`p/${owner}/${id}`),
  },
  convs: {
    list: (owner: string) => many<Conversation>(`c/${owner}/`).then((l) => l.sort((a, b) => b.startedAt.localeCompare(a.startedAt))),
    get: (owner: string, id: string) => kv.get<Conversation>(`c/${owner}/${id}`),
    async byTavus(tid: string) { const r = await kv.get<Ref>(`ct/${tid}`); return r ? kv.get<Conversation>(`c/${r.owner}/${r.id}`) : null; },
    async save(c: Conversation) { await kv.set(`c/${c.ownerId}/${c.id}`, c); if (c.tavusId) await kv.set(`ct/${c.tavusId}`, { owner: c.ownerId, id: c.id }); },
    async del(c: Conversation) { if (c.tavusId) await kv.del(`ct/${c.tavusId}`); await kv.del(`c/${c.ownerId}/${c.id}`); },
  },
  keys: {
    list: (owner: string) => many<ApiKey>(`k/${owner}/`).then((l) => l.sort((a, b) => b.createdAt.localeCompare(a.createdAt))),
    async byHash(hash: string) { const r = await kv.get<Ref>(`kh/${hash}`); return r ? kv.get<ApiKey>(`k/${r.owner}/${r.id}`) : null; },
    async insert(k: ApiKey) { await kv.set(`k/${k.ownerId}/${k.id}`, k); await kv.set(`kh/${k.hash}`, { owner: k.ownerId, id: k.id }); },
    save: (k: ApiKey) => kv.set(`k/${k.ownerId}/${k.id}`, k),
    async del(owner: string, id: string) { const k = await kv.get<ApiKey>(`k/${owner}/${id}`); if (!k) return false; await kv.del(`kh/${k.hash}`); await kv.del(`k/${owner}/${id}`); return true; },
  },
  docs: {
    list: (owner: string) => many<Doc>(`d/${owner}/`).then((l) => l.sort((a, b) => b.createdAt.localeCompare(a.createdAt))),
    async getMany(owner: string, ids: string[]) { return (await Promise.all(ids.map((i) => kv.get<Doc>(`d/${owner}/${i}`)))).filter(Boolean) as Doc[]; },
    save: (d: Doc) => kv.set(`d/${d.ownerId}/${d.id}`, d),
    async del(owner: string, id: string) { const d = await kv.get<Doc>(`d/${owner}/${id}`); if (!d) return false; await kv.del(`d/${owner}/${id}`); return true; },
  },
  leads: { insert: (l: { id: string }) => kv.set(`l/${l.id}`, l) },
  stripe: {
    link: (customerId: string, userId: string) => kv.set(`sc/${customerId}`, userId),
    userFor: (customerId: string) => kv.get<string>(`sc/${customerId}`),
  },
};

export const id = (p: string) => `${p}_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
export const now = () => new Date().toISOString();
