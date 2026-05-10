/** Health / calorie / meal-photo + on-device CV vertical */

import type { CouncilOutput } from "@/lib/types";

export function getNutritionCMOCouncil(idea: string): CouncilOutput {
  return {
    role: "CMO",
    personas: [
      {
        persona: "contrarian",
        label: "The Contrarian",
        content: `On "${idea}": the calorie-tracking category is brutal. MyFitnessPal and Lose It! own search and habit. Users churn after New Year's. Differentiation can't be "another food logger" — it has to be a 10× better *moment-of-use*: open camera, snap meal, get macros in 2 seconds with **no manual search**. If your on-device vision story adds friction (bad lighting, shared plates, ethnic foods), retention dies before week two.`,
      },
      {
        persona: "first_principles",
        label: "The First Principles Thinker",
        content: `Strip to the core job-to-be-done: **log nutrition with minimum shame and effort.** Manual entry fails because it's embarrassing and tedious. Photo-based estimation wins if accuracy is "good enough" for most meals and uncertainty is honest (ranges, not fake precision). Streaks and gentle nudges only work if the app feels like a coach, not a cop — celebrate small wins, back off when users miss days without guilt copy.`,
      },
      {
        persona: "expansionist",
        label: "The Expansionist",
        content: `The wedge is logging, but the platform is **longitudinal nutrition intelligence**. Meal photos + timestamps → personalized patterns ("you undereat protein on travel days"). Later: grocery list suggestions, recipe macros, coach marketplace, B2B corporate wellness. Data that stays on-device still supports premium features (local models, export, optional encrypted sync).`,
      },
      {
        persona: "outsider",
        label: "The Outsider",
        content: `I've tried MyFitnessPal and quit. Too much typing. If "${idea}" really means **open app → photo → done**, I'd try it. If it makes me fix mistakes for 5 minutes per meal, I won't. Explain the value in one line: "Snap food. See protein, carbs, fat. Keep streaks without burning out."`,
      },
      {
        persona: "executor",
        label: "The Executor",
        content: `This week: 20 interviews with people actively tracking food on Reddit (r/CICO, r/MacroFactor, r/nutrition). Show Figma of one screen: camera → macro summary → streak. Ask "would you pay $6/mo?" If 6+ say yes, build TestFlight MVP with **one** model pipeline (fixed meal categories first), then expand cuisines.`,
      },
    ],
    chair: `**CMO Summary for "${idea}":**\n\nConsensus: huge TAM, high churn category — you win on **speed + empathy**, not feature count. Differentiate on **camera-first logging**, **honest macro ranges**, and **burnout-aware** streaks. Contrarian warns incumbents + churn; Expansionist sees data/platform upside. **Next:** validate willingness to pay with 20 short user calls before scaling model complexity.`,
  };
}

export function getNutritionCTOCouncil(idea: string): CouncilOutput {
  return {
    role: "CTO",
    personas: [
      {
        persona: "contrarian",
        label: "The Contrarian",
        content: `Food CV is harder than slides make it look: mixed dishes, sauces, hidden oils, cultural foods under-represented in training data. On-device models trade accuracy vs. package size. If you ship overconfident numbers, users lose trust and the App Store reviews kill you. You'll need **uncertainty UI**, feedback loops ("was this close?"), and continuous evaluation — not a one-shot ResNet demo.`,
      },
      {
        persona: "first_principles",
        label: "The First Principles Thinker",
        content: `MVP stack: **on-device inference** (Core ML / TFLite) for a small classification + portion heuristic; optional cloud fallback *only* if user opts in. Store **images locally** by default; encrypt backups. Streaks + nudges = local notifications + simple rules engine (time windows, frequency caps) so you don't spam. Ship in 4–6 weeks: one platform (iOS), one flow (camera → result → log).`,
      },
      {
        persona: "expansionist",
        label: "The Expansionist",
        content: `Moat = **personalized correction loop**: when users fix macros, you learn per-user biases (e.g. underestimates rice). Federated or on-device fine-tuning is a story for later; start with lightweight user corrections feeding a local calibration table. Second moat: **nutrition knowledge graph** (ingredients → macros) for disambiguation.`,
      },
      {
        persona: "outsider",
        label: "The Outsider",
        content: `Why on-device? Privacy and speed. Explain it plainly on the landing page: **"Your meal photos stay on your phone."** That's a real selling point against cloud-only competitors.`,
      },
      {
        persona: "executor",
        label: "The Executor",
        content: `Week 1: dataset audit + baseline offline accuracy on 200 meal photos. Week 2: iOS shell + Core ML stub returning macro ranges. Week 3: streak + nudge rules + settings (quiet hours). Week 4: TestFlight with 15 users, instrument time-to-log and edit rate. Target: median log under 20 seconds.`,
      },
    ],
    chair: `**CTO Summary for "${idea}":**\n\nFeasible MVP on iOS with on-device inference + honest UX for uncertainty. Biggest risk is **model quality across diverse foods**; mitigate with ranges, user correction, and phased cuisine coverage. **Recommendation:** ship thin vertical slice (camera → ranges → log) before expanding features.`,
  };
}

export function getNutritionCEOVerdict(
  idea: string,
  cmoSummary: string,
  ctoSummary: string
): string {
  return `# CEO Verdict: "${idea}"

## Decision: PROCEED — validate accuracy + speed in the first cohort

**Synthesis:** Strong pull if you nail **fast, low-shame logging** and **on-device privacy**. CMO: crowded market, win on moment-of-use and habit design. CTO: vision pipeline is hard — ship with humility (ranges, corrections).

**Go/No-Go**
- 15 TestFlight users, **median log time < 30s**, **≥60%** say they'd pay $5–8/mo → GO
- If users distrust macro numbers (>40% frequent edits) → tighten model + UX before growth spend

**Next steps:** (1) Figma + pitch to 20 target users (2) iOS MVP with Core ML path + local-only photos (3) measure streak retention week 2 vs. industry churn benchmarks

---
CMO digest: ${cmoSummary.slice(0, 100)}…
CTO digest: ${ctoSummary.slice(0, 100)}…`;
}

export function getNutritionSWE1BuildNarrative(idea: string): {
  narrative: string;
  files: { html: string; css: string; js: string };
} {
  const short = idea.length > 80 ? idea.slice(0, 80) + "…" : idea;
  return {
    narrative: `## SWE 1 — MVP for "${idea}"

Building **PlateWise** (working title): a landing page + interactive prototype showing camera-first macro estimation, local-privacy copy, streak + gentle nudge UI — aligned with your concept: **${short}**

Files: index.html, style.css, app.js — deploying preview…`,
    files: {
      html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>PlateWise — Log meals from a photo</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<nav class="nav"><span class="logo">plate<span class="accent">wise</span></span><span class="pill">On-device · Private</span></nav>
<main>
<section class="hero">
<p class="eyebrow">Calorie & macro intelligence</p>
<h1>${idea.replace(/</g, "").slice(0, 120)}</h1>
<p class="sub">Snap a meal. Get protein, carbs, and fat estimates in seconds — gentle streaks and nudges that never shame you for missing a day.</p>
<div class="cta-row"><button type="button" class="btn primary" id="demo-btn">Try photo flow</button></div>
</section>
<section class="demo" id="demo">
<div class="phone">
<div class="cam">Camera preview</div>
<div class="macros" id="macros">
<div class="row"><span>Protein</span><b id="p">— g</b></div>
<div class="row"><span>Carbs</span><b id="c">— g</b></div>
<div class="row"><span>Fat</span><b id="f">— g</b></div>
<p class="range" id="range">Estimate ranges appear after analysis.</p>
</div>
<div class="streak">Streak <strong id="streak">0</strong> days · <span id="nudge">We’ll remind you at lunch if you want.</span></div>
</div>
</section>
<section class="features">
<div class="card"><h3>On-device vision</h3><p>Core ML–style pipeline keeps meal photos off our servers by default.</p></div>
<div class="card"><h3>Gentle nudges</h3><p>Configurable quiet hours. Skip guilt trips when life gets busy.</p></div>
<div class="card"><h3>Honest ranges</h3><p>Show uncertainty for mixed dishes — trust beats fake precision.</p></div>
</section>
<section class="wait"><h2>Early access</h2><form id="f"><input type="email" placeholder="you@email.com" required><button class="btn">Join</button></form></section>
</main>
<footer>© 2026 PlateWise demo · Venture Court</footer>
<script src="app.js"></script>
</body></html>`,
      css: `*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,sans-serif;background:#0c0c0d;color:#fafafa;line-height:1.5}
.nav{display:flex;justify-content:space-between;align-items:center;padding:1rem 1.5rem;border-bottom:1px solid #222}
.logo{font-weight:800}.accent{color:#4ade80}.pill{font-size:11px;padding:4px 10px;border:1px solid #333;border-radius:20px;color:#a3a3a3}
.hero{padding:3rem 1.5rem;max-width:42rem}.eyebrow{color:#4ade80;font-size:12px;text-transform:uppercase;letter-spacing:.1em;margin-bottom:.5rem}
.hero h1{font-size:clamp(1.4rem,4vw,2rem);margin-bottom:.75rem}.sub{color:#a3a3a3}
.cta-row{margin-top:1.5rem}.btn{padding:.65rem 1.2rem;border-radius:8px;border:none;font-weight:600;cursor:pointer}
.btn.primary{background:#4ade80;color:#052e16}
.demo{padding:2rem 1.5rem;background:#111}.phone{max-width:360px;margin:0 auto;border:1px solid #333;border-radius:16px;padding:1rem;background:#0a0a0b}
.cam{height:140px;border-radius:12px;background:linear-gradient(145deg,#222,#111);display:flex;align-items:center;justify-content:center;color:#555;font-size:13px;margin-bottom:1rem}
.macros .row{display:flex;justify-content:space-between;padding:.35rem 0;border-bottom:1px solid #222;font-size:14px}
.range{font-size:12px;color:#888;margin-top:.75rem}.streak{margin-top:1rem;font-size:13px;color:#d4d4d4}
.features{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;padding:2.5rem 1.5rem;max-width:900px;margin:0 auto}
.card{padding:1.25rem;border:1px solid #262626;border-radius:12px;background:#111}.card h3{margin-bottom:.35rem;font-size:15px}
.wait{text-align:center;padding:3rem 1.5rem}#f{display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap}input{padding:.6rem 1rem;border-radius:8px;border:1px solid #333;background:#111;color:#fff;min-width:220px}
footer{text-align:center;padding:2rem;color:#525252;font-size:12px;border-top:1px solid #222}
@media(max-width:500px){.cta-row .btn{width:100%}}`,
      js: `const meal = \`Estimated (demo): ~520 kcal · Protein 32–42g · Carbs 48–62g · Fat 14–20g\\n(Saucy bowl — model shows ranges for mixed dishes.)\`;

document.getElementById("demo-btn").addEventListener("click", () => {
  const mac = document.getElementById("macros");
  mac.querySelector("#p").textContent = "36 g";
  mac.querySelector("#c").textContent = "54 g";
  mac.querySelector("#f").textContent = "17 g";
  document.getElementById("range").textContent = meal;
  document.getElementById("streak").textContent = "4";
  document.getElementById("nudge").textContent = "Want a soft reminder tomorrow at 12:30?";
});

document.getElementById("f").addEventListener("submit", (e) => {
  e.preventDefault();
  const b = e.target.querySelector("button");
  b.textContent = "On the list ✓";
  b.disabled = true;
});`,
    },
  };
}

export function getNutritionSWE2ReviewNarrative(idea: string): string {
  return `## SWE 2 — Review: PlateWise MVP (demo for "${idea.slice(0, 60)}…")

**index.html:** Clear hero tied to the product thesis; demo section shows macros + streak + nudge line — matches on-device / gentle positioning.
**CSS:** Readable dark theme; mobile-friendly stacking.
**app.js:** Demo button fills plausible macro ranges and copy about mixed dishes — reinforces "honest ranges" story.

**Risks:** \`idea\` string inlined into HTML — production needs sanitize/escape.
**Verdict: LGTM for hackathon MVP preview.**`;
}
