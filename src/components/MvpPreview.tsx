"use client";

import { PrototypeFiles } from "@/lib/types";

export default function MvpPreview({ files }: { files: PrototypeFiles }) {
  const srcDoc = `<!DOCTYPE html>
<html>
<head><style>${files.css}</style></head>
<body>${files.html.replace(/<!DOCTYPE html>|<\/?html>|<\/?head>|<meta[^>]*>|<title>[^<]*<\/title>|<link[^>]*>/gi, "")}
<script>${files.js}<\/script>
</body>
</html>`;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800">
        <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
          MVP Preview
        </span>
        <span className="text-[10px] text-neutral-600">sandboxed</span>
      </div>
      <div className="flex-1 bg-black">
        <iframe
          srcDoc={srcDoc}
          sandbox="allow-scripts"
          className="w-full h-full border-0"
          title="MVP Preview"
        />
      </div>
    </div>
  );
}
