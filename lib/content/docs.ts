export type DocBlock = { h?: string; p?: string; code?: string; lang?: string; table?: string[][] };
export type DocPage = { slug: string; group: string; title: string; lead: string; blocks: DocBlock[] };

export const DOCS: DocPage[] = [
  {
    slug: "quickstart", group: "Get started", title: "Quickstart",
    lead: "Create an API key, pick a persona and start your first face-to-face conversation in about five minutes.",
    blocks: [
      { h: "1. Create an API key", p: "Sign in to the dashboard and open API keys. Keys start with mos_live_ and are shown once. Store yours in an environment variable." },
      { code: "export MANAVOS_API_KEY=mos_live_…", lang: "bash" },
      { h: "2. Start a conversation", p: "Every account includes six stock personas. Create a conversation with one of them; the response includes a join URL." },
      { code: `curl -X POST https://app.manavos.ai/api/v1/conversations \\
  -H "Authorization: Bearer $MANAVOS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "persona_id": "aarohi" }'`, lang: "bash" },
      { code: `{
  "id": "conv_8f21",
  "persona_id": "aarohi",
  "status": "active",
  "join_url": "https://app.manavos.ai/app/live/?id=conv_8f21",
  "mode": "video"
}`, lang: "json" },
      { h: "3. Join or embed", p: "Open join_url in a browser, or embed it in an iframe with camera and microphone permissions. When the call ends, the transcript arrives via webhook." },
      { code: `<iframe src="{join_url}" allow="camera; microphone; fullscreen; display-capture"></iframe>`, lang: "html" },
    ],
  },
  {
    slug: "authentication", group: "Get started", title: "Authentication",
    lead: "All API requests use a bearer token. Keys are scoped to a workspace and can be revoked at any time.",
    blocks: [
      { code: `Authorization: Bearer mos_live_xxxxxxxxxxxxxxxx`, lang: "http" },
      { p: "Requests without a valid key return 401. Revoked keys stop working immediately. Never ship a key in client-side code: create conversations from your server and pass only the join URL to the browser." },
    ],
  },
  {
    slug: "personas", group: "Core concepts", title: "Personas",
    lead: "A persona is a face, a voice, a personality and a set of capabilities. Create them in Studio or through the API.",
    blocks: [
      { h: "Create a persona", code: `POST /v1/personas
{
  "name": "Priya",
  "look": "aarohi",
  "system_prompt": "You are Priya, a friendly onboarding host…",
  "greeting": "Hi, I'm Priya, an AI host. Welcome!",
  "languages": ["en-IN", "hi-IN"],
  "memory": true,
  "perception": true
}`, lang: "http" },
      { h: "Fields", table: [["Field", "Type", "Description"], ["name", "string", "Display name"], ["look", "string", "Stock face key or custom face id"], ["system_prompt", "string", "Personality and instructions. Keep under ~5,000 tokens"], ["greeting", "string", "First line spoken when someone joins"], ["languages", "string[]", "First entry is the opening language"], ["memory", "boolean", "Remember participants across sessions"], ["perception", "boolean", "Enable Iris perception"], ["rubric", "string[]", "Optional scoring criteria for evaluations"]] },
      { p: "Every persona discloses it is an AI. This cannot be disabled." },
    ],
  },
  {
    slug: "conversations", group: "Core concepts", title: "Conversations",
    lead: "A conversation is one live session between a persona and one or more people.",
    blocks: [
      { h: "Create", code: `POST /v1/conversations
{
  "persona_id": "per_31ac",
  "participant": "cand_0412",
  "context": "Role: Data analyst. Seniority: mid-level.",
  "meeting_url": null
}`, lang: "http" },
      { h: "Retrieve", code: `GET /v1/conversations/conv_8f21`, lang: "http" },
      { h: "End", code: `POST /v1/conversations/conv_8f21/end`, lang: "http" },
      { h: "Modes", table: [["Mode", "When"], ["video", "Photoreal face-to-face via the rendering pipeline"], ["voice", "Rendered persona with browser voice; used when video capacity is unavailable"], ["preview", "Sandbox with scripted responses, no minutes consumed"]] },
    ],
  },
  {
    slug: "webhooks", group: "Core concepts", title: "Webhooks",
    lead: "Receive transcripts, perception notes and scores as soon as a conversation ends.",
    blocks: [
      { p: "Set a webhook URL in Settings or per conversation. We send a POST with a JSON body and an X-ManavOS-Signature header (HMAC-SHA256 of the raw body with your signing secret)." },
      { h: "Events", table: [["Event", "Sent when"], ["conversation.started", "The persona joins"], ["conversation.ended", "The session closes"], ["conversation.transcript_ready", "The full transcript is available"], ["conversation.scored", "Rubric scoring has completed"]] },
      { code: `{
  "event": "conversation.scored",
  "conversation_id": "conv_8f21",
  "scores": { "structure": 3.6, "evidence": 3.1 },
  "summary": "Clear, quantified answers; ran long on Q2.",
  "recommendation": "advance"
}`, lang: "json" },
    ],
  },
  {
    slug: "evaluations", group: "Core concepts", title: "Evaluations & scoring",
    lead: "Attach a rubric to a persona and every conversation is scored against it, with evidence quoted from the transcript.",
    blocks: [
      { p: "Scores range 1–4 per criterion. Each score is accompanied by the transcript excerpts that justify it, so reviewers can audit every number. Scoring runs on Claude by default." },
      { code: `"rubric": ["Structure", "Evidence & metrics", "Ownership", "Clarity"]`, lang: "json" },
      { p: "Evaluations support decisions made by people. Don't use them as the sole basis for consequential decisions." },
    ],
  },
  {
    slug: "api-reference", group: "Reference", title: "API reference",
    lead: "Base URL: https://app.manavos.ai/api (or your own deployment). All bodies are JSON.",
    blocks: [
      { table: [["Method", "Path", "Description"], ["GET", "/v1/personas", "List personas"], ["POST", "/v1/personas", "Create a persona"], ["GET", "/v1/personas/{id}", "Get a persona"], ["DELETE", "/v1/personas/{id}", "Delete a persona"], ["POST", "/v1/conversations", "Start a conversation"], ["GET", "/v1/conversations", "List conversations"], ["GET", "/v1/conversations/{id}", "Get a conversation with transcript"], ["POST", "/v1/conversations/{id}/end", "End a conversation"]] },
      { h: "Errors", table: [["Status", "Meaning"], ["400", "Invalid request body"], ["401", "Missing or invalid API key"], ["404", "Resource not found"], ["429", "Concurrency or rate limit reached"], ["503", "Video capacity unavailable; retry or use voice mode"]] },
    ],
  },
];

export const doc = (slug: string) => DOCS.find((d) => d.slug === slug);
