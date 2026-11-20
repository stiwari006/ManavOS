import { repo } from "@/lib/server/db";
import { body, fail, json, withUser } from "@/lib/server/http";
import { myConversations, startSession } from "@/lib/server/service";

export async function GET() { return withUser(async (u) => json({ conversations: (await myConversations(u.id)).map(({ transcript, ...c }) => ({ ...c, turns: transcript.length })) })); }
export async function POST(req: Request) {
  return withUser(async (u) => {
    const b = await body<{ personaId?: string; participant?: string; context?: string; mode?: string; meetingUrl?: string }>(req);
    const p = b.personaId ? await repo.personas.get(u.id, b.personaId) : null;
    if (!p) return fail(404, "Persona not found");
    try {
      const c = await startSession(u.id, p, { participant: b.participant, context: b.context, meetingUrl: b.meetingUrl, source: "app", preferMode: b.mode });
      return json({ conversation: c }, 201);
    } catch (e) { return fail(503, `Could not start video session: ${(e as Error).message}`); }
  });
}
