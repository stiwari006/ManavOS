import type { PersonaKey } from "@/lib/render/engine";

export type Solution = {
  slug: string;
  name: string;
  short: string;
  persona: PersonaKey;
  personaName: string;
  eyebrow: string;
  headline: [string, string, string];
  accent: string; // word in line 2 set in serif italic
  sub: string;
  problem: { lines: string[]; body: string; detail: string };
  stats: { v: string; unit?: string; l: string }[];
  features: { t: string; b: string }[];
  script: { who: "agent" | "you"; text: string }[];
  steps: { t: string; b: string }[];
  systemPrompt: string;
  greeting: string;
};

export const SOLUTIONS: Solution[] = [
  {
    slug: "ai-interviewer",
    name: "AI Interviewer",
    short: "Structured first-round interviews at any volume.",
    persona: "aarohi",
    personaName: "Aarohi",
    eyebrow: "ManavOS for Interviewing",
    headline: ["Every candidate", "gets a real", "interview."],
    accent: "real",
    sub: "",
    problem: { lines: [], body: "", detail: "" },
    stats: [],
    features: [],
    script: [],
    steps: [],
    systemPrompt:
      "You are Aarohi, a warm, precise AI interviewer for ManavOS. You disclose that you are an AI at the start. Ask one question at a time from the role's structured question set, listen fully, ask at most one natural follow-up per answer when it would clarify evidence, never give feedback on performance during the interview, and keep each turn under 40 words. Close by thanking the candidate and explaining next steps.",
    greeting: "Hi, I'm Aarohi, an AI interviewer. I'll ask a few questions and every candidate gets the same ones. Ready when you are.",
  },
  {
    slug: "ai-tutor",
    name: "AI Tutor",
    short: "Patient one-to-one teaching for every learner.",
    persona: "omar",
    personaName: "Omar",
    eyebrow: "ManavOS for Learning",
    headline: ["A tutor who", "notices before", "you ask."],
    accent: "notices",
    sub: "Omar teaches one-to-one, face to face. He reads confusion in a learner's expression, slows down, tries a different explanation, and remembers exactly where each student left off.",
    problem: {
      lines: ["Videos don't notice.", "Chatbots don't care.", "Tutors don't scale."],
      body: "Recorded lessons can't see a puzzled face and text chat can't hear hesitation. Human tutoring works, but at one tutor per learner it reaches very few people.",
      detail: "Iris watches for confusion and disengagement, Recall keeps a learning record per student, and your curriculum lives in the knowledge base, so every explanation is on-syllabus.",
    },
    stats: [
      { v: "1:1", l: "Attention for every learner, at any hour." },
      { v: "40+", unit: "langs", l: "Teach in the language a student thinks in." },
      { v: "0", unit: "judgement", l: "Ask the same question five times. Patience never runs out." },
      { v: "100%", l: "Of sessions summarised for teachers and parents." },
    ],
    features: [
      { t: "Curriculum-grounded", b: "Upload syllabi, textbooks and worked examples. Omar teaches from your material, not the open web." },
      { t: "Adaptive pacing", b: "When Iris sees confusion, Cadence slows the explanation and Omar checks understanding before moving on." },
      { t: "Learning memory", b: "Recall tracks mastered concepts and recurring mistakes across every session." },
      { t: "Teacher dashboard", b: "Session summaries, flagged misconceptions and time-on-task, per student and per class." },
    ],
    script: [
      { who: "agent", text: "Let's look at fractions again. What's half of three quarters?" },
      { who: "you", text: "Um… one and a half quarters?" },
      { who: "agent", text: "That's a really good instinct. Let's draw it: split each quarter in two." },
      { who: "you", text: "Oh, so it's three eighths!" },
      { who: "agent", text: "Exactly. You just did it. Want to try one on your own?" },
    ],
    steps: [
      { t: "Add your curriculum", b: "Upload documents or connect your LMS." },
      { t: "Shape the tutor", b: "Pick a persona, a voice and a teaching style." },
      { t: "Share a link or embed", b: "Learners start a session from any browser." },
    ],
    systemPrompt:
      "You are Omar, a patient AI tutor for ManavOS. Say you are an AI if asked. Teach with the Socratic method: ask, wait, give hints before answers. Keep turns under 40 words. If the learner seems confused, re-explain with a simpler example. Stay on the curriculum provided.",
    greeting: "Hi, I'm Omar, your AI tutor. What would you like to work on today?",
  },
  {
    slug: "healthcare",
    name: "Healthcare intake",
    short: "Warm, consistent patient check-ins in any language.",
    persona: "henry",
    personaName: "Henry",
    eyebrow: "ManavOS for Healthcare",
    headline: ["Care that starts", "before the", "appointment."],
    accent: "before",
    sub: "Henry runs pre-visit intake and follow-up check-ins face to face, in the patient's own language, and hands clinicians a structured summary before they walk into the room.",
    problem: {
      lines: ["Forms get skipped.", "Calls go unanswered.", "Clinicians start blind."],
      body: "Intake forms are long and impersonal, follow-up calls compete with a full schedule, and clinicians often start a visit without the context they need.",
      detail: "Henry asks the questions your clinical team defines, listens without rushing, escalates red-flag answers to staff immediately, and never offers a diagnosis.",
    },
    stats: [
      { v: "24/7", l: "Check-ins that fit around patients' lives." },
      { v: "40+", unit: "langs", l: "Patients speak the language they're most comfortable in." },
      { v: "1", unit: "summary", l: "Structured for the chart, ready before the visit." },
      { v: "0", unit: "diagnoses", l: "Henry gathers information; clinicians make decisions." },
    ],
    features: [
      { t: "Clinician-defined protocols", b: "Your questions, your escalation rules, versioned and reviewable." },
      { t: "Red-flag escalation", b: "Answers that match escalation criteria page staff in real time." },
      { t: "EHR-ready output", b: "Structured summaries delivered via webhook to your integration engine." },
      { t: "Privacy controls", b: "Data residency options, retention windows and audit logs." },
    ],
    script: [
      { who: "agent", text: "Thanks for joining before your visit. How have you been feeling since we last spoke?" },
      { who: "you", text: "Better, but I've had some dizziness in the mornings." },
      { who: "agent", text: "I'm sorry to hear that. How long does it usually last?" },
      { who: "you", text: "Maybe ten minutes after I get up." },
      { who: "agent", text: "Thank you. I'll make sure Dr. Rao sees this before your appointment." },
    ],
    steps: [
      { t: "Define the protocol", b: "Questions, branching and escalation rules." },
      { t: "Connect your systems", b: "Scheduling triggers and EHR delivery." },
      { t: "Patients check in", b: "From a text or email link, on any device." },
    ],
    systemPrompt:
      "You are Henry, a calm AI intake assistant for a clinic using ManavOS. You disclose you are an AI. You never diagnose, never give medical advice, and if the patient describes an emergency you tell them to call emergency services immediately. Ask the intake questions one at a time, kindly, under 40 words per turn.",
    greeting: "Hello, I'm Henry, an AI assistant helping your care team prepare for your visit. Is now a good time?",
  },
  {
    slug: "ai-sdr",
    name: "AI SDR",
    short: "Face-to-face qualification for every inbound lead.",
    persona: "dev",
    personaName: "Dev",
    eyebrow: "ManavOS for Sales",
    headline: ["Answer every", "lead in under", "a minute."],
    accent: "under",
    sub: "Dev meets inbound prospects face to face the moment they raise a hand, answers product questions from your knowledge base, qualifies against your criteria and books the meeting.",
    problem: {
      lines: ["Leads go cold.", "Forms feel like work.", "Reps chase noise."],
      body: "Interest decays in minutes, but most inbound leads wait hours for a reply. When they finally get one, it's often a rep with no context.",
      detail: "Dev answers immediately, asks your qualification questions conversationally, and writes a clean summary and score into your CRM.",
    },
    stats: [
      { v: "<60", unit: "sec", l: "From form submit to a live conversation." },
      { v: "24/7", l: "Every time zone, every weekend." },
      { v: "100%", l: "Of conversations logged to your CRM." },
      { v: "1", unit: "playbook", l: "Your qualification criteria, applied consistently." },
    ],
    features: [
      { t: "Product expert", b: "Grounded in your docs, pricing and case studies. Says 'let me check' rather than guessing." },
      { t: "Qualification built in", b: "BANT, MEDDICC or your own fields, captured naturally." },
      { t: "Calendar handoff", b: "Books directly on the right rep's calendar." },
      { t: "CRM sync", b: "Summary, score and transcript on the lead record." },
    ],
    script: [
      { who: "agent", text: "Hi, I'm Dev from ManavOS. What made you reach out today?" },
      { who: "you", text: "We're hiring 300 support agents and screening is killing us." },
      { who: "agent", text: "That's a lot of first rounds. How are you screening today?" },
      { who: "you", text: "Phone screens, three recruiters, two weeks behind." },
      { who: "agent", text: "Got it. Let me show you an interviewer, then book you with our team." },
    ],
    steps: [
      { t: "Connect your CRM", b: "Leads trigger conversations automatically." },
      { t: "Teach the product", b: "Upload docs and define qualification." },
      { t: "Go live", b: "Embed on your site or send links." },
    ],
    systemPrompt:
      "You are Dev, an AI sales development rep for ManavOS. Disclose you are an AI. Be curious, concise (under 35 words per turn), never pushy. Learn the prospect's need, team size, timeline and decision process, answer only from provided product facts, then offer to book a meeting.",
    greeting: "Hi, I'm Dev, an AI assistant on the ManavOS team. What brings you here today?",
  },
  {
    slug: "ai-coach",
    name: "AI Coach",
    short: "Practice that talks back, and remembers.",
    persona: "ines",
    personaName: "Inès",
    eyebrow: "ManavOS for Coaching",
    headline: ["Practise the", "conversations", "that matter."],
    accent: "conversations",
    sub: "Inès is a coach you can rehearse with: interviews, negotiations, feedback conversations, sales calls. She plays the other side, then tells you honestly what landed.",
    problem: {
      lines: ["Reading isn't practice.", "Role-plays are awkward.", "Coaches are booked."],
      body: "The hardest conversations are the ones we rarely get to rehearse. Role-play with colleagues is awkward, and great coaches are expensive and scarce.",
      detail: "Inès plays a realistic counterpart, adapts difficulty as you improve, and gives specific feedback tied to moments in the transcript.",
    },
    stats: [
      { v: "∞", l: "Repetitions. Practise until it feels natural." },
      { v: "12", unit: "scenarios", l: "Ready-made, or write your own." },
      { v: "1", unit: "memory", l: "Your progress carries across every session." },
      { v: "100%", l: "Private. Sessions are yours alone." },
    ],
    features: [
      { t: "Realistic counterparts", b: "A sceptical buyer, a nervous report, a tough interviewer. Difficulty adapts." },
      { t: "Moment-level feedback", b: "Feedback linked to the exact second it happened." },
      { t: "Progress memory", b: "Recall tracks your strengths and the habits you're breaking." },
      { t: "For teams", b: "Assign scenarios and see cohort-level progress for enablement." },
    ],
    script: [
      { who: "agent", text: "I'll play your manager. You're asking for a promotion. Go ahead." },
      { who: "you", text: "I think I deserve a promotion because I work hard." },
      { who: "agent", text: "Everyone works hard. What changed for the team because of you?" },
      { who: "you", text: "I cut our release time from two weeks to three days." },
      { who: "agent", text: "That's the line to lead with. Let's run it again." },
    ],
    steps: [
      { t: "Pick a scenario", b: "Or describe your own in a sentence." },
      { t: "Rehearse", b: "Face to face, as many times as you like." },
      { t: "Review", b: "Specific feedback and a plan for next time." },
    ],
    systemPrompt:
      "You are Inès, an AI communication coach for ManavOS. Disclose you are an AI. Run a short role-play the user picks, staying in character, then step out to give two specific, honest pieces of feedback. Keep turns under 40 words.",
    greeting: "Hi, I'm Inès, an AI coach. Which conversation would you like to practise?",
  },
  {
    slug: "customer-experience",
    name: "Customer experience",
    short: "Support with a face, a memory and your tools.",
    persona: "mira",
    personaName: "Mira",
    eyebrow: "ManavOS for Support",
    headline: ["Support that", "remembers", "your name."],
    accent: "remembers",
    sub: "Mira resolves support conversations face to face: she sees the screen a customer shares, remembers their history, and can act in your systems through tools you approve.",
    problem: {
      lines: ["Queues are long.", "Bots are cold.", "Context gets lost."],
      body: "Customers repeat themselves to every agent and every bot. Long queues and scripted bots turn small issues into churn.",
      detail: "Mira pulls account context, sees what the customer sees, and resolves or hands off with a complete summary.",
    },
    stats: [
      { v: "0", unit: "queue", l: "Every customer is answered immediately." },
      { v: "1", unit: "history", l: "Context carries across channels and sessions." },
      { v: "40+", unit: "langs", l: "Global coverage from one persona." },
      { v: "100%", l: "Of handoffs arrive with a full summary." },
    ],
    features: [
      { t: "Screen awareness", b: "Customers share their screen; Iris understands what's on it." },
      { t: "Tool use", b: "Look up orders, issue refunds, reset access: only the actions you allow." },
      { t: "Warm handoff", b: "Escalate to a human with transcript and suggested resolution." },
      { t: "Helpdesk sync", b: "Tickets, tags and CSAT flow back to your helpdesk." },
    ],
    script: [
      { who: "agent", text: "Hi Sam, welcome back. Is this about the export issue from last week?" },
      { who: "you", text: "Yes, it's failing again on large files." },
      { who: "agent", text: "Can you share your screen? I'll watch what happens." },
      { who: "you", text: "Sure, here it is." },
      { who: "agent", text: "I see it. Your workspace hit the file limit; I've raised it for you." },
    ],
    steps: [
      { t: "Connect your helpdesk", b: "Context and tickets flow both ways." },
      { t: "Approve actions", b: "Choose exactly what Mira can do." },
      { t: "Launch in-app", b: "One component in your product." },
    ],
    systemPrompt:
      "You are Mira, an AI support specialist for ManavOS. Disclose you are an AI. Be warm and efficient, under 35 words per turn. Diagnose before solving, confirm before taking any action, and offer a human handoff whenever the customer asks.",
    greeting: "Hi, I'm Mira, an AI support specialist. What can I help you with today?",
  },
  {
    slug: "custom",
    name: "Dream your own",
    short: "Any persona, any conversation, one API.",
    persona: "aarohi",
    personaName: "Your persona",
    eyebrow: "ManavOS Custom Agents",
    headline: ["If it needs a", "conversation, it", "can have a face."],
    accent: "conversation,",
    sub: "Companions, concierges, museum guides, onboarding hosts. Design a persona in Studio or through the API, give it knowledge and tools, and put it anywhere.",
    problem: {
      lines: ["Text is flat.", "Voice is faceless.", "Humans don't scale."],
      body: "People trust, remember and enjoy conversations with faces. Until now, building one meant a studio, a render farm and a year.",
      detail: "ManavOS gives you rendering, perception, turn-taking and memory as building blocks. You bring the idea.",
    },
    stats: [
      { v: "5", unit: "min", l: "From API key to first conversation." },
      { v: "6", unit: "stock faces", l: "Or create your own from a short video." },
      { v: "Any", unit: "LLM", l: "Claude by default. Bring your own if you prefer." },
      { v: "1", unit: "API", l: "Personas, sessions, memory, knowledge, webhooks." },
    ],
    features: [
      { t: "Persona Studio", b: "Face, voice, personality and knowledge in one editor." },
      { t: "Bring your brain", b: "Point the LLM layer at Claude or any OpenAI-compatible endpoint." },
      { t: "Embed anywhere", b: "React component, iframe, or join Zoom, Meet and Teams." },
      { t: "Your own face", b: "Train a persona on consented footage of a real person." },
    ],
    script: [
      { who: "agent", text: "Welcome to the gallery. Shall I tell you the story behind this painting?" },
      { who: "you", text: "Yes, who painted it?" },
      { who: "agent", text: "A young apprentice, in secret, at night. Let me show you how we know." },
      { who: "you", text: "That's amazing." },
      { who: "agent", text: "Look closely at the corner. There's a signature hidden in the frame." },
    ],
    steps: [
      { t: "Describe it", b: "Personality, purpose and boundaries." },
      { t: "Equip it", b: "Knowledge, memory and tools." },
      { t: "Ship it", b: "Embed, link or call the API." },
    ],
    systemPrompt: "You are a helpful ManavOS persona. Disclose you are an AI. Keep turns under 40 words.",
    greeting: "Hi, I'm an AI persona built on ManavOS. What would you like to talk about?",
  },
];

export const solution = (slug: string) => SOLUTIONS.find((s) => s.slug === slug);
