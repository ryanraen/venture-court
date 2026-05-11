"use client";

import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const components: Components = {
  h1: (props) => (
    <h1
      className="mt-4 text-lg font-bold tracking-tight text-white first:mt-0"
      {...props}
    />
  ),
  h2: (props) => (
    <h2 className="mt-4 text-base font-semibold text-white first:mt-0" {...props} />
  ),
  h3: (props) => (
    <h3
      className="mt-3 text-sm font-semibold tracking-tight text-neutral-100 first:mt-0"
      {...props}
    />
  ),
  p: (props) => (
    <p className="my-2 text-sm leading-relaxed text-neutral-300" {...props} />
  ),
  strong: (props) => <strong className="font-semibold text-white" {...props} />,
  em: (props) => <em className="italic text-neutral-200" {...props} />,
  ul: (props) => (
    <ul className="my-2 list-disc space-y-1 pl-5 text-sm text-neutral-300" {...props} />
  ),
  ol: (props) => (
    <ol className="my-2 list-decimal space-y-1 pl-5 text-sm text-neutral-300" {...props} />
  ),
  li: (props) => (
    <li className="leading-relaxed [&>p]:my-0" {...props} />
  ),
  a: (props) => (
    <a
      className="text-neutral-200 underline decoration-neutral-600 underline-offset-2 hover:text-white"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  blockquote: (props) => (
    <blockquote
      className="my-2 border-l-2 border-neutral-600 py-0.5 pl-3 text-sm text-neutral-400 italic"
      {...props}
    />
  ),
  hr: () => <hr className="my-4 border-neutral-800" />,
  code: ({ className, children, ...props }) => {
    const inline = !className;
    if (inline) {
      return (
        <code
          className="rounded bg-neutral-800/90 px-1.5 py-0.5 font-mono text-[0.85em] text-neutral-200"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code className={`${className} font-mono text-xs`} {...props}>
        {children}
      </code>
    );
  },
  pre: (props) => (
    <pre
      className="my-2 overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-xs text-neutral-300"
      {...props}
    />
  ),
  table: (props) => (
    <div className="my-3 overflow-x-auto">
      <table className="w-full border-collapse text-left text-xs" {...props} />
    </div>
  ),
  thead: (props) => <thead className="border-b border-neutral-800" {...props} />,
  th: (props) => (
    <th className="border border-neutral-800 bg-neutral-900 px-2 py-1.5 font-semibold text-neutral-200" {...props} />
  ),
  td: (props) => (
    <td className="border border-neutral-800 px-2 py-1.5 text-neutral-300" {...props} />
  ),
  tr: (props) => <tr className="border-neutral-800" {...props} />,
};

export default function MarkdownBody({ children }: { children: string }) {
  return (
    <div className="markdown-body max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
