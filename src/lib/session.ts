import { Session, Stage } from "./types";

const sessions = new Map<string, Session>();

export function createSession(idea: string): Session {
  const id = crypto.randomUUID();
  const session: Session = {
    id,
    idea,
    stage: "idle",
    artifacts: {},
  };
  sessions.set(id, session);
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
