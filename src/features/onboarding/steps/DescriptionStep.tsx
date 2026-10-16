"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Tag } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Card";
import { RadioChips } from "@/components/ui/Chip";
import { TextareaField, TextField } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { countWords } from "@/lib/utils";
import type { Faq } from "@/types/property";
import { generateCopy, TONES, VARIANT_COUNT } from "../copy-templates";
import { updateDraft, useDraft } from "../draft-store";
import type { DraftContent, Tone } from "../types";
import { StepCard, StepFooter } from "../components/WizardShell";

type Field = "headline" | "description" | "faq";

export function DescriptionStep() {
  const router = useRouter();
  const draft = useDraft();
  const copy = generateCopy(draft.property, draft.content);
  const [editing, setEditing] = useState<Field | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const setContent = (patch: Partial<DraftContent>) =>
    updateDraft((current) => ({ ...current, content: { ...current.content, ...patch } }));

  function rewrite(field: Field) {
    const c = draft.content;
    setEditing(null);
    if (field === "headline") setContent({ headlineOverride: null, headlineVariant: (c.headlineVariant + 1) % VARIANT_COUNT });
    if (field === "description")
      setContent({ descriptionOverride: null, descriptionVariant: (c.descriptionVariant + 1) % VARIANT_COUNT });
    if (field === "faq") setContent({ faqOverride: null, faqVariant: (c.faqVariant + 1) % VARIANT_COUNT });
  }

  function setTone(tone: Tone) {
    setEditing(null);
    setContent({ tone, headlineOverride: null, descriptionOverride: null, headlineVariant: 0, descriptionVariant: 0 });
  }

  return (
    <StepCard title="Your page is written" description="Review it, edit anything you like, then continue.">
      <Notice title="Check before you publish">
        AI can make mistakes. We assumed breakfast and a pet policy. Edit anything that isn&apos;t right for your property.
      </Notice>

      <div className="mt-6">
        <RadioChips name="tone" legend="Tone" options={TONES} value={draft.content.tone} onChange={setTone} />
        <p className="mt-2 text-caption text-muted">
          Demo: copy is generated in your browser from your answers — no AI service is connected yet.
        </p>
      </div>

      <div className="mt-6 grid gap-4">
        <CopyCard
          title="Page headline"
          editing={editing === "headline"}
          onRewrite={() => rewrite("headline")}
          onEdit={() => setEditing(editing === "headline" ? null : "headline")}
        >
          {editing === "headline" ? (
            <TextField
              id="copy-headline"
              label="Page headline"
              srOnlyLabel
              maxLength={90}
              value={copy.headline}
              onChange={(event) => setContent({ headlineOverride: event.target.value })}
              autoFocus
            />
          ) : (
            <p className="font-heading text-title text-heading">{copy.headline}</p>
          )}
        </CopyCard>

        <CopyCard
          title="Description"
          editing={editing === "description"}
          onRewrite={() => rewrite("description")}
          onEdit={() => setEditing(editing === "description" ? null : "description")}
          footer={<span>{countWords(copy.description)} words</span>}
        >
          {editing === "description" ? (
            <TextareaField
              id="copy-description"
              label="Description"
              srOnlyLabel
              rows={5}
              maxLength={900}
              value={copy.description}
              onChange={(event) => setContent({ descriptionOverride: event.target.value })}
              autoFocus
            />
          ) : (
            <p className="text-small leading-relaxed text-body-strong">{copy.description}</p>
          )}
        </CopyCard>

        <CopyCard
          title="Questions guests ask"
          editing={editing === "faq"}
          onRewrite={() => rewrite("faq")}
          onEdit={() => setEditing(editing === "faq" ? null : "faq")}
        >
          {editing === "faq" ? (
            <FaqEditor faqs={copy.faqs} onChange={(faqOverride) => setContent({ faqOverride })} />
          ) : (
            <ul className="divide-y divide-divider">
              {copy.faqs.map((faq, index) => {
                const open = openFaq === index;
                const panelId = `faq-answer-${index}`;
                return (
                  <li key={faq.question}>
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
          )}
        </CopyCard>
      </div>

      <StepFooter
        start={
          <Button href="/setup/photos" variant="text">
            Back
          </Button>
        }
        end={
          <Button size="lg" onClick={() => router.push("/setup/theme")}>
            Continue
          </Button>
        }
      />
    </StepCard>
  );
}

function CopyCard({
  title,
  editing,
  onRewrite,
  onEdit,
  children,
  footer,
}: {
  title: string;
  editing: boolean;
  onRewrite: () => void;
  onEdit: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="rounded-input border border-border bg-surface p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-body text-small font-bold text-heading">
          {title} <Tag>Written by AI</Tag>
        </h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onRewrite}>
            <Icon name="refresh" size={14} /> Rewrite<span className="sr-only"> {title.toLowerCase()}</span>
          </Button>
          <Button size="sm" variant={editing ? "secondary" : "outline"} onClick={onEdit} aria-pressed={editing}>
            <Icon name={editing ? "check" : "pencil"} size={14} />
            {editing ? "Done" : "Edit"}
            <span className="sr-only"> {title.toLowerCase()}</span>
          </Button>
        </div>
      </div>
      {children}
      {footer ? <div className="mt-2 text-caption text-muted">{footer}</div> : null}
    </section>
  );
}

function FaqEditor({ faqs, onChange }: { faqs: Faq[]; onChange: (faqs: Faq[]) => void }) {
  const update = (index: number, patch: Partial<Faq>) =>
    onChange(faqs.map((faq, i) => (i === index ? { ...faq, ...patch } : faq)));
  return (
    <div className="grid gap-4">
      {faqs.map((faq, index) => (
        <fieldset key={index} className="grid gap-2 rounded-input bg-surface-muted p-3">
          <legend className="sr-only">Question {index + 1}</legend>
          <TextField id={`faq-q-${index}`} label={`Question ${index + 1}`} value={faq.question} onChange={(e) => update(index, { question: e.target.value })} />
          <TextareaField id={`faq-a-${index}`} label="Answer" rows={2} value={faq.answer} onChange={(e) => update(index, { answer: e.target.value })} />
          <Button size="sm" variant="text" className="justify-self-start" onClick={() => onChange(faqs.filter((_, i) => i !== index))}>
            <Icon name="trash" size={14} /> Remove question
          </Button>
        </fieldset>
      ))}
      {faqs.length < 8 ? (
        <Button size="sm" variant="outline" className="justify-self-start" onClick={() => onChange([...faqs, { question: "New question", answer: "" }])}>
          <Icon name="plus" size={14} /> Add question
        </Button>
      ) : null}
    </div>
  );
}
