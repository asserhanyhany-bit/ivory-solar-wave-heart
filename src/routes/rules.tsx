import { createFileRoute, Link } from "@tanstack/react-router";
import { BoothShell } from "@/components/nightline/booth-shell";
import { Wordmark } from "@/components/nightline/wordmark";

export const Route = createFileRoute("/rules")({ component: RulesPage });

const RULES = [
  {
    title: "No minors",
    body: "18+ only. If someone seems underage, leave and report. We will not host that conversation.",
  },
  {
    title: "No porn",
    body: "This is a text booth, not a cam site. Sexual content involving minors is blocked and ends the chat.",
  },
  {
    title: "No scams",
    body: "No Cash App, codes, wallets, or “verify with this.” Solicitations get hidden, then the booth closes.",
  },
  {
    title: "No harassment",
    body: "Hate, slurs, and targeted abuse are out. Report once — both sides disconnect.",
  },
  {
    title: "Stay a stranger",
    body: "No accounts, no logs kept, no location, no phone, no email. Do not ask for them.",
  },
];

function RulesPage() {
  return (
    <BoothShell>
      <main className="mx-auto flex min-h-dvh max-w-xl flex-col px-5 py-8 sm:px-8">
        <header className="flex items-center justify-between">
          <Wordmark size="md" to="/" />
          <Link to="/" className="inline-flex min-h-11 items-center text-sm text-muted hover:text-warm">
            Back
          </Link>
        </header>
        <h1 className="mt-12 font-display text-4xl font-extrabold tracking-[-0.04em] text-balance">
          House rules
        </h1>
        <p className="mt-3 text-muted text-pretty">
          Short, because the booth is. Break them and the line goes dead.
        </p>
        <ol className="mt-10 space-y-7">
          {RULES.map((r, i) => (
            <li key={r.title} className="flex gap-4">
              <span className="font-display text-sm tabular-nums text-violet">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h2 className="font-medium text-warm">{r.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted text-pretty">{r.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-12 text-sm text-dim">
          NIGHTLINE is anonymous 1:1 text. Nothing here is stored after both people leave.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-warm px-6 font-medium text-night"
        >
          Back to the booth
        </Link>
      </main>
    </BoothShell>
  );
}
