export type Post = { slug: string; title: string; kind: string; date: string; summary: string; body: string[] };

export const POSTS: Post[] = [
  {
    slug: "listening-is-visible",
    title: "Listening is visible: why micro-expression matters more than resolution",
    kind: "Rendering", date: "Nov 2026",
    summary: "People judge whether they're being heard from small, fast facial signals. We designed Lumen around them.",
    body: [
      "When people describe an AI face as uncanny, they rarely mean it looks low-resolution. They mean it doesn't seem to be listening. Between turns, a real listener nods slightly, narrows their eyes, glances away while thinking and comes back.",
      "Lumen treats those in-between moments as first-class output. While the user is speaking, the renderer receives a stream of listening cues from Cadence (is this a thought pause or a finished turn?) and from Iris (is the speaker animated, hesitant, upset?) and blends a small library of attentive behaviours accordingly.",
      "In internal blind comparisons, participants consistently preferred lower-resolution renders with active listening over higher-resolution renders that held still. We now allocate rendering budget to motion fidelity around the eyes and mouth before pixel count.",
      "This note describes our design approach; a full evaluation write-up will accompany the Lumen-1 public release.",
    ],
  },
  {
    slug: "the-pause-problem",
    title: "The pause problem: turn-taking that waits for meaning",
    kind: "Conversation", date: "Oct 2026",
    summary: "Silence is a poor signal of a finished thought. Cadence combines acoustics with semantics to decide when to speak.",
    body: [
      "Most voice agents decide it's their turn after a fixed silence threshold. Set it short and the agent interrupts people mid-thought; set it long and every exchange feels sluggish.",
      "Cadence predicts turn completion from three streams at once: prosody (falling pitch, slowing rate), lexical completeness (does the sentence so far form a complete thought?) and conversational context (was a yes/no question just asked?).",
      "The result is an agent that can answer quickly after 'Yes, Tuesday works' but waits patiently through 'I think the main reason was… um…'. For interviews and coaching, where people think out loud, this matters enormously.",
    ],
  },
  {
    slug: "fair-by-construction",
    title: "Fair by construction: structured AI interviews and consistency",
    kind: "Responsible AI", date: "Sep 2026",
    summary: "Structured interviews are among the more consistent predictors of job performance. AI makes them practical at scale, if you build the guardrails in.",
    body: [
      "Industrial-organisational psychology research has long found structured interviews more consistent than unstructured ones: the same questions, in the same order, scored against defined anchors.",
      "The obstacle has always been operational. Recruiters improvise, run late and get tired. An AI interviewer can hold the structure perfectly, but it also inherits any bias in its rubric or scoring model.",
      "Our approach: rubrics are written and approved by customers, scores are always accompanied by the transcript evidence that produced them, every persona discloses it's an AI, and we provide adverse-impact reporting so customers can monitor outcomes across groups.",
      "AI interviews should support human hiring decisions, not replace them. Final decisions stay with people.",
    ],
  },
  {
    slug: "full-body-presence",
    title: "Beyond the talking head: early notes on full-body presence",
    kind: "Rendering", date: "Aug 2026",
    summary: "Some conversations are physical. Teaching yoga, rehearsing a presentation, demonstrating a stretch. Notes from building Aarohi-1.",
    body: [
      "Most conversational video stops at the shoulders. That's fine for an interview, but useless for a yoga teacher who needs to show a pose, or a presentation coach who needs to model posture.",
      "Aarohi-1 drives a full-body rig from the same conversational state as the face: gestures are planned from the language model's output, posture shifts with conversational role, and demonstrations play from a library of motion-captured sequences.",
      "The hard part isn't animation quality; it's coordination. A gesture that lands half a second late reads as robotic. We now plan gestures against predicted speech timing rather than reacting to it.",
      "Aarohi-1 is in limited preview. We'll share more as it opens up.",
    ],
  },
];

export const post = (slug: string) => POSTS.find((p) => p.slug === slug);
