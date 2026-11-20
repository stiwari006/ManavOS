import { id, repo } from "@/lib/server/db";
import { body, fail, json } from "@/lib/server/http";
export async function POST(req: Request) {
  const b = await body<Record<string, string>>(req);
  if (!b.email?.includes("@") || !b.name) return fail(400, "Name and email are required");
  const lead = { id: id("lead"), at: new Date().toISOString(), ...Object.fromEntries(Object.entries(b).map(([k, v]) => [k, String(v).slice(0, 2000)])) };
  await repo.leads.insert(lead);
  if (process.env.LEADS_WEBHOOK_URL) await fetch(process.env.LEADS_WEBHOOK_URL, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(lead), signal: AbortSignal.timeout(5000) }).catch(() => {});
  return json({ ok: true });
}
