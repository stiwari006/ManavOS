import type { PersonaKey } from "@/lib/render/engine";

export type Model = {
  slug: string; name: string; tag: string; version: string; persona: PersonaKey;
  headline: [string, string]; sub: string;
  specs: [string, string][];
  sections: { t: string; b: string }[];
};

export const MODELS: Model[] = [
  {
    slug: "iris", name: "Iris", tag: "Perception", version: "Iris-2", persona: "ines",
    headline: ["It sees you", "seeing it."],
    sub: "Iris is the perception model. It reads expression, gaze, posture and what's on a shared screen, and turns it into context the conversation can use, in real time.",
    specs: [["Inputs", "Camera, screen share, audio prosody"], ["Signals", "Emotion, engagement, gaze, environment"], ["Latency", "Per-frame, streamed to the LLM layer"], ["Queries", "Custom visual & screen awareness questions"]],
    sections: [
      { t: "Emotion, not just words", b: "A pause with a frown means something different from a pause with a smile. Iris passes those cues to the brain so replies can soften, slow down or check in." },
      { t: "Screen awareness", b: "When a user shares a screen, Iris understands what's on it: an error dialog, a spreadsheet, a slide. Support and tutoring personas can talk about what they see." },
      { t: "Your own questions", b: "Ask Iris anything visual in plain language: 'Is the candidate reading from notes?' 'Does the patient look uncomfortable?' Answers arrive as structured events." },
    ],
  },
  {
    slug: "lumen", name: "Lumen", tag: "Rendering", version: "Lumen-1", persona: "aarohi",
    headline: ["Faces that", "feel present."],
    sub: "Lumen renders the persona: photoreal faces with micro-expressions, lip sync and, in the Aarohi-1 preview, full-body posture and gesture, at video frame rates.",
    specs: [["Output", "1080p, 30 fps, streamed over WebRTC"], ["Lip sync", "Phoneme-accurate across 40+ languages"], ["Body", "Full-body gesture & posture (preview)"], ["Training", "2 minutes of consented video for a custom face"]],
    sections: [
      { t: "Micro-expression", b: "Listening is visible: small nods, a raised brow, eyes that track. Lumen animates the in-between moments that make a face feel attentive." },
      { t: "Full body, in preview", b: "Aarohi-1 adds posture and hand gesture driven by the conversation, for use cases like yoga, fitness and presenting where the body is the message." },
      { t: "Consent first", b: "Custom faces require verified, recorded consent from the person depicted, and every persona discloses it is an AI." },
    ],
  },
  {
    slug: "cadence", name: "Cadence", tag: "Conversation", version: "Cadence-2", persona: "dev",
    headline: ["Knows when", "you're done."],
    sub: "Cadence handles voice and turn-taking: when to speak, when to wait, when to let you interrupt. It's the difference between a conversation and a walkie-talkie.",
    specs: [["Turn detection", "Semantic + acoustic, ~400 ms yield"], ["Interruptions", "Barge-in with graceful recovery"], ["Voices", "Stock, cloned (with consent) or third-party TTS"], ["Speech", "Streaming STT with custom hotwords"]],
    sections: [
      { t: "Thinking pauses", b: "People pause mid-thought. Cadence listens to meaning as well as silence, so it doesn't jump in while you're finding the word." },
      { t: "Natural interruptions", b: "Cut in and the persona stops, listens, and picks up where it makes sense, the way a person would." },
      { t: "Tone that fits", b: "Pace and warmth adapt to the moment: brisk for a status update, gentle for bad news." },
    ],
  },
  {
    slug: "recall", name: "Recall", tag: "Continuity", version: "Recall-1", persona: "mira",
    headline: ["Picks up where", "you left off."],
    sub: "Recall gives personas durable memory: a profile and timeline per person, pinned facts you control, and retrieval from your knowledge base.",
    specs: [["Scope", "Per participant, per persona"], ["Types", "Learned profile, timeline, pinned facts"], ["Control", "View, edit and delete any memory"], ["Knowledge", "Documents with speed/quality retrieval"]],
    sections: [
      { t: "Remembers people, not just chats", b: "A coach remembers the habit you're breaking; a tutor remembers the concept you mastered on Tuesday." },
      { t: "Memory you can inspect", b: "Every learned fact is visible and deletable through the dashboard and API. Nothing is a black box." },
      { t: "Knowledge on tap", b: "Upload documents or URLs. Recall retrieves the right passage mid-conversation and cites it in the transcript." },
    ],
  },
];

export type Feature = { slug: string; name: string; headline: string; sub: string; points: { t: string; b: string }[]; code: string };

export const FEATURES: Feature[] = [
  { slug: "memory", name: "Memory", headline: "Conversations that continue.", sub: "Give each participant a stable tag and personas remember them across sessions.",
    points: [{ t: "Learned profile", b: "Preferences and facts gathered naturally." }, { t: "Timeline", b: "What happened, session by session." }, { t: "Pinned facts", b: "Things you tell the persona to always know." }],
    code: `await hos.conversations.create({\n  persona: "ines",\n  participant: "user_8812", // memory key\n});` },
  { slug: "knowledge-base", name: "Knowledge base", headline: "Grounded in what you know.", sub: "Upload PDFs, docs or URLs. Personas retrieve and cite the right passage mid-conversation.",
    points: [{ t: "Any format", b: "PDF, DOCX, TXT, web pages." }, { t: "Tags", b: "Scope documents to personas or conversations." }, { t: "Retrieval modes", b: "Speed, quality or balanced." }],
    code: `await hos.documents.create({\n  url: "https://example.com/handbook.pdf",\n  tags: ["onboarding"],\n});` },
  { slug: "perception", name: "Perception", headline: "Eyes on the conversation.", sub: "Iris turns camera and screen into context: emotion, engagement and answers to your own visual questions.",
    points: [{ t: "Emotion recognition", b: "Adapts tone in real time." }, { t: "Custom queries", b: "Ask visual questions in plain language." }, { t: "Post-call analysis", b: "Perception notes alongside the transcript." }],
    code: `perception: {\n  model: "iris-2",\n  queries: ["Is the user reading from notes?"],\n}` },
  { slug: "screen-share", name: "Screen share", headline: "See what they see.", sub: "Users share a screen or tab and the persona can talk about what's on it.",
    points: [{ t: "Support", b: "Diagnose from the actual error." }, { t: "Tutoring", b: "Work through the problem on screen." }, { t: "Demos", b: "Walk prospects through your product." }],
    code: `properties: { screen_share: true }` },
  { slug: "meetings", name: "Meetings", headline: "Join the call you're already on.", sub: "Send a persona into Google Meet, Zoom or Teams with a meeting link.",
    points: [{ t: "No new app", b: "Participants stay where they are." }, { t: "Named guest", b: "Joins with the persona's name." }, { t: "Same output", b: "Transcript and summary via webhook." }],
    code: `await hos.conversations.create({\n  persona: "dev",\n  meetingUrl: "https://meet.google.com/abc-defg-hij",\n});` },
  { slug: "languages", name: "Languages", headline: "Speak their language.", sub: "Speech, lip sync and reasoning in 40+ languages, switchable mid-conversation.",
    points: [{ t: "Opening language", b: "Start in the user's language." }, { t: "Code-switching", b: "Hinglish, Spanglish and more." }, { t: "Accurate lip sync", b: "Phoneme-level, per language." }],
    code: `languages: ["hi-IN", "en-IN"]` },
  { slug: "guardrails", name: "Guardrails", headline: "Boundaries you define.", sub: "Topics to avoid, actions that need approval and phrases that trigger a human handoff.",
    points: [{ t: "AI disclosure", b: "Always on. Every persona says it's an AI." }, { t: "Topic limits", b: "Stay on purpose, decline the rest." }, { t: "Escalation", b: "Hand off to a person on your triggers." }],
    code: `guardrails: [{ avoid: "medical advice", escalate: true }]` },
  { slug: "tools", name: "Tools & actions", headline: "Do things, not just say them.", sub: "Connect APIs and MCP servers so personas can look up, book and update, with your approval rules.",
    points: [{ t: "Function calling", b: "Typed tools with JSON schemas." }, { t: "MCP connectors", b: "Use existing MCP servers." }, { t: "Approval rules", b: "Confirm before sensitive actions." }],
    code: `tools: [{ name: "book_meeting", url: "https://api.example.com/book" }]` },
];

export const PLANS = [
  { name: "Starter", price: "$0", per: "forever", blurb: "Explore and prototype.", minutes: "25 conversation minutes / mo", features: ["3 personas", "Stock faces & voices", "1 concurrent session", "Community support"], cta: "Start free" },
  { name: "Builder", price: "$59", per: "per month", blurb: "Ship your first product.", minutes: "250 minutes / mo, then $0.30/min", features: ["Unlimited personas", "1 custom face", "Knowledge base & memory", "3 concurrent sessions", "Webhooks & API"], cta: "Start building", featured: true },
  { name: "Growth", price: "$399", per: "per month", blurb: "Scale with confidence.", minutes: "2,000 minutes / mo, then $0.22/min", features: ["5 custom faces", "Perception queries", "15 concurrent sessions", "Meeting join (Zoom, Meet, Teams)", "Priority support"], cta: "Start building" },
  { name: "Enterprise", price: "Custom", per: "annual", blurb: "For regulated and high-volume teams.", minutes: "Committed-use pricing", features: ["SSO, SCIM & audit logs", "Data residency & private deployment", "Custom concurrency", "Dedicated solutions engineer", "Security review & DPA"], cta: "Talk to sales" },
];

export const FAQ = [
  ["What counts as a conversation minute?", "Time a persona is live in a session, rounded up to the nearest minute. Idle rooms with no participants time out automatically."],
  ["Can I use my own LLM?", "Yes. Claude is the default reasoning layer. Point the LLM layer at any OpenAI-compatible endpoint to bring your own."],
  ["Can I create a persona of a real person?", "Only with verified, recorded consent from that person. Every persona discloses that it is an AI."],
  ["Is my data used to train models?", "No. Customer conversations are never used to train shared models."],
  ["Do unused minutes roll over?", "No, minutes reset monthly. Enterprise plans can commit to annual pools."],
];
