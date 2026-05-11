/**
 * Picks which scripted demo bundle matches the user's idea so fallbacks
 * aren't stuck on a single vertical (e.g. job applications).
 */
export type DemoScenario = "nutrition_cv" | "job_search" | "generic";

export function detectDemoScenario(idea: string): DemoScenario {
  const t = idea.toLowerCase();
  const nutrition =
    /\b(calorie|calories|macro|macros|meal|meals|nutrition|nutrit|food log|food photo|food\s+photo|plate\b|recipe|diet|dieting|fasting|weight loss|on-?device|computer vision|\bcv\b|image.*meal|meal.*image|streak|burnout|nudge|hunger|fork|kitchen)/i.test(
      idea
    ) || /\b(vision|camera).*\b(food|meal|plate|dish)/i.test(idea);
  const jobs =
    /\b(resume|cover letter|ats\b|job application|linkedin.*job|apply for jobs|job copilot|hiring|recruiter|interview prep|lazyapply|tealhq)/i.test(
      idea
    );
  if (nutrition && !jobs) return "nutrition_cv";
  if (jobs && !nutrition) return "job_search";
  if (nutrition && jobs) return "nutrition_cv";
  return "generic";
}
