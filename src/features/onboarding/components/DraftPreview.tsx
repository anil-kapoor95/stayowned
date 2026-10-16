"use client";

import { PropertyDetails } from "@/components/property/PropertyDetails";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { draftToProperty } from "../draft-to-property";
import { useDraft } from "../draft-store";
import { LIVE_HREF } from "../steps";

/** Renders the host's draft with the same component as published property pages. */
export function DraftPreview() {
  const draft = useDraft();
  const property = draftToProperty(draft);
  return (
    <div data-theme={property.theme} className="flex-1 bg-background">
      <div className="border-b border-primary-subtle bg-warning-soft">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3 text-small text-warning">
          <p className="flex items-center gap-2 font-medium">
            <Icon name="eye" size={16} /> Preview of your draft page — this is how guests will see it once published.
          </p>
          <Button href={LIVE_HREF} size="sm" variant="outline">
            <Icon name="arrowLeft" size={14} /> Back to setup
          </Button>
        </div>
      </div>
      <PropertyDetails property={property} />
    </div>
  );
}
