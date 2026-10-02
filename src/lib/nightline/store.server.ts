import {
  INTEREST_GRACE_MS,
  LAST_PARTNER_COOLDOWN_MS,
  MAX_MESSAGE_LENGTH,
  POLL_WAIT_MS,
  RATE_MAX,
  RATE_WINDOW_MS,
  SESSION_TTL_MS,
  sharesInterest,
  type EndReason,
  type LineOp,
  type LinePollResponse,
  type ReportReason,
  type WireEvent,
} from "./protocol";

type Session = {
  id: string;
  interests: string[];
  lastPartnerId: string | null;
  blocked: Set<string>;
  roomId: string | null;
  status: "idle" | "searching" | "matched";
  lastSeen: number;
  joinedWaitAt: number;
  inbox: WireEvent[];
  waiter: ((events: WireEvent[]) => void) | null;
  recentMsgTs: number[];
};

type Room = {
  id: string;
  a: string;
  b: string;
};

type Store = {
  sessions: Map<string, Session>;
  waiting: Map<string, Session>;
  rooms: Map<string, Room>;
};

const g = globalThis as typeof globalThis & { __nightlineStore?: Store };

function store(): Store {
  g.__nightlineStore ??= {
    sessions: new Map(),
    waiting: new Map(),
    rooms: new Map(),
  };
  return g.__nightlineStore;
}

function now() {
  return Date.now();
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

function drain(s: Session): WireEvent[] {
  const events = s.inbox;
  s.inbox = [];
  return events;
}

function emit(s: Session, event: WireEvent) {
  s.inbox.push(event);
  if (s.inbox.length > 80) s.inbox.splice(0, s.inbox.length - 80);
  if (s.waiter) {
    const wake = s.waiter;
    s.waiter = null;
    wake(drain(s));
  }
}

function partnerOf(room: Room, id: string): string {
  return room.a === id ? room.b : room.a;
}

function getSession(id: string): Session | undefined {
  const s = store().sessions.get(id);
  if (s) s.lastSeen = now();
  return s;
}

function gc(t: number) {
  const s = store();
  for (const sess of s.sessions.values()) {
    if (t - sess.lastSeen <= SESSION_TTL_MS) continue;
    if (sess.status === "matched" && sess.roomId) {
      endRoom(sess.roomId, sess.id, "partner_left");
    }
    s.waiting.delete(sess.id);
    if (sess.waiter) {
      sess.waiter([]);
      sess.waiter = null;
    }
    s.sessions.delete(sess.id);
  }
}

function canPair(a: Session, b: Session, t: number): boolean {
  if (a.id === b.id) return false;
  if (a.blocked.has(b.id) || b.blocked.has(a.id)) return false;
  const cooled =
    t - a.joinedWaitAt >= LAST_PARTNER_COOLDOWN_MS ||
    t - b.joinedWaitAt >= LAST_PARTNER_COOLDOWN_MS;
  if (!cooled && (a.lastPartnerId === b.id || b.lastPartnerId === a.id)) return false;
  return true;
}

function pair(a: Session, b: Session) {
  const s = store();
  const roomId = `${a.id.slice(0, 6)}${b.id.slice(0, 6)}${tweak()}`;
  s.rooms.set(roomId, { id: roomId, a: a.id, b: b.id });
  for (const sess of [a, b]) {
    sess.status = "matched";
    sess.roomId = roomId;
    s.waiting.delete(sess.id);
  }
  a.lastPartnerId = b.id;
  b.lastPartnerId = a.id;
  emit(a, { t: "matched", roomId, partnerId: b.id, interests: b.interests });
  emit(b, { t: "matched", roomId, partnerId: a.id, interests: a.interests });
}

function tweak() {
  return Math.floor(Math.random() * 36 ** 3)
    .toString(36)
    .padStart(3, "0");
}

function tryMatch(me: Session) {
  const t = now();
  const waiters = [...store().waiting.values()]
    .filter((w) => w.id !== me.id && w.status === "searching")
    .sort((x, y) => x.joinedWaitAt - y.joinedWaitAt);

  const eligible = waiters.filter((w) => canPair(me, w, t));
  if (eligible.length === 0) return;

  const overlap = eligible.find((w) => sharesInterest(me.interests, w.interests));
  if (overlap) {
    pair(me, overlap);
    return;
  }

  const oldest = eligible[0];
  const waitedLongEnough =
    t - me.joinedWaitAt >= INTEREST_GRACE_MS || t - oldest.joinedWaitAt >= INTEREST_GRACE_MS;
  if (waitedLongEnough) pair(me, oldest);
}

function endRoom(roomId: string, fromId: string, reasonForOther: EndReason, selfReason?: EndReason) {
  const s = store();
  const room = s.rooms.get(roomId);
  if (!room) return;
  s.rooms.delete(roomId);
  const otherId = partnerOf(room, fromId);
  const self = s.sessions.get(fromId);
  const other = s.sessions.get(otherId);
  if (self && self.roomId === roomId) {
    self.roomId = null;
    self.status = "idle";
    emit(self, { t: "ended", reason: selfReason ?? "left", partnerId: otherId });
  }
  if (other && other.roomId === roomId) {
    other.roomId = null;
    other.status = "idle";
    emit(other, { t: "ended", reason: reasonForOther, partnerId: fromId });
  }
}

function join(op: Extract<LineOp, { op: "join" }>): LinePollResponse {
  const s = store();
  const prev = s.sessions.get(op.id);
  if (prev) {
    if (prev.waiter) {
      const wake = prev.waiter;
      prev.waiter = null;
      wake([]);
    }
    if (prev.roomId) endRoom(prev.roomId, prev.id, "partner_left", "left");
    s.waiting.delete(prev.id);
  }
  const sess: Session = {
    id: op.id,
    interests: op.interests.slice(0, 8),
    lastPartnerId: op.lastPartnerId,
    blocked: new Set(op.blocked.slice(0, 80)),
    roomId: null,
    status: "searching",
    lastSeen: now(),
    joinedWaitAt: now(),
    inbox: [],
    waiter: null,
    recentMsgTs: [],
  };
  s.sessions.set(sess.id, sess);
  s.waiting.set(sess.id, sess);
  tryMatch(sess);
  for (const w of s.waiting.values()) {
    if (w.id !== sess.id) tryMatch(w);
  }
  return {
    status: sess.status === "matched" ? "matched" : "searching",
    roomId: sess.roomId,
    events: drain(sess),
  };
}

function poll(id: string): Promise<LinePollResponse> {
  const sess = getSession(id);
  if (!sess) {
    return Promise.resolve({ status: "idle", roomId: null, events: [] });
  }
  if (sess.status === "searching") tryMatch(sess);

  if (sess.inbox.length > 0) {
    return Promise.resolve({
      status: sess.status === "matched" ? "matched" : sess.status === "searching" ? "searching" : "idle",
      roomId: sess.roomId,
      events: drain(sess),
    });
  }

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      if (sess.waiter) {
        sess.waiter = null;
        sess.lastSeen = now();
        resolve({
          status:
            sess.status === "matched" ? "matched" : sess.status === "searching" ? "searching" : "idle",
          roomId: sess.roomId,
          events: drain(sess),
        });
      }
    }, POLL_WAIT_MS);

    sess.waiter = (events) => {
      clearTimeout(timer);
      sess.lastSeen = now();
      resolve({
        status:
          sess.status === "matched" ? "matched" : sess.status === "searching" ? "searching" : "idle",
        roomId: sess.roomId,
        events,
      });
    };
  });
}

function send(op: Extract<LineOp, { op: "send" }>): LinePollResponse {
  const sess = getSession(op.id);
  if (!sess || sess.roomId !== op.roomId) {
    return { status: "idle", roomId: null, events: [{ t: "nack", id: op.msgId, error: "not in room" }] };
  }
  const text = op.text.trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!text) {
    return {
      status: "matched",
      roomId: sess.roomId,
      events: [{ t: "nack", id: op.msgId, error: "empty" }],
    };
  }
  const t = now();
  sess.recentMsgTs = sess.recentMsgTs.filter((x) => t - x < RATE_WINDOW_MS);
  if (sess.recentMsgTs.length >= RATE_MAX) {
    return {
      status: "matched",
      roomId: sess.roomId,
      events: [{ t: "nack", id: op.msgId, error: "rate" }],
    };
  }
  sess.recentMsgTs.push(t);
  const room = store().rooms.get(op.roomId);
  if (!room) {
    return { status: "idle", roomId: null, events: [{ t: "nack", id: op.msgId, error: "closed" }] };
  }
  const other = store().sessions.get(partnerOf(room, sess.id));
  emit(sess, { t: "ack", id: op.msgId });
  if (other) {
    emit(other, { t: "msg", id: op.msgId, from: sess.id, text, ts: t });
  }
  return { status: "matched", roomId: sess.roomId, events: drain(sess) };
}

function typing(op: Extract<LineOp, { op: "typing" }>) {
  const sess = getSession(op.id);
  if (!sess || sess.roomId !== op.roomId) {
    return { status: "idle" as const, roomId: null, events: [] as WireEvent[] };
  }
  const room = store().rooms.get(op.roomId);
  if (!room) return { status: "matched" as const, roomId: sess.roomId, events: [] as WireEvent[] };
  const other = store().sessions.get(partnerOf(room, sess.id));
  if (other) emit(other, { t: "typing", on: op.on });
  return { status: "matched" as const, roomId: sess.roomId, events: drain(sess) };
}

function skip(id: string, roomId: string, reason: EndReason, otherReason: EndReason) {
  const sess = getSession(id);
  if (sess?.roomId === roomId) endRoom(roomId, id, otherReason, reason);
  else if (sess) {
    sess.status = "idle";
    store().waiting.delete(id);
  }
  const fresh = store().sessions.get(id);
  return {
    status: "ended" as const,
    roomId: null,
    events: fresh ? drain(fresh) : ([{ t: "ended", reason }] as WireEvent[]),
  };
}

function leave(id: string) {
  const s = store();
  const sess = s.sessions.get(id);
  if (!sess) return { status: "idle" as const, roomId: null, events: [] as WireEvent[] };
  if (sess.roomId) endRoom(sess.roomId, id, "partner_left", "left");
  s.waiting.delete(id);
  if (sess.waiter) {
    sess.waiter([]);
    sess.waiter = null;
  }
  s.sessions.delete(id);
  return { status: "idle" as const, roomId: null, events: [] as WireEvent[] };
}

function cancel(id: string) {
  const s = store();
  const sess = s.sessions.get(id);
  if (!sess) return { status: "idle" as const, roomId: null, events: [] as WireEvent[] };
  if (sess.roomId) endRoom(sess.roomId, id, "partner_left", "left");
  sess.status = "idle";
  sess.roomId = null;
  s.waiting.delete(id);
  if (sess.waiter) {
    const wake = sess.waiter;
    sess.waiter = null;
    wake(drain(sess));
  }
  return { status: "idle" as const, roomId: null, events: [] as WireEvent[] };
}

function parseOp(body: unknown): LineOp | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const op = o.op;
  const id = typeof o.id === "string" ? o.id : "";
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(id)) return null;
  if (op === "join") {
    const interests = Array.isArray(o.interests)
      ? o.interests.filter((x): x is string => typeof x === "string").slice(0, 8)
      : [];
    const lastPartnerId = typeof o.lastPartnerId === "string" ? o.lastPartnerId : null;
    const blocked = Array.isArray(o.blocked)
      ? o.blocked.filter((x): x is string => typeof x === "string").slice(0, 80)
      : [];
    return { op, id, interests, lastPartnerId, blocked };
  }
  if (op === "poll" || op === "leave" || op === "cancel") return { op, id };
  if (op === "send") {
    const roomId = typeof o.roomId === "string" ? o.roomId : "";
    const msgId = typeof o.msgId === "string" ? o.msgId : "";
    const text = typeof o.text === "string" ? o.text : "";
    if (!roomId || !msgId) return null;
    return { op, id, roomId, msgId, text };
  }
  if (op === "typing") {
    const roomId = typeof o.roomId === "string" ? o.roomId : "";
    if (!roomId) return null;
    return { op, id, roomId, on: Boolean(o.on) };
  }
  if (op === "skip" || op === "report") {
    const roomId = typeof o.roomId === "string" ? o.roomId : "";
    if (!roomId) return null;
    if (op === "report") {
      const reason = o.reason;
      const ok: ReportReason[] = ["spam", "sexual", "hate", "scam", "other"];
      if (typeof reason !== "string" || !ok.includes(reason as ReportReason)) return null;
      return { op, id, roomId, reason: reason as ReportReason };
    }
    return { op, id, roomId };
  }
  return null;
}

export async function handleNightline(request: Request): Promise<Response> {
  try {
    gc(now());
    if (request.method !== "POST") return json({ error: "method not allowed" }, 405);
    let raw: unknown;
    try {
      const text = await request.text();
      raw = text ? JSON.parse(text) : null;
    } catch {
      return json({ error: "invalid JSON" }, 400);
    }
    const op = parseOp(raw);
    if (!op) return json({ error: "invalid request" }, 400);

    if (op.op === "join") return json(join(op));
    if (op.op === "poll") return json(await poll(op.id));
    if (op.op === "send") return json(send(op));
    if (op.op === "typing") return json(typing(op));
    if (op.op === "skip") return json(skip(op.id, op.roomId, "skipped", "partner_left"));
    if (op.op === "report") return json(skip(op.id, op.roomId, "reported", "reported_you"));
    if (op.op === "leave") return json(leave(op.id));
    if (op.op === "cancel") return json(cancel(op.id));
    return json({ error: "unknown op" }, 400);
  } catch (error) {
    console.error("[nightline]", error);
    return json({ error: "line failed" }, 500);
  }
}
