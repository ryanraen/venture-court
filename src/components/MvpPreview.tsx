"use client";

import { useCallback } from "react";
import { PrototypeFiles } from "@/lib/types";

function escapeScriptClose(js: string): string {
  return js.replace(/<\/script/gi, "<\\/script");
}

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
  const safeJs = escapeScriptClose(files.js);
  const srcDoc = `<!DOCTYPE html>
<html>
<head><style>${files.css}</style></head>
<body>${files.html.replace(/<!DOCTYPE html>|<\/?html>|<\/?head>|<meta[^>]*>|<title>[^<]*<\/title>|<link[^>]*>/gi, "")}
<script>${safeJs}</script>
</body>
</html>`;

  const handleDownload = useCallback(() => {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>MVP Prototype</title>
<style>
${files.css}
</style>
</head>
<body>
${files.html.replace(/<!DOCTYPE html>|<\/?html>|<\/?head>|<meta[^>]*>|<title>[^<]*<\/title>|<link[^>]*>/gi, "")}
<script>
${escapeScriptClose(files.js)}
</script>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prototype.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [files]);

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
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-neutral-600">sandboxed</span>
          <button
            type="button"
            onClick={handleDownload}
            aria-label="Download prototype"
            className="flex items-center justify-center rounded-md p-1.5 text-neutral-500 transition-colors hover:bg-neutral-900 hover:text-neutral-200"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V3" />
            </svg>
          </button>
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
