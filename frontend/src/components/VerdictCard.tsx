interface Props {
  agent: string;
  verdict: string;
  type: "final_verdict" | "research_summary" | "verdict";
  proceedLabel?: string;
  onProceed?: () => void;
  onStop?: () => void;
}

export default function VerdictCard({
  agent,
  verdict,
  type,
  proceedLabel,
  onProceed,
  onStop,
}: Props) {
  const isMainVerdict = type === "final_verdict" || type === "research_summary";

  return (
    <div
      className={`rounded-xl border p-6 ${
        isMainVerdict
          ? "bg-gradient-to-br from-amber-500/10 to-purple-500/10 border-amber-500/30"
          : "bg-gray-900 border-gray-700"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="px-2 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full border border-amber-500/40">
          {agent}
        </span>
        {isMainVerdict && (
          <span className="text-xs text-amber-400 font-medium uppercase tracking-wider">
            {type === "final_verdict" ? "Final Verdict" : "Research Summary"}
          </span>
        )}
      </div>

      <p className="text-gray-200 leading-relaxed whitespace-pre-wrap mb-4">
        {verdict}
      </p>

      {isMainVerdict && onProceed && (
        <div className="flex gap-3">
          <button
            onClick={onProceed}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-purple-500/20"
          >
            {proceedLabel || "Proceed →"}
          </button>
          {onStop && (
            <button
              onClick={onStop}
              className="py-3 px-6 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-lg transition-colors border border-gray-700"
            >
              Stop here
            </button>
          )}
        </div>
      )}
    </div>
  );
}
