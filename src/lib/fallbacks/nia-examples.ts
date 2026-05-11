import type { ResearchData } from "@/lib/types";
import { detectDemoScenario } from "./demo-scenario";

const enc = (s: string) => encodeURIComponent(s.slice(0, 120));

/** Job-search vertical — real links (same bundle as before). */
function getJobDemoResearchData(idea: string): ResearchData {
  return {
    cards: [
      {
        title: "How to Use ChatGPT to Write a Cover Letter",
        url: "https://www.youtube.com/watch?v=-kgAFH7nZYs",
        source: "YouTube",
        viralitySignal: "100K+ views",
      },
      {
        title: "Write Your Cover Letter In SECONDS With ChatGPT — Full Tutorial",
        url: "https://www.youtube.com/watch?v=fpxR9pCMAps",
        source: "YouTube",
        viralitySignal: "49K+ views",
      },
      {
        title: "AI resume tips — how I used ChatGPT to land 3 offers",
        url: "https://www.tiktok.com/@acdoesai/video/7522922914635582733",
        source: "TikTok",
        viralitySignal: "direct TikTok video",
      },
      {
        title: "Career TikTok: AI resume and cover letter workflow",
        url: "https://www.tiktok.com/@careercoachdarci/video/7314311652924677419",
        source: "TikTok",
        viralitySignal: "career TikTok format",
      },
      {
        title: "I've Reviewed 1,000+ Resumes — Here's How to Use AI to Land More Interviews",
        url: "https://www.youtube.com/watch?v=KprWxa9WtIk",
        source: "YouTube",
        viralitySignal: "high-intent tutorial",
      },
      {
        title: "How ChatGPT Helped Me Get 800% More Job Interviews — Full CV & Cover Letter Tutorial",
        url: "https://www.youtube.com/watch?v=XvtHdIRh26Q",
        source: "YouTube",
        viralitySignal: "reported 800% interview lift",
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

/** Nutrition / meal-photo / macro tracking — direct viral nutrition videos. */
function getNutritionDemoResearchData(idea: string): ResearchData {
  return {
    cards: [
      {
        title: "What I eat in a day — 1391 calories and 129g protein",
        url: "https://www.tiktok.com/@lucyolivial/video/7464848376694197536",
        source: "TikTok",
        viralitySignal: "TikTok what-I-eat format",
      },
      {
        title: "Macro tracking grocery haul and healthy food shop inspo",
        url: "https://www.tiktok.com/@lilyanderson2.0/video/7590326224711421206",
        source: "TikTok",
        viralitySignal: "TikTok macro-tracking format",
      },
      {
        title: "High-protein meal with calorie and macro breakdown",
        url: "https://www.tiktok.com/@victoriamaefit/video/7240652507700219182",
        source: "TikTok",
        viralitySignal: "TikTok meal macro breakdown",
      },
      {
        title: "The 100,000 Calorie Challenge",
        url: "https://www.youtube.com/watch?v=dKlWgmhOvpM",
        source: "YouTube",
        viralitySignal: "viral calorie challenge",
      },
      {
        title: "The Best Science-Based Diet to Build Lean Muscle (All Meals Shown)",
        url: "https://www.youtube.com/watch?v=oPRrl-ZhrJQ",
        source: "YouTube",
        viralitySignal: "million-view nutrition format",
      },
      {
        title: "MyFitnessPal 2026 Guide: Track Macros and Calories",
        url: "https://www.youtube.com/watch?v=e9K9MmIjj4M",
        source: "YouTube",
        viralitySignal: "8K+ views",
      },
      {
        title: "2 months of Intermittent Fasting Weigh In + What I Ate",
        url: "https://www.youtube.com/watch?v=qUoFkOzek74",
        source: "YouTube",
        viralitySignal: "direct diet-tracking video",
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

/** Idea-agnostic: hardcoded broad startup/product videos, not search pages. */
function getGenericDemoResearchData(idea: string): ResearchData {
  const q = enc(idea);
  return {
    cards: [
      {
        title: "Startup advice for founders: essential tips to succeed",
        url: "https://www.tiktok.com/@sabrina_ramonov/video/7577881892066708767",
        source: "TikTok",
        viralitySignal: "startup TikTok advice",
      },
      {
        title: "Alex Hormozi: biggest piece of advice for startup software businesses",
        url: "https://www.tiktok.com/@ahormozi/video/7229032803021737259",
        source: "TikTok",
        viralitySignal: "founder TikTok advice",
      },
      {
        title: "Justin Kan: when and how to sell your startup",
        url: "https://www.tiktok.com/@justinkan/video/7056194096947432750",
        source: "TikTok",
        viralitySignal: "founder exit advice",
      },
      {
        title: "Marc Randolph: quick, cheap validation before building",
        url: "https://www.tiktok.com/@marc_randolph/video/7079079298182909230",
        source: "TikTok",
        viralitySignal: "startup validation advice",
      },
      {
        title: "The single biggest reason why startups succeed — Bill Gross",
        url: "https://www.youtube.com/watch?v=bNpx7gpSqbY",
        source: "YouTube",
        viralitySignal: "TED-style viral startup talk",
      },
      {
        title: "How to Get Startup Ideas — Y Combinator",
        url: "https://www.youtube.com/watch?v=Th8JoIan4dg",
        source: "YouTube",
        viralitySignal: "direct startup advice video",
      },
      {
        title: "How Airbnb designs for trust — Joe Gebbia",
        url: "https://www.youtube.com/watch?v=16cM-RFid9U",
        source: "YouTube",
        viralitySignal: "viral product/design talk",
      },
      {
        title: "How great leaders inspire action — Simon Sinek",
        url: "https://www.youtube.com/watch?v=qp0HIF3SfI4",
        source: "YouTube",
        viralitySignal: "multi-million-view positioning talk",
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

This scripted bundle uses **direct viral startup/product videos** (not search pages) as broad signal examples. For niche-specific viral posts, enable live Nia research with a query that has enough social volume.

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
