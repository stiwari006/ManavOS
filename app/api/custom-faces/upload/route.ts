import { randomBytes } from "node:crypto";
import { body, fail, json, withUser } from "@/lib/server/http";
import { limit } from "@/lib/server/ratelimit";
import { presign, uploadsReady } from "@/lib/server/s3";

const TYPES: Record<string, string> = { "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov", "image/jpeg": "jpg", "image/png": "png" };

/** Returns a one-time URL the browser PUTs the file to (direct to the bucket). */
export async function POST(req: Request) {
  return withUser(async (u) => {
    if (!uploadsReady()) return fail(503, "Uploads aren't set up. Paste a link to the video instead.");
    const rl = await limit(`upl:${u.id}`, 20, 3600); if (rl) return rl;
    const { type, size } = await body<{ type?: string; size?: number }>(req);
    const ext = type ? TYPES[type] : undefined;
    if (!ext) return fail(400, "Use an .mp4, .webm or .mov video (or a .jpg/.png photo).");
    if (!size || size > 750 * 1024 * 1024) return fail(400, "Files must be under 750 MB.");
    const key = `faces/${u.id}/${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
    return json({ key, uploadUrl: presign("PUT", key, 3600) });
  });
}
