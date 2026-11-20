import { publicUser, setSession, verifyPassword } from "@/lib/server/auth";
import { repo } from "@/lib/server/db";
import { body, fail, json } from "@/lib/server/http";

export async function POST(req: Request) {
  const b = await body<{ email?: string; password?: string }>(req);
  const u = await repo.users.byEmail((b.email || "").trim().toLowerCase());
  if (!u || !verifyPassword(b.password || "", u.passHash)) return fail(401, "Email or password is incorrect");
  await setSession(u.id);
  return json({ user: publicUser(u) });
}
