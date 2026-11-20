import { repo } from "@/lib/server/db";
import { json } from "@/lib/server/http";
import { verifyStripe } from "@/lib/server/stripe";

type Sub = { id: string; customer: string; status: string; metadata?: { plan?: string } };

export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyStripe(raw, req.headers.get("stripe-signature"))) return json({ error: "Invalid signature" }, 400);
  const ev = JSON.parse(raw) as { type: string; data: { object: Sub & { client_reference_id?: string; subscription?: string } } };
  const o = ev.data.object;
  const uid = o.client_reference_id || (o.customer ? await repo.stripe.userFor(o.customer) : null);
  const u = uid ? await repo.users.byId(uid) : null;
  if (!u) return json({ ok: true, ignored: true });

  if (ev.type === "customer.subscription.created" || ev.type === "customer.subscription.updated") {
    const active = ["active", "trialing", "past_due"].includes(o.status);
    u.plan = active ? o.metadata?.plan || u.plan : "starter";
    u.stripeSubscriptionId = active ? o.id : undefined;
  } else if (ev.type === "customer.subscription.deleted") {
    u.plan = "starter"; u.stripeSubscriptionId = undefined;
  } else if (ev.type === "checkout.session.completed" && o.customer && !u.stripeCustomerId) {
    u.stripeCustomerId = o.customer; await repo.stripe.link(o.customer, u.id);
  }
  await repo.users.save(u);
  return json({ ok: true });
}
