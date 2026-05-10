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
          className="flex items-center justify-center rounded-lg px-2 py-2 font-semibold tabular-nums leading-none text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-white"
        >
          <span aria-hidden className="text-sm tracking-tight">
            {"<<"}
          </span>
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
            className="flex items-center justify-center rounded-md px-2 py-1.5 font-semibold tabular-nums leading-none text-neutral-500 transition-colors hover:bg-neutral-900 hover:text-neutral-200"
          >
            <span aria-hidden className="text-xs tracking-tight">
              {">>"}
            </span>
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
