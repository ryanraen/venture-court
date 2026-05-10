"use client";

import { useState, useRef, useCallback, useEffect, useMemo, type ReactNode } from "react";
import StageIndicator from "@/components/StageIndicator";
import AgentBlock from "@/components/AgentBlock";
import Spinner from "@/components/Spinner";
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
const IDEATION_AGENT_IDS = new Set(["CMO", "CMO_chair", "CTO", "CTO_chair", "CEO"]);
const RESEARCH_AGENT_IDS = new Set(["researcher", "synthesis", "contrarian"]);
const RESEARCH_AGENT_ORDER = ["researcher", "synthesis", "contrarian"];

type Ribbon = "ideation" | "research" | "prototype";

function ribbonForStage(stage: Stage): Ribbon {
  if (stage === "idle") return "ideation";
  if (
    stage === "ideation_cmo" ||
    stage === "ideation_cto" ||
    stage === "ideation_ceo" ||
    stage === "gate_research"
  ) {
    return "ideation";
  }
  if (stage === "market_research" || stage === "gate_prototype") {
    return "research";
  }
  if (
    stage === "prototyping_build" ||
    stage === "prototyping_review" ||
    stage === "complete"
  ) {
    return "prototype";
  }
  return "ideation";
}

function PhaseBand({
  eyebrow,
  title,
  highlight,
  borderClass,
  bgClass,
  children,
}: {
  eyebrow: string;
  title: string;
  highlight: boolean;
  borderClass: string;
  bgClass: string;
  children: ReactNode;
}) {
  return (
    <section
      className={`border-l-[3px] pl-5 pr-2 py-1 ${borderClass} ${highlight ? `${bgClass} ring-1 ring-inset ring-white/[0.07]` : "bg-black/30"}`}
    >
      <header className="py-4 pr-4">
        <div className="flex flex-wrap items-baseline gap-2">
          <span
            className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${highlight ? "text-neutral-400" : "text-neutral-600"}`}
          >
            {eyebrow}
          </span>
          <h2 className={`text-sm font-semibold tracking-tight ${highlight ? "text-white" : "text-neutral-500"}`}>
            {title}
          </h2>
        </div>
      </header>
      <div className="-ml-1">{children}</div>
    </section>
  );
}

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
  /** Bumped on Summon start and Reset so stray SSE tails never mutate state after reset */
  const flowGenerationRef = useRef(0);
  const streamAbortRef = useRef<AbortController | null>(null);

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
    async (sid: string, action: string, signal: AbortSignal, generation: number) => {
      if (generation !== flowGenerationRef.current) return;

      const stillThisFlow = () => generation === flowGenerationRef.current;

      setRunning(true);
      setGatePrompt(null);
      setPendingGateStage(null);

      try {
        const res = await fetch("/api/council/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sid, action }),
          signal,
        });

        if (!stillThisFlow()) return;

        if (!res.ok || !res.body) {
          if (stillThisFlow()) setRunning(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (stillThisFlow()) {
          let readChunk;
          try {
            readChunk = await reader.read();
          } catch {
            break;
          }
          const { done, value } = readChunk;
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!stillThisFlow()) {
              reader.cancel().catch(() => {});
              break;
            }
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
      } catch (err: unknown) {
        const aborted =
          signal.aborted ||
          (err instanceof Error && (err.name === "AbortError" || err.message.includes("abort")));
        if (!aborted && stillThisFlow()) console.error(err);
      } finally {
        if (stillThisFlow()) setRunning(false);
      }
    },
    []
  );

  const abortStream = useCallback(() => {
    streamAbortRef.current?.abort();
    streamAbortRef.current = null;
  }, []);

  const handleReset = useCallback(() => {
    abortStream();
    flowGenerationRef.current += 1;
    setRunning(false);
    setSessionId(null);
    setStage("idle");
    setAgents([]);
    setActiveAgent(null);
    setResearch(null);
    setPrototype(null);
    setGatePrompt(null);
    setPendingGateStage(null);
    setPreviewMinimized(false);
    setSource("demo");
  }, [abortStream]);

  const handleSummon = useCallback(async () => {
    if (!idea.trim() || running) return;

    abortStream();
    flowGenerationRef.current += 1;
    const generation = flowGenerationRef.current;
    const ac = new AbortController();
    streamAbortRef.current = ac;
    const signal = ac.signal;

    const res = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea: idea.trim() }),
      signal,
    }).catch(() => null);
    if (generation !== flowGenerationRef.current || !res?.ok) {
      if (generation === flowGenerationRef.current) setRunning(false);
      abortStream();
      return;
    }
    const session = await res.json();
    if (generation !== flowGenerationRef.current) return;

    setSessionId(session.id);
    setStage("ideation_cmo");
    setAgents([]);
    setResearch(null);
    setPrototype(null);

    await runAction(session.id, "ideation_cmo", signal, generation);
    if (signal.aborted || generation !== flowGenerationRef.current) return;
    await runAction(session.id, "ideation_cto", signal, generation);
    if (signal.aborted || generation !== flowGenerationRef.current) return;
    await runAction(session.id, "ideation_ceo", signal, generation);
  }, [idea, running, runAction, abortStream]);

  const handleProceed = useCallback(async () => {
    if (!sessionId || !streamAbortRef.current) return;
    const generation = flowGenerationRef.current;
    const signal = streamAbortRef.current.signal;

    if (pendingGateStage === "gate_research") {
      await runAction(sessionId, "market_research", signal, generation);
    } else if (pendingGateStage === "gate_prototype") {
      await runAction(sessionId, "prototyping_build", signal, generation);
      if (signal.aborted || generation !== flowGenerationRef.current) return;
      await runAction(sessionId, "prototyping_review", signal, generation);
    }
  }, [sessionId, pendingGateStage, runAction]);

  const showPreview = prototype !== null;

  const agentsMain = agents.filter((a) => !SWE_AGENT_IDS.has(a.id));
  const agentsSwe = agents.filter((a) => SWE_AGENT_IDS.has(a.id));

  const agentsIdeation = useMemo(
    () => agentsMain.filter((a) => IDEATION_AGENT_IDS.has(a.id)),
    [agentsMain]
  );
  const agentsResearch = useMemo(
    () => agentsMain.filter((a) => RESEARCH_AGENT_IDS.has(a.id)),
    [agentsMain]
  );

  const ribbon = useMemo(() => ribbonForStage(stage), [stage]);

  const showPrepCeoGate =
    !!gatePrompt &&
    pendingGateStage === "gate_research" &&
    gatePrompt.includes("Proceed to CEO");
  const showResearchGate =
    !!gatePrompt &&
    pendingGateStage === "gate_research" &&
    gatePrompt.includes("Market Research");
  const showPrototypeGate =
    !!gatePrompt && pendingGateStage === "gate_prototype";

  const proceedBtn = (
    <button
      type="button"
      onClick={handleProceed}
      disabled={running}
      className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-semibold rounded-md hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {running && (
        <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {running ? "Loading..." : "Proceed"}
    </button>
  );

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
            <div className="flex flex-col gap-px pb-8">
              <PhaseBand
                eyebrow="Phase 01"
                title="Ideation"
                highlight={ribbon === "ideation"}
                borderClass="border-l-neutral-600"
                bgClass="bg-neutral-950/75"
              >
                {agentsIdeation.map((a) => (
                  <AgentBlock
                    key={a.id + a.label}
                    label={a.label}
                    content={a.content}
                    isActive={activeAgent === a.id}
                    isDone={a.done}
                  />
                ))}
                {showPrepCeoGate && (
                  <div className="px-4 py-5">
                    <div className="rounded-lg border border-neutral-700 bg-neutral-900/85 p-4">
                      <p className="text-sm text-neutral-200 mb-3">{gatePrompt}</p>
                      {proceedBtn}
                    </div>
                  </div>
                )}
                {showResearchGate && (
                  <div className="px-4 py-5">
                    <div className="rounded-lg border border-neutral-700 bg-neutral-900/85 p-4">
                      <p className="text-sm text-neutral-200 mb-3">{gatePrompt}</p>
                      {proceedBtn}
                    </div>
                  </div>
                )}
              </PhaseBand>

              <PhaseBand
                eyebrow="Phase 02"
                title="Market research"
                highlight={ribbon === "research"}
                borderClass="border-l-neutral-400"
                bgClass="bg-neutral-900/45"
              >
                {agentsResearch
                  .filter((a) => a.id === "researcher")
                  .map((a) => (
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
                {agentsResearch
                  .filter((a) => a.id === "synthesis" || a.id === "contrarian")
                  .sort((a, b) => RESEARCH_AGENT_ORDER.indexOf(a.id) - RESEARCH_AGENT_ORDER.indexOf(b.id))
                  .map((a) => (
                    <AgentBlock
                      key={a.id + a.label}
                      label={a.label}
                      content={a.content}
                      isActive={activeAgent === a.id}
                      isDone={a.done}
                    />
                  ))}
                {showPrototypeGate && (
                  <div className="px-4 py-5">
                    <div className="rounded-lg border border-neutral-700 bg-neutral-900/85 p-4">
                      <p className="text-sm text-neutral-200 mb-3">{gatePrompt}</p>
                      {proceedBtn}
                    </div>
                  </div>
                )}
              </PhaseBand>

              <PhaseBand
                eyebrow="Phase 03"
                title="Prototype"
                highlight={ribbon === "prototype"}
                borderClass="border-l-neutral-300"
                bgClass="bg-neutral-950/60"
              >
                {agentsSwe.map((a) => (
                  <AgentBlock
                    key={a.id + a.label}
                    label={a.label}
                    content={a.content}
                    isActive={activeAgent === a.id}
                    isDone={a.done}
                  />
                ))}
                {stage === "complete" && (
                  <div className="px-4 py-5">
                    <div className="rounded-lg border border-neutral-700 bg-neutral-900/70 p-4 text-center">
                      <p className="text-sm text-neutral-200">
                        All stages complete. Your MVP is ready for review.
                      </p>
                    </div>
                  </div>
                )}
              </PhaseBand>

              {running && !activeAgent && (
                <Spinner label="Preparing next stage..." />
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
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {running && stage === "ideation_cmo" && !activeAgent && (
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              Summon Council
            </button>
            {stage !== "idle" && (
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 rounded-lg border border-neutral-700 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition-colors whitespace-nowrap"
              >
                Reset
              </button>
            )}
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
