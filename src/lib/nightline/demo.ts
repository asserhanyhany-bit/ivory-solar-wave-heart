const OPENERS = [
  "Demo mode. I'm a script, not a person.",
  "This booth is a local demo — not a stranger.",
];

const LINES = [
  "Open a second tab if you want a real match.",
  "The rain sounds louder after midnight.",
  "I only know a handful of lines. That's the point.",
  "Ask me anything. I'll still be a demo.",
  "Still here. Still labeled DEMO.",
  "If this feels empty, find a real stranger.",
  "Late night radio energy, zero human on the other end.",
];

export function demoReply(turn: number, _userText: string): string {
  if (turn <= 1) return OPENERS[Math.min(turn, OPENERS.length - 1)] ?? OPENERS[0];
  return LINES[(turn + _userText.length) % LINES.length] ?? LINES[0];
}

export function demoDelay(): number {
  return 700 + Math.floor(Math.random() * 1100);
}
