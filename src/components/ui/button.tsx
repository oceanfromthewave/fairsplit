import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--accent)] text-[var(--accent-foreground)] hover:opacity-95 active:scale-[0.99] shadow-sm",
  secondary:
    "bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--muted-bg)]",
  ghost: "text-[var(--foreground)] hover:bg-[var(--muted-bg)]",
  danger: "bg-red-600 text-white hover:bg-red-700 active:scale-[0.99]",
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type={props.type ?? "button"}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:pointer-events-none disabled:opacity-45",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
