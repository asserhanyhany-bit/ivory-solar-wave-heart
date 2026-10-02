import { cva, type VariantProps } from "class-variance-authority";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-[transform,background-color,color,opacity,box-shadow] duration-150 ease-out select-none disabled:pointer-events-none disabled:opacity-40 active:not-disabled:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet/70 focus-visible:ring-offset-2 focus-visible:ring-offset-night",
  {
    variants: {
      variant: {
        primary:
          "bg-warm text-night hover:bg-warm/90 shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-warm)_20%,transparent)]",
        violet: "bg-violet text-warm hover:bg-violet/90",
        ghost:
          "bg-transparent text-warm/80 hover:text-warm hover:bg-warm/5 shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-warm)_12%,transparent)]",
        danger: "bg-danger/15 text-danger hover:bg-danger/25",
        chip: "bg-ink text-muted hover:text-warm shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-warm)_10%,transparent)] data-[on=true]:bg-violet/20 data-[on=true]:text-warm data-[on=true]:shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-violet)_70%,transparent)]",
      },
      size: {
        sm: "h-9 px-3 text-sm rounded-md",
        md: "h-11 px-4 text-sm rounded-lg",
        lg: "h-12 px-6 text-base rounded-lg",
        xl: "h-14 px-8 text-base rounded-xl",
        icon: "size-11 rounded-lg",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { staticScale?: boolean };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, staticScale, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        buttonVariants({ variant, size }),
        staticScale && "active:not-disabled:scale-100",
        className,
      )}
      {...props}
    />
  );
});
