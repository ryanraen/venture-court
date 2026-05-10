import {
  getCMOCouncil,
  getCTOCouncil,
  getCEOVerdict,
  getSWE1BuildNarrative,
  getSWE2ReviewNarrative,
} from "./fallbacks/clod-examples";
import {
  councilPrompt,
  ceoPrompt,
  swe1Prompt,
  swe2Prompt,
} from "./clod-prompts";
import type { CouncilOutput, PrototypeFiles } from "./types";

const isDemo = () =>
  process.env.FORCE_DEMO_MODE === "true" || !process.env.CLOD_API_KEY;

/**
 * Call CLoD (OpenAI-compatible) for a single completion.
 * Returns null on any error so callers can fall back to demo.
 */
async function clodChat(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 1024,
  model?: string,
): Promise<string | null> {
  const apiKey = process.env.CLOD_API_KEY;
  if (!apiKey) return null;
  try {
    const resolvedModel =
      model || process.env.CLOD_MODEL_BUILD || "claude-3-5-sonnet-20241022";
    const res = await fetch("https://api.clod.io/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: resolvedModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: maxTokens,
        temperature: 0.8,
      }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) {
      console.error(`CLoD ${res.status}: ${(await res.text()).slice(0, 200)}`);
      return null;
    }
    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? null;
  } catch (err) {
    console.error("CLoD fetch error:", err instanceof Error ? err.message : err);
    return null;
  }
}

/** Strip markdown fences that models sometimes wrap JSON in. */
function stripJsonFences(raw: string): string {
  return raw.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
}

// ── Council (CMO / CTO) ─────────────────────────────────────────────

function parseCouncilJSON(raw: string, role: string): CouncilOutput | null {
  try {
    const obj = JSON.parse(stripJsonFences(raw));
    if (!Array.isArray(obj.personas) || obj.personas.length < 3) return null;
    if (typeof obj.chair !== "string" || obj.chair.length < 20) return null;
    const personas = obj.personas.map(
      (p: { persona?: string; label?: string; content?: string }, i: number) => ({
        persona: p.persona || `persona_${i}`,
        label: p.label || `Persona ${i + 1}`,
        content: p.content || "",
      }),
    );
    return { role, personas, chair: obj.chair };
  } catch {
    return null;
  }
}

export async function getCouncil(
  role: "CMO" | "CTO",
  idea: string,
): Promise<{ source: "demo" | "live"; council: CouncilOutput }> {
  const demoCouncil = role === "CMO" ? getCMOCouncil(idea) : getCTOCouncil(idea);

  if (isDemo()) {
    return { source: "demo", council: demoCouncil };
  }

  const { system, user, maxTokens } = councilPrompt(role, idea);
  const raw = await clodChat(system, user, maxTokens);
  if (!raw) return { source: "demo", council: demoCouncil };

  const parsed = parseCouncilJSON(raw, role);
  if (!parsed) {
    console.error(`CLoD ${role} council JSON parse failed, falling back to demo`);
    return { source: "demo", council: demoCouncil };
  }

  return { source: "live", council: parsed };
}

// ── CEO Verdict ──────────────────────────────────────────────────────

export async function getCEO(
  idea: string,
  cmoSummary: string,
  ctoSummary: string,
): Promise<{ source: "demo" | "live"; verdict: string }> {
  const demoVerdict = getCEOVerdict(idea, cmoSummary, ctoSummary);

  if (isDemo()) {
    return { source: "demo", verdict: demoVerdict };
  }

  const { system, user, maxTokens } = ceoPrompt(idea, cmoSummary, ctoSummary);
  const raw = await clodChat(system, user, maxTokens);
  if (!raw || raw.length < 50) return { source: "demo", verdict: demoVerdict };

  return { source: "live", verdict: raw };
}

// ── SWE1 (Build MVP) ────────────────────────────────────────────────

function parseSWE1JSON(
  raw: string,
): { narrative: string; files: PrototypeFiles } | null {
  try {
    const obj = JSON.parse(stripJsonFences(raw));
    if (
      typeof obj.narrative !== "string" ||
      typeof obj.html !== "string" ||
      typeof obj.css !== "string" ||
      typeof obj.js !== "string"
    )
      return null;
    if (obj.html.length < 50) return null;
    return {
      narrative: obj.narrative,
      files: { html: obj.html, css: obj.css, js: obj.js },
    };
  } catch {
    return null;
  }
}

export async function getSWE1(
  idea: string,
): Promise<{ source: "demo" | "live"; narrative: string; files: PrototypeFiles }> {
  const demo = getSWE1BuildNarrative(idea);

  if (isDemo()) {
    return { source: "demo", ...demo };
  }

  const { system, user, maxTokens } = swe1Prompt(idea);
  const raw = await clodChat(system, user, maxTokens);
  if (!raw) return { source: "demo", ...demo };

  const parsed = parseSWE1JSON(raw);
  if (!parsed) {
    console.error("CLoD SWE1 JSON parse failed, falling back to demo");
    return { source: "demo", ...demo };
  }

  return { source: "live", ...parsed };
}

// ── SWE2 (Code Review) ──────────────────────────────────────────────

export async function getSWE2(
  idea: string,
): Promise<{ source: "demo" | "live"; review: string }> {
  const demoReview = getSWE2ReviewNarrative(idea);

  if (isDemo()) {
    return { source: "demo", review: demoReview };
  }

  const model = process.env.CLOD_MODEL_REVIEW || undefined;
  const { system, user, maxTokens } = swe2Prompt(idea);
  const raw = await clodChat(system, user, maxTokens, model);
  if (!raw || raw.length < 30) return { source: "demo", review: demoReview };

  return { source: "live", review: raw };
}

export { clodChat };
