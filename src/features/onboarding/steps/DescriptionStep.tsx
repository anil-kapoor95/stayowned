"use client";

import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useRef, useState, type ReactNode } from "react";
import { Tag } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Card";
import { RadioChips } from "@/components/ui/Chip";
import { TextareaField, TextField } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { signupApi, type ContentField, type SignupFaq } from "@/lib/api/signup";
import { cn, countWords } from "@/lib/utils";
import { TONES } from "../copy-templates";
import { updateDraft, useDraft } from "../draft-store";
import { updateSignupState, useSignupSession } from "../signup-session";
import { hrefForNextStep } from "../steps";
import type { Tone } from "../types";
import { StepCard, StepFooter } from "../components/WizardShell";

const DEFAULT_TONE: Tone = "warm";
const MAX_HEADLINE = 120;
const MAX_DESCRIPTION = 5000;
const MAX_FAQS = 8;

type Field = ContentField;
/** Where a card's text comes from: the AI, the host's own edit, or what was saved before. */
type Source = "ai" | "edited" | "saved" | "empty";

interface Texts {
  headline: string;
  description: string;
  faqs: SignupFaq[];
}
interface Version {
  texts: Texts;
  sources: Record<Field, Source>;
}

const FIELDS: Field[] = ["headline", "description", "faqs"];
const FIELD_NAMES: Record<Field, string> = {
  headline: "page headline",
  description: "description",
  faqs: "questions guests ask",
};
const EMPTY: Version = {
  texts: { headline: "", description: "", faqs: [] },
  sources: { headline: "empty", description: "empty", faqs: "empty" },
};

const isEmpty = (texts: Texts, field: Field) =>
  field === "faqs" ? texts.faqs.length === 0 : texts[field].trim() === "";

/**
 * Step 5 — page texts (pjActionSignupDescription): page headline, description and the
 * questions guests ask. The AI (pjActionSignupGenerateDescription, Options > AI settings)
 * always writes in English, in the tone chosen with the chips (Warm by default):
 * - first visit with nothing saved: the page is written straight away in the Warm tone;
 * - choosing another tone writes the page again in that tone (each tone's version is
 *   kept, so going back to a tone shows its texts, edits included);
 * - "Rewrite" on a card writes only that card again.
 * Nothing is saved until the host continues.
 */
export function DescriptionStep() {
  const router = useRouter();
  const { token, state } = useSignupSession();
  const aiAvailable = Boolean(state?.ai_available);
  const importedDescription = useDraft().imported?.description?.trim() ?? "";

  const [tone, setTone] = useState<Tone>(state?.tone ?? DEFAULT_TONE);
  const [versions, setVersions] = useState<Partial<Record<Tone, Version>>>(() => {
    const texts: Texts = {
      headline: state?.headline ?? "",
      description: state?.description ?? "",
      faqs: state?.faqs ?? [],
    };
    if (FIELDS.every((field) => isEmpty(texts, field))) {
      // Nothing saved yet: start from the description imported from Airbnb (step 3), if any.
      if (!importedDescription) return {};
      return {
        [state?.tone ?? DEFAULT_TONE]: {
          texts: { ...texts, description: importedDescription },
          sources: { headline: "empty", description: "edited", faqs: "empty" },
        },
      };
    }
    const sources = Object.fromEntries(
      FIELDS.map((field) => [field, isEmpty(texts, field) ? "empty" : "saved"]),
    ) as Record<Field, Source>;
    return { [state?.tone ?? DEFAULT_TONE]: { texts, sources } };
  });
  const version = versions[tone] ?? EMPTY;
  const { texts, sources } = version;
  const nothingWritten = FIELDS.every((field) => isEmpty(texts, field));

  const [aiLeft, setAiLeft] = useState(state?.ai_generations_left ?? 0);
  const [busy, setBusy] = useState<Field | "all" | null>(null);
  const [aiMessage, setAiMessage] = useState<string>();
  // Without AI, empty cards open as forms straight away.
  const [editing, setEditing] = useState<Record<Field, boolean>>(() => {
    const open = !aiAvailable && Object.keys(versions).length === 0;
    return { headline: open, description: open, faqs: open };
  });
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [errors, setErrors] = useState<Partial<Record<Field | "form", string>>>({});
  const [saving, setSaving] = useState(false);

  // Live preview on the right follows the texts of the current tone.
  useEffect(() => {
    updateDraft((draft) => ({
      ...draft,
      content: {
        ...draft.content,
        tone,
        headlineOverride: texts.headline.trim() || null,
        descriptionOverride: texts.description.trim() || null,
        faqOverride: texts.faqs.length > 0 ? texts.faqs : null,
      },
    }));
  }, [tone, texts]);

  function patch(forTone: Tone, values: Partial<Texts>, source: Source) {
    setVersions((current) => {
      const base = current[forTone] ?? current[tone] ?? EMPTY;
      const next: Version = { texts: { ...base.texts }, sources: { ...base.sources } };
      for (const field of FIELDS) {
        const value = values[field];
        if (value === undefined) continue;
        (next.texts as unknown as Record<Field, unknown>)[field] = value;
        next.sources[field] = isEmpty(next.texts, field) ? "empty" : source;
      }
      return { ...current, [forTone]: next };
    });
  }

  async function generate(field: Field | "all", forTone: Tone, previousTone?: Tone) {
    if (!token) return;
    setAiMessage(undefined);
    setErrors({});
    setBusy(field);
    const current =
      field === "all" ? undefined : field === "faqs" ? texts.faqs.map((faq) => faq.question).join("\n") : texts[field];
    const result = await signupApi.generateContent(forTone, token, field === "all" ? undefined : field, current);
    setBusy(null);
    if (!result.ok) {
      setAiMessage(result.message);
      if (result.code === 429) setAiLeft(0);
      // The new tone could not be written: stay on the tone whose texts are shown.
      if (previousTone) setTone(previousTone);
      return;
    }
    const { headline, description, faqs, ai_generations_left } = result.data;
    setAiLeft(ai_generations_left);
    patch(forTone, { headline, description, faqs }, "ai");
    if (field !== "all") setEditing((current) => ({ ...current, [field]: false }));
    setOpenFaq(null);
  }

  // First visit with nothing saved: write the page in the default (Warm) tone.
  const started = useRef(false);
  const writeFirstVersion = useEffectEvent(() => {
    if (aiAvailable && aiLeft > 0 && Object.keys(versions).length === 0) void generate("all", tone);
  });
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    writeFirstVersion();
  }, []);

  function chooseTone(next: Tone) {
    const previous = tone;
    setTone(next);
    setEditing({ headline: false, description: false, faqs: false });
    setAiMessage(undefined);
    if (versions[next]) return;
    if (aiAvailable && aiLeft > 0) {
      void generate("all", next, previous);
    } else {
      // No AI: the texts stay as they are, only the tone changes.
      setVersions((current) => ({ ...current, [next]: current[previous] ?? EMPTY }));
    }
  }

  function edit(field: Field, value: Partial<Texts>) {
    patch(tone, value, "edited");
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  }

  async function onContinue() {
    if (!token) return;
    const headline = texts.headline.trim();
    const description = texts.description.trim();
    const faqs = texts.faqs
      .map((faq) => ({ question: faq.question.trim(), answer: faq.answer.trim() }))
      .filter((faq) => faq.question || faq.answer);
    const next: typeof errors = {
      description: !description
        ? aiAvailable
          ? "Please write a description, or choose a tone to let AI write one."
          : "Please write a description."
        : description.length > MAX_DESCRIPTION
          ? `Maximum ${MAX_DESCRIPTION} characters allowed.`
          : undefined,
      headline: headline.length > MAX_HEADLINE ? `Maximum ${MAX_HEADLINE} characters allowed.` : undefined,
      faqs: faqs.some((faq) => !faq.question || !faq.answer) ? "Every question needs an answer." : undefined,
    };
    const invalid = FIELDS.find((field) => next[field]);
    if (invalid) {
      setErrors(next);
      setEditing((current) => ({ ...current, [invalid]: true }));
      return;
    }
    setSaving(true);
    const result = await signupApi.description({ headline, description, faqs, tone }, token);
    setSaving(false);
    if (result.ok) {
      updateSignupState(result.data);
      router.push(hrefForNextStep(result.data.next_step));
      return;
    }
    if (result.code === 409 && result.data) {
      router.push(hrefForNextStep((result.data as { next_step: number | "done" }).next_step));
      return;
    }
    const serverErrors = result.errors as typeof errors;
    setErrors(Object.keys(serverErrors).length > 0 ? serverErrors : { form: result.message });
    const first = FIELDS.find((field) => serverErrors[field]);
    if (first) setEditing((current) => ({ ...current, [first]: true }));
  }

  const toneLabel = TONES.find((item) => item.value === tone)?.label.toLowerCase() ?? tone;
  const status =
    busy === "all"
      ? `Writing your page in a ${toneLabel} tone… this can take up to a minute.`
      : busy
        ? `Rewriting the ${FIELD_NAMES[busy]}…`
        : "";
  const canRewrite = aiAvailable && aiLeft > 0 && !busy;
  const cardProps = (field: Field) => ({
    source: sources[field],
    editing: editing[field],
    busy: busy === field || busy === "all",
    canRewrite,
    onRewrite: aiAvailable ? () => generate(field, tone) : undefined,
    onEdit: () => setEditing((current) => ({ ...current, [field]: !current[field] })),
    error: errors[field],
  });

  return (
    <StepCard
      title={nothingWritten && !busy ? "Describe your property" : "Your page is written"}
      description="Review it, edit anything you like, then continue."
    >
      <Notice title="Check before you publish">
        AI can make mistakes. Check details such as breakfast, pets and check-in times, and edit anything that
        isn&apos;t right for your property.
      </Notice>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <RadioChips
          name="tone"
          legend="Tone"
          options={TONES}
          value={tone}
          onChange={chooseTone}
          disabled={Boolean(busy) || saving}
        />
        {aiAvailable ? (
          <Tag>
            <Icon name="sparkles" size={13} className="mr-1 text-primary" />
            {aiLeft} AI {aiLeft === 1 ? "rewrite" : "rewrites"} left
          </Tag>
        ) : null}
      </div>
      <p className="mt-2 text-caption text-muted">
        {aiAvailable
          ? "Choosing a tone writes the headline, description and questions again in that tone, in English."
          : "AI writing isn't available right now — write your texts below."}
      </p>

      <p role="status" aria-live="polite" className={cn("text-small font-medium text-heading", status && "mt-4")}>
        {status ? (
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="size-4 animate-spin rounded-pill border-2 border-border border-t-primary" />
            {status}
          </span>
        ) : null}
      </p>
      {aiMessage ? (
        <p role="alert" className="mt-3 flex items-center gap-1.5 text-small font-medium text-error">
          <Icon name="alert" size={15} /> {aiMessage}
        </p>
      ) : null}

      <div className="mt-5 grid gap-4">
        <CopyCard
          title="Page headline"
          {...cardProps("headline")}
          footer={editing.headline ? `${texts.headline.length}/${MAX_HEADLINE} characters` : undefined}
        >
          {editing.headline ? (
            <TextField
              id="copy-headline"
              label="Page headline"
              srOnlyLabel
              maxLength={MAX_HEADLINE}
              placeholder="e.g. Your private pool villa, minutes from the beach"
              value={texts.headline}
              onChange={(event) => edit("headline", { headline: event.target.value })}
              error={errors.headline}
            />
          ) : (
            <p className={cn("font-heading text-title", texts.headline ? "text-heading" : "text-muted")}>
              {texts.headline || "No headline yet."}
            </p>
          )}
        </CopyCard>

        <CopyCard
          title="Description"
          {...cardProps("description")}
          footer={`${countWords(texts.description)} words${editing.description ? " · separate paragraphs with an empty line" : ""}`}
        >
          {editing.description ? (
            <TextareaField
              id="copy-description"
              label="Description"
              srOnlyLabel
              rows={9}
              maxLength={MAX_DESCRIPTION}
              placeholder="Describe your place: the rooms, the view, what's nearby and what makes a stay special."
              value={texts.description}
              onChange={(event) => edit("description", { description: event.target.value })}
              error={errors.description}
              required
            />
          ) : texts.description ? (
            <div className="grid gap-3 text-small leading-relaxed text-body-strong">
              {texts.description.split(/\n\s*\n/).map((paragraph, index) => (
                <p key={index} className="whitespace-pre-line">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-small text-muted">No description yet.</p>
          )}
        </CopyCard>

        <CopyCard title="Questions guests ask" {...cardProps("faqs")}>
          {editing.faqs ? (
            <FaqEditor faqs={texts.faqs} onChange={(faqs) => edit("faqs", { faqs })} error={errors.faqs} />
          ) : texts.faqs.length > 0 ? (
            <ul className="divide-y divide-divider">
              {texts.faqs.map((faq, index) => {
                const open = openFaq === index;
                const panelId = `faq-answer-${index}`;
                return (
                  <li key={index}>
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={panelId}
                      onClick={() => setOpenFaq(open ? null : index)}
                      className="flex w-full items-center justify-between gap-3 rounded-sm py-3 text-left text-small font-semibold text-heading focus-visible:outline-none focus-visible:focus-ring"
                    >
                      {faq.question}
                      <Icon name={open ? "minus" : "plus"} size={16} className="shrink-0 text-primary" />
                    </button>
                    <p id={panelId} hidden={!open} className="pb-3 text-small text-body">
                      {faq.answer}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-small text-muted">No questions yet (optional).</p>
          )}
        </CopyCard>
      </div>

      {errors.form ? (
        <p role="alert" className="mt-4 flex items-center gap-1.5 text-small font-medium text-error">
          <Icon name="alert" size={15} /> {errors.form}
        </p>
      ) : null}

      <StepFooter
        start={
          <Button href="/setup/photos" variant="text">
            Back
          </Button>
        }
        end={
          <Button size="lg" onClick={onContinue} disabled={saving || Boolean(busy)} aria-busy={saving}>
            {saving ? "Saving…" : "Continue"}
          </Button>
        }
      />
    </StepCard>
  );
}

function CopyCard({
  title,
  source,
  editing,
  busy,
  canRewrite,
  onRewrite,
  onEdit,
  error,
  children,
  footer,
}: {
  title: string;
  source: Source;
  editing: boolean;
  busy: boolean;
  canRewrite: boolean;
  onRewrite?: () => void;
  onEdit: () => void;
  error?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const name = title.toLowerCase();
  return (
    <section
      aria-busy={busy}
      className={cn("rounded-input border bg-surface p-4 sm:p-5", error ? "border-error" : "border-border")}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-body text-small font-bold text-heading">
          {title}
          {source === "ai" ? <Tag>Written by AI</Tag> : null}
          {source === "edited" ? <Tag>Edited</Tag> : null}
        </h2>
        <div className="flex gap-2">
          {onRewrite ? (
            <Button size="sm" variant="outline" onClick={onRewrite} disabled={!canRewrite}>
              <Icon name="refresh" size={14} className={cn(busy && "animate-spin")} /> Rewrite
              <span className="sr-only"> {name}</span>
            </Button>
          ) : null}
          <Button
            size="sm"
            variant={editing ? "secondary" : "outline"}
            onClick={onEdit}
            aria-pressed={editing}
            disabled={busy}
          >
            <Icon name={editing ? "check" : "pencil"} size={14} />
            {editing ? "Done" : "Edit"}
            <span className="sr-only"> {name}</span>
          </Button>
        </div>
      </div>
      {busy ? <Skeleton /> : children}
      {error && !editing ? <p className="mt-2 text-small font-medium text-error">{error}</p> : null}
      {footer && !busy ? <div className="mt-2 text-caption text-muted">{footer}</div> : null}
    </section>
  );
}

function Skeleton() {
  return (
    <div aria-hidden="true" className="grid animate-pulse gap-2 py-1">
      <span className="h-3 w-11/12 rounded-sm bg-surface-muted" />
      <span className="h-3 w-full rounded-sm bg-surface-muted" />
      <span className="h-3 w-3/4 rounded-sm bg-surface-muted" />
    </div>
  );
}

function FaqEditor({
  faqs,
  onChange,
  error,
}: {
  faqs: SignupFaq[];
  onChange: (faqs: SignupFaq[]) => void;
  error?: string;
}) {
  const update = (index: number, patch: Partial<SignupFaq>) =>
    onChange(faqs.map((faq, i) => (i === index ? { ...faq, ...patch } : faq)));
  return (
    <div className="grid gap-4">
      {faqs.map((faq, index) => (
        <fieldset key={index} className="grid gap-2 rounded-input bg-surface-muted p-3">
          <legend className="sr-only">Question {index + 1}</legend>
          <TextField
            id={`faq-q-${index}`}
            label={`Question ${index + 1}`}
            maxLength={200}
            value={faq.question}
            onChange={(event) => update(index, { question: event.target.value })}
          />
          <TextareaField
            id={`faq-a-${index}`}
            label="Answer"
            rows={2}
            maxLength={1000}
            value={faq.answer}
            onChange={(event) => update(index, { answer: event.target.value })}
          />
          <Button
            size="sm"
            variant="text"
            className="justify-self-start"
            onClick={() => onChange(faqs.filter((_, i) => i !== index))}
          >
            <Icon name="trash" size={14} /> Remove question
          </Button>
        </fieldset>
      ))}
      {error ? (
        <p role="alert" className="text-small font-medium text-error">
          {error}
        </p>
      ) : null}
      {faqs.length < MAX_FAQS ? (
        <Button
          size="sm"
          variant="outline"
          className="justify-self-start"
          onClick={() => onChange([...faqs, { question: "", answer: "" }])}
        >
          <Icon name="plus" size={14} /> Add question
        </Button>
      ) : null}
    </div>
  );
}
