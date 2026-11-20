import { repo } from "@/lib/server/db";
import { fail, json, withUser } from "@/lib/server/http";
import { getConversation } from "@/lib/server/tavus";

type P = { params: Promise<{ id: string }> };
export async function GET(_: Request, { params }: P) {
  const { id } = await params;
  return withUser(async (u) => {
    const c = await repo.convs.get(u.id, id);
    if (!c) return fail(404, "Conversation not found");
    // Pull the transcript from Tavus if the webhook hasn't delivered it yet
    if (c.mode === "video" && c.tavusId && !c.transcript.length && c.status === "ended") {
      try {
        const t = await getConversation(c.tavusId);
        const tr = t.events?.find((e) => e.event_type === "application.transcription_ready")?.properties?.transcript;
        if (tr) { c.transcript = tr.filter((x) => x.role === "user" || x.role === "assistant").map((x) => ({ role: x.role as "user" | "assistant", content: x.content, at: (x.timestamp || 0) * 1000 })); await repo.convs.save(c); }
      } catch { /* not ready */ }
    }
    return json({ conversation: c });
  });
}
