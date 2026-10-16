import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

type BadgeVariant = "pro" | "free" | "success" | "warning" | "primary" | "neutral" | "solid";

const variants: Record<BadgeVariant, string> = {
  pro: "bg-secondary text-on-secondary",
  free: "bg-success-soft text-success-strong",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning border border-primary-subtle",
  primary: "bg-primary-soft text-primary-strong",
  neutral: "bg-surface-muted text-body",
  solid: "bg-primary-strong text-on-primary",
};

export function Badge({
  variant = "neutral",
  children,
  className,
}: {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-caption font-bold uppercase tracking-wide",
        variants[variant],
        className,
      )}
    >
      {variant === "pro" ? <Icon name="lock" size={11} strokeWidth={2.5} /> : null}
      {children}
    </span>
  );
}

/** Small rounded label used for "Written by AI", "Recommended", "Free Plan". */
export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm bg-surface-muted px-2 py-0.5 text-caption font-medium text-body",
        className,
      )}
    >
      {children}
    </span>
  );
}
