const SLUR =
  /\b(nigg(?:a|er)s?|fag(?:got)?s?|kikes?|spics?|chinks?|trann(?:y|ies)|retards?)\b/i;

const SCAM =
  /\b(cash\s*app|what's your cashapp|whats your cashapp|venmo|zelle|gift\s*cards?|verify (?:with )?code|send(?: me)? (?:the )?code|crypto\s*wallet|seed phrase|telegram\.me|wa\.me|whatsapp me)\b/i;

const SEXUAL =
  /\b(sex|sexy|nude|nudes|naked|horny|send pics?|dick pic|onlyfans)\b/i;

const MINOR =
  /\b(little (?:girl|boy)s?|underage|schoolgirl|schoolboy|\b(?:1[0-7]|[8-9])\s*(?:y\/o|yo|years? old)|are you (?:1[0-7]|[8-9])\b)\b/i;

export type FilterHit = "slur" | "scam" | "minor" | null;

export function scanMessage(text: string): FilterHit {
  const t = text.trim();
  if (!t) return null;
  if (SLUR.test(t)) return "slur";
  if (SCAM.test(t)) return "scam";
  if (SEXUAL.test(t) && MINOR.test(t)) return "minor";
  if (/\b(any kids|you a minor|are you under)\b/i.test(t) && SEXUAL.test(t)) {
    return "minor";
  }
  return null;
}

export function warningCopy(hit: FilterHit): string {
  if (hit === "minor") return "That message was blocked. This booth is 18+ only.";
  if (hit === "scam") return "That looks like a scam. Message hidden.";
  if (hit === "slur") return "Keep it clean. One more strike ends the chat.";
  return "Message hidden. One more strike ends the chat.";
}
