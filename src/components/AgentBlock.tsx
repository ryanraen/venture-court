"use client";

import { useState } from "react";
import MarkdownBody from "./MarkdownBody";

interface AgentBlockProps {
  label: string;
  content: string;
  isActive: boolean;
  isDone: boolean;
}

export default function AgentBlock({
  label,
  content,
  isActive,
  isDone,
}: AgentBlockProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="border-b border-neutral-800/60 last:border-0">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-neutral-900/50 transition-colors"
      >
        <span
          className={`inline-block h-1.5 w-1.5 rounded-full flex-shrink-0 ${
            isActive
              ? "bg-white animate-pulse"
              : isDone
                ? "bg-neutral-500"
                : "bg-neutral-700"
          }`}
        />
        <span
          className={`text-sm font-medium flex-1 ${
            isActive ? "text-white" : "text-neutral-400"
          }`}
        >
          {label}
        </span>
        <svg
          className={`h-3 w-3 text-neutral-600 transition-transform ${
            collapsed ? "-rotate-90" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {!collapsed && content && (
        <div className="px-4 pb-3 pl-8">
          <div className="inline-block max-w-full min-w-0 text-sm">
            <MarkdownBody>{content}</MarkdownBody>
            {isActive && (
              <span
                className="ml-0.5 inline-block h-4 w-1 animate-pulse bg-white align-[-0.15em]"
                aria-hidden
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
