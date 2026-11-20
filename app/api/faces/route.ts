import { json } from "@/lib/server/http";
import { faceMap } from "@/lib/server/tavus";

/** Public: which photoreal video to show for each look. */
export async function GET() {
  const map = await faceMap();
  const out = Object.fromEntries(Object.entries(map).map(([k, v]) => [k, { video: v.video, name: v.name }]));
  return new Response(JSON.stringify({ faces: out }), { headers: { "content-type": "application/json", "cache-control": "public, max-age=600, s-maxage=3600" } });
}
