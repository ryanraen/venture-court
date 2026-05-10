# Venture Court

AI-powered startup idea council — ideate, research, and prototype your concept through three rigorous stages with multi-agent reasoning.

## How it works

1. **Enter your startup idea** and click "Summon Council"
2. **Ideation** — CMO and CTO councils (each with 5 internal personas: Contrarian, First Principles, Expansionist, Outsider, Executor) debate your idea, followed by a CEO verdict
3. **Market Research** — viral content cards, competitor analysis, synthesis report, and contrarian analysis
4. **Prototyping** — SWE 1 builds a static MVP, SWE 2 code-reviews it, and a live preview appears in a side panel

Each stage streams real-time reasoning and pauses at gates for your approval before proceeding.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No API keys are needed — the app runs in **demo mode** by default with pre-authored, high-quality scripted content streamed over SSE.

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/venture-court)

The app is a standard Next.js App Router project and deploys to Vercel with zero configuration.

## Environment variables

Copy `.env.example` to `.env.local`:

| Variable | Required | Description |
|----------|----------|-------------|
| `FORCE_DEMO_MODE` | No | Set `true` to always use demo fixtures |
| `CLOD_API_KEY` | No (stretch) | CLoD API key for live LLM councils |
| `NIA_API_KEY` | No (stretch) | Nia API key for live market research |

## Architecture

```
src/
├── app/
│   ├── page.tsx              # Main UI — chat, council stream, MVP preview
│   └── api/
│       ├── session/route.ts  # Session CRUD
│       └── council/stream/   # SSE streaming pipeline
├── components/               # StageIndicator, AgentBlock, ResearchCards, MvpPreview
└── lib/
    ├── types.ts              # Shared types for SSE events, sessions, research
    ├── session.ts            # In-memory session store
    ├── stream.ts             # SSE encoding + chunked text streamer
    ├── llm.ts                # CLoD wrapper (demo + live path)
    ├── nia.ts                # Nia wrapper (demo + live path)
    └── fallbacks/            # Pre-authored demo fixtures
        ├── clod-examples.ts  # Ideation councils, CEO, SWE1/SWE2
        └── nia-examples.ts   # Research cards, competitors, synthesis
```

## Security notes

- The MVP preview runs in a **sandboxed iframe** (`sandbox="allow-scripts"`) — no same-origin access
- Generated code is static HTML/CSS/JS only; no server-side execution of model output
- All API keys are server-side only and never exposed to the client

## Tech stack

- **Next.js 16** (App Router) on **Vercel**
- **Tailwind CSS** v4
- **Server-Sent Events** for real-time streaming
- **CLoD** (OpenAI-compatible) for live LLM — optional
- **Nia** for live market research — optional
