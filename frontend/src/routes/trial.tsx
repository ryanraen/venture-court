import { createFileRoute } from "@tanstack/react-router";
import Trial from "@/components/Trial";

type TrialSearch = {
  idea?: string;
};

export const Route = createFileRoute("/trial")({
  component: Trial,
  validateSearch: (search: Record<string, unknown>): TrialSearch => ({
    idea: (search.idea as string) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "Venture Court — Trial in Session" },
      {
        name: "description",
        content:
          "Your AI council is deliberating on your startup idea.",
      },
    ],
  }),
});
