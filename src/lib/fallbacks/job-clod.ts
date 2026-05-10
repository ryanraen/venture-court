/** Job-search vertical — scripted demo (ApplyCopilot-style). */

import type { CouncilOutput } from "@/lib/types";

export function getJobCMOCouncil(idea: string): CouncilOutput {
  return {
    role: "CMO",
    personas: [
      {
        persona: "contrarian",
        label: "The Contrarian",
        content: `Let me push back hard on "${idea}." This market is a red ocean. Teal has 3.2 million users. Rezi has 4.3 million. Simplify's Chrome extension has over a million installs with a 4.9-star rating. You're entering one of the most saturated corners of the AI tools space. Customer acquisition costs for "AI resume builder" keywords on Google are $8–$14 per click. Without a fundamentally different distribution strategy — not just a better product — you're fighting incumbents with massive head starts and SEO moats. The TikTok virality you're banking on? Every competitor is already doing it. Rezi is all over career TikTok. The organic channel is crowded.`,
      },
      {
        persona: "first_principles",
        label: "The First Principles Thinker",
        content: `Strip away the buzzwords. What is the atomic unit of value here? It's this: a job seeker pastes a job URL, and gets a resume + cover letter tailored to that specific role in under 60 seconds. Everything else — dashboards, tracking, analytics — is secondary. The question is: are current tools failing at this core loop? Yes. Teal requires manual copy-pasting of job descriptions. Rezi's free tier limits you to 3 AI-generated resumes. LazyApply doesn't tailor at all — same resume for every job. The gap is clear: a tool that takes a job URL as input, scrapes the listing, and produces tailored documents with zero friction. Solve that one interaction perfectly and the rest follows.`,
      },
      {
        persona: "expansionist",
        label: "The Expansionist",
        content: `The upside you're missing is massive. Start with job seekers, but the real play is the data asset. Every tailored resume + cover letter pair is a training signal about what skills map to what job descriptions. After 100K users, you have the most valuable job-market matching dataset in the world. That unlocks: (1) a B2B API for recruiters to understand candidate-job fit, (2) career coaching recommendations — "you're 2 skills away from qualifying for senior roles," (3) salary negotiation intelligence — "candidates with your profile in this market earn $X." The resume copilot is the wedge; the career intelligence platform is the $500M business.`,
      },
      {
        persona: "outsider",
        label: "The Outsider",
        content: `I have zero context on the HR tech industry. Here's what I see as a regular person: job searching is miserable. I spent 3 months applying to 80+ jobs last year. I used a Google Doc for my resume and a spreadsheet to track applications. The spreadsheet had 6 columns and I still lost track. If someone told me "paste a job link, get a perfect cover letter, and we'll track everything" — I'd pay for that today. The value prop is immediately clear. But here's the thing: I'd try it once, and if the cover letter sounds robotic or generic, I'd never come back. The make-or-break is output quality on the first try. No onboarding flow, no tutorial — just paste, generate, and it has to be *good*.`,
      },
      {
        persona: "executor",
        label: "The Executor",
        content: `Monday morning, here's what we do for "${idea}." First: build a landing page with one input field — "Paste a job URL." Above it, a real example showing a job listing → generated cover letter side by side. Ship this on Vercel by Tuesday. Second: run 50 cold DMs to job seekers on LinkedIn and Reddit's r/jobs and r/cscareerquestions. Don't sell — just ask "would you try this?" Third: if 10+ say yes, build the Chrome extension MVP by Friday — it adds a "Generate Cover Letter" button to LinkedIn job listings. That's the distribution channel that wins. Not a standalone app. A button that lives where job seekers already are.`,
      },
    ],
    chair: `**CMO Council Summary for "${idea}":**\n\nThe council sees a validated but intensely competitive opportunity. The core value proposition — paste a job URL, get tailored documents instantly — is clear and resonates even with zero-context outsiders. Key consensus: (1) the market is proven (Teal 3.2M, Rezi 4.3M users) but CAC is high without a differentiated channel, (2) output quality on first use is make-or-break — generic-sounding letters will kill retention, (3) a Chrome extension on LinkedIn is the distribution wedge, not a standalone app, (4) the long-term play is career intelligence data, not just document generation. Key disagreement: the Contrarian questions whether organic channels are viable given incumbent SEO moats, while the Executor believes LinkedIn-native distribution bypasses the search channel entirely. **Recommendation:** Validate with 50 cold outreach DMs this week. If 10+ express interest, build the LinkedIn Chrome extension MVP.`,
  };
}

export function getJobCTOCouncil(idea: string): CouncilOutput {
  return {
    role: "CTO",
    personas: [
      {
        persona: "contrarian",
        label: "The Contrarian",
        content: `From a technical standpoint, "${idea}" has a deceptive complexity problem. The demo looks simple — paste a URL, get a letter. But production-grade execution requires: (1) reliable job listing scrapers for LinkedIn, Indeed, Greenhouse, Lever, Workday, and dozens of ATS platforms — each with different DOM structures that change monthly, (2) an LLM pipeline that produces consistently high-quality, non-generic output for wildly different job types, (3) ATS keyword extraction that actually works — not just TF-IDF matching but understanding which keywords the ATS scores on. Teams underestimate the scraping maintenance burden by 10x. One LinkedIn DOM change and your core feature breaks overnight.`,
      },
      {
        persona: "first_principles",
        label: "The First Principles Thinker",
        content: `What is the minimum technical surface? One API endpoint: POST /generate with a job URL. Backend: (1) fetch and parse the job listing (use a headless browser or proxy service like ScrapingBee), (2) extract structured data — title, company, requirements, nice-to-haves, (3) combine with user's base resume (stored as structured JSON, not a PDF), (4) call an LLM with a carefully engineered prompt that produces a tailored cover letter + resume keyword suggestions. The entire MVP is a Next.js app with one server action. No microservices. No Redis. No event queue. Use Vercel's serverless functions. Total infrastructure cost for 1,000 users: ~$20/month (LLM API calls are the dominant cost at ~$0.03 per generation).`,
      },
      {
        persona: "expansionist",
        label: "The Expansionist",
        content: `The technical moat is in the prompt pipeline, not the infrastructure. Build a multi-stage generation system: Stage 1 — extract structured job requirements, Stage 2 — match against user's experience graph, Stage 3 — generate with role-specific tone (a cover letter for a startup CEO reads differently than one for a Fortune 500 PM). Version the prompts aggressively. A/B test outputs with user feedback ("Did you get an interview? Yes/No"). After 10K generations with feedback loops, your prompt pipeline will be genuinely better than competitors who use generic ChatGPT wrappers. The secondary moat: build the resume as a structured data model (skills graph, not a Word doc) so you can auto-match across *any* job listing without re-entering data.`,
      },
      {
        persona: "outsider",
        label: "The Outsider",
        content: `I don't follow dev tooling trends. But as someone who's built Chrome extensions: why is this an app at all? The user's workflow starts on LinkedIn or Indeed. They're browsing jobs. They see one they like. If they have to leave that page, open your app, paste the URL, wait, then come back — that's too many steps. Build it as a browser extension that injects a "Generate Cover Letter" button directly into the job listing page. When they click it, a sidebar opens with the generated letter. They copy it, apply, done. The application tracker is automatic — every generation logs the job. No spreadsheet. No context switching.`,
      },
      {
        persona: "executor",
        label: "The Executor",
        content: `Here's the Monday plan for "${idea}": Day 1–2: set up Next.js app, build the /generate endpoint — accept a URL, scrape with Cheerio (LinkedIn public listings don't need headless browsers), extract job title + description, call Claude API with a tuned prompt, return the cover letter. Day 3: build a minimal UI — one text input, one output panel, a "Copy" button. Day 4: add user accounts (NextAuth with Google) and a simple job tracker (Postgres on Neon, free tier). Day 5: deploy to Vercel. Week 2: build the Chrome extension wrapper that calls the same API. Total estimated cost: $0 infrastructure (free tiers), ~$15/mo in Claude API during validation, 80 engineering hours. Ship the web app in 5 days, Chrome extension in 10.`,
      },
    ],
    chair: `**CTO Council Summary for "${idea}":**\n\nTechnically feasible with a lean approach, but scraping fragility is the #1 engineering risk. The council agrees on: (1) MVP is a single Next.js endpoint — URL in, tailored letter out — deployable in 5 days on Vercel for ~$0 infra, (2) the real moat is a versioned, feedback-trained prompt pipeline that improves with every generation, (3) build as a Chrome extension from week 2 — the standalone app is a stepping stone, not the product, (4) store resumes as structured data (skills graph), not documents. Key tension: the Contrarian warns about scraping maintenance across dozens of ATS platforms; First Principles says start with LinkedIn-only and expand. **Recommendation:** 5-day MVP sprint targeting LinkedIn public listings only. Single LLM call per generation. Deploy on day 5, Chrome extension by day 10. Estimated cost: ~$0 infra, ~$15/mo API, ~80 hours engineering.`,
  };
}

export function getJobCEOVerdict(idea: string, cmoSummary: string, ctoSummary: string): string {
  return `# CEO Verdict: "${idea}"

## Decision: PROCEED — Conditional on Demand Signal ✅

After reviewing the CMO and CTO council outputs, here is my synthesis:

### What We Know
The market is **proven and large** — Teal (3.2M users), Rezi (4.3M users), and Simplify (1M+ installs) validate that job seekers will adopt AI application tools at massive scale. The CTO council confirms a **5-day MVP** is feasible at near-zero cost. The core value proposition — paste a job URL, get a tailored cover letter — resonates immediately even with zero-context outsiders.

### The Core Bet
This succeeds if we can **differentiate on output quality and distribution**. The incumbents have scale but have gaps: Teal lacks auto-apply, Rezi's free tier is too limited, LazyApply doesn't tailor at all. Our edge is (1) per-job tailoring that sounds genuinely human, and (2) LinkedIn-native distribution via Chrome extension.

### Why Now
The 2026 market is shifting from volume-first mass applications to quality-first tailored applications. Job seekers who customize per-job see 3–6x higher callback rates. We ride that wave instead of fighting it.

### Go/No-Go Framework
- **Demand signal needed:** 10 out of 50 cold DMs on LinkedIn/Reddit express intent to try → **GO**
- **Technical validation:** Web MVP deployed in ≤5 days → validates feasibility
- **Quality bar:** First 20 beta users rate output quality ≥ 4/5 → validates differentiation
- **Kill criteria:** If beta users don't return for a second generation within 7 days, the retention loop is broken — pivot to a different form factor or audience

### Recommended Next Steps
1. **This week:** Run the 50-person outreach experiment (LinkedIn DMs + Reddit r/jobs, r/cscareerquestions)
2. **If signal is positive:** Begin 5-day MVP sprint (Next.js + Claude API + LinkedIn scraper)
3. **Day 10:** Ship Chrome extension for LinkedIn
4. **Week 3:** First cohort of 20 beta users with feedback loop
5. **Week 4:** Decide on pricing model (freemium vs. trial) based on usage patterns

### Resource Allocation
- 1 full-stack engineer (80 hours for web MVP + Chrome extension)
- 1 designer (15 hours for landing page + extension UI)
- LLM API budget: $15/month during validation
- Marketing budget: $0 for validation phase (organic outreach only)
- Total burn: under $500 for complete validation

*This verdict is based on council analysis. The final decision rests with the founder.*

---
**CMO Summary:** ${cmoSummary.slice(0, 120)}...
**CTO Summary:** ${ctoSummary.slice(0, 120)}...`;
}

export function getJobSWE1BuildNarrative(idea: string): { narrative: string; files: { html: string; css: string; js: string } } {
  return {
    narrative: `## SWE 1 — Building MVP for "${idea}"

**Planning the architecture...**

I'll build a clean, functional landing page that demonstrates the core value proposition: paste a job URL → get a tailored cover letter + ATS-optimized resume suggestions. Stack:
- Single-page HTML with semantic structure
- Modern CSS with a dark, professional theme
- Vanilla JS for the interactive demo flow

**Writing index.html...**
Setting up the document structure: hero section with a URL input, a live demo area showing a generated cover letter, feature highlights (ATS optimization, application tracking, one-click generation), and a waitlist CTA.

**Writing style.css...**
Implementing a professional dark theme — this is a career tool, so the design should feel polished and trustworthy. Clean typography, proper spacing, subtle animations on interactions.

**Writing app.js...**
Building the interactive demo: when a user enters a job URL (or clicks "Try Demo"), it simulates the generation flow with a typing animation showing a tailored cover letter appearing in real-time. Also adding a mini application tracker table to demonstrate the dashboard concept.

**Build complete.** Three files ready for review:
- \`index.html\` — hero, demo, features, CTA
- \`style.css\` — professional dark theme
- \`app.js\` — interactive generation demo + tracker

Deploying to preview...`,
    files: {
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ApplyCopilot — AI Job Application Copilot</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <nav class="nav">
    <div class="nav-brand">apply<span class="accent">copilot</span></div>
    <div class="nav-links">
      <a href="#features">Features</a>
      <a href="#demo">Try It</a>
      <a href="#waitlist" class="nav-cta">Get Early Access</a>
    </div>
  </nav>

  <main>
    <section class="hero">
      <div class="badge">AI-Powered Job Applications</div>
      <h1>Stop writing cover letters.<br><span class="highlight">Let AI tailor them for you.</span></h1>
      <p class="subtitle">Paste a job URL. Get a tailored cover letter and ATS-optimized resume in 30 seconds. Track every application in one dashboard.</p>
      <div class="hero-stats">
        <div class="stat"><strong>3x</strong><span>more interviews</span></div>
        <div class="stat-sep"></div>
        <div class="stat"><strong>30s</strong><span>per application</span></div>
        <div class="stat-sep"></div>
        <div class="stat"><strong>100%</strong><span>ATS-optimized</span></div>
      </div>
    </section>

    <section id="demo" class="demo-section">
      <h2>See it in action</h2>
      <div class="demo-container">
        <div class="demo-input-area">
          <label for="job-url">Paste a job listing URL</label>
          <div class="input-row">
            <input type="url" id="job-url" placeholder="https://linkedin.com/jobs/view/..." value="">
            <button id="generate-btn" onclick="runDemo()">Generate</button>
          </div>
          <button class="try-demo-link" onclick="loadSampleAndRun()">or try a demo with a sample listing →</button>
        </div>
        <div class="demo-output" id="demo-output">
          <div class="output-placeholder">Your tailored cover letter will appear here...</div>
        </div>
      </div>
    </section>

    <section id="features" class="features">
      <div class="feature">
        <div class="feature-icon">&#9889;</div>
        <h3>One-Click Tailoring</h3>
        <p>Paste any job URL. We scrape the listing, extract requirements, and generate a cover letter that matches the role's exact language and keywords.</p>
      </div>
      <div class="feature">
        <div class="feature-icon">&#128202;</div>
        <h3>ATS Keyword Optimization</h3>
        <p>Our AI identifies the keywords each ATS scores on and weaves them naturally into your resume. No more keyword-stuffing or guesswork.</p>
      </div>
      <div class="feature">
        <div class="feature-icon">&#128203;</div>
        <h3>Application Tracker</h3>
        <p>Every generated application is logged automatically. See status, follow-up dates, and response rates in one dashboard — no more spreadsheets.</p>
      </div>
    </section>

    <section class="tracker-preview">
      <h2>Your applications, organized</h2>
      <div class="tracker-table-wrap">
        <table class="tracker-table" id="tracker-table">
          <thead>
            <tr><th>Company</th><th>Role</th><th>Status</th><th>Applied</th><th>Response</th></tr>
          </thead>
          <tbody>
            <tr><td>Stripe</td><td>Senior Product Manager</td><td><span class="status status-interview">Interview</span></td><td>May 2</td><td>May 5</td></tr>
            <tr><td>Vercel</td><td>Full-Stack Engineer</td><td><span class="status status-applied">Applied</span></td><td>May 4</td><td>—</td></tr>
            <tr><td>Linear</td><td>Design Engineer</td><td><span class="status status-applied">Applied</span></td><td>May 6</td><td>—</td></tr>
            <tr><td>Notion</td><td>Product Designer</td><td><span class="status status-rejected">Rejected</span></td><td>Apr 28</td><td>May 3</td></tr>
            <tr><td>Ramp</td><td>Growth Lead</td><td><span class="status status-interview">Interview</span></td><td>Apr 30</td><td>May 4</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section id="waitlist" class="waitlist">
      <h2>Get early access</h2>
      <p>Join 2,400+ job seekers on the waitlist. Free during beta.</p>
      <form id="signup-form" class="signup-form">
        <input type="email" id="email" placeholder="you@email.com" required>
        <button type="submit">Join Waitlist</button>
      </form>
    </section>
  </main>

  <footer>
    <p>&copy; 2026 ApplyCopilot. Built by Venture Court.</p>
  </footer>
  <script src="app.js"></script>
</body>
</html>`,
      css: `*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#09090b;--surface:#111113;--border:#1e1e22;--fg:#fafafa;--muted:#71717a;--accent:#3b82f6;--green:#22c55e;--red:#ef4444;--radius:8px}
body{background:var(--bg);color:var(--fg);font-family:'Inter',system-ui,-apple-system,sans-serif;line-height:1.6;overflow-x:hidden}
a{color:var(--fg);text-decoration:none}

.nav{display:flex;align-items:center;justify-content:space-between;padding:1rem 2rem;border-bottom:1px solid var(--border);position:sticky;top:0;background:var(--bg);z-index:10}
.nav-brand{font-size:1.15rem;font-weight:700;letter-spacing:-0.02em}
.accent{color:var(--accent)}
.nav-links{display:flex;gap:1.5rem;align-items:center;font-size:0.875rem}
.nav-links a{color:var(--muted);transition:color 0.2s}
.nav-links a:hover{color:var(--fg)}
.nav-cta{background:var(--fg)!important;color:var(--bg)!important;padding:0.4rem 1rem;border-radius:var(--radius);font-weight:600}

main{max-width:900px;margin:0 auto;padding:0 1.5rem}

.hero{text-align:center;padding:5rem 0 3rem}
.badge{display:inline-block;font-size:0.75rem;font-weight:600;color:var(--accent);background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.2);padding:0.3rem 0.8rem;border-radius:20px;margin-bottom:1.5rem;letter-spacing:0.02em}
.hero h1{font-size:clamp(2rem,5vw,3rem);font-weight:800;letter-spacing:-0.03em;line-height:1.15;margin-bottom:1.25rem}
.highlight{color:var(--accent)}
.subtitle{color:var(--muted);font-size:1.05rem;max-width:560px;margin:0 auto 2.5rem;line-height:1.7}
.hero-stats{display:flex;justify-content:center;gap:1.5rem;align-items:center}
.stat{display:flex;flex-direction:column;align-items:center;gap:0.15rem}
.stat strong{font-size:1.5rem;font-weight:800}
.stat span{font-size:0.75rem;color:var(--muted)}
.stat-sep{width:1px;height:2rem;background:var(--border)}

.demo-section{padding:4rem 0;text-align:center}
.demo-section h2{font-size:1.5rem;font-weight:700;margin-bottom:1.5rem}
.demo-container{background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;text-align:left}
.demo-input-area{padding:1.25rem 1.5rem;border-bottom:1px solid var(--border)}
.demo-input-area label{display:block;font-size:0.8rem;color:var(--muted);margin-bottom:0.5rem;font-weight:500}
.input-row{display:flex;gap:0.5rem}
.input-row input{flex:1;padding:0.65rem 1rem;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);color:var(--fg);font-size:0.9rem;outline:none;transition:border-color 0.2s}
.input-row input:focus{border-color:var(--accent)}
.input-row button{padding:0.65rem 1.25rem;background:var(--accent);color:#fff;border:none;border-radius:var(--radius);font-weight:600;cursor:pointer;font-size:0.9rem;transition:opacity 0.2s;white-space:nowrap}
.input-row button:hover{opacity:0.85}
.try-demo-link{background:none;border:none;color:var(--accent);font-size:0.8rem;cursor:pointer;margin-top:0.75rem;padding:0}
.try-demo-link:hover{text-decoration:underline}
.demo-output{padding:1.5rem;min-height:200px;font-size:0.9rem;line-height:1.75;color:var(--fg)}
.output-placeholder{color:var(--muted);font-style:italic;font-size:0.85rem}
.typing-cursor{display:inline-block;width:2px;height:1em;background:var(--accent);margin-left:2px;animation:blink 0.7s step-end infinite;vertical-align:text-bottom}
@keyframes blink{50%{opacity:0}}

.features{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem;padding:4rem 0}
.feature{padding:1.75rem;border:1px solid var(--border);border-radius:12px;background:var(--surface);transition:border-color 0.2s}
.feature:hover{border-color:#333}
.feature-icon{font-size:1.75rem;margin-bottom:0.75rem}
.feature h3{font-size:1rem;margin-bottom:0.4rem;font-weight:600}
.feature p{color:var(--muted);font-size:0.85rem;line-height:1.6}

.tracker-preview{padding:4rem 0;text-align:center}
.tracker-preview h2{font-size:1.5rem;font-weight:700;margin-bottom:1.5rem}
.tracker-table-wrap{overflow-x:auto;border:1px solid var(--border);border-radius:12px;background:var(--surface)}
.tracker-table{width:100%;border-collapse:collapse;font-size:0.85rem}
.tracker-table th{text-align:left;padding:0.75rem 1rem;font-weight:600;color:var(--muted);border-bottom:1px solid var(--border);font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em}
.tracker-table td{padding:0.75rem 1rem;border-bottom:1px solid var(--border)}
.tracker-table tr:last-child td{border-bottom:none}
.status{padding:0.2rem 0.6rem;border-radius:20px;font-size:0.75rem;font-weight:600}
.status-interview{background:rgba(34,197,94,0.1);color:var(--green)}
.status-applied{background:rgba(59,130,246,0.1);color:var(--accent)}
.status-rejected{background:rgba(239,68,68,0.1);color:var(--red)}

.waitlist{text-align:center;padding:4rem 0 5rem}
.waitlist h2{font-size:1.5rem;font-weight:700;margin-bottom:0.5rem}
.waitlist p{color:var(--muted);margin-bottom:1.5rem;font-size:0.95rem}
.signup-form{display:flex;gap:0.5rem;max-width:400px;margin:0 auto}
.signup-form input{flex:1;padding:0.7rem 1rem;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);color:var(--fg);font-size:0.9rem;outline:none}
.signup-form input:focus{border-color:var(--accent)}
.signup-form button{padding:0.7rem 1.5rem;background:var(--fg);color:var(--bg);border:none;border-radius:var(--radius);font-weight:600;cursor:pointer;font-size:0.9rem;transition:opacity 0.2s}
.signup-form button:hover{opacity:0.85}

footer{text-align:center;padding:2rem;color:var(--muted);font-size:0.75rem;border-top:1px solid var(--border)}

@media(max-width:600px){
  .nav-links a:not(.nav-cta){display:none}
  .hero-stats{flex-direction:column;gap:0.75rem}
  .stat-sep{width:2rem;height:1px}
  .signup-form{flex-direction:column}
  .input-row{flex-direction:column}
}`,
      js: `const sampleLetter = \`Dear Hiring Manager,

I'm excited to apply for the Senior Product Manager role at Stripe. With 6 years of experience building and scaling B2B SaaS products, I bring a track record of driving measurable growth through data-informed product strategy.

At my current role, I led the redesign of our core onboarding flow, resulting in a 34% increase in activation rate and $2.1M in incremental ARR. I collaborated cross-functionally with engineering, design, and data science teams to ship features that directly impacted our North Star metric.

What draws me to Stripe is your commitment to increasing the GDP of the internet. I'm particularly excited about the opportunity to shape the future of payment infrastructure for platforms — an area where I see massive untapped potential in developer experience and self-serve adoption.

I'd love to discuss how my experience in product-led growth and API-first platforms aligns with Stripe's roadmap.

Best regards,
Alex Chen\`;

function runDemo() {
  const output = document.getElementById('demo-output');
  const btn = document.getElementById('generate-btn');
  btn.textContent = 'Generating...';
  btn.disabled = true;
  output.innerHTML = '<span class="typing-cursor"></span>';

  let i = 0;
  const speed = 12;
  function type() {
    if (i < sampleLetter.length) {
      const text = sampleLetter.slice(0, i + 1).replace(/\\n/g, '<br>');
      output.innerHTML = text + '<span class="typing-cursor"></span>';
      i++;
      setTimeout(type, speed);
    } else {
      output.innerHTML = sampleLetter.replace(/\\n/g, '<br>');
      btn.textContent = 'Generate';
      btn.disabled = false;
    }
  }
  setTimeout(type, 600);
}

function loadSampleAndRun() {
  document.getElementById('job-url').value = 'https://linkedin.com/jobs/view/senior-product-manager-stripe-3847291';
  runDemo();
}

document.getElementById('signup-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const btn = this.querySelector('button');
  btn.textContent = 'Joining...';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = "You're in! \\u2713";
    btn.style.background = '#22c55e';
    btn.style.color = '#fff';
    document.getElementById('email').value = '';
    setTimeout(() => { btn.textContent = 'Join Waitlist'; btn.disabled = false; btn.style.background = ''; btn.style.color = ''; }, 3000);
  }, 1000);
});`,
    },
  };
}

export function getJobSWE2ReviewNarrative(_idea: string): string {
  return `## SWE 2 — Code Review for ApplyCopilot MVP

**Reviewing index.html...**
✅ Semantic HTML5 structure — \`<nav>\`, \`<main>\`, \`<section>\`, \`<footer>\` properly used
✅ Meta viewport tag present — mobile-ready
✅ Form has \`required\` attribute on email input
✅ Interactive demo section with clear CTA hierarchy
✅ Application tracker table demonstrates the dashboard concept effectively
⚠️ Minor: Add \`aria-label="Generate cover letter"\` to the generate button for screen readers

**Reviewing style.css...**
✅ CSS custom properties for consistent theming — easy to maintain and extend
✅ Responsive design with mobile breakpoints at 600px
✅ Professional color palette: dark base with blue accent — appropriate for a career tool
✅ Sticky nav with proper z-index layering
✅ Smooth transitions on interactive elements
✅ Typing cursor animation for the demo is a nice touch
⚠️ Minor: Add \`prefers-reduced-motion\` media query to disable animations for accessibility

**Reviewing app.js...**
✅ \`runDemo()\` provides compelling live demonstration of the core value prop
✅ Typing animation speed (12ms) feels natural — not too fast, not too slow
✅ \`loadSampleAndRun()\` reduces friction for first-time visitors
✅ Signup form has proper loading state feedback
✅ Sample cover letter is realistic and demonstrates per-job tailoring
⚠️ Minor: The sample letter should be parameterized — if someone enters a different company's URL, the letter still says "Stripe"
⚠️ Minor: Add input sanitization on the URL field

**Overall Assessment:**

| Category | Score |
|----------|-------|
| HTML semantics | 9/10 |
| CSS quality | 9/10 |
| JS correctness | 8/10 |
| UX/Demo flow | 9/10 |
| Accessibility | 7/10 |
| Performance | 10/10 |

**Verdict: LGTM ✅**

The MVP landing page is clean, professional, and effectively communicates the value proposition. The interactive cover letter demo is the standout feature — it lets visitors experience the product before signing up. The minor issues flagged (accessibility labels, URL validation, parameterized demo) are non-blocking and should be addressed in the next iteration. Ship it.`;
}
