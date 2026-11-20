import { repo } from "@/lib/server/db";
import { fail, json, withUser } from "@/lib/server/http";
import { finishSession } from "@/lib/server/service";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withUser(async (u) => {
    const c = await repo.convs.get(u.id, id);
    if (!c) return fail(404, "Conversation not found");
    return json({ conversation: await finishSession(c) });
  });
}
