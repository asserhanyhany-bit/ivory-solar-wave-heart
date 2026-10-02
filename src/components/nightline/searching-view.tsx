import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Wordmark } from "./wordmark";

export function SearchingView({
  elapsed,
  onCancel,
  onDemo,
}: {
  elapsed: number;
  onCancel: () => void;
  onDemo: () => void;
}) {
  const still = elapsed >= 4;
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-5 py-4 sm:px-8">
        <Wordmark size="md" to="/" />
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-11 items-center text-sm text-muted hover:text-warm"
        >
          Cancel
        </button>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="relative mb-10 size-28">
          <span className="search-ring" />
          <span className="search-ring" />
          <span className="search-ring" />
          <span className="absolute inset-8 rounded-full bg-violet/30 blur-md" />
          <span className="absolute inset-[42%] rounded-full bg-cyan" />
        </div>
        <p className="font-display text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
          {still ? "Still looking…" : "Looking for a stranger"}
        </p>
        <p className="mt-3 tabular-nums text-sm text-muted">
          {elapsed}s in the queue
        </p>
        <p className="mt-6 max-w-sm text-sm text-dim text-pretty">
          {still
            ? "Waiting for a stranger. Open a second tab to test matching."
            : "Matching the oldest person in line. Interest overlap is a bonus, never a gate."}
        </p>
        {still ? (
          <Button variant="ghost" className="mt-8" onClick={onDemo}>
            Try a local demo
          </Button>
        ) : null}
      </div>
      <p className="px-6 pb-8 text-center text-xs text-dim">
        <Link to="/rules" className="hover:text-warm">
          Rules
        </Link>
        <span className="mx-2">·</span>
        Demo replies are labeled so they are never mistaken for a person.
      </p>
    </div>
  );
}
