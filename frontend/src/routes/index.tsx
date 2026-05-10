import { createFileRoute } from "@tanstack/react-router";
import Landing from "@/components/Landing";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Venture Court — Put your startup idea on trial" },
      { name: "description", content: "A multi-agent AI startup council that debates, researches, validates, and prototypes your idea before you waste months building the wrong thing." },
      { property: "og:title", content: "Venture Court — Put your startup idea on trial" },
      { property: "og:description", content: "Your AI Boardroom for Startup Decisions. CMO, CTO, Contrarian, and CEO agents debate your idea — then build the MVP." },
    ],
  }),
});
