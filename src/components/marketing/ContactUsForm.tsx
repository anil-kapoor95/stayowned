"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Card";
import { SelectField, TextareaField, TextField } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { validateEmail, validateRequired } from "@/lib/validation";
import { SUPPORT } from "./ui";

const TOPICS = [
  "Setting up my page",
  "Moving my Airbnb listing",
  "Payments and payouts",
  "Calendar sync",
  "Pro plan and domains",
  "Something else",
] as const;

type Values = { name: string; email: string; whatsapp: string; topic: string; message: string };
type Errors = Partial<Record<keyof Values, string>>;

/**
 * "Send us a message" form from the Figma "Contact Us" frame. There is no messaging endpoint yet,
 * so a valid form opens the visitor's email app with the message filled in.
 */
export function ContactUsForm() {
  const [values, setValues] = useState<Values>({ name: "", email: "", whatsapp: "", topic: TOPICS[0], message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const set = (key: keyof Values) => (value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const digits = values.whatsapp.replace(/\D/g, "");
    const next: Errors = {
      name: validateRequired(values.name, "your name", 2),
      email: validateEmail(values.email),
      whatsapp:
        values.whatsapp.trim() && (digits.length < 6 || digits.length > 15)
          ? "Enter a valid phone number, with the country code."
          : undefined,
      message: validateRequired(values.message, "a message", 10),
    };
    setErrors(next);
    const firstInvalid = (Object.keys(next) as (keyof Values)[]).find((key) => next[key]);
    if (firstInvalid) {
      document.getElementById(`contact-${firstInvalid}`)?.focus();
      return;
    }
    const body = [
      values.message.trim(),
      "",
      `Name: ${values.name.trim()}`,
      `Email: ${values.email.trim()}`,
      values.whatsapp.trim() ? `WhatsApp: ${values.whatsapp.trim()}` : "",
    ]
      .filter((line, index) => line || index < 2)
      .join("\n");
    window.location.href = `mailto:${SUPPORT.email}?subject=${encodeURIComponent(values.topic)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  if (sent) {
    return (
      <div className="grid gap-4">
        <Notice tone="success" role="status" title="Your message is ready to send">
          We opened your email app with your message filled in — press send there and we&apos;ll get back to you.
          Nothing opened? Write to {SUPPORT.email} or message us on WhatsApp.
        </Notice>
        <Button variant="outline" className="justify-self-start" onClick={() => setSent(false)}>
          Edit message
        </Button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className="grid gap-5" aria-labelledby="contact-form-title">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="contact-name"
          label="Your name"
          autoComplete="name"
          value={values.name}
          onChange={(e) => set("name")(e.target.value)}
          error={errors.name}
          required
        />
        <TextField
          id="contact-email"
          label="Email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => set("email")(e.target.value)}
          error={errors.email}
          required
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="contact-whatsapp"
          label={
            <>
              WhatsApp number <span className="font-normal text-muted">(optional)</span>
            </>
          }
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+91 98765 43210"
          value={values.whatsapp}
          onChange={(e) => set("whatsapp")(e.target.value)}
          error={errors.whatsapp}
        />
        <SelectField
          id="contact-topic"
          label="What is it about?"
          value={values.topic}
          onChange={(e) => set("topic")(e.target.value)}
        >
          {TOPICS.map((topic) => (
            <option key={topic}>{topic}</option>
          ))}
        </SelectField>
      </div>
      <TextareaField
        id="contact-message"
        label="Your message"
        rows={5}
        maxLength={2000}
        placeholder="How can we help?"
        value={values.message}
        onChange={(e) => set("message")(e.target.value)}
        error={errors.message}
        required
      />
      <Button type="submit" size="lg" fullWidth>
        Send message <Icon name="arrowRight" size={16} />
      </Button>
      <p className="text-center text-caption text-body">Prefer to talk? Use WhatsApp or call us, on the right.</p>
    </form>
  );
}
