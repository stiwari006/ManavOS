import { repo } from "@/lib/server/db";
import { fail, json, withUser } from "@/lib/server/http";
import { refreshFace } from "@/lib/server/service";
import { deleteFace } from "@/lib/server/tavus";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withUser(async (u) => { const f = await repo.faces.get(u.id, id); return f ? json({ face: await refreshFace(f) }) : fail(404, "Face not found"); });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withUser(async (u) => {
    const f = await repo.faces.get(u.id, id);
    if (!f) return fail(404, "Face not found");
    if (f.tavusFaceId) await deleteFace(f.tavusFaceId);
    // Personas using this face fall back to their stock look.
    for (const p of await repo.personas.list(u.id)) if (p.faceId && p.faceId === f.tavusFaceId) { p.faceId = undefined; p.frame = undefined; p.tavusPalId = undefined; await repo.personas.save(p); }
    await repo.faces.del(f);
    return json({ ok: true });
  });
}
