import { useState } from "react";
import { StreamEvent } from "../hooks/useAgentStream";

interface Props {
  events: StreamEvent[];
  agent: string;
}

const PERSONA_ICONS: Record<string, string> = {
  "The Contrarian": "🎯",
  "The First Principles Thinker": "🔬",
  "The Expansionist": "🚀",
  "The Outsider": "👀",
  "The Executor": "⚡",
};

export default function CouncilDebate({ events, agent }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  // Group by persona
  const personaOutputs = new Map<string, string>();
  for (const event of events) {
    if (event.agent === agent && event.persona && event.token) {
      const current = personaOutputs.get(event.persona) || "";
      personaOutputs.set(event.persona, current + event.token);
    }
  }

  if (personaOutputs.size === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {agent} Council Debate
      </h4>
      {Array.from(personaOutputs.entries()).map(([persona, content]) => (
        <div
          key={persona}
          className="border border-gray-800 rounded-lg overflow-hidden"
        >
          <button
            onClick={() =>
              setExpanded(expanded === persona ? null : persona)
            }
            className="w-full px-3 py-2 flex items-center justify-between bg-gray-900/50 hover:bg-gray-800/50 transition-colors"
          >
            <span className="flex items-center gap-2 text-sm">
              <span>{PERSONA_ICONS[persona] || "💭"}</span>
              <span className="text-gray-300">{persona}</span>
            </span>
            <span className="text-gray-500 text-xs">
              {expanded === persona ? "▼" : "▶"}
            </span>
          </button>
          {expanded === persona && (
            <div className="px-3 py-2 text-sm text-gray-400 font-mono whitespace-pre-wrap border-t border-gray-800 max-h-48 overflow-y-auto">
              {content}
            </div>
          )}
          {expanded !== persona && (
            <div className="px-3 py-1 text-xs text-gray-500 truncate">
              {content.slice(0, 100)}...
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
