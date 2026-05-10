/** Generic scripted demo — every section anchors on the user's exact idea string. */

import type { CouncilOutput } from "@/lib/types";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function getGenericCMOCouncil(idea: string): CouncilOutput {
  const safe = esc(idea);
  return {
    role: "CMO",
    personas: [
      {
        persona: "contrarian",
        label: "The Contrarian",
        content: `Pushing back on "${idea}": what's the sharp reason someone switches *today*? If the answer is "it's better," that's not enough — incumbents have distribution, brand, and habit. I want proof of who pays and why they can't get this outcome elsewhere.`,
      },
      {
        persona: "first_principles",
        label: "The First Principles Thinker",
        content: `What job does "${idea}" do in one sentence for a tired, distracted user? Until that's painfully specific, messaging will be mush. Name the failing workaround (spreadsheet, manual process, expensive consultant) and replace *that* loop end-to-end.`,
      },
      {
        persona: "expansionist",
        label: "The Expansionist",
        content: `If "${idea}" works, what's the second product? Usually the wedge unlocks data or workflow access — calendar, billing, compliance artifacts. Plan the expansion arc early so you don't paint yourself into a single-feature corner.`,
      },
      {
        persona: "outsider",
        label: "The Outsider",
        content: `I'm not in your industry. Explain "${idea}" like I'm five: what do I click, what improves in my life in five minutes, and what do you want me to pay? If that isn't obvious, fix the pitch before the product.`,
      },
      {
        persona: "executor",
        label: "The Executor",
        content: `Monday: ship a one-page site with "${idea}" and a single CTA — book a call, join waitlist, or try a fake door. Talk to ten strangers who match your ICP by Wednesday. Numbers beat opinions.`,
      },
    ],
    chair: `**CMO Summary for "${safe}":**\n\nAlign on one wedge narrative, kill generic "AI-powered" language, and force distribution thinking from day one. **Recommendation:** 10 customer conversations with a landing that states the specific pain you remove.`,
  };
}

export function getGenericCTOCouncil(idea: string): CouncilOutput {
  const safe = esc(idea);
  return {
    role: "CTO",
    personas: [
      {
        persona: "contrarian",
        label: "The Contrarian",
        content: `Tech risk for "${idea}": founders underestimate integration depth (auth, roles, audits) and overestimate model quality on edge cases. If the roadmap assumes perfect ML on day one, you'll slip six months. What's the manual-human fallback?`,
      },
      {
        persona: "first_principles",
        label: "The First Principles Thinker",
        content: `Smallest shippable slice for "${idea}": one API, one database table, one UI that proves value. Pick boring hosting (e.g. Postgres + Next.js) until you have retention — novelty belongs in the product experience, not the infra.`,
      },
      {
        persona: "expansionist",
        label: "The Expansionist",
        content: `For "${idea}", instrument everything: latency, cost per action, correction rate, churn reasons. The moat is often the dataset+workflow graph you accumulate while competitors stay demo-deep.`,
      },
      {
        persona: "outsider",
        label: "The Outsider",
        content: `Will "${idea}" run on mobile spotty networks? Do I need an account before I see value? The best demos let me experience the "aha" before sign-up — consider that flow ruthlessly.`,
      },
      {
        persona: "executor",
        label: "The Executor",
        content: `Two-week rule: "${idea}" MVP should embarrass you slightly but work for five beta users. Week three is only for bugs that block the core loop — postpone everything else.`,
      },
    ],
    chair: `**CTO Summary for "${safe}":**\n\nBias to a boring stack, aggressive telemetry, and explicit failure handling. **Recommendation:** define the minimal architecture that proves the loop, then harden.`,
  };
}

export function getGenericCEOVerdict(
  idea: string,
  cmoSummary: string,
  ctoSummary: string
): string {
  const safe = esc(idea);
  return `# CEO Verdict: "${safe}"

## Decision: EXPLORE — earn clarity fast

We don't yet have category-specific numbers in this scripted pass; treat this as a **prompt-faithful** review for **"${safe}"**.

**Merge CMO + CTO:** sharpen the wedge, refuse scope creep, validate willingness to pay, keep infra simple.

**Next:** ship the thinnest experiment (landing + waitlist or concierge MVP), 10 structured interviews, decide pivot/persist.

---
CMO: ${cmoSummary.slice(0, 120)}…
CTO: ${ctoSummary.slice(0, 120)}…`;
}

export function getGenericSWE1BuildNarrative(idea: string): {
  narrative: string;
  files: { html: string; css: string; js: string };
} {
  const safe = esc(idea);
  return {
    narrative: `## SWE 1 — Landing prototype for your idea

Built a minimal single-page MVP reflecting: **${safe}** — hero, three benefit pillars, waitlist. Tuned copy around your exact prompt so the preview matches what you typed.`,
    files: {
      html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${safe}</title><link rel="stylesheet" href="style.css"></head><body>
<nav class="n"><span class="logo">venture<span>court</span></span></nav>
<main><section class="hero"><h1>${safe}</h1><p class="s">Prototype preview — refine copy and scope before engineering depth.</p>
<button type="button" class="b" id="go">Simulate primary action</button><p id="out" class="out"></p></section>
<section class="grid"><div><h3>Focus</h3><p>One sharp loop for your concept.</p></div><div><h3>Speed</h3><p>Ship thin, learn fast.</p></div><div><h3>Trust</h3><p>Be explicit about data & limits.</p></div></section>
<section class="w"><h2>Waitlist</h2><form id="f"><input name="e" type="email" placeholder="you@email.com" required><button>Join</button></form></section></main>
<footer>Demo shell · Venture Court</footer>
<script src="app.js"></script></body></html>`,
      css: `body{margin:0;font-family:system-ui,sans-serif;background:#0a0a0a;color:#fafafa;line-height:1.6}
.n{padding:1rem 1.5rem;border-bottom:1px solid #222}.logo{font-weight:700}.logo span{color:#737373}
.hero{padding:3rem 1.5rem;max-width:720px}.hero h1{font-size:clamp(1.25rem,3vw,2rem)}.s{color:#a3a3a3;margin:1rem 0}
.b{padding:.65rem 1.2rem;background:#fafafa;color:#0a0a0a;border:none;border-radius:8px;font-weight:600;cursor:pointer}
.out{margin-top:1rem;font-size:14px;color:#86efac;min-height:1.5em}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;padding:2rem 1.5rem;max-width:900px;margin:0 auto}
.grid div{padding:1rem;border:1px solid #262626;border-radius:12px}
.w{padding:3rem 1.5rem;text-align:center}#f{display:inline-flex;gap:.5rem}input{padding:.5rem 1rem;border-radius:8px;border:1px solid #333;background:#111;color:#fff}`,
      js: `document.getElementById("go").addEventListener("click",()=>{document.getElementById("out").textContent="Primary action acknowledged — hook this to your real workflow.";});
document.getElementById("f").addEventListener("submit",e=>{e.preventDefault();e.target.querySelector("button").textContent="Thanks ✓";});`,
    },
  };
}

export function getGenericSWE2ReviewNarrative(idea: string): string {
  return `## SWE 2 — Review (generic shell)

**Scope:** Static landing aligned to user prompt: "${idea.slice(0, 120)}${idea.length > 120 ? "…" : ""}"

**Notes:** Escape user HTML in production; this demo uses basic escaping server-side where applicable. **LGTM** for concept preview.`;
}
