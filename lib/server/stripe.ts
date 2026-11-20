import "server-only";
import { createHmac } from "node:crypto";
import { safeEqual } from "./auth";

/* Stripe via its REST API (no SDK). Dormant until STRIPE_SECRET_KEY is set.
   Prices: STRIPE_PRICE_BUILDER / STRIPE_PRICE_GROWTH (recurring Price IDs). */
export const billingReady = () => !!process.env.STRIPE_SECRET_KEY;
export const PRICE: Record<string, string | undefined> = {
  builder: process.env.STRIPE_PRICE_BUILDER,
  growth: process.env.STRIPE_PRICE_GROWTH,
};

export async function stripe<T = Record<string, unknown>>(path: string, params: Record<string, string> = {}, method = "POST"): Promise<T> {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method,
    headers: { authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, "content-type": "application/x-www-form-urlencoded" },
    body: method === "GET" ? undefined : new URLSearchParams(params),
    signal: AbortSignal.timeout(10000),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Stripe ${res.status}`);
  return data as T;
}

/** Verifies the Stripe-Signature header (t=…,v1=…) against the raw body. */
export function verifyStripe(raw: string, header: string | null, toleranceSec = 300) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !header) return false;
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=") as [string, string]));
  const t = Number(parts.t);
  if (!t || Math.abs(Date.now() / 1000 - t) > toleranceSec) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${raw}`).digest("hex");
  return header.split(",").some((p) => p.startsWith("v1=") && safeEqual(p.slice(3), expected));
}
