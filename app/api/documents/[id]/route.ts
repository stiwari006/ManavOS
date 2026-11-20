import { repo } from "@/lib/server/db";
import { fail, json, withUser } from "@/lib/server/http";
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withUser(async (u) => {
    if (!(await repo.docs.del(u.id, id))) return fail(404, "Document not found");
    for (const p of await repo.personas.list(u.id)) if (p.documentIds.includes(id)) { p.documentIds = p.documentIds.filter((x) => x !== id); await repo.personas.save(p); }
    return json({ ok: true });
  });
}
