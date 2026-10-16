import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "soft"
  | "onDark"
  | "whatsapp"
  | "text";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 font-body font-semibold text-button whitespace-nowrap select-none " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-(--duration-fast) ease-(--ease-standard) " +
  "focus-visible:outline-none focus-visible:focus-ring active:translate-y-px " +
  "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary shadow-button-primary hover:bg-primary-hover active:bg-primary-active",
  secondary: "bg-secondary text-on-secondary hover:bg-secondary-hover active:bg-secondary-active",
  outline:
    "border border-border bg-surface text-heading hover:border-border-strong hover:bg-background",
  soft: "bg-surface-sunken text-heading hover:bg-surface-muted",
  onDark:
    "border border-white/25 bg-transparent text-on-dark hover:border-white/50 hover:bg-white/10",
  whatsapp: "bg-whatsapp text-white hover:bg-whatsapp-hover",
  text: "text-body underline-offset-4 hover:text-link-hover hover:underline px-0!",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 rounded-sm px-3.5 text-small",
  md: "h-11 rounded-button px-5",
  lg: "h-control rounded-button px-6",
};

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type ButtonAsLink = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; external?: boolean };

export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
}: Pick<CommonProps, "variant" | "size" | "fullWidth" | "className">) {
  return cn(base, variants[variant], sizes[size], fullWidth && "w-full", className);
}

export function Button(props: ButtonAsButton | ButtonAsLink) {
  if (props.href !== undefined) {
    const { variant, size, fullWidth, className, children, href, external, ...rest } =
      props as ButtonAsLink;
    const classes = buttonClasses({ variant, size, fullWidth, className });
    if (external) {
      return (
        <a href={href} className={classes} target="_blank" rel="noopener noreferrer" {...rest}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }
  const { variant, size, fullWidth, className, children, type = "button", ...rest } =
    props as ButtonAsButton;
  return (
    <button type={type} className={buttonClasses({ variant, size, fullWidth, className })} {...rest}>
      {children}
    </button>
  );
}
