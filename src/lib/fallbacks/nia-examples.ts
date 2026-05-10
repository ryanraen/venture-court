import type { ResearchData } from "@/lib/types";
import { detectDemoScenario } from "./demo-scenario";

const enc = (s: string) => encodeURIComponent(s.slice(0, 120));

/** Job-search vertical — real links (same bundle as before). */
function getJobDemoResearchData(idea: string): ResearchData {
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
          "3.2M+ users. Free AI resume builder, job tracker, ATS keyword matching, and cover letter generator.",
        url: "https://www.tealhq.com",
      },
      {
        name: "Rezi",
        description:
          "Forbes' #1 AI resume builder with 4.3M users. Scores resumes with a 'Rezi Score' across many criteria.",
        url: "https://www.rezi.io",
      },
      {
        name: "Simplify",
        description:
          "1M+ Chrome extension installs. Copilot autofill, job board, resume builder, and tracker.",
        url: "https://simplify.jobs",
      },
      {
        name: "LazyApply",
        description:
          "Chrome extension for high-volume applications on major job boards. Lifetime pricing; mixed reviews on tailoring quality.",
        url: "https://lazyapply.com",
      },
      {
        name: "Kickresume",
        description:
          "AI resume and cover letter builder with templates and LinkedIn import.",
        url: "https://www.kickresume.com",
      },
    ],
    synthesis: `**Market Research (demo) for:** "${idea}"

Job-tech and resume AI remain loud on TikTok/YouTube — creators push ChatGPT prompts and ATS hacks. Incumbents (Teal, Rezi, Simplify) prove willingness to pay for *tailored* applications, not just generators.

**Takeaway:** Differentiate on workflow speed, trust (non-robotic tone), and where users already spend time (browser, email), not a generic "AI resume" pitch.`,

    contrarian: `**Contrarian (demo)**

SATURATED category: SEO, ads, and influencers are expensive. Hiring managers increasingly scrutinize AI-written applications. If your wedge isn't obvious in one session, paid growth will eat you before PMF.

**Mitigation:** narrow ICP, undeniable "before/after" proof, and compliance with how real hiring stacks (ATS + human review) work.`,
  };
}

/** Nutrition / meal-photo / macro tracking — real brands + discover/search links. */
function getNutritionDemoResearchData(idea: string): ResearchData {
  const q = enc(idea);
  return {
    cards: [
      {
        title: "TikTok: food calorie tracker & meal photo trends",
        url: `https://www.tiktok.com/search?q=${q}`,
        source: "TikTok",
      },
      {
        title: "TikTok discover: calorie counting & nutrition hacks",
        url: "https://www.tiktok.com/discover/calorie-counting-app",
        source: "TikTok",
      },
      {
        title: "YouTube search: AI food recognition & macro estimation",
        url: `https://www.youtube.com/results?search_query=${q}`,
        source: "YouTube",
      },
      {
        title: "YouTube: meal prep macros & tracking for beginners",
        url: "https://www.youtube.com/results?search_query=macro+tracking+meal+prep",
        source: "YouTube",
      },
      {
        title: "CNET: best nutrition apps & calorie counters (roundups)",
        url: "https://www.cnet.com/health-fitness/nutrition/best-nutrition-apps-to-track-your-eating/",
        source: "Web",
      },
      {
        title: "Healthline: how calorie-counting apps work & accuracy limits",
        url: "https://www.healthline.com/nutrition/best-calorie-counters",
        source: "Web",
      },
    ],
    competitors: [
      {
        name: "MyFitnessPal",
        description:
          "Largest food database; barcode scan + logging. Strong habit for many users; subscription for premium insights.",
        url: "https://www.myfitnesspal.com",
      },
      {
        name: "Cronometer",
        description:
          "Macro- and micronutrient-focused; popular with precision nutrition users. Detailed reporting.",
        url: "https://cronometer.com",
      },
      {
        name: "Lose It!",
        description:
          "Calorie budgeting, challenges, barcode scan; freemium with large community.",
        url: "https://www.loseit.com",
      },
      {
        name: "Lifesum",
        description:
          "Meal plans, recipes, Scandinavian-market strength; subscription tiers for coaching-style features.",
        url: "https://lifesum.com",
      },
      {
        name: "Yazio",
        description:
          "Calorie counter + intermittent fasting tooling; strong EU presence.",
        url: "https://www.yazio.com",
      },
    ],
    synthesis: `**Market Research (demo) for:** "${idea}"

**Category:** Digital nutrition / calorie estimation / macro tracking — high search volume, strong habit loops, and skepticism about accuracy for mixed meals and dining out.

**Signals:** TikTok and YouTube push "what I eat" + macro content; trust hinges on **speed of logging**, **privacy**, and **honesty about error bars** (especially for photo-based estimation).

**Wedge:** On-device processing, gentle adherence UX (streaks without shame), and transparent ranges can differentiate from manual database search apps.`,

    contrarian: `**Contrarian (demo)**

Food CV is **hard**: hidden oils, ethnic dishes, buffets, and shared plates break naive models. Regulators and App Store scrutiny around health claims matter. Churn spikes if users feel judged or if numbers feel "made up."

**Mitigation:** show confidence intervals, easy corrections, and clear privacy — ship narrow cuisine/venue scopes before claiming universal accuracy.`,
  };
}

/** Idea-agnostic: real search surfaces so content always matches the prompt in the URL. */
function getGenericDemoResearchData(idea: string): ResearchData {
  const q = enc(idea);
  return {
    cards: [
      {
        title: `TikTok search: ${idea.slice(0, 60)}${idea.length > 60 ? "…" : ""}`,
        url: `https://www.tiktok.com/search?q=${q}`,
        source: "TikTok",
      },
      {
        title: `YouTube search: ${idea.slice(0, 60)}${idea.length > 60 ? "…" : ""}`,
        url: `https://www.youtube.com/results?search_query=${q}`,
        source: "YouTube",
      },
      {
        title: "Google News — startup & product coverage (broad discovery)",
        url: `https://news.google.com/search?q=${q}&hl=en-US&gl=US&ceid=US:en`,
        source: "Web",
      },
      {
        title: "Product Hunt — recent launches (find adjacent products)",
        url: "https://www.producthunt.com/search?q=" + q,
        source: "Web",
      },
    ],
    competitors: [
      {
        name: "Market landscape",
        description: `For "${idea.slice(0, 100)}", map direct & adjacent players via Product Hunt, G2, and crisp Google queries — scripted demo cannot name winners without your niche.`,
        url: `https://www.google.com/search?q=${q}+competitors+alternatives`,
      },
      {
        name: "G2 / software reviews (if B2B)",
        description: "Browse categories that match your positioning and read switching reasons in reviews.",
        url: "https://www.g2.com/search?query=" + q,
      },
    ],
    synthesis: `**Market Research (demo) for:** "${idea}"

This scripted bundle uses **real search & discovery URLs** (see cards) so every link is tied to your exact words. Use them to skim social proof, messaging angles, and competitor positioning.

**Next with live data:** connect Nia or manual research to replace generic competitor rows with verified companies in your vertical.`,

    contrarian: `**Contrarian (demo)**

Without vertical-specific data, the risk is **false confidence**. Use the linked searches, then validate **pricing**, **distribution**, and **why now** with primary conversations — demos can't replace that.`,
  };
}

export function getDemoResearchData(idea: string): ResearchData {
  switch (detectDemoScenario(idea)) {
    case "nutrition_cv":
      return getNutritionDemoResearchData(idea);
    case "job_search":
      return getJobDemoResearchData(idea);
    default:
      return getGenericDemoResearchData(idea);
  }
}
