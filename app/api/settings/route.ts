import { publicUser } from "@/lib/server/auth";
import { repo } from "@/lib/server/db";
import { body, fail, json, withUser } from "@/lib/server/http";

export async function PATCH(req: Request) {
  return withUser(async (u) => {
    const b = await body<{ name?: string; company?: string; webhookUrl?: string }>(req);
    if (b.webhookUrl && !/^https:\/\//.test(b.webhookUrl)) return fail(400, "Webhook URL must start with https://");
    if (b.name !== undefined) u.name = b.name.slice(0, 80);
    if (b.company !== undefined) u.company = b.company.slice(0, 120);
    if (b.webhookUrl !== undefined) u.webhookUrl = b.webhookUrl || undefined;
    await repo.users.save(u); return json({ user: publicUser(u) });
  });
}
