import "server-only";
import { NextResponse } from "next/server";
import { currentUser, userFromApiKey } from "./auth";
import type { User } from "@/lib/types";

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status });
export const fail = (status: number, error: string) => NextResponse.json({ error }, { status });

/** Session auth for the dashboard. */
export async function withUser<T>(fn: (u: User) => Promise<T> | T) {
  const u = await currentUser();
  if (!u) return fail(401, "Not signed in");
  return fn(u);
}
/** API-key auth for /api/v1. */
export async function withKey<T>(req: Request, fn: (u: User) => Promise<T> | T) {
  const u = await userFromApiKey(req);
  if (!u) return fail(401, "Missing or invalid API key");
  return fn(u);
}
export async function body<T = Record<string, unknown>>(req: Request): Promise<T> {
  try { return (await req.json()) as T; } catch { return {} as T; }
}
