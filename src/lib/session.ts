import { Session, Stage } from "./types";

const MAX_SESSIONS = 500;
const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour

const sessions = new Map<string, Session>();
const sessionCreatedAt = new Map<string, number>();

function evictStale() {
  const now = Date.now();
  for (const [id, created] of sessionCreatedAt) {
    if (now - created > SESSION_TTL_MS) {
      sessions.delete(id);
      sessionCreatedAt.delete(id);
    }
  }
}

export function createSession(idea: string): Session {
  evictStale();

  if (sessions.size >= MAX_SESSIONS) {
    const oldest = sessionCreatedAt.keys().next().value!;
    sessions.delete(oldest);
    sessionCreatedAt.delete(oldest);
  }

  const id = crypto.randomUUID();
  const session: Session = {
    id,
    idea,
    stage: "idle",
    artifacts: {},
  };
  sessions.set(id, session);
  sessionCreatedAt.set(id, Date.now());
  return session;
}

export function getSession(id: string): Session | undefined {
  return sessions.get(id);
}

export function updateStage(id: string, stage: Stage): Session | undefined {
  const session = sessions.get(id);
  if (session) session.stage = stage;
  return session;
}

export function updateArtifact(
  id: string,
  key: keyof Session["artifacts"],
  value: unknown
): Session | undefined {
  const session = sessions.get(id);
  if (session) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (session.artifacts as any)[key] = value;
  }
  return session;
}
