export const INTEREST_CHIPS = [
  "music",
  "late night",
  "travel",
  "movies",
  "tech",
  "random",
] as const;

export type InterestChip = (typeof INTEREST_CHIPS)[number];

export const REPORT_REASONS = [
  { id: "spam", label: "Spam" },
  { id: "sexual", label: "Sexual" },
  { id: "hate", label: "Hate" },
  { id: "scam", label: "Scam" },
  { id: "other", label: "Other" },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]["id"];

export type EndReason =
  | "partner_left"
  | "skipped"
  | "reported"
  | "left"
  | "strikes"
  | "reported_you";

export type MsgStatus = "pending" | "sent" | "failed";

export type ChatMessage = {
  id: string;
  from: "me" | "them";
  text: string;
  ts: number;
  status: MsgStatus;
  hidden?: boolean;
};

export type WireEvent =
  | { t: "matched"; roomId: string; partnerId: string; interests: string[] }
  | { t: "msg"; id: string; from: string; text: string; ts: number }
  | { t: "ack"; id: string }
  | { t: "nack"; id: string; error: string }
  | { t: "typing"; on: boolean }
  | { t: "ended"; reason: EndReason; partnerId?: string };

export type LineOp =
  | {
      op: "join";
      id: string;
      interests: string[];
      lastPartnerId: string | null;
      blocked: string[];
    }
  | { op: "poll"; id: string }
  | { op: "send"; id: string; roomId: string; msgId: string; text: string }
  | { op: "typing"; id: string; roomId: string; on: boolean }
  | { op: "skip"; id: string; roomId: string }
  | { op: "report"; id: string; roomId: string; reason: ReportReason }
  | { op: "leave"; id: string }
  | { op: "cancel"; id: string };

export type LinePollResponse = {
  status: "searching" | "matched" | "idle" | "ended";
  roomId: string | null;
  events: WireEvent[];
};

export const MAX_MESSAGE_LENGTH = 500;
export const RATE_WINDOW_MS = 5000;
export const RATE_MAX = 8;
export const MUTE_MS = 3000;
export const TYPING_DEBOUNCE_MS = 1200;
export const INTEREST_GRACE_MS = 3000;
export const LAST_PARTNER_COOLDOWN_MS = 4000;
export const SESSION_TTL_MS = 22000;
export const POLL_WAIT_MS = 9000;

export function newId(): string {
  const raw = crypto.randomUUID().replaceAll("-", "");
  return raw.slice(0, 16);
}

export function normalizeInterests(chips: string[]): string[] {
  const set = new Set(
    chips
      .map((c) => c.trim().toLowerCase())
      .filter((c) => c && c !== "random"),
  );
  return [...set].slice(0, 8);
}

export function sharesInterest(a: string[], b: string[]): boolean {
  if (a.length === 0 || b.length === 0) return false;
  const other = new Set(b);
  return a.some((x) => other.has(x));
}
