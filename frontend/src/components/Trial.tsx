import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Route } from "@/routes/trial";
import { useAgentStream, StreamEvent } from "@/hooks/use-agent-stream";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
} as const;

/* --------------------------------- Types --------------------------------- */

interface GroupedMessage {
  id: string;
  agent: string;
  persona?: string;
  content: string;
  type: string;
}

/* --------------------------------- Helpers -------------------------------- */

function groupEvents(events: StreamEvent[]): GroupedMessage[] {
  const messages: GroupedMessage[] = [];
  const tokenMap = new Map<
    string,
    { agent: string; persona?: string; content: string }
  >();
  const insertionOrder: string[] = [];

  for (const event of events) {
    if (event.type === "stage_complete") continue;

    if (event.token && event.agent) {
      const key = `${event.agent}|${event.persona || ""}`;
      const existing = tokenMap.get(key);
      if (existing) {
        existing.content += event.token;
      } else {
        tokenMap.set(key, {
          agent: event.agent,
          persona: (event.persona as string) || undefined,
          content: event.token,
        });
        insertionOrder.push(key);
      }
    } else if (
      event.type === "verdict" ||
      event.type === "final_verdict" ||
      event.type === "research_summary"
    ) {
      for (const k of insertionOrder) {
        const entry = tokenMap.get(k)!;
        messages.push({
          id: `stream-${k}-${messages.length}`,
          agent: entry.agent,
          persona: entry.persona,
          content: entry.content,
          type: "council_token",
        });
      }
      tokenMap.clear();
      insertionOrder.length = 0;
      messages.push({
        id: `verdict-${event.agent}-${messages.length}`,
        agent: event.agent || "System",
        content: event.content as string,
        type: event.type,
      });
    } else if (event.type === "nia_result") {
      messages.push({
        id: `nia-${event.agent}-${messages.length}`,
        agent: event.agent || "System",
        content: "[Market data retrieved]",
        type: "nia_result",
      });
    }
  }

  for (const k of insertionOrder) {
    const entry = tokenMap.get(k)!;
    messages.push({
      id: `stream-${k}-${messages.length}`,
      agent: entry.agent,
      persona: entry.persona,
      content: entry.content,
      type: "council_token",
    });
  }
  return messages;
}

/* -------------------------------- Sub-views ------------------------------- */

function StreamPanel({
  messages,
  loading,
}: {
  messages: GroupedMessage[];
  loading: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const shouldScroll = useRef(true);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const onScroll = () => {
      shouldScroll.current =
        el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (shouldScroll.current && panelRef.current) {
      panelRef.current.scrollTo({
        top: panelRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div
      ref={panelRef}
      className="flex-1 overflow-y-auto space-y-3 p-4 scroll-smooth"
    >
      <AnimatePresence initial={false}>
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="mono text-[11px] font-semibold text-foreground/80">
                {m.agent}
              </span>
              {m.persona && (
                <span className="mono text-[10px] text-muted-foreground">
                  · {m.persona}
                </span>
              )}
              {(m.type === "verdict" || m.type === "final_verdict") && (
                <span className="ml-auto rounded-full border border-[#febc2e]/20 bg-[#febc2e]/10 px-2 py-0.5 mono text-[9px] text-[#febc2e]/80">
                  VERDICT
                </span>
              )}
            </div>
            <div className="text-sm text-foreground/70 leading-relaxed whitespace-pre-wrap">
              {m.content}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {loading && messages.length === 0 && (
        <div className="flex items-center gap-2 text-muted-foreground mono text-[12px] p-4">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#febc2e]/40" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#febc2e]/70" />
          </span>
          Agents deliberating…
        </div>
      )}
    </div>
  );
}

function VerdictCard({ content }: { content: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-lg border border-white/8 bg-white/[0.03] p-5"
    >
      <div className="mono text-[11px] font-semibold text-foreground/70 mb-2 uppercase tracking-wider">
        Council Verdict
      </div>
      <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
        {content}
      </div>
    </motion.div>
  );
}

function ResearchCards({
  events,
}: {
  events: StreamEvent[];
}) {
  const research = events.filter(
    (e) => e.type === "research_summary" || e.type === "nia_result"
  );
  if (research.length === 0) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {research.map((r, i) => (
        <div
          key={i}
          className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-4"
        >
          <div className="mono text-[11px] text-muted-foreground mb-1">
            {r.agent || "Research"}
          </div>
          <div className="text-sm text-foreground/70">
            {(r.content as string) || "Market data collected"}
          </div>
        </div>
      ))}
    </div>
  );
}

function MvpPanel({ events }: { events: StreamEvent[] }) {
  const codeEvents = events.filter(
    (e) => e.type === "code_token" || e.type === "review_token"
  );
  if (codeEvents.length === 0) return null;

  const codeContent = codeEvents
    .map((e) => e.token || "")
    .join("");

  return (
    <div className="rounded-lg border border-white/[0.04] bg-black/30 p-4 mono text-[12px] text-foreground/60 overflow-x-auto whitespace-pre-wrap max-h-80 overflow-y-auto">
      {codeContent}
    </div>
  );
}

function FeedbackModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (feedback: string) => void;
}) {
  const [text, setText] = useState("");

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-xl border border-white/8 bg-card p-6"
      >
        <h3 className="display text-lg font-semibold">Refine the MVP</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell the council what to change.
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="mt-4 w-full rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/50 focus:border-white/15"
          placeholder="Change the hero copy, add a pricing page…"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSubmit(text);
              setText("");
              onClose();
            }}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 transition"
          >
            Submit
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* --------------------------------- Stages -------------------------------- */

const STAGE_LABELS = ["Ideation", "Market Research", "Prototyping"];

function StageIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1">
      {STAGE_LABELS.map((label, i) => (
        <div key={label} className="flex items-center gap-1">
          <div
            className={`grid h-6 w-6 place-items-center rounded-full mono text-[10px] font-bold transition-all ${
              i < current
                ? "bg-[#28c840] text-white"
                : i === current
                  ? "bg-foreground text-background"
                  : "border border-white/10 text-muted-foreground"
            }`}
          >
            {i < current ? "✓" : i + 1}
          </div>
          <span
            className={`text-[12px] ${
              i <= current ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {label}
          </span>
          {i < STAGE_LABELS.length - 1 && (
            <div className="mx-2 h-px w-6 bg-white/8" />
          )}
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------- Main --------------------------------- */

export default function Trial() {
  const { idea } = Route.useSearch();
  const navigate = useNavigate();
  const { events, loading, startStream, reset } = useAgentStream();
  const [stage, setStage] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const hasStarted = useRef(false);

  const grouped = useMemo(() => groupEvents(events), [events]);

  const verdicts = useMemo(
    () =>
      events.filter(
        (e: StreamEvent) => e.type === "verdict" || e.type === "final_verdict"
      ),
    [events]
  );

  const startIdeation = useCallback(
    (input: string) => {
      reset();
      setStage(0);
      startStream("/api/ideation", { idea: input });
    },
    [reset, startStream]
  );

  const startResearch = useCallback(() => {
    const lastVerdict = verdicts[verdicts.length - 1];
    reset();
    setStage(1);
    startStream("/api/research", {
      idea: idea || "",
      ideation_summary: lastVerdict?.content || "",
    });
  }, [verdicts, reset, startStream, idea]);

  const startPrototyping = useCallback(() => {
    reset();
    setStage(2);
    startStream("/api/prototyping", {
      idea: idea || "",
      research_summary:
        events
          .filter((e: StreamEvent) => e.type === "research_summary")
          .map((e: StreamEvent) => e.content as string)
          .join("\n") || "",
    });
  }, [reset, startStream, idea, events]);

  useEffect(() => {
    if (idea && !hasStarted.current) {
      hasStarted.current = true;
      startIdeation(idea);
    }
  }, [idea, startIdeation]);

  const stageComplete = events.some((e: StreamEvent) => e.type === "stage_complete");

  const handleNext = () => {
    if (stage === 0 && stageComplete) startResearch();
    else if (stage === 1 && stageComplete) startPrototyping();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.04] bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate({ to: "/" })}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm">Back</span>
          </button>
          <StageIndicator current={stage} />
          <div className="mono text-[11px] text-muted-foreground">
            {loading ? (
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#febc2e]/40" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#febc2e]/70" />
                </span>
                Processing
              </span>
            ) : stageComplete ? (
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#28c840]/70" />
                Complete
              </span>
            ) : (
              "Ready"
            )}
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Idea display */}
        {idea && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mb-6 rounded-lg border border-white/[0.04] bg-white/[0.02] p-4"
          >
            <div className="mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              Idea on Trial
            </div>
            <div className="text-foreground/90">{idea}</div>
          </motion.div>
        )}

        {/* No idea state */}
        {!idea && !loading && events.length === 0 && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="text-center py-20"
          >
            <h2 className="display text-2xl font-semibold">
              No idea submitted
            </h2>
            <p className="mt-2 text-muted-foreground">
              Go back and enter a startup idea to begin.
            </p>
            <button
              onClick={() => navigate({ to: "/" })}
              className="mt-6 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-white/90 transition"
            >
              ← Back to Court
            </button>
          </motion.div>
        )}

        {/* Stream panel */}
        {(events.length > 0 || loading) && (
          <div className="rounded-xl border border-white/[0.04] bg-card/40 overflow-hidden">
            <div className="border-b border-white/[0.04] px-4 py-2.5 flex items-center justify-between">
              <span className="mono text-[11px] text-muted-foreground">
                {STAGE_LABELS[stage]} · Agent Stream
              </span>
              <span className="mono text-[10px] text-muted-foreground">
                {grouped.length} messages
              </span>
            </div>
            <div className="max-h-[60vh]">
              <StreamPanel messages={grouped} loading={loading} />
            </div>
          </div>
        )}

        {/* Verdict */}
        {verdicts.length > 0 && (
          <div className="mt-6">
            <VerdictCard
              content={verdicts[verdicts.length - 1].content as string}
            />
          </div>
        )}

        {/* Research cards */}
        {stage >= 1 && (
          <div className="mt-6">
            <ResearchCards events={events} />
          </div>
        )}

        {/* MVP code */}
        {stage === 2 && (
          <div className="mt-6">
            <MvpPanel events={events} />
          </div>
        )}

        {/* Action buttons */}
        {stageComplete && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 flex items-center gap-3"
          >
            {stage < 2 && (
              <button
                onClick={handleNext}
                className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-white/90 transition"
              >
                Continue to {STAGE_LABELS[stage + 1]} →
              </button>
            )}
            {stage === 2 && (
              <button
                onClick={() => setShowFeedback(true)}
                className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-white/90 transition"
              >
                Refine MVP
              </button>
            )}
            <button
              onClick={() => navigate({ to: "/" })}
              className="rounded-lg border border-white/10 px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground transition"
            >
              New Trial
            </button>
          </motion.div>
        )}
      </div>

      <FeedbackModal
        open={showFeedback}
        onClose={() => setShowFeedback(false)}
        onSubmit={(feedback) => {
          reset();
          startStream("/api/prototyping", {
            idea: idea || "",
            feedback,
          });
        }}
      />
    </div>
  );
}
