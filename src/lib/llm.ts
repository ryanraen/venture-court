import {
  getCMOCouncil,
  getCTOCouncil,
  getCEOVerdict,
  getSWE1BuildNarrative,
  getSWE2ReviewNarrative,
} from "./fallbacks/clod-examples";
import type { CouncilOutput } from "./types";

const isDemo = () =>
  process.env.FORCE_DEMO_MODE === "true" || !process.env.CLOD_API_KEY;

/**
 * Stretch: call CLoD (OpenAI-compatible) for a single completion.
 * Falls back to demo on any error.
 */
async function clodChat(systemPrompt: string, userPrompt: string): Promise<string | null> {
  const apiKey = process.env.CLOD_API_KEY;
  if (!apiKey) return null;
  try {
    const model = process.env.CLOD_MODEL_BUILD || "claude-3-5-sonnet-20241022";
    const res = await fetch("https://api.clod.io/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 1024,
        temperature: 0.8,
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

export function getCouncil(
  role: "CMO" | "CTO",
  idea: string
): { source: "demo" | "live"; council: CouncilOutput } {
  if (isDemo()) {
    return {
      source: "demo",
      council: role === "CMO" ? getCMOCouncil(idea) : getCTOCouncil(idea),
    };
  }
  // Live path would use clodChat per-persona — deferred to stretch
  return {
    source: "demo",
    council: role === "CMO" ? getCMOCouncil(idea) : getCTOCouncil(idea),
  };
}

export function getCEO(
  idea: string,
  cmoSummary: string,
  ctoSummary: string
): { source: "demo" | "live"; verdict: string } {
  if (isDemo()) {
    return { source: "demo", verdict: getCEOVerdict(idea, cmoSummary, ctoSummary) };
  }
  return { source: "demo", verdict: getCEOVerdict(idea, cmoSummary, ctoSummary) };
}

export function getSWE1(idea: string) {
  if (isDemo()) {
    return { source: "demo" as const, ...getSWE1BuildNarrative(idea) };
  }
  return { source: "demo" as const, ...getSWE1BuildNarrative(idea) };
}

export function getSWE2(idea: string) {
  if (isDemo()) {
    return { source: "demo" as const, review: getSWE2ReviewNarrative(idea) };
  }
  return { source: "demo" as const, review: getSWE2ReviewNarrative(idea) };
}

// Re-export for potential direct use
export { clodChat };
