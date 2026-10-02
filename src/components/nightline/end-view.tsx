import { Button } from "@/components/ui/button";
import type { EndReason } from "@/lib/nightline/protocol";
import { Wordmark } from "./wordmark";

const COPY: Record<EndReason, { title: string; body: string }> = {
  partner_left: {
    title: "They left the booth.",
    body: "The other side went quiet. The room is gone.",
  },
  skipped: {
    title: "You skipped.",
    body: "Line cleared. Someone else is out there.",
  },
  reported: {
    title: "Reported. They’re gone.",
    body: "You won’t be matched with them in this browser.",
  },
  reported_you: {
    title: "You were disconnected.",
    body: "The other person reported this chat. The booth closed.",
  },
  left: {
    title: "You left.",
    body: "The stranger was released. No transcript remains.",
  },
  strikes: {
    title: "Chat ended.",
    body: "Too many blocked messages. Find a cleaner booth.",
  },
};

export function EndView({
  reason,
  onAgain,
  onHome,
}: {
  reason: EndReason;
  onAgain: () => void;
  onHome: () => void;
}) {
  const copy = COPY[reason];
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="px-5 py-4 sm:px-8">
        <Wordmark size="md" to="/" />
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="text-[11px] uppercase tracking-[0.22em] text-dim">Line dead</p>
        <h1 className="mt-4 max-w-md font-display text-4xl font-extrabold tracking-[-0.04em] text-balance sm:text-5xl">
          {copy.title}
        </h1>
        <p className="mt-4 max-w-sm text-muted text-pretty">{copy.body}</p>
        <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
          <Button size="lg" className="w-full font-semibold" onClick={onAgain}>
            Find someone new
          </Button>
          <Button variant="ghost" size="lg" className="w-full" onClick={onHome}>
            Back home
          </Button>
        </div>
      </div>
    </div>
  );
}
