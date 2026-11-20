/* Transport-agnostic conversation contract.
   The UI only talks to `ConversationClient`. Today it's backed by
   `MockInterviewClient`; swap in a real client (WebRTC video + Claude as the
   reasoning layer) without touching any component. */

export type Speaker = "agent" | "candidate";
export type Turn = { id: string; speaker: Speaker; text: string };
export type ConvState = "idle" | "connecting" | "listening" | "thinking" | "speaking" | "ended";
export type Signal = { key: string; label: string; value: number };

export type ConvEvent =
  | { type: "state"; state: ConvState }
  | { type: "partial"; text: string }
  | { type: "turn"; turn: Turn }
  | { type: "signals"; signals: Signal[] };

export type StartOptions = { persona: string; role: string };

export interface ConversationClient {
  start(opts: StartOptions): Promise<void>;
  send(text: string): void;
  end(): void;
  on(listener: (e: ConvEvent) => void): () => void;
}
