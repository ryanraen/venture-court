/**
 * Demo council + SWE fixtures routed by `detectDemoScenario(idea)` so the scripted
 * path matches the user's prompt (nutrition vs job tools vs generic).
 */
import type { CouncilOutput } from "@/lib/types";
import { detectDemoScenario } from "./demo-scenario";
import {
  getJobCMOCouncil,
  getJobCTOCouncil,
  getJobCEOVerdict,
  getJobSWE1BuildNarrative,
  getJobSWE2ReviewNarrative,
} from "./job-clod";
import {
  getNutritionCMOCouncil,
  getNutritionCTOCouncil,
  getNutritionCEOVerdict,
  getNutritionSWE1BuildNarrative,
  getNutritionSWE2ReviewNarrative,
} from "./nutrition-clod";
import {
  getGenericCMOCouncil,
  getGenericCTOCouncil,
  getGenericCEOVerdict,
  getGenericSWE1BuildNarrative,
  getGenericSWE2ReviewNarrative,
} from "./generic-clod";

export type { PersonaOutput, CouncilOutput } from "@/lib/types";

export function getCMOCouncil(idea: string): CouncilOutput {
  switch (detectDemoScenario(idea)) {
    case "nutrition_cv":
      return getNutritionCMOCouncil(idea);
    case "job_search":
      return getJobCMOCouncil(idea);
    default:
      return getGenericCMOCouncil(idea);
  }
}

export function getCTOCouncil(idea: string): CouncilOutput {
  switch (detectDemoScenario(idea)) {
    case "nutrition_cv":
      return getNutritionCTOCouncil(idea);
    case "job_search":
      return getJobCTOCouncil(idea);
    default:
      return getGenericCTOCouncil(idea);
  }
}

export function getCEOVerdict(
  idea: string,
  cmoSummary: string,
  ctoSummary: string
): string {
  switch (detectDemoScenario(idea)) {
    case "nutrition_cv":
      return getNutritionCEOVerdict(idea, cmoSummary, ctoSummary);
    case "job_search":
      return getJobCEOVerdict(idea, cmoSummary, ctoSummary);
    default:
      return getGenericCEOVerdict(idea, cmoSummary, ctoSummary);
  }
}

export function getSWE1BuildNarrative(idea: string) {
  switch (detectDemoScenario(idea)) {
    case "nutrition_cv":
      return getNutritionSWE1BuildNarrative(idea);
    case "job_search":
      return getJobSWE1BuildNarrative(idea);
    default:
      return getGenericSWE1BuildNarrative(idea);
  }
}

export function getSWE2ReviewNarrative(idea: string): string {
  switch (detectDemoScenario(idea)) {
    case "nutrition_cv":
      return getNutritionSWE2ReviewNarrative(idea);
    case "job_search":
      return getJobSWE2ReviewNarrative(idea);
    default:
      return getGenericSWE2ReviewNarrative(idea);
  }
}
