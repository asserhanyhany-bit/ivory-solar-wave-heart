import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BoothShell } from "@/components/nightline/booth-shell";
import { Wordmark } from "@/components/nightline/wordmark";
import { Button } from "@/components/ui/button";
import { INTEREST_CHIPS } from "@/lib/nightline/protocol";
import { hasAgeConfirm, setAgeConfirm, stashInterests } from "@/lib/nightline/storage";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const navigate = useNavigate();
  const [chips, setChips] = useState<string[]>([]);
  const [age, setAge] = useState(false);

  useEffect(() => {
    setAge(hasAgeConfirm());
  }, []);

  function toggleChip(chip: string) {
    setChips((prev) => {
      if (chip === "random") return prev.includes("random") ? [] : ["random"];
      const withoutRandom = prev.filter((c) => c !== "random");
      return withoutRandom.includes(chip)
        ? withoutRandom.filter((c) => c !== chip)
        : [...withoutRandom, chip];
    });
  }

  function start() {
    if (!age) return;
    setAgeConfirm(true);
    stashInterests(chips);
    void navigate({ to: "/chat" });
  }

  return (
    <BoothShell>
      <main className="relative mx-auto flex min-h-dvh max-w-3xl flex-col px-5 pb-10 pt-8 sm:px-8 sm:pt-14">
        <header className="flex items-center justify-between text-muted">
          <span className="text-[11px] font-medium uppercase tracking-[0.22em]">Live booth</span>
          <Link
            to="/rules"
            className="min-h-11 inline-flex items-center text-sm text-muted hover:text-warm"
          >
            Rules
          </Link>
        </header>

        <div className="relative flex flex-1 flex-col items-center justify-center py-10 text-center">
          <div className="stagger-in relative isolate">
            <div
              className="glow-orb pointer-events-none -z-10 h-40 w-40 sm:h-56 sm:w-56"
              aria-hidden
              style={{ left: "50%", top: "10%", marginLeft: "-5rem" }}
            />
            <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.28em] text-cyan">
              On air · anonymous
            </p>
            <h1>
              <Wordmark size="hero" />
            </h1>
            <p className="mt-6 text-lg text-muted text-pretty sm:text-xl">
              Talk to a stranger. Stay a stranger.
            </p>
          </div>

          <div className="relative mt-12 w-full max-w-md stagger-in">
            <p className="mb-3 text-left text-xs uppercase tracking-[0.18em] text-dim">
              Optional interests
            </p>
            <div className="flex flex-wrap gap-2">
              {INTEREST_CHIPS.map((chip) => {
                const on = chips.includes(chip);
                return (
                  <button
                    key={chip}
                    type="button"
                    data-on={on}
                    onClick={() => toggleChip(chip)}
                    className={cn(
                      "h-11 rounded-full px-4 text-sm capitalize transition-[background-color,color,box-shadow] duration-150",
                      "bg-ink text-muted shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-warm)_10%,transparent)]",
                      "hover:text-warm",
                      "data-[on=true]:bg-violet/20 data-[on=true]:text-warm data-[on=true]:shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-violet)_70%,transparent)]",
                    )}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>

            <label className="mt-8 flex min-h-11 cursor-pointer items-start gap-3 text-left">
              <span className="relative mt-0.5 size-5 shrink-0">
                <input
                  type="checkbox"
                  checked={age}
                  onChange={(e) => {
                    setAge(e.target.checked);
                    setAgeConfirm(e.target.checked);
                  }}
                  className="peer absolute inset-0 z-10 cursor-pointer opacity-0"
                />
                <span className="pointer-events-none block size-5 rounded-[4px] border border-warm/25 bg-ink peer-checked:border-violet peer-checked:bg-violet peer-focus-visible:ring-2 peer-focus-visible:ring-violet/70" />
                <span className="pointer-events-none absolute left-[5px] top-[2px] hidden size-2 rotate-45 border-b-2 border-r-2 border-warm peer-checked:block" />
              </span>
              <span className="text-sm leading-snug text-muted">
                I confirm I am 18 or older. No minors. No exceptions.
              </span>
            </label>

            <Button
              size="xl"
              className="mt-6 w-full font-semibold tracking-wide"
              disabled={!age}
              onClick={start}
            >
              Start chatting
            </Button>
            <p className="mt-3 text-xs text-dim">
              No accounts. No video. Messages vanish when you leave.
            </p>
          </div>
        </div>

        <footer className="flex flex-col gap-2 text-center text-xs text-dim sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p>Open a second tab to test matching.</p>
          <p>
            <Link to="/rules" className="hover:text-warm">
              House rules
            </Link>
            <span className="mx-2 text-line">·</span>
            18+ only
          </p>
        </footer>
      </main>
    </BoothShell>
  );
}
