"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import StageIndicator from "@/components/StageIndicator";
import AgentBlock from "@/components/AgentBlock";
import { ViralCards, CompetitorList } from "@/components/ResearchCards";
import MvpPreview from "@/components/MvpPreview";
import type { Stage, SSEEvent, ResearchData, PrototypeFiles } from "@/lib/types";

interface AgentEntry {
  id: string;
  label: string;
  content: string;
  done: boolean;
}

const SWE_AGENT_IDS = new Set(["SWE1", "SWE2"]);

export default function Home() {
  const [idea, setIdea] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [agents, setAgents] = useState<AgentEntry[]>([]);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [source, setSource] = useState<"demo" | "live">("demo");
  const [research, setResearch] = useState<ResearchData | null>(null);
  const [prototype, setPrototype] = useState<PrototypeFiles | null>(null);
  const [previewMinimized, setPreviewMinimized] = useState(false);
  const [gatePrompt, setGatePrompt] = useState<string | null>(null);
  const [pendingGateStage, setPendingGateStage] = useState<Stage | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, []);

  useEffect(scrollToBottom, [agents, research, gatePrompt, scrollToBottom]);

  const runAction = useCallback(
    async (sid: string, action: string) => {
      setRunning(true);
      setGatePrompt(null);
      setPendingGateStage(null);

      const res = await fetch("/api/council/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, action }),
      });

      if (!res.ok || !res.body) {
        setRunning(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const raw = line.replace(/^data: /, "").trim();
          if (!raw) continue;
          let event: SSEEvent;
          try {
            event = JSON.parse(raw);
          } catch {
            continue;
          }

          switch (event.type) {
            case "meta":
              setSource(event.source);
              break;

            case "agent_start":
              setActiveAgent(event.agent);
              setAgents((prev) => [
                ...prev,
                { id: event.agent, label: event.label, content: "", done: false },
              ]);
              break;

            case "chunk":
              setAgents((prev) => {
                const copy = [...prev];
                const last = copy[copy.length - 1];
                if (last) copy[copy.length - 1] = { ...last, content: last.content + event.content };
                return copy;
              });
              break;

            case "agent_done":
              setActiveAgent(null);
              setAgents((prev) =>
                prev.map((a) =>
                  a.id === event.agent ? { ...a, done: true } : a
                )
              );
              break;

            case "research_data":
              setResearch(event.data);
              break;

            case "prototype_ready":
              setPrototype(event.files);
              break;

            case "gate":
              setGatePrompt(event.prompt);
              setPendingGateStage(event.stage);
              break;

            case "stage_complete":
              setStage(event.stage);
              break;
          }
        }
      }

      setRunning(false);
    },
    []
  );

  const handleSummon = useCallback(async () => {
    if (!idea.trim() || running) return;

    const res = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea: idea.trim() }),
    });
    const session = await res.json();
    setSessionId(session.id);
    setStage("ideation_cmo");
    setAgents([]);
    setResearch(null);
    setPrototype(null);

    await runAction(session.id, "ideation_cmo");
    await runAction(session.id, "ideation_cto");
    await runAction(session.id, "ideation_ceo");
  }, [idea, running, runAction]);

  const handleProceed = useCallback(async () => {
    if (!sessionId) return;
    if (pendingGateStage === "gate_research") {
      await runAction(sessionId, "market_research");
    } else if (pendingGateStage === "gate_prototype") {
      await runAction(sessionId, "prototyping_build");
      await runAction(sessionId, "prototyping_review");
    }
  }, [sessionId, pendingGateStage, runAction]);

  const showPreview = prototype !== null;

  const agentsMain = agents.filter((a) => !SWE_AGENT_IDS.has(a.id));
  const agentsSwe = agents.filter((a) => SWE_AGENT_IDS.has(a.id));

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Main panel */}
      <div
        className={`flex min-w-0 flex-col flex-1 ${
          showPreview && !previewMinimized ? "w-1/2" : "w-full"
        }`}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-neutral-800 px-5 py-3">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold tracking-tight">
              venture<span className="text-neutral-500">court</span>
            </h1>
            {source === "demo" && stage !== "idle" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-500 uppercase tracking-widest">
                demo
              </span>
            )}
          </div>
          {stage !== "idle" && <StageIndicator current={stage} />}
        </header>

        {/* Scrollable content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {stage === "idle" ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <h2 className="text-3xl font-bold tracking-tight mb-3">
                Venture Court
              </h2>
              <p className="text-neutral-500 text-sm max-w-md leading-relaxed">
                Enter your startup idea below and summon the council.
                AI agents will ideate, research, and prototype your concept
                through three rigorous stages.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-800/40">
              {agentsMain.map((a) => (
                <AgentBlock
                  key={a.id + a.label}
                  label={a.label}
                  content={a.content}
                  isActive={activeAgent === a.id}
                  isDone={a.done}
                />
              ))}

              {research && (
                <>
                  <ViralCards cards={research.cards} />
                  <CompetitorList competitors={research.competitors} />
                </>
              )}

              {agentsSwe.map((a) => (
                <AgentBlock
                  key={a.id + a.label}
                  label={a.label}
                  content={a.content}
                  isActive={activeAgent === a.id}
                  isDone={a.done}
                />
              ))}

              {gatePrompt && !running && (
                <div className="px-4 py-5">
                  <div className="rounded-lg border border-neutral-700 bg-neutral-900/60 p-4">
                    <p className="text-sm text-neutral-200 mb-3">
                      {gatePrompt}
                    </p>
                    <button
                      onClick={handleProceed}
                      className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-md hover:bg-neutral-200 transition-colors"
                    >
                      Proceed
                    </button>
                  </div>
                </div>
              )}

              {stage === "complete" && (
                <div className="px-4 py-5">
                  <div className="rounded-lg border border-neutral-700 bg-neutral-900/60 p-4 text-center">
                    <p className="text-sm text-neutral-200">
                      All stages complete. Your MVP is ready for review.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom input */}
        <div className="border-t border-neutral-800 px-4 py-3">
          <div className="flex items-center gap-2 max-w-2xl mx-auto">
            <input
              ref={inputRef}
              type="text"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && stage === "idle") handleSummon();
              }}
              placeholder="Describe your startup idea..."
              disabled={running || stage !== "idle"}
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors disabled:opacity-40"
            />
            <button
              onClick={handleSummon}
              disabled={running || !idea.trim() || stage !== "idle"}
              className="px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
            >
              Summon Council
            </button>
          </div>
        </div>
      </div>

      {/* Preview panel */}
      {showPreview && (
        <div
          className={`flex shrink-0 flex-col border-l border-neutral-800 transition-[width] duration-200 ease-out ${
            previewMinimized ? "w-12" : "w-1/2"
          }`}
        >
          <MvpPreview
            files={prototype}
            minimized={previewMinimized}
            onMinimize={() => setPreviewMinimized(true)}
            onExpand={() => setPreviewMinimized(false)}
          />
        </div>
      )}
    </div>
  );
}
