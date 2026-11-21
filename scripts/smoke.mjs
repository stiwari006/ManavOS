// End-to-end smoke test against a running server. Usage: BASE_URL=http://localhost:3000 node scripts/smoke.mjs
const BASE = process.env.BASE_URL || "http://localhost:3000";
let cookie = "", fails = 0;
const req = async (path, init = {}) => {
  const r = await fetch(BASE + path, { ...init, redirect: "manual", headers: { "content-type": "application/json", cookie, ...(init.headers || {}) } });
  const set = r.headers.get("set-cookie"); if (set) cookie = set.split(";")[0];
  let body = null; try { body = await r.clone().json(); } catch {}
  return { status: r.status, body, headers: r.headers };
};
const check = (name, ok, extra = "") => { console.log(`${ok ? "✓" : "✗"} ${name}${ok ? "" : "  " + extra}`); if (!ok) fails++; };

for (const p of ["/", "/solutions/ai-interviewer", "/pricing", "/docs", "/login", "/forgot", "/sitemap.xml", "/robots.txt"]) {
  const r = await fetch(BASE + p); check(`GET ${p}`, r.status === 200, r.status);
}
const home = await fetch(BASE + "/");
check("security headers", home.headers.get("x-content-type-options") === "nosniff" && !!home.headers.get("permissions-policy"));
const cap = await req("/api/capabilities"); check("capabilities", cap.status === 200, cap.status);

const email = `smoke+${Date.now()}@example.com`;
let r = await req("/api/auth/signup", { method: "POST", body: JSON.stringify({ name: "Smoke", email, password: "smoke-test-pw-1", type: "developer" }) });
check("signup", r.status === 200 || r.status === 201, JSON.stringify(r.body));
r = await req("/api/me"); check("me", r.body?.user?.email === email, JSON.stringify(r.body));
r = await req("/api/personas"); const personas = r.body?.personas || [];
check("seeded personas", personas.length >= 1, JSON.stringify(r.body));
r = await req("/api/conversations", { method: "POST", body: JSON.stringify({ personaId: personas[0]?.id, mode: "preview" }) });
const conv = r.body?.conversation; check("start conversation", !!conv?.id, JSON.stringify(r.body));
if (conv) {
  const t = await fetch(`${BASE}/api/conversations/${conv.id}/turn`, { method: "POST", headers: { "content-type": "application/json", cookie }, body: JSON.stringify({ text: "Hi, I'm ready." }) });
  check("conversation turn", t.status === 200 && (await t.text()).length > 0, t.status);
  r = await req(`/api/conversations/${conv.id}/end`, { method: "POST" }); check("end conversation", r.status === 200, r.status);
}
r = await req("/api/keys", { method: "POST", body: JSON.stringify({ name: "smoke" }) });
const key = r.body?.secret; check("create API key", typeof key === "string", JSON.stringify(r.body));
if (key) { const v = await fetch(BASE + "/api/v1/personas", { headers: { authorization: `Bearer ${key}` } }); check("v1 API with key", v.status === 200, v.status); }
const bad = await fetch(BASE + "/api/v1/personas", { headers: { authorization: "Bearer nope" } }); check("v1 rejects bad key", bad.status === 401, bad.status);
r = await req("/api/custom-faces"); check("list custom faces", r.status === 200 && Array.isArray(r.body?.faces), r.status);
r = await req("/api/custom-faces", { method: "POST", body: JSON.stringify({ name: "x", kind: "full", url: "https://example.com/v.mp4" }) });
check("face needs consent", r.status === 400 || r.status === 503, r.status);
r = await req("/api/auth/forgot", { method: "POST", body: JSON.stringify({ email }) }); check("forgot password", r.status === 200, r.status);
r = await req("/api/account"); check("export data", r.status === 200 && !!r.body, r.status);
const wh = await fetch(BASE + "/api/webhooks/stripe", { method: "POST", body: "{}", headers: { "stripe-signature": "t=1,v1=bad" } }); check("stripe webhook rejects bad signature", wh.status === 400, wh.status);
r = await req("/api/account", { method: "DELETE", body: JSON.stringify({ password: "smoke-test-pw-1" }) }); check("delete account", r.status === 200, JSON.stringify(r.body));
r = await req("/api/me"); check("logged out after delete", !r.body?.user, JSON.stringify(r.body));

console.log(fails ? `\n${fails} check(s) failed` : "\nAll checks passed");
process.exit(fails ? 1 : 0);
