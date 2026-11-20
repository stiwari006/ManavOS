// Download photoreal face clips from Tavus into public/media/personas so every
// page (including the static preview) shows real humans.
// Usage: TAVUS_API_KEY=… node scripts/fetch-faces.mjs   [TAVUS_FACES="aarohi=face_id,…"]
// Only use faces your Tavus plan licenses, or replace the files with footage you own.
import { mkdirSync, writeFileSync } from "node:fs";
const KEY = process.env.TAVUS_API_KEY;
if (!KEY) { console.error("Set TAVUS_API_KEY"); process.exit(1); }
const LOOKS = ["aarohi", "dev", "mira", "omar", "ines", "henry"];
const r = await fetch("https://tavusapi.com/v2/faces?face_type=system&verbose=true&limit=60", { headers: { "x-api-key": KEY } });
if (!r.ok) { console.error("Tavus", r.status, await r.text()); process.exit(1); }
const faces = (await r.json()).data.filter((f) => f.thumbnail_video_url);
const pinned = Object.fromEntries((process.env.TAVUS_FACES || "").split(",").map((s) => s.trim().split("=")).filter((p) => p.length === 2));
const pool = faces.filter((f) => !Object.values(pinned).includes(f.face_id));
mkdirSync("public/media/personas", { recursive: true });
const out = {};
for (const look of LOOKS) {
  const f = pinned[look] ? faces.find((x) => x.face_id === pinned[look]) : pool.shift();
  if (!f) continue;
  const v = await fetch(f.thumbnail_video_url);
  writeFileSync(`public/media/personas/${look}.mp4`, Buffer.from(await v.arrayBuffer()));
  out[look] = { video: `/media/personas/${look}.mp4` };
  console.log(`${look} ← ${f.face_name} (${f.face_id})`);
}
writeFileSync("lib/render/media.json", JSON.stringify(out, null, 2) + "\n");
console.log("Wrote lib/render/media.json. Add TAVUS_FACES to your env to keep live calls on the same faces.");
