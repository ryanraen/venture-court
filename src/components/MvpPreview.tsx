"use client";

import { PrototypeFiles } from "@/lib/types";

type Props = {
  files: PrototypeFiles;
  minimized: boolean;
  onMinimize: () => void;
  onExpand: () => void;
};

export default function MvpPreview({
  files,
  minimized,
  onMinimize,
  onExpand,
}: Props) {
  const srcDoc = `<!DOCTYPE html>
<html>
<head><style>${files.css}</style></head>
<body>${files.html.replace(/<!DOCTYPE html>|<\/?html>|<\/?head>|<meta[^>]*>|<title>[^<]*<\/title>|<link[^>]*>/gi, "")}
<script>${files.js}<\/script>
</body>
</html>`;

  if (minimized) {
    return (
      <div className="flex h-full w-full flex-col items-center bg-black py-3">
        <button
          type="button"
          onClick={onExpand}
          aria-label="Expand MVP preview"
          className="flex items-center justify-center rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-white"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>
        <span
          className="mt-4 select-none px-1 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-600 [writing-mode:vertical-rl] rotate-180"
        >
          MVP
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-neutral-800 px-3 py-2">
        <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">
          MVP Preview
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-neutral-600">sandboxed</span>
          <button
            type="button"
            onClick={onMinimize}
            aria-label="Minimize MVP preview"
            className="flex items-center justify-center rounded-md p-1.5 text-neutral-500 transition-colors hover:bg-neutral-900 hover:text-neutral-200"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 bg-black">
        <iframe
          srcDoc={srcDoc}
          sandbox="allow-scripts"
          className="h-full w-full border-0"
          title="MVP Preview"
        />
      </div>
    </div>
  );
}
