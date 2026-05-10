import { useState, useCallback, useRef } from "react";

export interface StreamEvent {
  agent?: string;
  persona?: string;
  type?: string;
  token?: string;
  content?: unknown;
  message?: string;
  name?: string;
  proceed_prompt?: string;
  mvp_port?: number;
  mvp_url?: string;
  [key: string]: unknown;
}

export function useAgentStream() {
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
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
    async (url: string, body: object) => {
      setEvents([]);
      bufferRef.current = [];
      setIsStreaming(true);

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const event: StreamEvent = JSON.parse(line.slice(6));
                enqueue(event);
              } catch {
                // Skip malformed events
              }
            }
          }
        }
      } catch (err) {
        console.error("Stream error:", err);
      }

      // Flush any remaining buffered events
      if (bufferRef.current.length > 0) {
        const remaining = bufferRef.current;
        bufferRef.current = [];
        setEvents((prev) => [...prev, ...remaining]);
      }
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      setIsStreaming(false);
    },
    [enqueue]
  );

  const reset = useCallback(() => {
    setEvents([]);
    bufferRef.current = [];
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  return { events, isStreaming, startStream, reset };
}
