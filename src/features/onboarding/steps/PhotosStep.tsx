"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type DragEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { SafeImage } from "@/components/ui/SafeImage";
import { importAirbnbPhotos } from "@/lib/api/airbnb-import";
import { signupApi } from "@/lib/api/signup";
import { cn } from "@/lib/utils";
import { updateDraft, useDraft } from "../draft-store";
import { updateSignupState, useSignupSession } from "../signup-session";
import { hrefForNextStep } from "../steps";
import { StepCard, StepFooter } from "../components/WizardShell";

const MAX_PHOTOS = 20; // pjJabbApi::MAX_PHOTOS
const RECOMMENDED = 5;
const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = ["image/jpeg", "image/png", "image/gif"]; // formats the back end stores
const SHOT_LIST = [
  "Outside view",
  "Living area",
  "Every bedroom",
  "Bathrooms",
  "Kitchen",
  "Pool or garden",
  "The view",
];

/**
 * Step 4 — photos (pjActionSignupPhotos / pjActionSignupDeletePhoto). Files are
 * uploaded as soon as they are chosen; the server keeps them in upload order.
 */
export function PhotosStep() {
  const router = useRouter();
  const { token, state } = useSignupSession();
  const photos = state?.photos ?? [];
  const propertyName = state?.property?.name || "your property";
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string>();
  const imported = useDraft().imported;
  const airbnbPhotos = imported && !imported.photosImported ? imported.photos : [];
  const [importingAirbnb, setImportingAirbnb] = useState(false);

  /** Adds the photos found on the imported Airbnb listing (step 2) through /api/airbnb-import/photos. */
  async function addAirbnbPhotos() {
    if (!token || !imported || importingAirbnb) return;
    setError(undefined);
    setMessages([]);
    setImportingAirbnb(true);
    setStatus(`Adding ${airbnbPhotos.length} photos from Airbnb…`);
    const result = await importAirbnbPhotos(
      imported.listingId,
      airbnbPhotos.map((photo) => photo.url),
      token,
    );
    setImportingAirbnb(false);
    if (!result.ok) {
      setStatus("");
      setError(result.errors.photos ?? result.message);
      return;
    }
    updateSignupState(result.data.state);
    updateDraft((current) => (current.imported ? { ...current, imported: { ...current.imported, photosImported: true } } : current));
    const notes: string[] = [];
    if (result.data.failed > 0) notes.push(`${result.data.failed} Airbnb photo(s) could not be added.`);
    if (result.data.skipped > 0) notes.push(`${result.data.skipped} photo(s) were left out: a property can have up to ${MAX_PHOTOS} photos.`);
    setMessages(notes);
    setStatus(result.message);
  }

  async function addFiles(fileList: FileList | null) {
    if (!fileList || !token) return;
    setError(undefined);
    const problems: string[] = [];
    const accepted: File[] = [];
    for (const file of Array.from(fileList)) {
      if (photos.length + accepted.length >= MAX_PHOTOS) {
        problems.push(`You can add up to ${MAX_PHOTOS} photos.`);
        break;
      }
      if (!ACCEPT.includes(file.type)) {
        problems.push(`${file.name}: only JPG, PNG or GIF images are supported.`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        problems.push(`${file.name}: files must be under 10 MB.`);
        continue;
      }
      accepted.push(file);
    }

    if (accepted.length) {
      setUploading(accepted.length);
      setStatus(`Uploading ${accepted.length} photo${accepted.length === 1 ? "" : "s"}…`);
      const result = await signupApi.photos(accepted, token);
      setUploading(0);
      if (result.ok) {
        updateSignupState(result.data);
        result.data.photo_errors?.forEach((item) => problems.push(`${item.file}: ${item.error}`));
        setStatus(`${accepted.length - (result.data.photo_errors?.length ?? 0)} photo(s) added.`);
      } else {
        const failed = (result.data as { photo_errors?: { file: string; error: string }[] } | undefined)?.photo_errors;
        failed?.forEach((item) => problems.push(`${item.file}: ${item.error}`));
        setError(result.errors.photos ?? result.message);
        setStatus("");
      }
    }
    setMessages(problems);
  }

  async function remove(photoId: number) {
    if (!token) return;
    setError(undefined);
    setDeleting(photoId);
    const result = await signupApi.deletePhoto(photoId, token);
    setDeleting(null);
    if (result.ok) {
      updateSignupState(result.data);
      setStatus("Photo removed.");
    } else {
      setError(result.errors.photos ?? result.message);
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(false);
    void addFiles(event.dataTransfer.files);
  }

  function onContinue() {
    if (!state) return;
    if (photos.length === 0 || state.completed_steps < 4) {
      setError("Please add at least one photo.");
      return;
    }
    router.push(hrefForNextStep(state.next_step));
  }

  const progress = Math.min(photos.length, RECOMMENDED) / RECOMMENDED;
  const remaining = Math.max(0, RECOMMENDED - photos.length);
  const busy = uploading > 0;

  return (
    <StepCard
      title={`Add photos of ${propertyName}`}
      description="Great photos get more bookings. Our AI also reads them to write your description."
    >
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
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
            disabled={busy}
            className="rounded-sm text-primary-strong underline underline-offset-2 hover:text-primary focus-visible:outline-none focus-visible:focus-ring disabled:opacity-50"
          >
            browse
          </button>
        </p>
        <p className="text-caption text-muted">JPG, PNG or GIF · up to 10 MB each · up to {MAX_PHOTOS} photos</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT.join(",")}
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-label="Choose photos to upload"
          onChange={(event) => {
            void addFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {airbnbPhotos.length > 0 && photos.length < MAX_PHOTOS ? (
        <section
          aria-labelledby="airbnb-photos-title"
          className="mt-4 flex flex-col gap-3 rounded-input border border-primary-subtle bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h2 id="airbnb-photos-title" className="flex items-center gap-2 font-body text-base font-bold text-heading">
              <Icon name="image" size={18} className="text-primary" /> {airbnbPhotos.length} photos found on your Airbnb listing
            </h2>
            <p className="mt-0.5 text-small text-body">
              Add them here in one click{photos.length + airbnbPhotos.length > MAX_PHOTOS ? ` (the first ${MAX_PHOTOS - photos.length})` : ""}. You can remove any of them afterwards.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => void addAirbnbPhotos()}
            disabled={importingAirbnb || busy}
            aria-busy={importingAirbnb}
            className="shrink-0"
          >
            {importingAirbnb ? "Adding photos…" : "Add Airbnb photos"}
          </Button>
        </section>
      ) : null}

      {messages.length ? (
        <Notice tone="error" role="alert" className="mt-3" title="Some files were not added">
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
              className={cn(
                "group relative overflow-hidden rounded-media bg-surface-muted",
                index === 0 ? "col-span-2 row-span-2 aspect-photo sm:aspect-auto" : "aspect-thumb",
                deleting === photo.id && "opacity-50",
              )}
            >
              <SafeImage
                src={index === 0 ? photo.url : photo.thumb_url}
                alt={`Photo ${index + 1} of ${propertyName}`}
                fill
                sizes={index === 0 ? "(min-width: 1024px) 420px, 90vw" : "(min-width: 1024px) 200px, 45vw"}
                className="object-cover"
              />
              {index === 0 ? (
                <span className="absolute left-3 top-3 rounded-sm bg-primary px-2 py-0.5 text-caption font-bold text-on-primary">
                  Cover
                </span>
              ) : null}
              <div className="absolute bottom-2 right-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                <button
                  type="button"
                  aria-label={`Remove photo ${index + 1}`}
                  title="Remove photo"
                  disabled={deleting !== null || photos.length <= 1}
                  onClick={() => void remove(photo.id)}
                  className="grid size-8 place-items-center rounded-pill bg-surface/95 text-heading shadow-card transition-colors hover:bg-surface hover:text-primary focus-visible:outline-none focus-visible:focus-ring disabled:hidden"
                >
                  <Icon name="trash" size={15} />
                </button>
              </div>
            </li>
          ))}
          {Array.from({ length: uploading }, (_, i) => (
            <li
              key={`uploading-${i}`}
              className="grid aspect-thumb place-items-center rounded-media bg-surface-muted"
              aria-hidden="true"
            >
              <span className="size-6 animate-spin rounded-pill border-2 border-border border-t-primary" />
            </li>
          ))}
          {photos.length + uploading < MAX_PHOTOS ? (
            <li className="aspect-thumb">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={busy}
                className="flex size-full flex-col items-center justify-center gap-1 rounded-media border-2 border-dashed border-border-strong text-small font-semibold text-heading transition-colors hover:border-primary hover:bg-primary-tint focus-visible:outline-none focus-visible:focus-ring disabled:opacity-50"
              >
                <Icon name="plus" size={18} className="text-primary" />
                Add more
              </button>
            </li>
          ) : null}
        </ul>
        <p className="mt-2 text-caption text-muted">
          The first photo is your cover. {photos.length === 1 ? "Add another photo before removing this one." : ""}
        </p>
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

      {error ? (
        <p role="alert" className="mt-4 flex items-center gap-1.5 text-small font-medium text-error">
          <Icon name="alert" size={15} /> {error}
        </p>
      ) : null}

      <StepFooter
        start={
          <Button href="/setup/company" variant="text">
            Back
          </Button>
        }
        end={
          <Button size="lg" onClick={onContinue} disabled={busy} aria-busy={busy}>
            {busy ? "Uploading…" : "Continue"}
          </Button>
        }
      />
    </StepCard>
  );
}
