import { createHash } from "node:crypto";
import { hashPassword, publicUser, setSession } from "@/lib/server/auth";
import { repo } from "@/lib/server/db";
import { body, fail, json } from "@/lib/server/http";
import { ip, limit } from "@/lib/server/ratelimit";

export async function POST(req: Request) {
  const rl = limit(`reset:${ip(req)}`, 10, 900); if (rl) return rl;
  const { token, password } = await body<{ token?: string; password?: string }>(req);
  if (!token) return fail(400, "Missing reset token");
  if ((password || "").length < 8) return fail(400, "Password must be at least 8 characters");
  const hash = createHash("sha256").update(token).digest("hex");
  const r = await repo.resets.get(hash);
  if (!r || r.exp < Date.now()) return fail(400, "This reset link is invalid or has expired");
  const u = await repo.users.byId(r.userId);
  if (!u) return fail(400, "This reset link is invalid or has expired");
  u.passHash = hashPassword(password!);
  u.sessionVersion = (u.sessionVersion ?? 0) + 1; // signs out every other session
  await repo.users.save(u);
  await repo.resets.del(hash);
  await setSession(u.id, u.sessionVersion);
  return json({ user: publicUser(u) });
}
