"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { TextField } from "@/components/ui/Field";
import { SwitchCard } from "@/components/ui/Switch";
import { cn } from "@/lib/utils";
import {
  validateGatewaySettings,
  type GatewayConfig,
  type GatewaySettings,
} from "../payment-gateways";

/**
 * "Connect Razorpay" style popup, shared by every gateway. Front end only: Save checks
 * the fields and hands the values back; nothing is sent to the provider.
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
  onSave: (settings: GatewaySettings) => void;
}) {
  const formId = useId();
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
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button type="submit" form={formId}>
            Save and connect
          </Button>
        </>
      }
    >
      {/* Remounted on every open so Close discards unsaved changes. */}
      {open ? <GatewayForm key={config.id} id={formId} config={config} initial={initial} onSave={onSave} /> : null}
    </Dialog>
  );
}

function GatewayForm({
  id,
  config,
  initial,
  onSave,
}: {
  id: string;
  config: GatewayConfig;
  initial: GatewaySettings;
  onSave: (settings: GatewaySettings) => void;
}) {
  const [settings, setSettings] = useState<GatewaySettings>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
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

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validateGatewaySettings(config, settings);
    setErrors(found);
    const first = config.keys.find((key) => found[key.id]);
    if (first) {
      formRef.current?.querySelector<HTMLInputElement>(`#${CSS.escape(fieldId(first.id))}`)?.focus();
      return;
    }
    onSave({
      ...settings,
      label: settings.label.trim(),
      keys: Object.fromEntries(Object.entries(settings.keys).map(([key, value]) => [key, value.trim()])),
    });
  }

  return (
    <form id={id} ref={formRef} noValidate onSubmit={submit} className="grid gap-4" autoComplete="off">
      <Notice tone="warning" className="py-3">
        This payment method requires your website to be secured with an SSL certificate.
      </Notice>

      <SwitchCard
        title={`Allow ${config.name} payments`}
        description={config.allowHint}
        checked={settings.enabled}
        onChange={(enabled) => {
          update({ enabled });
          if (!enabled) setErrors({});
        }}
      />

      <TextField
        id={fieldId("label")}
        compact
        label={
          <>
            Label <span className="font-normal text-body">(optional)</span>
          </>
        }
        hint="Shown to guests at checkout."
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
        return (
          <TextField
            key={key.id}
            id={fieldId(key.id)}
            compact
            label={key.label}
            hint={key.hint}
            error={errors[key.id]}
            placeholder={key.placeholder[mode]}
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
    </form>
  );
}
