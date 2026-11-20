import { streamReply, claudeReady } from "@/lib/server/claude";
import { body, fail, json } from "@/lib/server/http";
import { SOLUTIONS } from "@/lib/content/solutions";

/* Public "Talk to a persona" endpoint for the marketing site.
   Stateless: the client sends the running transcript. Rate-limited per IP. */
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const t = Date.now(), arr = (hits.get(ip) || []).filter((x) => t - x < 10 * 60_000);
  arr.push(t); hits.set(ip, arr);
  return arr.length > 40;
}

export async function GET() { return json({ live: claudeReady() }); }

export async function POST(req: Request) {
  if (!claudeReady()) return fail(503, "Live demo is not configured");
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  if (limited(ip)) return fail(429, "You've reached the demo limit. Sign up to keep talking.");
  const b = await body<{ persona?: string; turns?: { role: "user" | "assistant"; content: string }[] }>(req);
  const s = SOLUTIONS.find((x) => x.slug === b.persona) ?? SOLUTIONS[0];
  const turns = (b.turns || []).slice(-16).map((t) => ({ role: t.role === "assistant" ? "assistant" as const : "user" as const, content: String(t.content).slice(0, 1500), at: 0 }));
  if (!turns.length || turns[turns.length - 1].role !== "user") return fail(400, "Send a user turn");
  const system = `${s.systemPrompt}\n\nThis is a short public demo on the HumanOS website. Keep replies under 40 words, spoken style, no markdown. If asked about HumanOS, it's a platform for real-time AI humans with Claude as the reasoning layer.`;
  try {
    return new Response(await streamReply(system, turns, () => {}), { headers: { "content-type": "text/plain; charset=utf-8" } });
  } catch (e) { return fail(502, (e as Error).message); }
}
