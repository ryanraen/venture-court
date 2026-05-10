import { useState, useCallback, useRef } from "react";

export interface StreamEvent {
  type: string;
  agent?: string;
  persona?: string;
  token?: string;
  content?: unknown;
  [key: string]: unknown;
}

export function useAgentStream() {
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const bufferRef = useRef<StreamEvent[]>([]);
  const rafRef = useRef<number | null>(null);

  const flushBuffer = useCallback(() => {
    rafRef.current = null;
    if (bufferRef.current.length > 0) {
      const batch = bufferRef.current;
      bufferRef.current = [];
      setEvents((prev) => [...prev, ...batch]);
    }
  }, []);

  const enqueue = useCallback(
    (event: StreamEvent) => {
      bufferRef.current.push(event);
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(flushBuffer);
      }
    },
    [flushBuffer]
  );

  const startStream = useCallback(
    async (url: string, body: Record<string, unknown>) => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          setLoading(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const dataStr = line.slice(6).trim();
            if (dataStr === "[DONE]") continue;
            try {
              const event: StreamEvent = JSON.parse(dataStr);
              enqueue(event);
            } catch {
              // skip malformed lines
            }
          }
        }

        if (buffer.startsWith("data: ")) {
          const dataStr = buffer.slice(6).trim();
          if (dataStr && dataStr !== "[DONE]") {
            try {
              const event: StreamEvent = JSON.parse(dataStr);
              enqueue(event);
            } catch {
              // skip
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("Stream error:", err);
      } finally {
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
          flushBuffer();
        }
        setLoading(false);
      }
    },
    [enqueue, flushBuffer]
  );

  const reset = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    bufferRef.current = [];
    rafRef.current = null;
    setEvents([]);
    setLoading(false);
  }, []);

  return { events, loading, startStream, reset };
}
