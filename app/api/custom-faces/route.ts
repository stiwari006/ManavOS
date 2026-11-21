import { id, now, repo } from "@/lib/server/db";
import { body, fail, json, withUser } from "@/lib/server/http";
import { limit } from "@/lib/server/ratelimit";
import { presign } from "@/lib/server/s3";
import { FACE_LIMIT, refreshFace } from "@/lib/server/service";
import { createFace, faceCallbackUrl } from "@/lib/server/tavus";
import type { Face } from "@/lib/types";

export async function GET() {
  return withUser(async (u) => json({ faces: await Promise.all((await repo.faces.list(u.id)).map(refreshFace)), limit: FACE_LIMIT[u.plan] ?? 1 }));
}

const STATEMENT = {
  self: "I am the person shown in this footage and I agree to it being used to create an AI likeness of me.",
  permission: "I have the written, informed permission of the person shown in this footage to create an AI likeness of them, and I can provide it on request.",
};

export async function POST(req: Request) {
  return withUser(async (u) => {
    if (!process.env.TAVUS_API_KEY) return fail(503, "Face training isn't switched on yet.");
    const rl = await limit(`face:${u.id}`, 5, 3600); if (rl) return rl;
    const b = await body<{ name?: string; kind?: string; key?: string; url?: string; consent?: "self" | "permission"; consentName?: string }>(req);
    const name = (b.name || "").trim().slice(0, 60);
    const kind = (["full", "head", "photo"] as const).find((k) => k === b.kind);
    if (!name || !kind) return fail(400, "Give the face a name and choose a type.");
    if (b.consent !== "self" && b.consent !== "permission") return fail(400, "Confirm you have consent from the person in the footage.");
    if (!b.consentName?.trim()) return fail(400, "Type the full name of the person in the footage.");
    if (kind === "photo" && !process.env.TAVUS_DEFAULT_VOICE_ID) return fail(400, "Photo faces aren't available yet. Upload a video instead.");
    const mine = await repo.faces.list(u.id);
    if (mine.filter((f) => f.status !== "error").length >= (FACE_LIMIT[u.plan] ?? 1)) return fail(402, `Your plan includes ${FACE_LIMIT[u.plan] ?? 1} custom face(s). Upgrade or delete one to add more.`);

    let source: string;
    if (b.key) {
      if (!b.key.startsWith(`faces/${u.id}/`)) return fail(400, "Invalid upload");
      source = presign("GET", b.key, 7 * 86400);
    } else {
      try { const url = new URL(b.url || ""); if (url.protocol !== "https:") throw 0; source = url.toString(); }
      catch { return fail(400, "Upload a file or paste a public https link to the video."); }
    }

    const f: Face = {
      id: id("face"), ownerId: u.id, name, kind, status: "training", source: b.key ? `upload:${b.key}` : source,
      consent: { by: b.consentName.trim().slice(0, 100), statement: STATEMENT[b.consent], at: now() }, createdAt: now(),
    };
    try {
      const t = await createFace({ name, kind, url: source, callback: faceCallbackUrl() });
      f.tavusFaceId = t.face_id;
      if (t.status === "error") { f.status = "error"; f.error = "Tavus rejected the footage. Check the recording guide."; }
    } catch (e) {
      return fail(502, `Couldn't start training: ${(e as Error).message.slice(0, 200)}`);
    }
    await repo.faces.save(f);
    return json({ face: f }, 201);
  });
}
