import { clearSession, verifyPassword } from "@/lib/server/auth";
import { repo } from "@/lib/server/db";
import { body, fail, json, withUser } from "@/lib/server/http";

/** Data export: everything we hold for this account, as JSON. */
export async function GET() {
  return withUser(async (u) => {
    const { passHash: _p, ...profile } = u;
    const [personas, conversations, keys, documents] = await Promise.all([repo.personas.list(u.id), repo.convs.list(u.id), repo.keys.list(u.id), repo.docs.list(u.id)]);
    const out = { exportedAt: new Date().toISOString(), profile, personas, conversations, apiKeys: keys.map(({ hash: _h, ...k }) => k), documents };
    return new Response(JSON.stringify(out, null, 2), { headers: { "content-type": "application/json", "content-disposition": `attachment; filename="account-export.json"` } });
  });
}

/** Permanently deletes the account and all its data. Requires the password. */
export async function DELETE(req: Request) {
  return withUser(async (u) => {
    const { password } = await body<{ password?: string }>(req);
    if (!verifyPassword(password || "", u.passHash)) return fail(403, "Password is incorrect");
    const [personas, conversations, keys, documents] = await Promise.all([repo.personas.list(u.id), repo.convs.list(u.id), repo.keys.list(u.id), repo.docs.list(u.id)]);
    await Promise.all([
      ...personas.map((p) => repo.personas.del(u.id, p.id)),
      ...conversations.map((c) => repo.convs.del(c)),
      ...keys.map((k) => repo.keys.del(u.id, k.id)),
      ...documents.map((d) => repo.docs.del(u.id, d.id)),
    ]);
    await repo.users.del(u);
    await clearSession();
    return json({ ok: true });
  });
}
