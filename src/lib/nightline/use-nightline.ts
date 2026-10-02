import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NightlineClient } from "./client";
import { demoDelay, demoReply } from "./demo";
import { scanMessage, warningCopy, type FilterHit } from "./filter";
import {
  MAX_MESSAGE_LENGTH,
  MUTE_MS,
  RATE_MAX,
  RATE_WINDOW_MS,
  TYPING_DEBOUNCE_MS,
  newId,
  type ChatMessage,
  type EndReason,
  type ReportReason,
} from "./protocol";
import { tickIncoming, tickMatch } from "./sound";
import { addBlocked, readBlocked, setSoundEnabled, soundEnabled } from "./storage";

export type Phase = "searching" | "matched" | "ended";

export type NightlineState = {
  phase: Phase;
  endReason: EndReason | null;
  messages: ChatMessage[];
  partnerTyping: boolean;
  partnerInterests: string[];
  isDemo: boolean;
  warning: string | null;
  mutedUntil: number;
  searchElapsed: number;
  matchElapsed: number;
  soundOn: boolean;
  unread: number;
};

export function useNightline(interests: string[]) {
  const [phase, setPhase] = useState<Phase>("searching");
  const [endReason, setEndReason] = useState<EndReason | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [partnerInterests, setPartnerInterests] = useState<string[]>([]);
  const [isDemo, setIsDemo] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [mutedUntil, setMutedUntil] = useState(0);
  const [searchElapsed, setSearchElapsed] = useState(0);
  const [matchElapsed, setMatchElapsed] = useState(0);
  const [soundOn, setSoundOnState] = useState(false);
  const [unread, setUnread] = useState(0);
  const [searchKey, setSearchKey] = useState(0);

  const clientRef = useRef<NightlineClient | null>(null);
  const lastPartnerRef = useRef<string | null>(null);
  const strikesRef = useRef(0);
  const warnedRef = useRef(false);
  const stickyRef = useRef(true);
  const matchAtRef = useRef<number | null>(null);
  const searchAtRef = useRef(Date.now());
  const typingIdleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const partnerTypeHideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const demoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const demoTurnRef = useRef(0);
  const rateRef = useRef<number[]>([]);
  const soundRef = useRef(false);
  const phaseRef = useRef<Phase>("searching");
  const demoRef = useRef(false);
  const ignoreEndedRef = useRef(false);

  useEffect(() => {
    setSoundOnState(soundEnabled());
    soundRef.current = soundEnabled();
  }, []);

  const setSoundOn = useCallback((on: boolean) => {
    soundRef.current = on;
    setSoundOnState(on);
    setSoundEnabled(on);
  }, []);

  const clearDemoTimer = () => {
    if (demoTimerRef.current) {
      clearTimeout(demoTimerRef.current);
      demoTimerRef.current = null;
    }
  };

  const goEnded = useCallback((reason: EndReason, partnerId?: string) => {
    if (phaseRef.current === "ended") return;
    phaseRef.current = "ended";
    setPhase("ended");
    setEndReason(reason);
    setPartnerTyping(false);
    if (partnerId) lastPartnerRef.current = partnerId;
    if (reason === "reported" && partnerId) addBlocked(partnerId);
    clearDemoTimer();
    clientRef.current?.stop();
    clientRef.current = null;
  }, []);

  useEffect(() => {
    if (demoRef.current) return;
    let active = true;
    let client: NightlineClient | null = null;
    let minSearch: ReturnType<typeof setTimeout> | null = null;
    let pendingMatch: {
      roomId: string;
      partnerId: string;
      interests: string[];
    } | null = null;
    const started = Date.now();
    searchAtRef.current = started;
    phaseRef.current = "searching";
    setPhase("searching");
    setEndReason(null);
    setMessages([]);
    setPartnerTyping(false);
    setPartnerInterests([]);
    setWarning(null);
    setUnread(0);
    strikesRef.current = 0;
    warnedRef.current = false;
    stickyRef.current = true;
    matchAtRef.current = null;

    const revealMatch = () => {
      if (!pendingMatch || !active || phaseRef.current !== "searching") return;
      phaseRef.current = "matched";
      matchAtRef.current = Date.now();
      lastPartnerRef.current = pendingMatch.partnerId;
      setPartnerInterests(pendingMatch.interests);
      setPhase("matched");
      if (soundRef.current) tickMatch();
    };

    client = new NightlineClient({
      interests,
      lastPartnerId: lastPartnerRef.current,
      blocked: readBlocked(),
      handlers: {
        onMatched: (info) => {
          if (!active) return;
          pendingMatch = info;
          const wait = Math.max(0, 1100 - (Date.now() - started));
          minSearch = setTimeout(revealMatch, wait);
        },
        onMessage: (ev) => {
          if (!active) return;
          const hit = scanMessage(ev.text);
          setMessages((prev) => [
            ...prev,
            {
              id: ev.id,
              from: "them",
              text: ev.text,
              ts: ev.ts,
              status: "sent",
              hidden: Boolean(hit),
            },
          ]);
          if (!stickyRef.current) setUnread((n) => n + 1);
          if (soundRef.current) tickIncoming();
        },
        onAck: (id) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === id ? { ...m, status: "sent" as const } : m)),
          );
        },
        onNack: (id, error) => {
          if (error === "rate") setMutedUntil(Date.now() + MUTE_MS);
          setMessages((prev) =>
            prev.map((m) => (m.id === id ? { ...m, status: "failed" as const } : m)),
          );
        },
        onTyping: (on) => {
          setPartnerTyping(on);
          if (partnerTypeHideRef.current) clearTimeout(partnerTypeHideRef.current);
          if (on) {
            partnerTypeHideRef.current = setTimeout(() => setPartnerTyping(false), TYPING_DEBOUNCE_MS);
          }
        },
        onEnded: (reason, partnerId) => {
          if (!active || ignoreEndedRef.current) return;
          if (minSearch) clearTimeout(minSearch);
          goEnded(reason, partnerId);
        },
      },
    });
    ignoreEndedRef.current = false;
    clientRef.current = client;
    void client.start();

    const onHide = () => client?.stop();
    window.addEventListener("pagehide", onHide);
    window.addEventListener("beforeunload", onHide);

    return () => {
      active = false;
      if (minSearch) clearTimeout(minSearch);
      window.removeEventListener("pagehide", onHide);
      window.removeEventListener("beforeunload", onHide);
      client?.stop();
      if (clientRef.current === client) clientRef.current = null;
    };
  }, [interests, searchKey, goEnded]);

  useEffect(() => {
    const t = setInterval(() => {
      if (phaseRef.current === "searching") {
        setSearchElapsed(Math.floor((Date.now() - searchAtRef.current) / 1000));
      }
      if (phaseRef.current === "matched" && matchAtRef.current) {
        setMatchElapsed(Math.floor((Date.now() - matchAtRef.current) / 1000));
      }
    }, 250);
    return () => clearInterval(t);
  }, [searchKey]);

  const applyStrike = useCallback(
    (hit: FilterHit) => {
      strikesRef.current += 1;
      const copy = warningCopy(hit);
      setWarning(copy);
      if (!warnedRef.current) {
        warnedRef.current = true;
      }
      if (strikesRef.current >= 2) {
        clientRef.current?.skip();
        goEnded("strikes", clientRef.current?.partnerId ?? undefined);
      }
    },
    [goEnded],
  );

  const send = useCallback(
    (raw: string) => {
      const text = raw.trim().slice(0, MAX_MESSAGE_LENGTH);
      if (!text) return false;
      if (Date.now() < mutedUntil) return false;
      const ring = rateRef.current.filter((t) => Date.now() - t < RATE_WINDOW_MS);
      if (ring.length >= RATE_MAX) {
        setMutedUntil(Date.now() + MUTE_MS);
        rateRef.current = ring;
        return false;
      }
      ring.push(Date.now());
      rateRef.current = ring;

      const hit = scanMessage(text);
      const id = `m${newId()}`;
      const msg: ChatMessage = {
        id,
        from: "me",
        text,
        ts: Date.now(),
        status: hit ? "sent" : "pending",
        hidden: Boolean(hit),
      };
      setMessages((prev) => [...prev, msg]);
      stickyRef.current = true;
      if (hit) {
        applyStrike(hit);
        return true;
      }
      if (demoRef.current) {
        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status: "sent" } : m)));
        const turn = ++demoTurnRef.current;
        setPartnerTyping(true);
        clearDemoTimer();
        demoTimerRef.current = setTimeout(() => {
          setPartnerTyping(false);
          const reply = demoReply(turn, text);
          setMessages((prev) => [
            ...prev,
            {
              id: `d${newId()}`,
              from: "them",
              text: reply,
              ts: Date.now(),
              status: "sent",
            },
          ]);
          if (soundRef.current) tickIncoming();
        }, demoDelay());
        return true;
      }
      void clientRef.current?.send(id, text);
      return true;
    },
    [applyStrike, mutedUntil],
  );

  const retry = useCallback(
    (id: string) => {
      const found = messages.find((m) => m.id === id && m.from === "me");
      if (!found) return;
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: "pending" as const } : m)),
      );
      void clientRef.current?.send(id, found.text);
    },
    [messages],
  );

  const notifyTyping = useCallback(() => {
    if (phaseRef.current !== "matched" || demoRef.current) return;
    clientRef.current?.typing(true);
    if (typingIdleRef.current) clearTimeout(typingIdleRef.current);
    typingIdleRef.current = setTimeout(() => {
      clientRef.current?.typing(false);
    }, TYPING_DEBOUNCE_MS);
  }, []);

  const skip = useCallback(
    (force = false) => {
      if (demoRef.current) {
        demoRef.current = false;
        setIsDemo(false);
        clearDemoTimer();
        lastPartnerRef.current = "demo";
        phaseRef.current = "searching";
        setPhase("searching");
        setMessages([]);
        setSearchKey((k) => k + 1);
        return "done" as const;
      }
      const exchanged = messages.filter((m) => !m.hidden).length;
      if (!force && exchanged >= 3) return "confirm" as const;
      ignoreEndedRef.current = true;
      lastPartnerRef.current = clientRef.current?.partnerId ?? lastPartnerRef.current;
      clientRef.current?.skip();
      clientRef.current?.stop();
      clientRef.current = null;
      phaseRef.current = "searching";
      setPhase("searching");
      setSearchElapsed(0);
      setMessages([]);
      setPartnerTyping(false);
      setWarning(null);
      setSearchKey((k) => k + 1);
      return "done" as const;
    },
    [messages],
  );

  const report = useCallback(
    (reason: ReportReason) => {
      void reason;
      if (demoRef.current) {
        demoRef.current = false;
        setIsDemo(false);
        clearDemoTimer();
        goEnded("reported");
        return;
      }
      const pid = clientRef.current?.partnerId;
      if (pid) addBlocked(pid);
      clientRef.current?.report(reason);
      goEnded("reported", pid ?? undefined);
    },
    [goEnded],
  );

  const startDemo = useCallback(() => {
    demoRef.current = true;
    setIsDemo(true);
    clientRef.current?.stop();
    clientRef.current = null;
    phaseRef.current = "matched";
    matchAtRef.current = Date.now();
    setPhase("matched");
    setPartnerInterests([]);
    setMessages([]);
    demoTurnRef.current = 0;
    if (soundRef.current) tickMatch();
    setPartnerTyping(true);
    clearDemoTimer();
    demoTimerRef.current = setTimeout(() => {
      setPartnerTyping(false);
      demoTurnRef.current = 1;
      setMessages([
        {
          id: `d${newId()}`,
          from: "them",
          text: demoReply(1, ""),
          ts: Date.now(),
          status: "sent",
        },
      ]);
    }, 900);
  }, []);

  const findNew = useCallback(() => {
    demoRef.current = false;
    setIsDemo(false);
    clearDemoTimer();
    clientRef.current?.stop();
    clientRef.current = null;
    setSearchKey((k) => k + 1);
  }, []);

  const leave = useCallback(() => {
    clientRef.current?.stop();
    clientRef.current = null;
    demoRef.current = false;
    setIsDemo(false);
  }, []);

  const setSticky = useCallback((sticky: boolean) => {
    stickyRef.current = sticky;
    if (sticky) setUnread(0);
  }, []);

  const state: NightlineState = useMemo(
    () => ({
      phase,
      endReason,
      messages,
      partnerTyping,
      partnerInterests,
      isDemo,
      warning,
      mutedUntil,
      searchElapsed,
      matchElapsed,
      soundOn,
      unread,
    }),
    [
      phase,
      endReason,
      messages,
      partnerTyping,
      partnerInterests,
      isDemo,
      warning,
      mutedUntil,
      searchElapsed,
      matchElapsed,
      soundOn,
      unread,
    ],
  );

  return {
    ...state,
    send,
    retry,
    skip,
    report,
    startDemo,
    findNew,
    leave,
    notifyTyping,
    setSoundOn,
    setSticky,
    isSticky: () => stickyRef.current,
  };
}
