import { fail, json, withUser } from "@/lib/server/http";
import { billingReady, stripe } from "@/lib/server/stripe";

export async function POST(req: Request) {
  return withUser(async (u) => {
    if (!billingReady() || !u.stripeCustomerId) return fail(400, "No billing account yet");
    const base = process.env.PUBLIC_URL || new URL(req.url).origin;
    const s = await stripe<{ url: string }>("billing_portal/sessions", { customer: u.stripeCustomerId, return_url: `${base}/app/usage` });
    return json({ url: s.url });
  });
}
