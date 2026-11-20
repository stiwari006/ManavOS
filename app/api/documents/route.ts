import { id, now, repo } from "@/lib/server/db";
import { body, fail, json, withUser } from "@/lib/server/http";

export async function GET() { return withUser(async (u) => json({ documents: (await repo.docs.list(u.id)).map(({ text, ...d }) => ({ ...d, chars: text?.length ?? 0 })) })); }
export async function POST(req: Request) {
  return withUser(async (u) => {
    const b = await body<{ name?: string; url?: string; text?: string; tags?: string[] }>(req);
    if (!b.text?.trim() && !b.url?.trim()) return fail(400, "Add text or a URL");
    let text = b.text?.slice(0, 200000);
    if (!text && b.url) {
      let u: URL;
      try { u = new URL(b.url); } catch { return fail(400, "Invalid URL"); }
      if (u.protocol !== "https:" || /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.|\[)/.test(u.hostname)) return fail(400, "Only public https URLs are allowed");
      try { const r = await fetch(u, { redirect: "error", signal: AbortSignal.timeout(8000) }); text = (await r.text()).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 200000); }
      catch { return fail(400, "Couldn't fetch that URL"); }
    }
    const d = { id: id("doc"), ownerId: u.id, name: (b.name || b.url || "Untitled").slice(0, 120), url: b.url, text, tags: (b.tags || []).slice(0, 10), createdAt: now() };
    await repo.docs.save(d);
    const { text: _t, ...view } = d;
    return json({ document: { ...view, chars: text?.length ?? 0 } }, 201);
  });
}
