import { limit } from "@/lib/server/ratelimit";
import { body, fail, json, withKey } from "@/lib/server/http";
import { QuotaError, apiConversation, myConversations, myPersonas, startSession } from "@/lib/server/service";

export async function GET(req: Request) { return withKey(req, async (u) => json({ data: (await myConversations(u.id)).map(apiConversation) })); }
export async function POST(req: Request) {
  return withKey(req, async (u) => {
    const rl = limit(`v1conv:${u.id}`, 60, 3600); if (rl) return rl;
    const b = await body<{ persona_id?: string; participant?: string; context?: string; meeting_url?: string; mode?: string }>(req);
    // persona_id may be an id or a stock persona's look key (e.g. "aarohi")
    const p = (await myPersonas(u.id)).find((x) => x.id === b.persona_id || (x.stock && x.look === b.persona_id));
    if (!p) return fail(404, "Persona not found");
    try {
      const c = await startSession(u.id, p, { participant: b.participant, context: b.context, meetingUrl: b.meeting_url, source: "api", preferMode: b.mode });
      return json(apiConversation(c), 201);
    } catch (e) { return fail(e instanceof QuotaError ? 402 : 503, (e as Error).message); }
  });
}
