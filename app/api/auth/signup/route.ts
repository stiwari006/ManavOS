import { ip, limit } from "@/lib/server/ratelimit";
import { hashPassword, publicUser, setSession } from "@/lib/server/auth";
import { repo } from "@/lib/server/db";
import { body, fail, json } from "@/lib/server/http";
import { newUser } from "@/lib/server/service";

export async function POST(req: Request) {
  const rl = limit(`signup:${ip(req)}`, 5, 600); if (rl) return rl;
  const b = await body<{ email?: string; password?: string; name?: string; company?: string; type?: string; plan?: string }>(req);
  const email = (b.email || "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail(400, "Enter a valid email");
  if ((b.password || "").length < 8) return fail(400, "Password must be at least 8 characters");
  if (await repo.users.byEmail(email)) return fail(409, "An account with this email already exists");
  const u = await newUser(email, (b.name || email.split("@")[0]).slice(0, 80), hashPassword(b.password!), b.type === "teams" ? "teams" : "developer", ["builder", "growth"].includes(b.plan || "") ? b.plan! : "starter", b.company?.slice(0, 120));
  await setSession(u.id);
  return json({ user: publicUser(u) });
}
