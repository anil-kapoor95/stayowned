"use client";

import { useId, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Icon, WhatsAppMark } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { FAQ_GROUPS, type FaqGroup } from "./faq-data";
import { MarketingIcon } from "./icons";
import { CtaBanner, Eyebrow, SUPPORT } from "./ui";

const POPULAR = [
  { label: "Is it free?", query: "free" },
  { label: "How do I get paid?", query: "paid" },
  { label: "Double bookings", query: "double bookings" },
  { label: "Custom domain", query: "domain" },
];

function GroupIcon({ name }: { name: FaqGroup["icon"] }) {
  if (name === "card" || name === "globe" || name === "user") return <MarketingIcon name={name} size={20} />;
  return <Icon name={name} size={20} />;
}

/** FAQ page from the Figma "Faqs" frame: search, popular topics, category sidebar and grouped answers. */
export function FaqPage() {
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(FAQ_GROUPS[0].id);
  const [open, setOpen] = useState<string | null>(FAQ_GROUPS[0].items[0].id);
  const baseId = useId();

  const groups = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return FAQ_GROUPS;
    return FAQ_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        const text = `${item.question} ${item.answer}`.toLowerCase();
        return terms.every((term) => text.includes(term));
      }),
    })).filter((group) => group.items.length);
  }, [query]);

  const resultCount = groups.reduce((sum, group) => sum + group.items.length, 0);

  function search(value: string) {
    setDraft(value);
    setQuery(value);
    const first = FAQ_GROUPS.flatMap((g) => g.items).find((item) =>
      value
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .every((term) => `${item.question} ${item.answer}`.toLowerCase().includes(term)),
    );
    setOpen(first?.id ?? null);
    document.getElementById("faq-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    search(draft);
  }

  function goTo(id: string) {
    setActive(id);
    if (query) {
      setQuery("");
      setDraft("");
    }
    requestAnimationFrame(() =>
      document.getElementById(`faq-group-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  return (
    <>
      <section
        aria-labelledby="faq-title"
        className="relative overflow-hidden bg-linear-to-br from-primary-soft via-primary-tint to-surface"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -left-40 -top-40 size-[30rem] rounded-pill border border-primary-subtle/70"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-48 -right-32 size-[34rem] rounded-pill border border-primary-subtle/70"
        />
        <div className="container-page relative py-14 text-center sm:py-20">
          <Eyebrow variant="lines">FAQ</Eyebrow>
          <h1 id="faq-title" className="mt-4 text-hero">
            Questions? <span className="block text-brand">We&apos;ve got answers.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lead text-body">
            Everything about going live, getting paid and staying in sync.
          </p>

          <form
            role="search"
            onSubmit={onSubmit}
            className="mx-auto mt-8 flex max-w-2xl items-center gap-2 rounded-pill border border-border bg-surface p-1.5 pl-5 shadow-card focus-within:border-primary"
          >
            <Icon name="search" size={18} className="shrink-0 text-muted" />
            <label htmlFor={`${baseId}-q`} className="sr-only">
              Search questions
            </label>
            <input
              id={`${baseId}-q`}
              type="search"
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                if (!event.target.value) setQuery("");
              }}
              placeholder='Search questions, like "How do I get paid?"'
              className="min-w-0 flex-1 bg-transparent py-2 text-small text-heading outline-none placeholder:text-muted"
            />
            <Button type="submit" className="rounded-pill">
              Search
            </Button>
          </form>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-caption">
            <span className="font-semibold text-body">Popular:</span>
            {POPULAR.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => search(chip.query)}
                className="rounded-pill border border-border bg-surface px-3 py-1.5 font-semibold text-heading transition-colors hover:border-primary hover:text-primary-strong focus-visible:outline-none focus-visible:focus-ring"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="faq-results" aria-label="Questions and answers" className="container-page scroll-mt-24 py-section">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <aside className="grid gap-5 lg:sticky lg:top-24">
            <nav aria-label="FAQ categories" className="rounded-card border border-border bg-surface p-3">
              <p className="px-3 pb-2 pt-1 text-caption font-bold uppercase tracking-wider text-muted">Categories</p>
              <ul className="grid gap-1">
                {FAQ_GROUPS.map((group) => {
                  const isActive = !query && active === group.id;
                  return (
                    <li key={group.id}>
                      <button
                        type="button"
                        onClick={() => goTo(group.id)}
                        aria-current={isActive ? "true" : undefined}
                        className={cn(
                          "flex w-full items-center justify-between gap-3 rounded-input px-3 py-2.5 text-left text-small font-semibold transition-colors focus-visible:outline-none focus-visible:focus-ring",
                          isActive ? "bg-primary-soft text-heading" : "text-body hover:bg-surface-muted",
                        )}
                      >
                        {group.title}
                        <span
                          className={cn(
                            "grid min-w-6 place-items-center rounded-pill px-1.5 text-caption",
                            isActive ? "bg-primary text-on-primary" : "bg-surface-muted text-body",
                          )}
                        >
                          {group.items.length}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="rounded-card bg-secondary-active p-6 text-on-dark">
              <p className="font-heading text-title text-on-dark">Need a hand?</p>
              <p className="mt-2 text-small text-on-dark-muted">
                Our onboarding team can walk you through setup on WhatsApp.
              </p>
              <Button href={SUPPORT.whatsappHref} external variant="whatsapp" fullWidth className="mt-5">
                <WhatsAppMark size={18} /> Chat with us
              </Button>
            </div>
          </aside>

          <div className="grid gap-10">
            <p className="sr-only" role="status" aria-live="polite">
              {query ? `${resultCount} ${resultCount === 1 ? "question matches" : "questions match"} “${query}”` : ""}
            </p>
            {query ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-input bg-surface-muted px-5 py-3 text-small">
                <span className="text-body">
                  {resultCount} {resultCount === 1 ? "result" : "results"} for{" "}
                  <strong className="text-heading">“{query}”</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setDraft("");
                  }}
                  className="font-semibold text-primary-strong underline-offset-2 hover:underline focus-visible:outline-none focus-visible:focus-ring"
                >
                  Clear search
                </button>
              </div>
            ) : null}

            {groups.length === 0 ? (
              <div className="rounded-card border border-dashed border-border p-8 text-center">
                <p className="font-heading text-title">No questions match your search.</p>
                <p className="mt-2 text-small text-body">Try another word, or ask our team directly.</p>
                <Button href="/contact" variant="outline" className="mt-5">
                  Contact support
                </Button>
              </div>
            ) : null}

            {groups.map((group) => (
              <section
                key={group.id}
                id={`faq-group-${group.id}`}
                aria-labelledby={`faq-group-${group.id}-title`}
                className="scroll-mt-24"
              >
                <h2 id={`faq-group-${group.id}-title`} className="flex items-center gap-3 font-heading text-section">
                  <span className="grid size-11 place-items-center rounded-input bg-primary-soft text-primary-strong">
                    <GroupIcon name={group.icon} />
                  </span>
                  {group.title}
                </h2>
                <div className="mt-5 divide-y divide-divider overflow-hidden rounded-card border border-border bg-surface">
                  {group.items.map((item) => {
                    const isOpen = open === item.id;
                    const panelId = `${baseId}-${item.id}`;
                    return (
                      <div key={item.id}>
                        <h3 className="font-body text-base">
                          <button
                            type="button"
                            aria-expanded={isOpen}
                            aria-controls={panelId}
                            onClick={() => setOpen(isOpen ? null : item.id)}
                            className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-semibold text-heading hover:bg-surface-muted/60 focus-visible:outline-none focus-visible:focus-ring"
                          >
                            {item.question}
                            <Icon
                              name={isOpen ? "x" : "plus"}
                              size={18}
                              strokeWidth={2.5}
                              className="shrink-0 text-brand"
                            />
                          </button>
                        </h3>
                        <div id={panelId} hidden={!isOpen} className="px-6 pb-5 text-small text-body">
                          {item.answer}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner
        title="Still have questions?"
        description="Chat with our team on WhatsApp and we'll help you get your page live."
      >
        <Button href={SUPPORT.whatsappHref} external size="lg">
          <WhatsAppMark size={18} /> Chat with us on WhatsApp
        </Button>
        <Button href="/setup/account" size="lg" variant="onDark">
          Create my free website
        </Button>
      </CtaBanner>
    </>
  );
}
