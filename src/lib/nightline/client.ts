import {
  LAST_PARTNER_COOLDOWN_MS,
  INTEREST_GRACE_MS,
  newId,
  normalizeInterests,
  sharesInterest,
  type EndReason,
  type LineOp,
  type LinePollResponse,
  type ReportReason,
  type WireEvent,
} from "./protocol";

export type Transport = "server" | "local" | "demo";

type BcMsg =
  | {
      t: "wait";
      id: string;
      interests: string[];
      lastPartnerId: string | null;
      blocked: string[];
      at: number;
    }
  | { t: "pair"; roomId: string; a: string; b: string; interestsA: string[]; interestsB: string[] }
  | { t: "gone"; id: string }
  | { t: "msg"; roomId: string; from: string; id: string; text: string; ts: number }
  | { t: "typing"; roomId: string; from: string; on: boolean }
  | { t: "ended"; roomId: string; from: string; reason: EndReason }
  | { t: "ack"; roomId: string; id: string; to: string };

export type NightlineHandlers = {
  onMatched: (info: { roomId: string; partnerId: string; interests: string[]; transport: Transport }) => void;
  onMessage: (ev: { id: string; from: "them"; text: string; ts: number }) => void;
  onAck: (id: string) => void;
  onNack: (id: string, error: string) => void;
  onTyping: (on: boolean) => void;
  onEnded: (reason: EndReason, partnerId?: string) => void;
};

type LocalWaiter = {
  id: string;
  interests: string[];
  lastPartnerId: string | null;
  blocked: string[];
  at: number;
};

async function postLine(op: LineOp, signal?: AbortSignal): Promise<LinePollResponse> {
  const res = await fetch("/api/line", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(op),
    signal,
    keepalive: op.op === "leave" || op.op === "skip" || op.op === "report" || op.op === "cancel",
  });
  if (!res.ok) {
    const err = new Error(`line ${res.status}`);
    (err as { status?: number }).status = res.status;
    throw err;
  }
  return (await res.json()) as LinePollResponse;
}

export class NightlineClient {
  readonly id: string;
  readonly interests: string[];
  private readonly blocked: string[];
  private lastPartnerId: string | null;
  private readonly handlers: NightlineHandlers;
  private ac = new AbortController();
  private bc: BroadcastChannel | null = null;
  private waitTimer: ReturnType<typeof setInterval> | null = null;
  private pollLoop: Promise<void> | null = null;
  private stopped = false;
  private searchingSince = Date.now();
  private localWaiters = new Map<string, LocalWaiter>();
  transport: Transport | null = null;
  roomId: string | null = null;
  partnerId: string | null = null;

  constructor(opts: {
    interests: string[];
    lastPartnerId: string | null;
    blocked: string[];
    handlers: NightlineHandlers;
  }) {
    this.id = newId();
    this.interests = normalizeInterests(opts.interests);
    this.blocked = opts.blocked;
    this.lastPartnerId = opts.lastPartnerId;
    this.handlers = opts.handlers;
  }

  async start() {
    this.searchingSince = Date.now();
    this.openBroadcast();
    try {
      const res = await postLine(
        {
          op: "join",
          id: this.id,
          interests: this.interests,
          lastPartnerId: this.lastPartnerId,
          blocked: this.blocked,
        },
        this.ac.signal,
      );
      this.ingest(res.events, "server");
    } catch {
      // Server may be cold; BroadcastChannel can still pair two tabs.
    }
    this.pollLoop = this.runPoll();
  }

  stop() {
    if (this.stopped) return;
    this.stopped = true;
    this.ac.abort();
    if (this.waitTimer) clearInterval(this.waitTimer);
    this.bcPost({ t: "gone", id: this.id });
    if (this.roomId && this.transport === "local") {
      this.bcPost({ t: "ended", roomId: this.roomId, from: this.id, reason: "left" });
    }
    this.bc?.close();
    this.bc = null;
    void postLine({ op: "leave", id: this.id }).catch(() => {});
    try {
      navigator.sendBeacon?.(
        "/api/line",
        new Blob([JSON.stringify({ op: "leave", id: this.id })], { type: "application/json" }),
      );
    } catch {
      /* ignore */
    }
  }

  async send(msgId: string, text: string) {
    if (this.transport === "local" && this.roomId && this.partnerId) {
      const ts = Date.now();
      this.bcPost({ t: "msg", roomId: this.roomId, from: this.id, id: msgId, text, ts });
      this.handlers.onAck(msgId);
      return;
    }
    if (!this.roomId || this.transport !== "server") {
      this.handlers.onNack(msgId, "no room");
      return;
    }
    try {
      const res = await postLine({
        op: "send",
        id: this.id,
        roomId: this.roomId,
        msgId,
        text,
      });
      this.ingest(res.events, "server");
    } catch {
      this.handlers.onNack(msgId, "network");
    }
  }

  typing(on: boolean) {
    if (this.transport === "local" && this.roomId) {
      this.bcPost({ t: "typing", roomId: this.roomId, from: this.id, on });
      return;
    }
    if (this.transport === "server" && this.roomId) {
      void postLine({ op: "typing", id: this.id, roomId: this.roomId, on }).catch(() => {});
    }
  }

  skip() {
    this.disconnectPartner("partner_left");
  }

  report(reason: ReportReason) {
    this.disconnectPartner("reported_you", reason);
    this.handlers.onEnded("reported", this.partnerId ?? undefined);
  }

  private disconnectPartner(reasonForOther: EndReason, reportReason?: ReportReason) {
    const roomId = this.roomId;
    const transport = this.transport;
    this.roomId = null;
    this.transport = null;
    if (transport === "local" && roomId) {
      this.bcPost({ t: "ended", roomId, from: this.id, reason: reasonForOther });
    }
    if (transport === "server" && roomId) {
      const op: LineOp =
        reportReason
          ? { op: "report", id: this.id, roomId, reason: reportReason }
          : { op: "skip", id: this.id, roomId };
      void postLine(op).catch(() => {});
    }
  }

  private async runPoll() {
    while (!this.stopped) {
      if (this.transport === "local") {
        await sleep(1200, this.ac.signal);
        continue;
      }
      try {
        const res = await postLine({ op: "poll", id: this.id }, this.ac.signal);
        if (this.stopped) return;
        if (res.status === "idle" && !this.transport) {
          await postLine({
            op: "join",
            id: this.id,
            interests: this.interests,
            lastPartnerId: this.lastPartnerId,
            blocked: this.blocked,
          }).catch(() => {});
        }
        this.ingest(res.events, "server");
      } catch (err) {
        if (this.stopped || this.ac.signal.aborted) return;
        await sleep(700, this.ac.signal);
        void err;
      }
    }
  }

  private ingest(events: WireEvent[], source: Transport) {
    for (const ev of events) {
      if (ev.t === "matched") {
        if (this.transport && this.transport !== source) {
          if (source === "server") {
            void postLine({ op: "skip", id: this.id, roomId: ev.roomId }).catch(() => {});
          }
          continue;
        }
        this.acceptMatch(ev.roomId, ev.partnerId, ev.interests, source);
      } else if (ev.t === "msg") {
        if (this.transport !== source && source === "server") continue;
        this.handlers.onMessage({ id: ev.id, from: "them", text: ev.text, ts: ev.ts });
      } else if (ev.t === "ack") {
        this.handlers.onAck(ev.id);
      } else if (ev.t === "nack") {
        this.handlers.onNack(ev.id, ev.error);
      } else if (ev.t === "typing") {
        this.handlers.onTyping(ev.on);
      } else if (ev.t === "ended") {
        if (this.transport === "local" && source === "server") continue;
        this.roomId = null;
        this.transport = null;
        this.handlers.onEnded(ev.reason, ev.partnerId);
      }
    }
  }

  private acceptMatch(roomId: string, partnerId: string, interests: string[], transport: Transport) {
    this.transport = transport;
    this.roomId = roomId;
    this.partnerId = partnerId;
    this.lastPartnerId = partnerId;
    if (transport === "local") {
      void postLine({ op: "cancel", id: this.id }).catch(() => {});
      this.bcPost({ t: "gone", id: this.id });
    } else {
      this.bcPost({ t: "gone", id: this.id });
    }
    this.handlers.onMatched({ roomId, partnerId, interests, transport });
  }

  private openBroadcast() {
    if (typeof BroadcastChannel === "undefined") return;
    this.bc = new BroadcastChannel("nightline");
    this.bc.onmessage = (ev: MessageEvent<BcMsg>) => this.onBc(ev.data);
    this.announceWait();
    this.waitTimer = setInterval(() => {
      if (!this.transport) this.announceWait();
    }, 900);
  }

  private announceWait() {
    this.bcPost({
      t: "wait",
      id: this.id,
      interests: this.interests,
      lastPartnerId: this.lastPartnerId,
      blocked: this.blocked,
      at: this.searchingSince,
    });
  }

  private onBc(msg: BcMsg) {
    if (!msg || this.stopped) return;
    if (msg.t === "wait") {
      if (msg.id === this.id) return;
      this.localWaiters.set(msg.id, msg);
      this.maybeLocalPair(msg);
    } else if (msg.t === "gone") {
      this.localWaiters.delete(msg.id);
    } else if (msg.t === "pair") {
      if (this.transport) return;
      const other = msg.a === this.id ? msg.b : msg.b === this.id ? msg.a : null;
      if (!other) return;
      const interests = msg.a === this.id ? msg.interestsB : msg.interestsA;
      this.acceptMatch(msg.roomId, other, interests, "local");
    } else if (msg.t === "msg") {
      if (this.transport !== "local" || msg.roomId !== this.roomId || msg.from === this.id) return;
      this.handlers.onMessage({ id: msg.id, from: "them", text: msg.text, ts: msg.ts });
      this.bcPost({ t: "ack", roomId: msg.roomId, id: msg.id, to: msg.from });
    } else if (msg.t === "ack") {
      if (msg.to === this.id) this.handlers.onAck(msg.id);
    } else if (msg.t === "typing") {
      if (this.transport !== "local" || msg.roomId !== this.roomId || msg.from === this.id) return;
      this.handlers.onTyping(msg.on);
    } else if (msg.t === "ended") {
      if (this.transport !== "local" || msg.roomId !== this.roomId || msg.from === this.id) return;
      this.roomId = null;
      this.transport = null;
      this.handlers.onEnded(msg.reason, msg.from);
    }
  }

  private maybeLocalPair(them: LocalWaiter) {
    if (this.transport || this.stopped) return;
    if (them.blocked.includes(this.id) || this.blocked.includes(them.id)) return;
    const elapsed = Date.now() - this.searchingSince;
    const themElapsed = Date.now() - them.at;
    const cooled = elapsed >= LAST_PARTNER_COOLDOWN_MS || themElapsed >= LAST_PARTNER_COOLDOWN_MS;
    if (!cooled && (them.id === this.lastPartnerId || them.lastPartnerId === this.id)) return;
    const overlap = sharesInterest(this.interests, them.interests);
    const grace = elapsed >= INTEREST_GRACE_MS || themElapsed >= INTEREST_GRACE_MS;
    if (!overlap && !grace) return;
    if (this.id < them.id) {
      const roomId = `l-${this.id.slice(0, 8)}-${them.id.slice(0, 8)}`;
      this.bcPost({
        t: "pair",
        roomId,
        a: this.id,
        b: them.id,
        interestsA: this.interests,
        interestsB: them.interests,
      });
      this.acceptMatch(roomId, them.id, them.interests, "local");
    }
  }

  private bcPost(msg: BcMsg) {
    try {
      this.bc?.postMessage(msg);
    } catch {
      /* ignore */
    }
  }
}

function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve) => {
    if (signal?.aborted) {
      resolve();
      return;
    }
    const t = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(t);
        resolve();
      },
      { once: true },
    );
  });
}
