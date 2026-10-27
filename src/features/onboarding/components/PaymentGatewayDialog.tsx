"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { TextField } from "@/components/ui/Field";
import { SwitchCard } from "@/components/ui/Switch";
import { cn } from "@/lib/utils";
import {
  formFieldForServerError,
  validateGatewaySettings,
  type GatewayConfig,
  type GatewaySettings,
} from "../payment-gateways";

/** Result of saving: field errors use the API field names (public_key, secret_key, label). */
export type GatewaySaveResult = { ok: true } | { ok: false; message: string; errors: Record<string, string> };

/**
 * "Connect Razorpay" style popup, shared by every gateway. Save checks the fields, then
 * `onSave` sends them to the back office; server errors are shown on the form.
 */
export function PaymentGatewayDialog({
  config,
  open,
  initial,
  onClose,
  onSave,
}: {
  config: GatewayConfig;
  open: boolean;
  initial: GatewaySettings;
  onClose: () => void;
  onSave: (settings: GatewaySettings) => Promise<GatewaySaveResult>;
}) {
  const formId = useId();
  const [submitting, setSubmitting] = useState(false);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="form"
      title={`Connect ${config.name}`}
      titleClassName="font-display text-[1.5rem] font-extrabold leading-tight tracking-[-0.02em] text-heading opsz-14"
      description={config.description}
      showCloseButton={false}
      icon={
        <span
          aria-hidden="true"
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-input font-heading text-[1.25rem] font-extrabold text-white shadow-card",
            config.tileClass,
          )}
        >
          {config.initial}
        </span>
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Close
          </Button>
          <Button type="submit" form={formId} disabled={submitting} aria-busy={submitting}>
            {submitting ? "Saving…" : "Save and connect"}
          </Button>
        </>
      }
    >
      {/* Remounted on every open so Close discards unsaved changes. */}
      {open ? (
        <GatewayForm
          key={config.id}
          id={formId}
          config={config}
          initial={initial}
          onSave={onSave}
          submitting={submitting}
          setSubmitting={setSubmitting}
        />
      ) : null}
    </Dialog>
  );
}

function GatewayForm({
  id,
  config,
  initial,
  onSave,
  submitting,
  setSubmitting,
}: {
  id: string;
  config: GatewayConfig;
  initial: GatewaySettings;
  onSave: (settings: GatewaySettings) => Promise<GatewaySaveResult>;
  submitting: boolean;
  setSubmitting: (submitting: boolean) => void;
}) {
  const [settings, setSettings] = useState<GatewaySettings>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const mode = settings.testMode ? "test" : "live";
  const fieldId = (key: string) => `${config.id}-${key}`;

  function update(patch: Partial<GatewaySettings>) {
    setSettings((current) => ({ ...current, ...patch }));
  }

  function setKey(key: string, value: string) {
    setSettings((current) => ({ ...current, keys: { ...current.keys, [key]: value } }));
    if (errors[key]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    }
  }

  function focusFirstError(found: Record<string, string>) {
    const first = ["label", ...config.keys.map((key) => key.id)].find((key) => found[key]);
    if (first) formRef.current?.querySelector<HTMLInputElement>(`#${CSS.escape(fieldId(first))}`)?.focus();
    return Boolean(first);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setFormError(null);
    const found = validateGatewaySettings(config, settings);
    setErrors(found);
    if (focusFirstError(found)) return;

    setSubmitting(true);
    const result = await onSave({
      ...settings,
      label: settings.label.trim(),
      keys: Object.fromEntries(Object.entries(settings.keys).map(([key, value]) => [key, value.trim()])),
    });
    setSubmitting(false);
    if (result.ok) return;

    const serverErrors: Record<string, string> = {};
    for (const [field, text] of Object.entries(result.errors)) {
      const formField = formFieldForServerError(config, field);
      if (formField) serverErrors[formField] = text;
    }
    setErrors(serverErrors);
    if (!focusFirstError(serverErrors)) setFormError(result.message);
  }

  return (
    <form id={id} ref={formRef} noValidate onSubmit={submit} className="grid gap-4" autoComplete="off">
      <Notice tone="warning" className="py-3">
        This payment method requires your website to be secured with an SSL certificate.
      </Notice>

      {formError ? (
        <Notice tone="error" role="alert" className="py-3">
          {formError}
        </Notice>
      ) : null}

      <SwitchCard
        title={`Allow ${config.name} payments`}
        description={config.allowHint}
        checked={settings.enabled}
        onChange={(enabled) => {
          update({ enabled });
          if (!enabled) setErrors({});
        }}
      />

      {/* The settings only apply while payments are allowed: hidden when switched off. */}
      {settings.enabled ? (
        <div className="grid gap-4">
          <TextField
            id={fieldId("label")}
            compact
            label={
              <>
                Label <span className="font-normal text-body">(optional)</span>
              </>
            }
            hint="Shown to guests at checkout."
            error={errors.label}
            placeholder={config.labelPlaceholder}
            value={settings.label}
            maxLength={60}
            onChange={(event) => update({ label: event.target.value })}
          />

          <SwitchCard
            title="Test mode"
            description="Try a payment without real money. Turn it off before you go live."
            checked={settings.testMode}
            onChange={(testMode) => {
              update({ testMode });
              setErrors({});
            }}
          />

          {config.keys.map((key) => {
            const shown = Boolean(revealed[key.id]);
            const keepsSaved = key.secret && settings.savedSecret[mode];
            return (
              <TextField
                key={key.id}
                id={fieldId(key.id)}
                compact
                label={key.label}
                hint={key.hint}
                error={errors[key.id]}
                placeholder={keepsSaved ? "Saved — leave empty to keep it" : key.placeholder[mode]}
                value={settings.keys[key.id] ?? ""}
                onChange={(event) => setKey(key.id, event.target.value)}
                type={key.secret && !shown ? "password" : "text"}
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                data-1p-ignore
                suffix={
                  key.secret ? (
                    <button
                      type="button"
                      onClick={() => setRevealed((current) => ({ ...current, [key.id]: !shown }))}
                      aria-pressed={shown}
                      aria-controls={fieldId(key.id)}
                      className="rounded-sm px-2 py-1 text-caption font-bold text-heading hover:text-link-hover focus-visible:outline-none focus-visible:focus-ring"
                    >
                      {shown ? "Hide" : "Show"}
                      <span className="sr-only"> {key.label}</span>
                    </button>
                  ) : undefined
                }
              />
            );
          })}

          {config.extraToggles.map((toggle) => (
            <SwitchCard
              key={toggle.id}
              title={toggle.title}
              description={toggle.description}
              checked={Boolean(settings.toggles[toggle.id])}
              onChange={(value) => update({ toggles: { ...settings.toggles, [toggle.id]: value } })}
            />
          ))}
        </div>
      ) : null}
    </form>
  );
}
