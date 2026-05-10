import { useState } from "react";

interface Props {
  onSubmit: (idea: string) => void;
  disabled?: boolean;
}

export default function IdeaInput({ onSubmit, disabled }: Props) {
  const [idea, setIdea] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim()) {
      onSubmit(idea.trim());
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent mb-3">
          Venture Court
        </h1>
        <p className="text-gray-400 text-lg">
          Your AI startup council — from raw idea to working MVP
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Describe your startup idea... e.g. 'A marketplace for freelance AI prompt engineers'"
            className="w-full h-32 px-5 py-4 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-lg"
            disabled={disabled}
          />
        </div>
        <button
          type="submit"
          disabled={disabled || !idea.trim()}
          className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 text-lg shadow-lg shadow-purple-500/20"
        >
          {disabled ? "Council in session..." : "Summon the Council"}
        </button>
      </form>

      <div className="mt-8 grid grid-cols-3 gap-4 text-center text-sm text-gray-500">
        <div className="p-3 rounded-lg bg-gray-900/50">
          <div className="text-amber-400 font-medium">Stage 1</div>
          <div>Ideation</div>
        </div>
        <div className="p-3 rounded-lg bg-gray-900/50">
          <div className="text-blue-400 font-medium">Stage 2</div>
          <div>Market Research</div>
        </div>
        <div className="p-3 rounded-lg bg-gray-900/50">
          <div className="text-emerald-400 font-medium">Stage 3</div>
          <div>Prototyping</div>
        </div>
      </div>
    </div>
  );
}
