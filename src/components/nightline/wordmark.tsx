import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Wordmark({
  size = "md",
  to,
}: {
  size?: "sm" | "md" | "hero";
  to?: "/";
}) {
  const cls = cn(
    "font-display font-extrabold tracking-[-0.06em] leading-[0.85] text-warm text-balance",
    size === "hero" && "text-[clamp(3.4rem,16vw,8.5rem)]",
    size === "md" && "text-xl",
    size === "sm" && "text-base tracking-[-0.04em]",
  );
  if (to) {
    return (
      <Link to={to} className={cls}>
        NIGHTLINE
      </Link>
    );
  }
  return <span className={cls}>NIGHTLINE</span>;
}
