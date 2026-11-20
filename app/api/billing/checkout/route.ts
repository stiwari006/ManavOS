import { repo } from "@/lib/server/db";
import { body, fail, json, withUser } from "@/lib/server/http";
import { PRICE, billingReady, stripe } from "@/lib/server/stripe";

export async function POST(req: Request) {
  return withUser(async (u) => {
    if (!billingReady()) return fail(503, "Billing isn't set up yet. Contact us to upgrade.");
    const { plan } = await body<{ plan?: string }>(req);
    const price = plan ? PRICE[plan] : undefined;
    if (!price) return fail(400, "Unknown plan");
    if (!u.stripeCustomerId) {
      const c = await stripe<{ id: string }>("customers", { email: u.email, name: u.name, "metadata[userId]": u.id });
      u.stripeCustomerId = c.id;
      await repo.users.save(u);
      await repo.stripe.link(c.id, u.id);
    }
    const base = process.env.PUBLIC_URL || new URL(req.url).origin;
    const s = await stripe<{ url: string }>("checkout/sessions", {
      mode: "subscription", customer: u.stripeCustomerId, client_reference_id: u.id,
      "line_items[0][price]": price, "line_items[0][quantity]": "1",
      "subscription_data[metadata][plan]": plan!, "subscription_data[metadata][userId]": u.id,
      success_url: `${base}/app/usage?upgraded=1`, cancel_url: `${base}/app/usage`,
      allow_promotion_codes: "true",
    });
    return json({ url: s.url });
  });
}
