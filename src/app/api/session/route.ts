import { NextRequest, NextResponse } from "next/server";
import { createSession, getSession, updateStage } from "@/lib/session";
import { Stage } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { idea } = body;
  if (!idea || typeof idea !== "string") {
    return NextResponse.json({ error: "idea is required" }, { status: 400 });
  }
  const trimmed = idea.trim();
  if (!trimmed) {
    return NextResponse.json({ error: "idea is required" }, { status: 400 });
  }
  if (trimmed.length > 1000) {
    return NextResponse.json({ error: "idea must be 1000 characters or fewer" }, { status: 400 });
  }
  const session = createSession(trimmed);
  return NextResponse.json(session);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { sessionId, stage } = body as { sessionId: string; stage: Stage };
  if (!sessionId || !stage) {
    return NextResponse.json(
      { error: "sessionId and stage required" },
      { status: 400 }
    );
  }
  const session = updateStage(sessionId, stage);
  if (!session) {
    return NextResponse.json({ error: "session not found" }, { status: 404 });
  }
  return NextResponse.json(session);
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const session = getSession(id);
  if (!session) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(session);
}
