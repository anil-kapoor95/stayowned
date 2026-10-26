import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

export const controlClasses =
  "w-full rounded-input border border-input-border bg-input-bg text-base text-heading " +
  "transition-[border-color,box-shadow] duration-(--duration-fast) " +
  "hover:border-input-border-hover focus:outline-none focus:border-focus focus:focus-ring " +
  "disabled:cursor-not-allowed disabled:bg-input-disabled " +
  "aria-[invalid=true]:border-error aria-[invalid=true]:focus:shadow-none";

type FieldShellProps = {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  labelAside?: ReactNode;
  className?: string;
  children: ReactNode;
  srOnlyLabel?: boolean;
};

export function describedBy(id: string, hint?: ReactNode, error?: string) {
  return [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
}

export function FieldShell({
  id,
  label,
  hint,
  error,
  required,
  labelAside,
  className,
  children,
  srOnlyLabel,
}: FieldShellProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <div className={cn("flex items-baseline justify-between gap-3", srOnlyLabel && "sr-only")}>
        <label htmlFor={id} className="text-small font-semibold text-heading">
          {label}
          {required ? (
            <span className="text-primary" aria-hidden="true">
              {" "}
              *
            </span>
          ) : null}
        </label>
        {labelAside}
      </div>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-caption text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-caption font-medium text-error" role="alert">
          <Icon name="alert" size={14} />
          {error}
        </p>
      ) : null}
    </div>
  );
}

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> & {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  prefix?: ReactNode;
  /** Left padding class used when a prefix is present (default "pl-11"). */
  prefixPadding?: string;
  suffix?: ReactNode;
  labelAside?: ReactNode;
  srOnlyLabel?: boolean;
  wrapperClassName?: string;
  /** 40px input with smaller text (dialogs). Default is the 52px control. */
  compact?: boolean;
};

export function TextField({
  id,
  label,
  hint,
  error,
  prefix,
  prefixPadding = "pl-11",
  suffix,
  labelAside,
  srOnlyLabel,
  wrapperClassName,
  className,
  required,
  compact = false,
  ...rest
}: TextFieldProps) {
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      labelAside={labelAside}
      srOnlyLabel={srOnlyLabel}
      className={wrapperClassName}
    >
      <div className="relative flex items-center">
        {prefix ? (
          <span className="pointer-events-none absolute left-4 flex items-center gap-2 text-body">{prefix}</span>
        ) : null}
        <input
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className={cn(
            controlClasses,
            compact ? "h-control-sm text-small" : "h-control",
            prefix ? prefixPadding : "pl-4",
            suffix ? "pr-20" : "pr-4",
            className,
          )}
          {...rest}
        />
        {suffix ? <span className="absolute right-2 flex items-center">{suffix}</span> : null}
      </div>
    </FieldShell>
  );
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  srOnlyLabel?: boolean;
  wrapperClassName?: string;
};

export function SelectField({
  id,
  label,
  hint,
  error,
  srOnlyLabel,
  wrapperClassName,
  className,
  children,
  required,
  ...rest
}: SelectFieldProps) {
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      srOnlyLabel={srOnlyLabel}
      className={wrapperClassName}
    >
      <div className="relative">
        <select
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className={cn(controlClasses, "h-control appearance-none pl-4 pr-11", className)}
          {...rest}
        >
          {children}
        </select>
        <Icon
          name="chevronDown"
          size={18}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-heading"
        />
      </div>
    </FieldShell>
  );
}

type TextareaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  srOnlyLabel?: boolean;
  wrapperClassName?: string;
};

export function TextareaField({
  id,
  label,
  hint,
  error,
  srOnlyLabel,
  wrapperClassName,
  className,
  required,
  ...rest
}: TextareaFieldProps) {
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      srOnlyLabel={srOnlyLabel}
      className={wrapperClassName}
    >
      <textarea
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(controlClasses, "min-h-32 px-4 py-3 leading-relaxed", className)}
        {...rest}
      />
    </FieldShell>
  );
}
