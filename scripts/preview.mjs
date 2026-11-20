// Builds a browser-only preview (no server, demo data in localStorage) into ./preview.
// Usage: node scripts/preview.mjs
// Relative asset paths per page depth, no underscore-prefixed paths, so it can be
// hosted under any sub-path (or opened from a static file host).
import { execSync } from "node:child_process";
import { cpSync, existsSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const env = { ...process.env, STATIC_EXPORT: "1", NEXT_PUBLIC_PREVIEW: "1", NEXT_PUBLIC_DEMO: "1" };
renameSync("app/api", ".api-aside");
try { execSync("npx next build", { stdio: "inherit", env }); }
finally { renameSync(".api-aside", "app/api"); }

rmSync("preview", { recursive: true, force: true });
cpSync("out", "preview", { recursive: true });
renameSync("preview/_next", "preview/assets");
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
for (const f of walk("preview")) {
  const name = f.split(sep).pop();
  if (f.endsWith(".txt") || name.startsWith("_") || f.includes(`${sep}_not-found`)) { rmSync(f, { force: true }); continue; }
}
for (const d of ["preview/_not-found", "preview/404"]) rmSync(d, { recursive: true, force: true });
for (const f of readdirSync("preview/assets/static")) if (!["chunks", "media"].includes(f)) rmSync(join("preview/assets/static", f), { recursive: true, force: true });
for (const f of walk("preview")) {
  if (f.endsWith(".js") || f.endsWith(".css")) {
    const s = readFileSync(f, "utf8"), t = s.replaceAll("./_next/", "./assets/").replaceAll("/_next/", "/assets/");
    if (s !== t) writeFileSync(f, t);
  }
  if (f.endsWith(".html")) {
    const depth = relative("preview", f).split(sep).length - 1;
    const rel = depth ? "../".repeat(depth) : "./";
    let s = readFileSync(f, "utf8").replaceAll("./_next/", `${rel}assets/`).replaceAll('"/_next/', `"${rel}assets/`);
    s = s.replace("<head>", `<head><script>self.TURBOPACK_CHUNK_BASE_PATH=${JSON.stringify(rel + "assets/")}</script>`);
    writeFileSync(f, s);
  }
}
console.log("preview ready:", walk("preview").length, "files");
