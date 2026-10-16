"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type DragEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { SafeImage } from "@/components/ui/SafeImage";
import { cn } from "@/lib/utils";
import { updateDraft, useDraft } from "../draft-store";
import type { DraftPhoto } from "../types";
import { StepCard, StepFooter } from "../components/WizardShell";

const MAX_PHOTOS = 20;
const RECOMMENDED = 5;
const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = ["image/jpeg", "image/png", "image/webp"];
const SHOT_LIST = ["Outside view", "Living area", "Every bedroom", "Bathrooms", "Kitchen", "Pool or garden", "The view"];

export function PhotosStep() {
  const router = useRouter();
  const { photos, property } = useDraft();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [submitError, setSubmitError] = useState<string>();

  const setPhotos = (next: DraftPhoto[]) => updateDraft((draft) => ({ ...draft, photos: next }));

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    const problems: string[] = [];
    const added: DraftPhoto[] = [];
    for (const file of Array.from(fileList)) {
      if (photos.length + added.length >= MAX_PHOTOS) {
        problems.push(`You can add up to ${MAX_PHOTOS} photos.`);
        break;
      }
      if (!ACCEPT.includes(file.type)) {
        problems.push(`${file.name}: only JPG, PNG or WebP images are supported.`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        problems.push(`${file.name}: files must be under 10 MB.`);
        continue;
      }
      added.push({
        id: `local-${crypto.randomUUID()}`,
        src: URL.createObjectURL(file),
        alt: `Photo of ${property.name || "the property"}: ${file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ")}`,
        local: true,
      });
    }
    if (added.length) {
      setPhotos([...photos, ...added]);
      setStatus(`${added.length} photo${added.length === 1 ? "" : "s"} added.`);
      setSubmitError(undefined);
    }
    setMessages(problems);
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= photos.length || from === to) return;
    const next = [...photos];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setPhotos(next);
    setStatus(to === 0 ? "Photo set as cover." : `Photo moved to position ${to + 1}.`);
  }

  function remove(index: number) {
    const photo = photos[index];
    if (photo.local) URL.revokeObjectURL(photo.src);
    setPhotos(photos.filter((_, i) => i !== index));
    setStatus("Photo removed.");
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(false);
    addFiles(event.dataTransfer.files);
  }

  function onContinue() {
    if (photos.length === 0) {
      setSubmitError("Add at least one photo, or choose “Skip for now”.");
      return;
    }
    router.push("/setup/description");
  }

  const progress = Math.min(photos.length, RECOMMENDED) / RECOMMENDED;
  const remaining = Math.max(0, RECOMMENDED - photos.length);

  return (
    <StepCard
      title={`Add photos of ${property.name || "your property"}`}
      description="Great photos get more bookings. Our AI also reads them to write your description."
    >
      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (dragIndex === null) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => dragIndex === null && onDrop(event)}
        className={cn(
          "flex flex-col items-center justify-center gap-1 rounded-input border-2 border-dashed px-4 py-6 text-center transition-colors",
          dragOver ? "border-primary bg-primary-soft" : "border-primary-subtle bg-primary-tint",
        )}
      >
        <p className="flex items-center gap-2 text-small font-semibold text-heading">
          <Icon name="upload" size={18} className="text-primary" />
          Drag photos here, or{" "}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-sm text-primary-strong underline underline-offset-2 hover:text-primary focus-visible:outline-none focus-visible:focus-ring"
          >
            browse
          </button>
        </p>
        <p className="text-caption text-muted">JPG, PNG or WebP · up to 10 MB each · stays on your device in this demo</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT.join(",")}
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-label="Choose photos to upload"
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>
      {messages.length ? (
        <Notice tone="error" role="alert" className="mt-3" title="Some files were skipped">
          <ul className="list-disc pl-4">
            {messages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </Notice>
      ) : null}

      <section aria-labelledby="your-photos" className="mt-7">
        <div className="flex items-baseline justify-between">
          <h2 id="your-photos" className="font-body text-base font-bold text-heading">
            Your photos
          </h2>
          <span className="text-small text-muted">
            {photos.length} of {MAX_PHOTOS}
          </span>
        </div>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-pill bg-divider"
          role="progressbar"
          aria-label="Recommended photos added"
          aria-valuemin={0}
          aria-valuemax={RECOMMENDED}
          aria-valuenow={Math.min(photos.length, RECOMMENDED)}
        >
          <div className="h-full rounded-pill bg-primary transition-[width]" style={{ width: `${progress * 100}%` }} />
        </div>
        <p className="mt-1.5 text-caption text-muted">
          {remaining > 0 ? `Add ${remaining} more for the best results.` : "Nice — that's enough for a great gallery."}
        </p>

        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo, index) => (
            <li
              key={photo.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragEnd={() => setDragIndex(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (dragIndex !== null) move(dragIndex, index);
                setDragIndex(null);
              }}
              className={cn(
                "group relative overflow-hidden rounded-media bg-surface-muted",
                index === 0 ? "col-span-2 row-span-2 aspect-photo sm:aspect-auto" : "aspect-thumb",
                dragIndex === index && "opacity-50",
              )}
            >
              <SafeImage
                src={photo.src}
                alt={photo.alt}
                fill
                sizes={index === 0 ? "(min-width: 1024px) 420px, 90vw" : "(min-width: 1024px) 200px, 45vw"}
                className="object-cover"
              />
              {index === 0 ? (
                <span className="absolute left-3 top-3 rounded-sm bg-primary px-2 py-0.5 text-caption font-bold text-on-primary">
                  Cover
                </span>
              ) : null}
              <div className="absolute inset-x-2 bottom-2 flex justify-end gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                <PhotoAction label="Move earlier" icon="chevronLeft" disabled={index === 0} onClick={() => move(index, index - 1)} />
                <PhotoAction label="Move later" icon="chevronRight" disabled={index === photos.length - 1} onClick={() => move(index, index + 1)} />
                <PhotoAction label="Remove photo" icon="trash" onClick={() => remove(index)} />
              </div>
            </li>
          ))}
          {photos.length < MAX_PHOTOS ? (
            <li className="aspect-thumb">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex size-full flex-col items-center justify-center gap-1 rounded-media border-2 border-dashed border-border-strong text-small font-semibold text-heading transition-colors hover:border-primary hover:bg-primary-tint focus-visible:outline-none focus-visible:focus-ring"
              >
                <Icon name="plus" size={18} className="text-primary" />
                Add more
              </button>
            </li>
          ) : null}
        </ul>
        <p className="mt-2 text-caption text-muted">Drag to reorder, or use the arrow buttons. The first photo is your cover.</p>
        <p className="sr-only" aria-live="polite">
          {status}
        </p>
      </section>

      <section aria-labelledby="shot-list" className="mt-6 rounded-input bg-surface-muted p-4">
        <h2 id="shot-list" className="font-body text-small font-bold text-heading">
          Photos guests look for
        </h2>
        <ul className="mt-2 flex flex-wrap gap-2">
          {SHOT_LIST.map((shot) => (
            <li key={shot} className="rounded-pill border border-border bg-surface px-3 py-1 text-caption text-heading">
              {shot}
            </li>
          ))}
        </ul>
      </section>

      {submitError ? (
        <p role="alert" className="mt-4 flex items-center gap-1.5 text-small font-medium text-error">
          <Icon name="alert" size={15} /> {submitError}
        </p>
      ) : null}

      <StepFooter
        start={
          <>
            <Button href="/setup/property" variant="text">
              Back
            </Button>
            <Button href="/setup/description" variant="text">
              Skip for now
            </Button>
          </>
        }
        end={
          <Button size="lg" onClick={onContinue}>
            Continue
          </Button>
        }
      />
    </StepCard>
  );
}

function PhotoAction({
  label,
  icon,
  onClick,
  disabled,
}: {
  label: string;
  icon: "chevronLeft" | "chevronRight" | "trash";
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-8 place-items-center rounded-pill bg-surface/95 text-heading shadow-card transition-colors hover:bg-surface hover:text-primary focus-visible:outline-none focus-visible:focus-ring disabled:hidden"
    >
      <Icon name={icon} size={15} />
    </button>
  );
}
