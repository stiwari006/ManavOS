import { json, withUser } from "@/lib/server/http";
import { myConversations } from "@/lib/server/service";

const LIMIT: Record<string, number> = { starter: 25, builder: 250, growth: 2000 };
export async function GET() {
  return withUser(async (u) => {
    const month = new Date().toISOString().slice(0, 7);
    const convs = (await myConversations(u.id)).filter((c) => c.startedAt.startsWith(month));
    const secs = (c: (typeof convs)[number]) => c.seconds ?? Math.round((Date.now() - Date.parse(c.startedAt)) / 1000);
    const minutes = Math.ceil(convs.filter((c) => c.mode !== "preview").reduce((a, c) => a + secs(c), 0) / 60);
    const days: Record<string, number> = {};
    for (const c of convs) { const d = c.startedAt.slice(0, 10); days[d] = (days[d] || 0) + Math.ceil(secs(c) / 60); }
    return json({ plan: u.plan, month, minutes, included: LIMIT[u.plan] ?? 0, conversations: convs.length, byMode: { video: convs.filter((c) => c.mode === "video").length, voice: convs.filter((c) => c.mode === "voice").length, preview: convs.filter((c) => c.mode === "preview").length }, days });
  });
}
