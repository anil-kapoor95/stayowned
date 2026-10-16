import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "./Icon";

export function Card({
  className,
  children,
  padded = true,
  as: Tag = "div",
  ...rest
}: HTMLAttributes<HTMLElement> & {
  padded?: boolean;
  as?: "div" | "section" | "article" | "aside";
  children: ReactNode;
}) {
  return (
    <Tag
      className={cn(
        "rounded-card border border-border bg-card shadow-card",
        padded && "p-card-sm sm:p-card",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

type NoticeTone = "warning" | "info" | "success" | "error";
const tones: Record<NoticeTone, { box: string; icon: IconName; iconColor: string }> = {
  warning: { box: "bg-primary-tint border-primary-subtle", icon: "alert", iconColor: "text-primary" },
  info: { box: "bg-info-soft border-info/20", icon: "info", iconColor: "text-info" },
  success: { box: "bg-success-soft border-success/25", icon: "check", iconColor: "text-success" },
  error: { box: "bg-error-soft border-error/25", icon: "alert", iconColor: "text-error" },
};

export function Notice({
  tone = "warning",
  title,
  children,
  className,
  role,
}: {
  tone?: NoticeTone;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
  role?: "status" | "alert";
}) {
  const t = tones[tone];
  return (
    <div className={cn("flex gap-3 rounded-input border p-4", t.box, className)} role={role}>
      <Icon name={t.icon} size={18} className={cn("mt-0.5 shrink-0", t.iconColor)} />
      <div className="text-small text-body-strong">
        {title ? <p className="font-semibold text-heading">{title}</p> : null}
        {children}
      </div>
    </div>
  );
}
