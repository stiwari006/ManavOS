# HumanOS: website + product

Next.js 16 · TypeScript · Tailwind v4 · Framer Motion. Claude is the brain; Tavus renders photoreal video.

## Run it
```bash
npm install
cp .env.example .env.local   # add your keys
npm run dev                  # http://localhost:3000
```

## Modes (picked automatically per session)
| Keys set | Session mode |
| --- | --- |
| `TAVUS_API_KEY` + `TAVUS_DEFAULT_FACE_ID` (+ `ANTHROPIC_API_KEY`) | **Video**: Tavus call; Claude is plugged in as the Tavus LLM layer |
| `ANTHROPIC_API_KEY` only | **Voice**: rendered persona, browser speech in/out, Claude streaming |
| none | **Preview**: scripted replies |

Set `PUBLIC_URL` to your deployed URL so Tavus can send transcripts to `/api/webhooks/tavus?token=TAVUS_WEBHOOK_TOKEN`.
After each conversation, Claude scores it against the persona's rubric. Results show in the dashboard and go to the user's webhook.

## What's inside
- **Website** `app/(site)`: home, 7 solution pages, 4 model pages, 8 feature pages, pricing, developers, docs (7 pages), research, enterprise/trust, studio, about/careers, contact, legal, `/try` (public live demo), cookie consent.
- **Auth** `app/(auth)`: email + password (scrypt), signed httpOnly session cookie.
- **Dashboard** `app/app`: overview, personas (builder + editor), live sessions, conversations (transcript + scorecard), knowledge base, API keys, usage, settings/webhooks.
- **API** `app/api`: dashboard routes plus the public **`/api/v1`** (personas, conversations, end) with Bearer API keys.
- **Server** `lib/server`: `tavus.ts`, `claude.ts`, `service.ts`, `auth.ts`, `db.ts`.
- **Data**: `lib/server/db.ts` is a JSON file store (`.data/db.json`). Fine for one server with a disk (Render, Railway, Fly). For Vercel/serverless, swap `load`/`save` for Postgres/Supabase.

## Preview build
`node scripts/preview.mjs` produces a static, browser-only demo in `./preview` (data in localStorage). This is what the shared link runs.

## Before launch
- Rotate `SESSION_SECRET`; use HTTPS.
- Have a lawyer review `/legal/*`. They are templates.
- Replace pricing, stats and research copy with your real figures.
- Add rate limits and email verification if you open signup publicly.
