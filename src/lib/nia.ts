import { ResearchData, ResearchCard, Competitor } from "./types";
import { getDemoResearchData } from "./fallbacks/nia-examples";

const isDemo = () =>
  process.env.FORCE_DEMO_MODE === "true" || !process.env.NIA_API_KEY;

export async function getResearch(idea: string): Promise<{
  source: "demo" | "live";
  data: ResearchData;
}> {
  if (isDemo()) {
    return { source: "demo", data: getDemoResearchData(idea) };
  }

  try {
    const results = await niaUnifiedSearch(idea);
    return { source: "live", data: results };
  } catch {
    return { source: "demo", data: getDemoResearchData(idea) };
  }
}

async function niaUnifiedSearch(idea: string): Promise<ResearchData> {
  const apiKey = process.env.NIA_API_KEY!;
  const baseUrl = "https://apigcp.trynia.ai/v2";

  const search = (query: string) =>
    fetch(`${baseUrl}/search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        mode: "web",
      }),
      signal: AbortSignal.timeout(15000),
    });

  const [marketRes, tikTokRes, youtubeRes, xRes] = await Promise.allSettled([
    search(`${idea} startup market size competitors`),
    search(`site:tiktok.com/@ ${idea} viral views likes shares`),
    search(`site:youtube.com/watch ${idea} viral views review tutorial`),
    search(`site:x.com ${idea} viral views likes reposts`),
  ]);

  const cards: ResearchCard[] = [];
  const competitors: Competitor[] = [];
  let synthesisRaw = "";

  for (const result of [marketRes, tikTokRes, youtubeRes, xRes]) {
    if (result.status !== "fulfilled" || !result.value.ok) continue;
    const body = await result.value.json();
    const sources = body?.sources || body?.results || [];
    for (const s of sources) {
      const url: string = s.url || s.link || "";
      const title: string = s.title || s.name || "";
      const snippet: string = s.snippet || s.description || "";
      const socialSource = getSocialSource(url);
      const viralitySignal = extractViralitySignal(title, snippet);
      if (socialSource && isDirectSocialContent(url) && viralitySignal) {
        cards.push({
          title,
          url,
          source: socialSource,
          viralitySignal,
        });
      } else if (!socialSource && title && url) {
        competitors.push({
          name: title.split(/[|\-–—]/)[0].trim().slice(0, 40),
          description: snippet.slice(0, 200),
          url,
        });
      }
    }
    if (body?.answer || body?.synthesis) {
      synthesisRaw += (body.answer || body.synthesis) + "\n";
    }
  }

  const demo = getDemoResearchData(idea);

  return {
    cards: dedupeByUrl(cards).slice(0, 10),
    competitors:
      competitors.length > 0 ? competitors.slice(0, 6) : demo.competitors,
    synthesis: synthesisRaw || demo.synthesis,
    contrarian: demo.contrarian,
  };
}

function getSocialSource(url: string): ResearchCard["source"] | null {
  if (/tiktok\.com/i.test(url)) return "TikTok";
  if (/youtube\.com|youtu\.be/i.test(url)) return "YouTube";
  if (/(^|\/\/)(x\.com|twitter\.com)\//i.test(url)) return "X (Twitter)";
  return null;
}

function isDirectSocialContent(url: string): boolean {
  try {
    const { hostname, pathname, searchParams } = new URL(url);
    const host = hostname.replace(/^www\./, "");

    if (host.endsWith("tiktok.com")) {
      return /^\/@[^/]+\/video\/\d+/.test(pathname);
    }

    if (host.endsWith("youtube.com")) {
      return pathname === "/watch" && Boolean(searchParams.get("v"));
    }

    if (host === "youtu.be") {
      return pathname.length > 1;
    }

    if (host === "x.com" || host === "twitter.com") {
      return /^\/[^/]+\/status\/\d+/.test(pathname);
    }
  } catch {
    return false;
  }

  return false;
}

function extractViralitySignal(title: string, snippet: string): string | null {
  const text = `${title} ${snippet}`.replace(/\s+/g, " ");
  const engagement =
    text.match(/\b(\d+(?:\.\d+)?\s?[KMB]|\d{1,3}(?:,\d{3})+)\s*(views|likes|shares|comments|reposts)\b/i) ||
    text.match(/\b(views|likes|shares|comments|reposts):\s*(\d+(?:\.\d+)?\s?[KMB]|\d{1,3}(?:,\d{3})+)\b/i);

  if (engagement) {
    return engagement[0].replace(/\s+/g, " ");
  }

  if (/\b(viral|trending|blew up|millions of views)\b/i.test(text)) {
    return "viral/trending mention";
  }

  return null;
}

function dedupeByUrl(cards: ResearchCard[]): ResearchCard[] {
  const seen = new Set<string>();
  return cards.filter((card) => {
    if (seen.has(card.url)) return false;
    seen.add(card.url);
    return true;
  });
}
