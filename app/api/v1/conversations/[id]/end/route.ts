import { repo } from "@/lib/server/db";
import { fail, json, withKey } from "@/lib/server/http";
import { apiConversation, finishSession } from "@/lib/server/service";
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withKey(req, async (u) => { const c = await repo.convs.get(u.id, id); return c ? json(apiConversation(await finishSession(c))) : fail(404, "Conversation not found"); });
}
