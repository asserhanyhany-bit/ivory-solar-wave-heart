import * as Dialog from "@radix-ui/react-dialog";
import { Flag, SkipForward, Volume2, VolumeX, RotateCcw } from "lucide-react";
import {
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  MAX_MESSAGE_LENGTH,
  REPORT_REASONS,
  type ChatMessage,
  type ReportReason,
} from "@/lib/nightline/protocol";
import { cn } from "@/lib/utils";
import { Wordmark } from "./wordmark";

function formatClock(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function Bubble({ msg }: { msg: ChatMessage }) {
  const mine = msg.from === "me";
  const [showTs, setShowTs] = useState(false);
  const hide = useRef<ReturnType<typeof setTimeout> | null>(null);
  function reveal() {
    setShowTs(true);
    if (hide.current) clearTimeout(hide.current);
    hide.current = setTimeout(() => setShowTs(false), 1600);
  }
  return (
    <div className={cn("flex bubble-in", mine ? "justify-end" : "justify-start")}>
      <button
        type="button"
        onClick={reveal}
        onMouseEnter={() => setShowTs(true)}
        onMouseLeave={() => setShowTs(false)}
        className={cn(
          "max-w-[min(78%,28rem)] rounded-2xl px-3.5 py-2.5 text-left text-[15px] leading-snug text-pretty",
          mine
            ? "rounded-br-md bg-violet text-warm"
            : "rounded-bl-md bg-ink text-warm shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-warm)_8%,transparent)]",
          msg.hidden && "opacity-50",
        )}
      >
        {msg.hidden ? (
          <span className="italic text-warm/70">Message hidden</span>
        ) : (
          msg.text
        )}
        {msg.status === "failed" ? (
          <span className="mt-1 block text-[11px] text-warm/80">Failed to send</span>
        ) : null}
        {showTs ? (
          <span className="mt-1 block text-[10px] uppercase tracking-wide text-warm/55">
            {new Date(msg.ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
          </span>
        ) : null}
      </button>
    </div>
  );
}

export function ChatView({
  messages,
  partnerTyping,
  partnerInterests,
  isDemo,
  warning,
  mutedUntil,
  matchElapsed,
  soundOn,
  unread,
  onSend,
  onRetry,
  onSkip,
  onReport,
  onTyping,
  onSound,
  onSticky,
}: {
  messages: ChatMessage[];
  partnerTyping: boolean;
  partnerInterests: string[];
  isDemo: boolean;
  warning: string | null;
  mutedUntil: number;
  matchElapsed: number;
  soundOn: boolean;
  unread: number;
  onSend: (text: string) => boolean;
  onRetry: (id: string) => void;
  onSkip: (force?: boolean) => "confirm" | "done" | void;
  onReport: (reason: ReportReason) => void;
  onTyping: () => void;
  onSound: (on: boolean) => void;
  onSticky: (sticky: boolean) => void;
}) {
  const [draft, setDraft] = useState("");
  const [skipOpen, setSkipOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [now, setNow] = useState(Date.now());
  const scroller = useRef<HTMLDivElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);
  const bottom = useRef<HTMLDivElement>(null);

  const muted = mutedUntil > now;
  const mutedLeft = Math.max(0, Math.ceil((mutedUntil - now) / 1000));

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onScroll = () => {
      const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
      onSticky(dist < 80);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [onSticky]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (dist < 120) {
      bottom.current?.scrollIntoView({ block: "end" });
    }
  }, [messages, partnerTyping]);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const sync = () => {
      document.documentElement.style.setProperty(
        "--kb",
        `${Math.max(0, window.innerHeight - vv.height - vv.offsetTop)}px`,
      );
    };
    sync();
    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    return () => {
      vv.removeEventListener("resize", sync);
      vv.removeEventListener("scroll", sync);
    };
  }, []);

  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      const typingField = tag === "TEXTAREA" || tag === "INPUT";
      if (e.key === "/" && !typingField && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        composer.current?.focus();
      }
      if (e.key === "Escape") {
        if (reportOpen) {
          setReportOpen(false);
          return;
        }
        const result = onSkip();
        if (result === "confirm") setSkipOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSkip, reportOpen]);

  function submit(e?: FormEvent) {
    e?.preventDefault();
    if (muted) return;
    const ok = onSend(draft);
    if (ok) {
      setDraft("");
      if (composer.current) {
        composer.current.style.height = "auto";
      }
    }
  }

  function onComposerKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function resize(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }

  function requestSkip() {
    const result = onSkip();
    if (result === "confirm") setSkipOpen(true);
  }

  return (
    <div
      className="flex min-h-dvh flex-col"
      style={{ paddingBottom: "var(--kb, 0px)" }}
    >
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line px-3 sm:px-5">
        <Wordmark size="sm" to="/" />
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            aria-label={soundOn ? "Mute sounds" : "Enable sounds"}
            onClick={() => onSound(!soundOn)}
            className="inline-flex size-11 items-center justify-center rounded-lg text-muted hover:text-warm"
          >
            {soundOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </button>
          <Link
            to="/rules"
            className="hidden size-11 items-center justify-center rounded-lg text-xs text-muted hover:text-warm sm:inline-flex"
          >
            Rules
          </Link>
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            className="inline-flex h-11 items-center gap-1.5 rounded-lg px-3 text-sm text-muted hover:text-danger"
          >
            <Flag className="size-4" />
            <span className="hidden sm:inline">Report</span>
          </button>
          <Button variant="ghost" size="sm" className="min-w-11" onClick={requestSkip}>
            <SkipForward className="size-4" />
            Skip
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <section className="flex min-w-0 flex-1 flex-col">
          {warning ? (
            <div className="border-b border-danger/30 bg-danger/10 px-4 py-2 text-center text-sm text-danger">
              {warning}
            </div>
          ) : null}
          {isDemo ? (
            <div className="border-b border-cyan/25 bg-cyan/10 px-4 py-2 text-center text-xs font-medium uppercase tracking-[0.16em] text-cyan">
              Demo · not a real person
            </div>
          ) : null}

          <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-8">
            {messages.length === 0 ? (
              <p className="pt-16 text-center text-sm text-dim">Say hello. Or don’t.</p>
            ) : (
              <div className="mx-auto flex max-w-2xl flex-col gap-2.5">
                {messages.map((msg) => (
                  <div key={msg.id} className="relative">
                    <Bubble msg={msg} />
                    {msg.status === "failed" ? (
                      <button
                        type="button"
                        onClick={() => onRetry(msg.id)}
                        className="absolute -bottom-1 right-1 inline-flex h-8 items-center gap-1 rounded-full bg-ink px-2 text-[11px] text-warm"
                      >
                        <RotateCcw className="size-3" />
                        Retry
                      </button>
                    ) : null}
                  </div>
                ))}
                {partnerTyping ? (
                  <p className="pl-1 text-xs text-muted">Stranger is typing…</p>
                ) : null}
                <div ref={bottom} />
              </div>
            )}
          </div>

          {unread > 0 ? (
            <div className="flex justify-center pb-2">
              <button
                type="button"
                onClick={() => {
                  onSticky(true);
                  bottom.current?.scrollIntoView({ block: "end" });
                }}
                className="h-9 rounded-full bg-violet px-3 text-xs font-medium text-warm"
              >
                New messages
              </button>
            </div>
          ) : null}

          <form
            onSubmit={submit}
            className="shrink-0 border-t border-line bg-night/95 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6"
          >
            {muted ? (
              <p className="mb-2 text-center text-xs text-muted">
                Slow down — muted {mutedLeft}s
              </p>
            ) : null}
            <div className="mx-auto flex max-w-2xl items-end gap-2 rounded-xl bg-ink p-2 shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-warm)_10%,transparent)]">
              <textarea
                ref={composer}
                rows={1}
                value={draft}
                maxLength={MAX_MESSAGE_LENGTH}
                disabled={muted}
                placeholder="Say something"
                onChange={(e) => {
                  setDraft(e.target.value);
                  resize(e.target);
                  onTyping();
                }}
                onKeyDown={onComposerKey}
                className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-[16px] leading-snug text-warm outline-none placeholder:text-dim"
              />
              <Button type="submit" size="md" variant="violet" disabled={muted || !draft.trim()}>
                Send
              </Button>
            </div>
            {draft.length > 400 ? (
              <p className="mt-1 text-right text-[11px] tabular-nums text-dim">
                {draft.length}/{MAX_MESSAGE_LENGTH}
              </p>
            ) : null}
          </form>
        </section>

        <aside className="hidden w-64 shrink-0 flex-col border-l border-line bg-ink/40 p-5 lg:flex">
          <p className="text-[11px] uppercase tracking-[0.2em] text-dim">In the booth</p>
          <p className="mt-3 font-display text-2xl font-bold tracking-[-0.03em]">
            {isDemo ? "DEMO" : "Stranger"}
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted">
            <span className={cn("size-1.5 rounded-full", isDemo ? "bg-cyan" : "bg-cyan")} />
            {isDemo ? "Scripted partner" : "Connected"}
          </p>
          <p className="mt-4 font-mono text-sm tabular-nums text-dim">{formatClock(matchElapsed)}</p>
          {partnerInterests.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-1.5">
              {partnerInterests.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-booth px-2.5 py-1 text-[11px] capitalize text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-xs text-dim">No shared tags. That’s fine.</p>
          )}
          <p className="mt-auto pt-8 text-xs leading-relaxed text-dim">
            They don’t have a name. Don’t ask for one you wouldn’t give.
          </p>
        </aside>
      </div>

      <Dialog.Root open={skipOpen} onOpenChange={setSkipOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-night/70" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-booth p-6 shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-warm)_12%,transparent)]">
            <Dialog.Title className="font-display text-xl font-bold tracking-[-0.03em]">
              Skip this stranger?
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-muted">
              You’ve been talking. Skip ends the booth immediately.
            </Dialog.Description>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setSkipOpen(false)}>
                Stay
              </Button>
              <Button
                variant="violet"
                onClick={() => {
                  setSkipOpen(false);
                  onSkip(true);
                }}
              >
                Skip
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={reportOpen} onOpenChange={setReportOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-night/70" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-booth p-6 shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-warm)_12%,transparent)]">
            <Dialog.Title className="font-display text-xl font-bold tracking-[-0.03em]">
              Report stranger
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-muted">
              One tap. Both sides disconnect. They won’t match you again here.
            </Dialog.Description>
            <div className="mt-5 flex flex-wrap gap-2">
              {REPORT_REASONS.map((r) => (
                <Button
                  key={r.id}
                  variant="ghost"
                  onClick={() => {
                    setReportOpen(false);
                    onReport(r.id);
                  }}
                >
                  {r.label}
                </Button>
              ))}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
