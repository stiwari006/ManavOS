import { createHash, randomBytes } from "node:crypto";
import { BRAND } from "@/lib/brand";
import { repo } from "@/lib/server/db";
import { sendEmail } from "@/lib/server/email";
import { body, json } from "@/lib/server/http";
import { ip, limit } from "@/lib/server/ratelimit";

/** Always answers the same way, so it can't be used to discover accounts. */
export async function POST(req: Request) {
  const rl = limit(`forgot:${ip(req)}`, 5, 900); if (rl) return rl;
  const { email } = await body<{ email?: string }>(req);
  const u = email ? await repo.users.byEmail(email.trim().toLowerCase()) : null;
  if (u) {
    const token = randomBytes(32).toString("base64url");
    await repo.resets.put(createHash("sha256").update(token).digest("hex"), { userId: u.id, exp: Date.now() + 60 * 60 * 1000 });
    const base = process.env.PUBLIC_URL || new URL(req.url).origin;
    await sendEmail(u.email, `Reset your ${BRAND.name} password`,
      `Hi ${u.name},\n\nUse this link to set a new password. It expires in 1 hour:\n${base}/reset?token=${token}\n\nIf you didn't ask for this, you can ignore this email.\n\n${BRAND.name}`).catch((e) => console.error(e));
  }
  return json({ ok: true });
}
