import { repo } from "@/lib/server/db";
import { body, json } from "@/lib/server/http";
import { refreshFace, scoreAndNotify } from "@/lib/server/service";

/* Tavus conversation callbacks: transcript + shutdown. */
type Ev = { face_id?: string; conversation_id?: string; event_type?: string; properties?: { transcript?: { role: string; content: string; timestamp?: number }[]; shutdown_reason?: string } };
export async function POST(req: Request) {
  const token = process.env.TAVUS_WEBHOOK_TOKEN;
  if (token && new URL(req.url).searchParams.get("token") !== token) return json({ error: "Forbidden" }, 403);
  const ev = await body<Ev>(req);
  // Face training finished (or failed): re-check its status with Tavus.
  if (ev.face_id && !ev.conversation_id) {
    const f = await repo.faces.byTavus(ev.face_id);
    if (f) await refreshFace(f);
    return json({ ok: true });
  }
  const c = ev.conversation_id ? await repo.convs.byTavus(ev.conversation_id) : null;
  if (!c) return json({ ok: true, ignored: true });
  if (ev.event_type === "system.shutdown" && c.status !== "ended") {
    c.status = "ended"; c.endedAt = new Date().toISOString();
    c.seconds = Math.round((Date.parse(c.endedAt) - Date.parse(c.startedAt)) / 1000); await repo.convs.save(c);
  }
  if (ev.event_type === "application.transcription_ready" && ev.properties?.transcript) {
    c.transcript = ev.properties.transcript.filter((t) => t.role === "user" || t.role === "assistant")
      .map((t) => ({ role: t.role as "user" | "assistant", content: t.content, at: (t.timestamp || 0) * 1000 }));
    await repo.convs.save(c);
    await scoreAndNotify(c);
  }
  return json({ ok: true });
}
