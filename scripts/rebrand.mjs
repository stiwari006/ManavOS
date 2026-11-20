// Rename the brand across the codebase.
// Usage: node scripts/rebrand.mjs "Chayan AI" chayan.ai [wordmarkStrong] [wordmarkQuiet]
//   e.g. node scripts/rebrand.mjs "Chayan AI" chayan.ai chayan AI
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [, , name, domain, wmA, wmB] = process.argv;
if (!name || !domain) { console.error('Usage: node scripts/rebrand.mjs "New Name" newdomain.ai [strong] [quiet]'); process.exit(1); }
const brandFile = readFileSync("lib/brand.ts", "utf8");
const oldName = brandFile.match(/name: "([^"]+)"/)[1];
const oldDomain = brandFile.match(/domain: "([^"]+)"/)[1];
const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "");
const oldSlug = oldName.toLowerCase().replace(/[^a-z0-9]+/g, "");
const [a, b] = wmA ? [wmA, wmB ?? ""] : [name, ""];

const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
let changed = 0;
for (const f of ["app", "components", "lib", "README.md"].flatMap((d) => (statSync(d).isDirectory() ? walk(d) : [d]))) {
  if (!/\.(tsx?|md)$/.test(f)) continue;
  const s = readFileSync(f, "utf8");
  let t = s.replaceAll(oldDomain, domain).replaceAll(oldName, name)
    .replaceAll(`@${oldSlug}/sdk`, `@${slug}/sdk`).replaceAll(`${oldSlug.toUpperCase()}_API_KEY`, `${slug.toUpperCase()}_API_KEY`);
  if (f.endsWith("brand.ts")) t = t.replace(/wordmark: \[[^\]]*\]/, `wordmark: ["${a}", "${b}"]`);
  if (t !== s) { writeFileSync(f, t); changed++; }
}
console.log(`Renamed ${oldName} → ${name} (${oldDomain} → ${domain}) in ${changed} files.`);
