import { repo } from "@/lib/server/db";
import { body, fail, json, withUser } from "@/lib/server/http";
import { personaInput } from "@/lib/server/service";

type P = { params: Promise<{ id: string }> };
export async function GET(_: Request, { params }: P) {
  const { id } = await params;
  return withUser(async (u) => { const p = await repo.personas.get(u.id, id); return p ? json({ persona: p }) : fail(404, "Persona not found"); });
}
export async function PATCH(req: Request, { params }: P) {
  const { id } = await params;
  return withUser(async (u) => {
    const p = await repo.personas.get(u.id, id); if (!p) return fail(404, "Persona not found");
    Object.assign(p, personaInput(await body(req), p)); await repo.personas.save(p);
    return json({ persona: p });
  });
}
export async function DELETE(_: Request, { params }: P) {
  const { id } = await params;
  return withUser(async (u) => {
    if (!(await repo.personas.get(u.id, id))) return fail(404, "Persona not found");
    await repo.personas.del(u.id, id);
    return json({ ok: true });
  });
}
