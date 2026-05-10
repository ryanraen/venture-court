import { SSEEvent } from "./types";

export function encodeSSE(event: SSEEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

/**
 * Stream a string chunk-by-chunk with small delays to simulate
 * token-level LLM output.
 */
export async function streamText(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  encoder: TextEncoder,
  agent: string,
  text: string,
  chunkSize = 12,
  delayMs = 30
): Promise<void> {
  for (let i = 0; i < text.length; i += chunkSize) {
    const chunk = text.slice(i, i + chunkSize);
    await writer.write(
      encoder.encode(encodeSSE({ type: "chunk", content: chunk }))
    );
    await sleep(delayMs);
  }
  void agent;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createSSEStream(): {
  stream: ReadableStream<Uint8Array>;
  writer: WritableStreamDefaultWriter<Uint8Array>;
  encoder: TextEncoder;
} {
  const encoder = new TextEncoder();
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();
  return { stream: readable, writer, encoder };
}
