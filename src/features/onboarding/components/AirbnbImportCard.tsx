"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Card";
import { TextField } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { parseAirbnbListingUrl, type AirbnbImportResponse } from "@/lib/airbnb-import";
import { importAirbnbListing } from "@/lib/api/airbnb-import";

/**
 * "Already on Airbnb? Import your listing" (step 3). Reads the listing through
 * POST /api/airbnb-import and hands it to the property form, which the host reviews
 * and saves. Nothing is saved from here.
 */
export function AirbnbImportCard({
  token,
  onImported,
}: {
  token: string | null;
  onImported: (result: AirbnbImportResponse) => void;
}) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (importing) return;
    setMessage(null);
    const parsed = parseAirbnbListingUrl(url);
    if (!parsed.ok) {
      setError(parsed.error);
      document.getElementById("airbnb-listing-url")?.focus();
      return;
    }
    if (!token) {
      setMessage("Your session has ended. Please log in again.");
      return;
    }
    setError(undefined);
    setImporting(true);
    const result = await importAirbnbListing(parsed.url, token);
    setImporting(false);
    if (result.ok) {
      onImported(result.data);
      return;
    }
    if (result.errors.url) {
      setError(result.errors.url);
      if (result.code !== 422) setMessage(result.message);
      document.getElementById("airbnb-listing-url")?.focus();
    } else {
      setMessage(result.message);
    }
  }

  return (
    <section
      aria-labelledby="airbnb-import-title"
      className="rounded-card border border-primary-subtle bg-primary-tint p-5 shadow-card sm:p-7"
    >
      <h2 id="airbnb-import-title" className="flex items-center gap-3 font-heading text-title font-extrabold text-heading">
        <Icon name="link" size={20} className="shrink-0 text-primary" /> Already on Airbnb? Import your listing
      </h2>
      <p className="mt-2 text-base text-body">
        Paste your listing link and we&apos;ll fill in the details for you. You can review everything before
        publishing.
      </p>

      <form noValidate onSubmit={onSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-start">
        <TextField
          id="airbnb-listing-url"
          label="Airbnb listing link"
          srOnlyLabel
          type="url"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          placeholder="https://www.airbnb.co.in/rooms/12345678"
          prefix={<Icon name="link" size={18} className="text-primary" />}
          wrapperClassName="flex-1"
          className="bg-surface"
          value={url}
          onChange={(event) => {
            setUrl(event.target.value);
            setError(undefined);
          }}
          error={error}
        />
        <Button type="submit" variant="secondary" size="lg" disabled={importing} aria-busy={importing} className="sm:min-w-28">
          {importing ? "Importing…" : "Import"}
        </Button>
      </form>

      {message ? (
        <Notice tone="info" role="status" className="mt-4">
          {message}
        </Notice>
      ) : null}

      <p className="mt-4 text-base text-body">Not on Airbnb? Just fill in the details below.</p>
    </section>
  );
}
