import { streamReply } from "@/lib/server/claude";
import { repo } from "@/lib/server/db";
import { limit } from "@/lib/server/ratelimit";
import { body, fail, withUser } from "@/lib/server/http";
import { addTurn, previewReply, systemFor } from "@/lib/server/service";

/** Voice/preview mode: append the participant's turn, stream the persona's reply. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withUser(async (u) => {
    const rl = limit(`turn:${u.id}`, 40, 60); if (rl) return rl;
    const c = await repo.convs.get(u.id, id);
    if (!c || c.status !== "active" || c.mode === "video") return fail(400, "Conversation is not an active voice session");
    const p = await repo.personas.get(u.id, c.personaId);
    if (!p) return fail(404, "Persona not found");
    const { text } = await body<{ text?: string }>(req);
    if (!text?.trim()) return fail(400, "Empty message");
    await addTurn(c, { role: "user", content: text.trim().slice(0, 4000), at: Date.now() });
    if (c.mode === "preview") {
      const reply = previewReply(c);
      await addTurn(c, { role: "assistant", content: reply, at: Date.now() });
      return new Response(reply, { headers: { "content-type": "text/plain; charset=utf-8" } });
    }
    try {
      const stream = await streamReply(await systemFor(p, c), c.transcript, (full) => addTurn(c, { role: "assistant", content: full, at: Date.now() }));
      return new Response(stream, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });
    } catch (e) { return fail(502, (e as Error).message); }
  });
}
