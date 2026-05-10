import { ResearchData } from "../types";

/**
 * Demo prompt this data is authored for:
 * "AI-powered job application copilot that auto-generates tailored cover letters,
 *  optimizes resumes for ATS, and tracks all your applications in one dashboard"
 */
export function getDemoResearchData(_idea: string): ResearchData {
  return {
    cards: [
      {
        title: "Enhance Your Job Prospects with AI Resume Tips — how I used ChatGPT to land 3 offers",
        url: "https://www.tiktok.com/@acdoesai/video/7522922914635582733",
        source: "TikTok",
      },
      {
        title: "How to use DeepSeek to write your resume — going viral with AI job hacks",
        url: "https://www.tiktok.com/discover/how-to-use-deepseek-to-write-your-resume",
        source: "TikTok",
      },
      {
        title: "How to Use AI to Update Your Work Resume — step-by-step walkthrough",
        url: "https://www.tiktok.com/discover/how-to-use-ai-to-update-your-work-resume",
        source: "TikTok",
      },
      {
        title: "ChatGPT Prompts for Resume Based on Job Description — the exact prompts I use",
        url: "https://www.tiktok.com/discover/chat-gpt-prompts-for-resume-based-on-job-description",
        source: "TikTok",
      },
      {
        title: "I've Reviewed 1,000+ Resumes — Here's How to Use AI to Land More Interviews",
        url: "https://www.youtube.com/watch?v=KprWxa9WtIk",
        source: "YouTube",
      },
      {
        title: "How ChatGPT Helped Me Get 800% More Job Interviews — Full CV & Cover Letter Tutorial",
        url: "https://www.youtube.com/watch?v=XvtHdIRh26Q",
        source: "YouTube",
      },
      {
        title: "HOW TO: Using AI to Tailor Your Resume and Cover Letter for every application",
        url: "https://www.youtube.com/watch?v=z8wArFMYtQI",
        source: "YouTube",
      },
      {
        title: "I've Reviewed 100s of Cover Letters — Here's How to Use AI to Land More Interviews",
        url: "https://www.youtube.com/watch?v=gIRhLMgexiw",
        source: "YouTube",
      },
    ],
    competitors: [
      {
        name: "Teal",
        description:
          "3.2M+ users. Free AI resume builder, job tracker, ATS keyword matching, and cover letter generator. Teal+ premium at $13/week unlocks unlimited AI credits. Strong brand but no auto-apply feature — users must submit manually.",
        url: "https://www.tealhq.com",
      },
      {
        name: "Rezi",
        description:
          "Forbes' #1 AI resume builder with 4.3M users and a 62% interview rate. Scores resumes across 23 criteria with its 'Rezi Score.' Also offers AI interview practice and job tracking. Free tier is limited; Pro is $29/mo.",
        url: "https://www.rezi.io",
      },
      {
        name: "Simplify",
        description:
          "1M+ Chrome extension installs (4.9★). Copilot autofill extension, aggregated job board, AI resume builder, and application tracker. Free autofill + tracking; Simplify+ is $39.99/mo. Mixed reviews on premium features.",
        url: "https://simplify.jobs",
      },
      {
        name: "LazyApply",
        description:
          "Chrome extension for high-volume mass applications on LinkedIn, Indeed, and ZipRecruiter. Same resume for every job — no per-job tailoring. $99–$249 lifetime plans. 2.3★ on Trustpilot — quantity over quality approach.",
        url: "https://lazyapply.com",
      },
      {
        name: "Kickresume",
        description:
          "AI resume and cover letter builder with 40+ templates. Integrates with LinkedIn for one-click imports. Freemium model with premium at $19/mo. Popular in Europe; less ATS-focused than US competitors.",
        url: "https://www.kickresume.com",
      },
    ],
    synthesis: `**Market Research Synthesis: "AI Job Application Copilot"**

The AI-assisted job search market is exploding. Our scan found 8 high-engagement viral content pieces across TikTok and YouTube, and 5 well-funded direct competitors.

**Key findings:**
- **TAM:** The global recruitment technology market is valued at ~$28B (2025) growing at 7.3% CAGR. The consumer-facing AI resume/application segment is an emerging ~$1.2B slice
- **Dominant competitors** (Teal at 3.2M users, Rezi at 4.3M) prove massive demand exists, but both have gaps: Teal has no auto-apply; Rezi's free tier is too limited
- **Market shift in 2026:** The space is pivoting from volume-first "spray-and-pray" (LazyApply) to quality-first tailoring — applicants who customize per-job see 3–6x higher callback rates
- **Viral signal is strong:** TikTok career content creators consistently go viral with AI resume hacks — the audience actively seeks tools that automate this workflow
- **Social sentiment:** 78% positive toward AI-assisted applications; main concern is "looking AI-generated" to hiring managers — tools that blend AI with human voice win

**Customer signal:** Users care most about (1) per-job tailoring without manual effort, (2) ATS keyword optimization, and (3) a single dashboard that replaces spreadsheet tracking. A copilot that nails all three and prices below Teal+ ($13/wk) has a clear wedge.`,

    contrarian: `**Contrarian Analysis — Why This Might Fail:**

1. **Red ocean, not blue ocean:** With Teal (3.2M users), Rezi (4.3M users), and Simplify (1M+ installs) already entrenched, the "AI resume builder" label is crowded. Differentiation requires more than feature parity — it requires a distribution moat (Chrome extension virality, LinkedIn integration, or employer-side partnerships).

2. **The "AI-generated" stigma is growing:** CNBC reported that hiring managers are flagging fully AI-written resumes. As detection improves, tools that produce obviously templated output will actually *hurt* candidates. Your tool must be measurably better at producing human-sounding, job-specific output — and that's hard to do cheaply.

3. **Pricing pressure from free tiers:** Teal's free tier is very generous (unlimited resumes + tracking). Rezi gives 3 free AI-built resumes. Users are trained to expect core features for free. Monetizing via subscription requires premium features that free alternatives genuinely can't match.

4. **Platform dependency risk:** Most value in this space comes from Chrome extensions that integrate with LinkedIn, Indeed, and Greenhouse. These platforms regularly change their DOM and APIs, requiring constant maintenance. A single LinkedIn UI update can break your core UX overnight.

5. **Unit economics concern:** If each cover letter generation costs ~$0.03 in LLM API calls and the average user generates 40+ letters before landing a job, your per-user cost is ~$1.20 *before* resume builds, ATS scoring, and tracking overhead. At a $9.99/mo price point with 15% conversion from free, you need ~50K free users to sustain a 3-person team.`,
  };
}
