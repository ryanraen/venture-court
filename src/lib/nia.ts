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

  const [webRes, deepRes] = await Promise.allSettled([
    fetch(`${baseUrl}/search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `${idea} startup market size competitors`,
        mode: "web",
      }),
      signal: AbortSignal.timeout(15000),
    }),
    fetch(`${baseUrl}/search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `${idea} tiktok viral youtube reviews criticism`,
        mode: "web",
      }),
      signal: AbortSignal.timeout(15000),
    }),
  ]);

  const cards: ResearchCard[] = [];
  const competitors: Competitor[] = [];
  let synthesisRaw = "";

  for (const result of [webRes, deepRes]) {
    if (result.status !== "fulfilled" || !result.value.ok) continue;
    const body = await result.value.json();
    const sources = body?.sources || body?.results || [];
    for (const s of sources) {
      const url: string = s.url || s.link || "";
      const title: string = s.title || s.name || "";
      if (/tiktok|youtube|twitter|x\.com/i.test(url)) {
        cards.push({
          title,
          url,
          source: /tiktok/i.test(url)
            ? "TikTok"
            : /youtube/i.test(url)
              ? "YouTube"
              : "X (Twitter)",
        });
      } else if (title && url) {
        competitors.push({
          name: title.split(/[|\-–—]/)[0].trim().slice(0, 40),
          description: (s.snippet || s.description || "").slice(0, 200),
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
    cards: cards.length > 0 ? cards.slice(0, 10) : demo.cards,
    competitors:
      competitors.length > 0 ? competitors.slice(0, 6) : demo.competitors,
    synthesis: synthesisRaw || demo.synthesis,
    contrarian: demo.contrarian,
  };
}
