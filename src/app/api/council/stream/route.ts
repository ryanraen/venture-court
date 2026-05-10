import { NextRequest } from "next/server";
import { getSession, updateStage, updateArtifact } from "@/lib/session";
import { createSSEStream, encodeSSE, streamText, sleep } from "@/lib/stream";
import { getCouncil, getCEO, getSWE1, getSWE2 } from "@/lib/llm";
import { getResearch } from "@/lib/nia";
import { Stage } from "@/lib/types";

/** Next.js closes the SSE when the client disconnects — writes then reject (e.g. ResponseAborted). */
function isConnectionLost(err: unknown): boolean {
  if (err == null) return false;
  const e = err as { name?: string; message?: string; constructor?: { name?: string } };
  if (e.name === "ResponseAborted" || e.name === "AbortError") return true;
  if (e.constructor?.name === "ResponseAborted") return true;
  const msg = typeof e.message === "string" ? e.message : "";
  if (/ResponseAborted|Invalid state.*WritableStream|closed/i.test(msg))
    return true;
  return false;
}

type Action =
  | "ideation_cmo"
  | "ideation_cto"
  | "ideation_ceo"
  | "market_research"
  | "prototyping_build"
  | "prototyping_review";

export async function POST(req: NextRequest) {
  const { sessionId, action } = (await req.json()) as {
    sessionId: string;
    action: Action;
  };

  const session = getSession(sessionId);
  if (!session) {
    return new Response(JSON.stringify({ error: "session not found" }), {
      status: 404,
    });
  }

  const { stream, writer, encoder } = createSSEStream();

  const write = async (data: Parameters<typeof encodeSSE>[0]) => {
    await writer.write(encoder.encode(encodeSSE(data)));
  };

  // Run the pipeline in the background
  (async () => {
    try {
      switch (action) {
        case "ideation_cmo":
        case "ideation_cto": {
          const role = action === "ideation_cmo" ? "CMO" : "CTO";
          const stage: Stage = action === "ideation_cmo" ? "ideation_cmo" : "ideation_cto";
          updateStage(sessionId, stage);

          const { source, council } = getCouncil(
            role as "CMO" | "CTO",
            session.idea
          );
          await write({ type: "meta", source });

          for (const p of council.personas) {
            await write({
              type: "agent_start",
              agent: `${role}`,
              persona: p.persona,
              label: `${role} — ${p.label}`,
            });
            await streamText(writer, encoder, p.persona, p.content);
            await write({ type: "agent_done", agent: p.persona });
            await sleep(200);
          }

          // Chair summary
          await write({
            type: "agent_start",
            agent: `${role}_chair`,
            label: `${role} — Chair Summary`,
          });
          await streamText(writer, encoder, `${role}_chair`, council.chair);
          await write({ type: "agent_done", agent: `${role}_chair` });

          updateArtifact(
            sessionId,
            role.toLowerCase() as "cmo" | "cto",
            council.chair
          );

          if (action === "ideation_cto") {
            await write({
              type: "gate",
              stage: "gate_research",
              prompt:
                "Ideation phase complete. The CEO will now synthesize the CMO and CTO findings. Proceed to CEO verdict?",
            });
          }

          await write({ type: "stage_complete", stage });
          break;
        }

        case "ideation_ceo": {
          updateStage(sessionId, "ideation_ceo");
          const { source, verdict } = getCEO(
            session.idea,
            session.artifacts.cmo || "",
            session.artifacts.cto || ""
          );
          await write({ type: "meta", source });
          await write({
            type: "agent_start",
            agent: "CEO",
            label: "CEO — Final Verdict",
          });
          await streamText(writer, encoder, "CEO", verdict);
          await write({ type: "agent_done", agent: "CEO" });

          updateArtifact(sessionId, "ceo", verdict);

          await write({
            type: "gate",
            stage: "gate_research",
            prompt:
              "Here is the final verdict from the Ideation phase. Would you like to proceed to the Market Research stage?",
          });
          await write({ type: "stage_complete", stage: "ideation_ceo" });
          break;
        }

        case "market_research": {
          updateStage(sessionId, "market_research");
          const { source, data } = await getResearch(session.idea);
          await write({ type: "meta", source });

          await write({
            type: "agent_start",
            agent: "researcher",
            label: "Market Research — Scanning Sources",
          });
          await streamText(
            writer,
            encoder,
            "researcher",
            `Searching for market signals related to "${session.idea}"...\n\nFound ${data.cards.length} viral content pieces across TikTok, YouTube, and X.\nIdentified ${data.competitors.length} direct competitors.\n\nCompiling synthesis report...`
          );
          await write({ type: "agent_done", agent: "researcher" });
          await sleep(300);

          await write({ type: "research_data", data });

          // Synthesis narrative
          await write({
            type: "agent_start",
            agent: "synthesis",
            label: "Market Research — Synthesis",
          });
          await streamText(writer, encoder, "synthesis", data.synthesis);
          await write({ type: "agent_done", agent: "synthesis" });
          await sleep(200);

          // Contrarian pass
          await write({
            type: "agent_start",
            agent: "contrarian",
            label: "Market Research — Contrarian Analysis",
          });
          await streamText(writer, encoder, "contrarian", data.contrarian);
          await write({ type: "agent_done", agent: "contrarian" });

          updateArtifact(sessionId, "research", data);

          await write({
            type: "gate",
            stage: "gate_prototype",
            prompt:
              "Market research complete. Would you like to proceed to the Prototyping stage?",
          });
          await write({ type: "stage_complete", stage: "market_research" });
          break;
        }

        case "prototyping_build": {
          updateStage(sessionId, "prototyping_build");
          const { source, narrative, files } = getSWE1(session.idea);
          await write({ type: "meta", source });

          await write({
            type: "agent_start",
            agent: "SWE1",
            label: "SWE 1 — Building MVP",
          });
          await streamText(writer, encoder, "SWE1", narrative, 15, 25);
          await write({ type: "agent_done", agent: "SWE1" });

          updateArtifact(sessionId, "prototype", files);
          await write({ type: "prototype_ready", files });
          await write({ type: "stage_complete", stage: "prototyping_build" });
          break;
        }

        case "prototyping_review": {
          updateStage(sessionId, "prototyping_review");
          const { source, review } = getSWE2(session.idea);
          await write({ type: "meta", source });

          await write({
            type: "agent_start",
            agent: "SWE2",
            label: "SWE 2 — Code Review",
          });
          await streamText(writer, encoder, "SWE2", review, 15, 25);
          await write({ type: "agent_done", agent: "SWE2" });

          updateArtifact(sessionId, "review", review);
          await write({ type: "stage_complete", stage: "complete" as Stage });
          break;
        }
      }
    } catch (err) {
      if (isConnectionLost(err)) return;
      try {
        await write({
          type: "error",
          message: err instanceof Error ? err.message : "Unknown error",
        });
      } catch {
        /* stream already closed */
      }
    } finally {
      try {
        await writer.close();
      } catch {
        // Writable already closed (client disconnected, navigation, or stream drained)
      }
    }
  })().catch((err) => {
    if (!isConnectionLost(err)) console.error("SSE pipeline error:", err);
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
