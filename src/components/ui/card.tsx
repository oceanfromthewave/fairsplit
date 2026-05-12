import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_1px_0_rgba(0,0,0,0.04)]",
        className,
      )}
      {...props}
    />
  );
}
