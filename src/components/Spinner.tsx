"use client";

export default function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-4">
      <svg
        className="h-4 w-4 animate-spin text-neutral-400"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      {label && (
        <span className="text-xs text-neutral-500">{label}</span>
      )}
    </div>
  );
}
