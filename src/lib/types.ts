export type Stage =
  | "idle"
  | "ideation_cmo"
  | "ideation_cto"
  | "ideation_ceo"
  | "gate_research"
  | "market_research"
  | "gate_prototype"
  | "prototyping_build"
  | "prototyping_review"
  | "complete";

export interface Session {
  id: string;
  idea: string;
  stage: Stage;
  artifacts: {
    cmo?: string;
    cto?: string;
    ceo?: string;
    research?: ResearchData;
    prototype?: PrototypeFiles;
    review?: string;
  };
}

export interface ResearchCard {
  title: string;
  url: string;
  source: string;
  thumbnail?: string;
}

export interface Competitor {
  name: string;
  description: string;
  url: string;
}

export interface ResearchData {
  cards: ResearchCard[];
  competitors: Competitor[];
  synthesis: string;
  contrarian: string;
}

export interface PrototypeFiles {
  html: string;
  css: string;
  js: string;
}

/** Scripted council fan-out for demo fixtures */
export interface PersonaOutput {
  persona: string;
  label: string;
  content: string;
}

export interface CouncilOutput {
  role: string;
  personas: PersonaOutput[];
  chair: string;
}

// SSE event types streamed to the client
export type SSEEvent =
  | { type: "agent_start"; agent: string; persona?: string; label: string }
  | { type: "chunk"; content: string }
  | { type: "agent_done"; agent: string }
  | { type: "research_data"; data: ResearchData }
  | { type: "prototype_ready"; files: PrototypeFiles }
  | { type: "gate"; stage: Stage; prompt: string }
  | { type: "stage_complete"; stage: Stage }
  | { type: "error"; message: string }
  | { type: "meta"; source: "demo" | "live" };
