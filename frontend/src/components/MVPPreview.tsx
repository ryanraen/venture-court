import { StreamEvent } from "../hooks/useAgentStream";

interface Props {
  events: StreamEvent[];
  isStreaming: boolean;
  mvpUrl?: string;
  onFeedback: () => void;
  onApprove: () => void;
}

export default function MVPPreview({
  events,
  isStreaming,
  mvpUrl,
  onFeedback,
  onApprove,
}: Props) {
  const buildTokens = events
    .filter(
      (e) =>
        e.type === "build_token" ||
        e.type === "fix_token" ||
        e.type === "review_token"
    )
    .map((e) => e.token || "")
    .join("");

  const files = events.filter((e) => e.type === "file");
  const isApproved = events.some((e) => e.type === "approved");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      {/* Left pane: Build stream */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-300">Build Log</h3>
          {isStreaming && (
            <span className="flex items-center gap-2 text-xs text-violet-400">
              <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
              Building
            </span>
          )}
          {isApproved && (
            <span className="text-xs text-green-400 font-medium">
              ✓ Approved
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
          {buildTokens && (
            <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap mb-4">
              {buildTokens}
            </pre>
          )}

          {files.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-gray-500 uppercase font-semibold">
                Generated Files
              </div>
              {files.map((f, idx) => (
                <details
                  key={idx}
                  className="bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  <summary className="px-3 py-2 text-sm text-violet-300 cursor-pointer hover:bg-gray-800/80">
                    {f.name as string}
                  </summary>
                  <pre className="px-3 py-2 text-xs text-gray-400 overflow-x-auto border-t border-gray-700">
                    {(f.content as string)?.slice(0, 500)}
                  </pre>
                </details>
              ))}
            </div>
          )}

          {!buildTokens && !isStreaming && (
            <div className="flex items-center justify-center h-full text-gray-600 text-sm">
              Waiting for build to start...
            </div>
          )}
        </div>
      </div>

      {/* Right pane: Preview iframe */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-sm font-semibold text-gray-300">MVP Preview</h3>
        </div>

        <div className="flex-1 relative">
          {mvpUrl ? (
            <iframe
              src={mvpUrl}
              className="w-full h-full min-h-[400px] border-0"
              title="MVP Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-full min-h-[400px] text-gray-600">
              <div className="text-center">
                <div className="text-4xl mb-2">🏗️</div>
                <p className="text-sm">
                  {isStreaming
                    ? "Building your MVP..."
                    : "MVP preview will appear here"}
                </p>
              </div>
            </div>
          )}
        </div>

        {mvpUrl && (
          <div className="px-4 py-3 border-t border-gray-800 flex gap-3">
            <button
              onClick={onApprove}
              className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg transition-colors text-sm"
            >
              Looks good! ✓
            </button>
            <button
              onClick={onFeedback}
              className="flex-1 py-2 px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-lg transition-colors border border-gray-700 text-sm"
            >
              Not quite — give feedback
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
