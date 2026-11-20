import { ip, limit } from "@/lib/server/ratelimit";
import { publicUser, setSession, verifyPassword } from "@/lib/server/auth";
import { repo } from "@/lib/server/db";
import { body, fail, json } from "@/lib/server/http";

export async function POST(req: Request) {
  const b = await body<{ email?: string; password?: string }>(req);
  const rl = limit(`login:${ip(req)}`, 10, 600) || limit(`login:${(b.email || "").toLowerCase()}`, 8, 600); if (rl) return rl;
  const u = await repo.users.byEmail((b.email || "").trim().toLowerCase());
  if (!u || !verifyPassword(b.password || "", u.passHash)) return fail(401, "Email or password is incorrect");
  await setSession(u.id, u.sessionVersion ?? 0);
  return json({ user: publicUser(u) });
}
