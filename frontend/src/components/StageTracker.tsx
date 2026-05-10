interface Props {
  currentStage: number;
  onStageClick?: (stage: number) => void;
}

const STAGES = [
  { name: "Ideation", color: "amber" },
  { name: "Market Research", color: "blue" },
  { name: "Prototyping", color: "emerald" },
];

export default function StageTracker({ currentStage, onStageClick }: Props) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {STAGES.map((stage, idx) => {
          const isComplete = idx < currentStage;
          const isActive = idx === currentStage;
          const stageNum = idx + 1;

          return (
            <div key={stage.name} className="flex items-center flex-1">
              <button
                onClick={() => isComplete && onStageClick?.(idx)}
                disabled={!isComplete}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  isActive
                    ? `bg-${stage.color}-500/20 border border-${stage.color}-500 text-${stage.color}-400`
                    : isComplete
                      ? "bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700 cursor-pointer"
                      : "bg-gray-900 border border-gray-800 text-gray-600"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isComplete
                      ? "bg-green-500 text-white"
                      : isActive
                        ? `bg-${stage.color}-500 text-white`
                        : "bg-gray-800 text-gray-500"
                  }`}
                >
                  {isComplete ? "✓" : stageNum}
                </span>
                <span className="text-sm font-medium hidden sm:inline">
                  {stage.name}
                </span>
              </button>
              {idx < STAGES.length - 1 && (
                <div
                  className={`flex-1 h-px mx-2 ${
                    idx < currentStage ? "bg-green-500" : "bg-gray-800"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
