import { repo } from "@/lib/server/db";
import { fail, json, withKey } from "@/lib/server/http";
import { apiPersona } from "@/lib/server/service";
type P = { params: Promise<{ id: string }> };
export async function GET(req: Request, { params }: P) {
  const { id } = await params;
  return withKey(req, async (u) => { const p = await repo.personas.get(u.id, id); return p ? json(apiPersona(p)) : fail(404, "Persona not found"); });
}
export async function DELETE(req: Request, { params }: P) {
  const { id } = await params;
  return withKey(req, async (u) => {
    if (!(await repo.personas.get(u.id, id))) return fail(404, "Persona not found");
    await repo.personas.del(u.id, id); return new Response(null, { status: 204 });
  });
}
