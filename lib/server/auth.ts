import "server-only";
import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { repo } from "./db";
import type { PublicUser, User } from "@/lib/types";

const SECRET = process.env.SESSION_SECRET || "dev-only-change-me";
const COOKIE = "hos_session";

export function hashPassword(pw: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(pw, salt, 32).toString("hex")}`;
}
export function verifyPassword(pw: string, stored: string) {
  const [salt, h] = stored.split(":");
  const a = Buffer.from(h, "hex"), b = scryptSync(pw, salt, 32);
  return a.length === b.length && timingSafeEqual(a, b);
}

const sign = (v: string) => createHmac("sha256", SECRET).update(v).digest("base64url");

export async function setSession(userId: string) {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 14;
  const v = `${userId}.${exp}`;
  (await cookies()).set(COOKIE, `${v}.${sign(v)}`, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 14 });
}
export async function clearSession() { (await cookies()).delete(COOKIE); }

export async function currentUser(): Promise<User | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [uid, exp, sig] = raw.split(".");
  if (!uid || !exp || !sig || sign(`${uid}.${exp}`) !== sig || Number(exp) < Date.now()) return null;
  return repo.users.byId(uid);
}

export const hashKey = (k: string) => createHash("sha256").update(k).digest("hex");

export async function userFromApiKey(req: Request): Promise<User | null> {
  const h = req.headers.get("authorization") || "";
  const key = h.startsWith("Bearer ") ? h.slice(7).trim() : "";
  if (!key.startsWith("hos_")) return null;
  const k = await repo.keys.byHash(hashKey(key));
  if (!k) return null;
  k.lastUsed = new Date().toISOString();
  await repo.keys.save(k);
  return repo.users.byId(k.ownerId);
}

export function publicUser(u: User): PublicUser {
  const { passHash: _p, webhookSecret, ...rest } = u;
  return { ...rest, webhookSecret };
}
