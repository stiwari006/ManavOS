import { repo } from "@/lib/server/db";
import { fail, json, withUser } from "@/lib/server/http";
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withUser(async (u) => ((await repo.keys.del(u.id, id)) ? json({ ok: true }) : fail(404, "Key not found")));
}
