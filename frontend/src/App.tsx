import { useState, useCallback } from "react";
import { useAgentStream, StreamEvent } from "./hooks/useAgentStream";
import IdeaInput from "./components/IdeaInput";
import StageTracker from "./components/StageTracker";
import AgentStream from "./components/AgentStream";
import CouncilDebate from "./components/CouncilDebate";
import VerdictCard from "./components/VerdictCard";
import ResearchPanel from "./components/ResearchPanel";
import MVPPreview from "./components/MVPPreview";
import FeedbackModal from "./components/FeedbackModal";

type Stage = "input" | "ideation" | "research" | "prototyping" | "complete";

export default function App() {
  const [stage, setStage] = useState<Stage>("input");
  const [idea, setIdea] = useState("");
  const [ideationVerdict, setIdeationVerdict] = useState("");
  const [researchSummary, setResearchSummary] = useState("");
  const [techSpec, setTechSpec] = useState("");
  const [codebase, setCodebase] = useState<{ files: Record<string, string> } | null>(null);
  const [mvpUrl, setMvpUrl] = useState<string | undefined>();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [stageHistory, setStageHistory] = useState<Record<string, StreamEvent[]>>({});

  const { events, isStreaming, startStream, reset } = useAgentStream();

  const currentStageNum =
    stage === "input"
      ? 0
      : stage === "ideation"
        ? 0
        : stage === "research"
          ? 1
          : 2;

  const handleIdeaSubmit = useCallback(
    async (submittedIdea: string) => {
      setIdea(submittedIdea);
      setStage("ideation");
      reset();
      await startStream("/api/ideation/start", { idea: submittedIdea });
    },
    [startStream, reset]
  );

  const handleProceedToResearch = useCallback(async () => {
    const verdict =
      events.find((e) => e.type === "final_verdict")?.content as string || "";
    setIdeationVerdict(verdict);
    setStageHistory((prev) => ({ ...prev, ideation: events }));
    setStage("research");
    reset();
    await startStream("/api/research/start", {
      idea,
      ideation_verdict: verdict,
    });
  }, [events, idea, startStream, reset]);

  const handleProceedToPrototype = useCallback(async () => {
    const summary =
      events.find((e) => e.type === "research_summary")?.content as string || "";
    setResearchSummary(summary);
    setStageHistory((prev) => ({ ...prev, research: events }));
    setStage("prototyping");
    reset();
    await startStream("/api/prototype/start", {
      idea,
      research_summary: summary,
      tech_spec: techSpec,
    });
  }, [events, idea, techSpec, startStream, reset]);

  const handleFeedbackSubmit = useCallback(
    async (feedback: string) => {
      setFeedbackOpen(false);
      setMvpUrl(undefined);
      reset();
      await startStream("/api/prototype/refine", {
        codebase: codebase || { files: {} },
        tech_spec: techSpec,
        user_feedback: feedback,
      });
    },
    [codebase, techSpec, startStream, reset]
  );

  // Track MVP completion and file collection
  const stageComplete = events.find((e) => e.type === "stage_complete");
  if (stageComplete?.mvp_url && !mvpUrl) {
    setMvpUrl(stageComplete.mvp_url as string);
  }

  // Collect tech spec from CTO if emitted
  const techSpecEvent = events.find((e) => e.type === "tech_spec");
  if (techSpecEvent?.content && !techSpec) {
    setTechSpec(techSpecEvent.content as string);
  }

  // Collect codebase files
  const fileEvents = events.filter((e) => e.type === "file");
  if (fileEvents.length > 0 && !codebase) {
    const files: Record<string, string> = {};
    for (const f of fileEvents) {
      files[f.name as string] = f.content as string;
    }
    setCodebase({ files });
  }

  const finalVerdict = events.find(
    (e) => e.type === "final_verdict" || e.type === "research_summary"
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {stage !== "input" && (
          <StageTracker currentStage={currentStageNum} />
        )}

        {stage === "input" && (
          <div className="flex items-center justify-center min-h-[70vh]">
            <IdeaInput onSubmit={handleIdeaSubmit} />
          </div>
        )}

        {stage === "ideation" && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-amber-400">
                Stage 1: Ideation
              </h2>
              <p className="text-gray-400 mt-1">
                The council is evaluating your idea: "{idea}"
              </p>
            </div>

            <AgentStream events={events} isStreaming={isStreaming} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CouncilDebate events={events} agent="CMO" />
              <CouncilDebate events={events} agent="CTO" />
              <CouncilDebate events={events} agent="Contrarian" />
            </div>

            {finalVerdict && !isStreaming && (
              <VerdictCard
                agent="CEO"
                verdict={finalVerdict.content as string}
                type="final_verdict"
                proceedLabel="Proceed to Market Research →"
                onProceed={handleProceedToResearch}
                onStop={() => setStage("complete")}
              />
            )}
          </div>
        )}

        {stage === "research" && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-blue-400">
                Stage 2: Market Research
              </h2>
              <p className="text-gray-400 mt-1">
                Gathering real market data for: "{idea}"
              </p>
            </div>

            <ResearchPanel events={events} />
            <AgentStream events={events} isStreaming={isStreaming} />

            {finalVerdict && !isStreaming && (
              <VerdictCard
                agent="CEO"
                verdict={finalVerdict.content as string}
                type="research_summary"
                proceedLabel="Proceed to Prototyping →"
                onProceed={handleProceedToPrototype}
                onStop={() => setStage("complete")}
              />
            )}
          </div>
        )}

        {stage === "prototyping" && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-emerald-400">
                Stage 3: Prototyping
              </h2>
              <p className="text-gray-400 mt-1">
                Building your MVP with the SWE team
              </p>
            </div>

            <MVPPreview
              events={events}
              isStreaming={isStreaming}
              mvpUrl={mvpUrl}
              onFeedback={() => setFeedbackOpen(true)}
              onApprove={() => setStage("complete")}
            />

            <FeedbackModal
              isOpen={feedbackOpen}
              onClose={() => setFeedbackOpen(false)}
              onSubmit={handleFeedbackSubmit}
            />
          </div>
        )}

        {stage === "complete" && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent mb-4">
                Session Complete
              </h2>
              <p className="text-gray-400 text-lg mb-6">
                {mvpUrl
                  ? "Your MVP is live and ready!"
                  : "Thank you for using Venture Court."}
              </p>
              {mvpUrl && (
                <a
                  href={mvpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block py-3 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-lg transition-all shadow-lg"
                >
                  Open MVP →
                </a>
              )}
              <button
                onClick={() => {
                  setStage("input");
                  setIdea("");
                  setIdeationVerdict("");
                  setResearchSummary("");
                  setTechSpec("");
                  setCodebase(null);
                  setMvpUrl(undefined);
                  reset();
                }}
                className="block mx-auto mt-4 text-gray-400 hover:text-white transition-colors text-sm"
              >
                Start a new idea →
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-xs text-gray-600 border-t border-gray-900 pt-6">
          Built with Claude Code · Powered by Nia by Nozomi · CLod · Greptile · Allscale
        </footer>
      </div>
    </div>
  );
}
