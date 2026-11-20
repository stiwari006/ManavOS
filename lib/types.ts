/* Shared domain types (server, client and demo store all use these). */
export type Persona = {
  id: string; ownerId: string; name: string; role: string; look: string; faceId?: string;
  systemPrompt: string; greeting: string; languages: string[]; rubric: string[];
  memory: boolean; perception: boolean; documentIds: string[]; stock?: boolean;
  tavusPalId?: string; createdAt: string; updatedAt: string;
};
export type Turn = { role: "assistant" | "user"; content: string; at: number };
export type Score = { criterion: string; score: number; evidence: string };
export type Scorecard = { scores: Score[]; summary: string; recommendation: string; model: string };
export type ConvMode = "video" | "voice" | "preview";
export type Conversation = {
  id: string; ownerId: string; personaId: string; personaName: string; mode: ConvMode;
  status: "active" | "ended"; participant?: string; context?: string;
  joinUrl?: string; tavusId?: string; transcript: Turn[]; scorecard?: Scorecard;
  startedAt: string; endedAt?: string; seconds?: number; source: "app" | "api" | "try";
};
export type ApiKey = { id: string; ownerId: string; name: string; prefix: string; hash: string; createdAt: string; lastUsed?: string };
export type ApiKeyView = Omit<ApiKey, "hash">;
export type Doc = { id: string; ownerId: string; name: string; url?: string; text?: string; tags: string[]; createdAt: string; tavusId?: string };
export type User = { id: string; email: string; name: string; company?: string; type: "developer" | "teams"; plan: string; passHash: string; webhookUrl?: string; webhookSecret: string; createdAt: string };
export type PublicUser = Omit<User, "passHash" | "webhookSecret"> & { webhookSecret?: string };
export type Capabilities = { video: boolean; claude: boolean; demo: boolean };
