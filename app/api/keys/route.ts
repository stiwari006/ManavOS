import { randomBytes } from "node:crypto";
import { hashKey } from "@/lib/server/auth";
import { id, now, repo } from "@/lib/server/db";
import { body, json, withUser } from "@/lib/server/http";

export async function GET() {
  return withUser(async (u) => json({ keys: (await repo.keys.list(u.id)).map(({ hash: _h, ...k }) => k) }));
}
export async function POST(req: Request) {
  return withUser(async (u) => {
    const { name } = await body<{ name?: string }>(req);
    const secret = "hos_live_" + randomBytes(20).toString("base64url");
    const k = { id: id("key"), ownerId: u.id, name: (name || "Untitled key").slice(0, 60), prefix: secret.slice(0, 13), hash: hashKey(secret), createdAt: now() };
    await repo.keys.insert(k);
    const { hash: _h, ...view } = k;
    return json({ key: view, secret }, 201);
  });
}
