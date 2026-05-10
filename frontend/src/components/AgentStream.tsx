import { useEffect, useRef, useMemo } from "react";
import { StreamEvent } from "../hooks/useAgentStream";

interface Props {
  events: StreamEvent[];
  isStreaming: boolean;
}

const AGENT_COLORS: Record<string, string> = {
  CEO: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  CMO: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  CTO: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  Contrarian: "text-rose-400 bg-rose-400/10 border-rose-400/30",
  SWE1: "text-violet-400 bg-violet-400/10 border-violet-400/30",
  SWE2: "text-purple-400 bg-purple-400/10 border-purple-400/30",
};

const AGENT_BADGE_COLORS: Record<string, string> = {
  CEO: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  CMO: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  CTO: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  Contrarian: "bg-rose-500/20 text-rose-300 border-rose-500/40",
  SWE1: "bg-violet-500/20 text-violet-300 border-violet-500/40",
  SWE2: "bg-purple-500/20 text-purple-300 border-purple-500/40",
};

interface GroupedMessage {
  id: string;
  agent: string;
  persona?: string;
  content: string;
  type?: string;
}

function groupEvents(events: StreamEvent[]): GroupedMessage[] {
  const messages: GroupedMessage[] = [];
  let currentAgent = "";
  let currentPersona = "";
  let currentContent = "";
  let currentType = "";
  let groupIndex = 0;

  const flushCurrent = () => {
    if (currentContent) {
      messages.push({
        id: `${currentAgent}-${currentPersona}-${groupIndex}`,
        agent: currentAgent,
        persona: currentPersona || undefined,
        content: currentContent,
        type: currentType,
      });
      groupIndex++;
    }
    currentContent = "";
  };

  for (const event of events) {
    if (event.type === "stage_complete") continue;

    if (event.token && event.agent) {
      const key = `${event.agent}-${event.persona || ""}`;
      const prevKey = `${currentAgent}-${currentPersona}`;

      if (currentContent && key === prevKey) {
        currentContent += event.token;
      } else {
        flushCurrent();
        currentAgent = event.agent;
        currentPersona = (event.persona as string) || "";
        currentContent = event.token;
        currentType = event.type || "";
      }
    } else if (
      event.type === "verdict" ||
      event.type === "final_verdict" ||
      event.type === "research_summary"
    ) {
      flushCurrent();
      messages.push({
        id: `verdict-${event.agent}-${groupIndex}`,
        agent: event.agent || "System",
        content: event.content as string,
        type: event.type,
      });
      groupIndex++;
    } else if (event.type === "nia_result") {
      flushCurrent();
      messages.push({
        id: `nia-${event.agent}-${groupIndex}`,
        agent: event.agent || "System",
        content: `[Research Data Retrieved] ${JSON.stringify(event.content, null, 2).slice(0, 200)}...`,
        type: "nia_result",
      });
      groupIndex++;
    }
  }

  if (currentContent) {
    messages.push({
      id: `${currentAgent}-${currentPersona}-${groupIndex}`,
      agent: currentAgent,
      persona: currentPersona || undefined,
      content: currentContent,
      type: currentType,
    });
  }

  return messages;
}

export default function AgentStream({ events, isStreaming }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);

  const groupedMessages = useMemo(() => groupEvents(events), [events]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
      shouldAutoScroll.current = atBottom;
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (shouldAutoScroll.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [groupedMessages]);

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300">
          Council Deliberation
        </h3>
        {isStreaming && (
          <span className="flex items-center gap-2 text-xs text-green-400">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Live
          </span>
        )}
      </div>

      <div
        ref={scrollRef}
        className="h-96 overflow-y-auto p-4 space-y-3 scrollbar-thin"
      >
        {groupedMessages.map((msg) => (
          <div
            key={msg.id}
            className={`rounded-lg border p-3 ${AGENT_COLORS[msg.agent] || "text-gray-300 bg-gray-800/50 border-gray-700"}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full border ${AGENT_BADGE_COLORS[msg.agent] || "bg-gray-700 text-gray-300 border-gray-600"}`}
              >
                {msg.agent}
              </span>
              {msg.persona && (
                <span className="text-xs text-gray-400 italic">
                  {msg.persona}
                </span>
              )}
            </div>
            <p className="text-sm font-mono leading-relaxed whitespace-pre-wrap">
              {msg.content}
            </p>
          </div>
        ))}

        {isStreaming && groupedMessages.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-3" />
              <p>Agents are deliberating...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
