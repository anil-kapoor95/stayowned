"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Card";
import { SelectField, TextareaField, TextField } from "@/components/ui/Field";
import { validateEmail, validateRequired } from "@/lib/validation";

const TOPICS = ["Setting up my page", "Payments & payouts", "Pro plan", "Something else"] as const;

type Values = { name: string; email: string; topic: string; message: string };
type Errors = Partial<Record<keyof Values, string>>;

/** Contact form with client-side validation and an explicit demo submission state. */
export function ContactForm() {
  const [values, setValues] = useState<Values>({ name: "", email: "", topic: TOPICS[0], message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);

  const set = (key: keyof Values) => (value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Errors = {
      name: validateRequired(values.name, "your name", 2),
      email: validateEmail(values.email),
      message: validateRequired(values.message, "a message", 10),
    };
    setErrors(next);
    const firstInvalid = (Object.keys(next) as (keyof Values)[]).find((key) => next[key]);
    if (firstInvalid) {
      document.getElementById(`contact-${firstInvalid}`)?.focus();
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="grid gap-4">
        <Notice tone="info" role="status" title="Demo mode — your message was not sent">
          This static build has no backend or email service, so nothing left your browser. Once the API is connected, this form
          will deliver messages to the StayOwned team.
        </Notice>
        <Button variant="outline" className="justify-self-start" onClick={() => setDone(false)}>
          Edit message
        </Button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className="grid gap-5" aria-label="Contact StayOwned">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField id="contact-name" label="Your name" autoComplete="name" value={values.name} onChange={(e) => set("name")(e.target.value)} error={errors.name} required />
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
      <SelectField id="contact-topic" label="Topic" value={values.topic} onChange={(e) => set("topic")(e.target.value)}>
        {TOPICS.map((topic) => (
          <option key={topic}>{topic}</option>
        ))}
      </SelectField>
      <TextareaField
        id="contact-message"
        label="Message"
        rows={5}
        maxLength={2000}
        value={values.message}
        onChange={(e) => set("message")(e.target.value)}
        error={errors.message}
        required
      />
      <Button type="submit" size="lg" className="justify-self-start">
        Send message
      </Button>
    </form>
  );
}
