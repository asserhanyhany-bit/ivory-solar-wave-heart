import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

const DROPS = [
  { left: "8%", delay: "0s", dur: "7.2s" },
  { left: "18%", delay: "1.4s", dur: "6.4s" },
  { left: "31%", delay: "0.6s", dur: "8.1s" },
  { left: "44%", delay: "2.1s", dur: "7.6s" },
  { left: "57%", delay: "0.3s", dur: "6.8s" },
  { left: "69%", delay: "1.8s", dur: "7.9s" },
  { left: "81%", delay: "0.9s", dur: "6.2s" },
  { left: "92%", delay: "2.4s", dur: "8.4s" },
];

export function BoothShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative min-h-dvh bg-night text-warm overflow-hidden", className)}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-10%,color-mix(in_oklab,var(--color-violet)_18%,transparent),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-soft-light bg-[linear-gradient(180deg,transparent,color-mix(in_oklab,var(--color-cyan)_6%,transparent)_48%,transparent)]" />
      <div className="pointer-events-none absolute inset-0 hidden sm:block" aria-hidden>
        {DROPS.map((d) => (
          <span
            key={d.left}
            className="rain-drop"
            style={{ left: d.left, animationDelay: d.delay, animationDuration: d.dur }}
          />
        ))}
      </div>
      <div className="grain" aria-hidden />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
