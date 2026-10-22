"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { SafeImage } from "@/components/ui/SafeImage";
import { cn } from "@/lib/utils";
import type { PropertyImage } from "@/types/property";

/** Cover + thumbnails grid with an accessible lightbox (arrow keys, Escape). */
export function PropertyGallery({ images, name }: { images: PropertyImage[]; name: string }) {
  const [index, setIndex] = useState<number | null>(null);
  const open = (i: number) => setIndex(i);
  const total = images.length;
  const step = (delta: number) => setIndex((current) => (current === null ? 0 : (current + delta + total) % total));

  if (total === 0) {
    return (
      <div className="grid aspect-hero place-items-center rounded-card bg-surface-muted text-muted">
        <Icon name="image" size={32} />
      </div>
    );
  }

  const [cover, ...rest] = images;
  const thumbs = rest.slice(0, 4);

  return (
    <div className="relative">
      <div
        className={cn(
          "grid gap-2 overflow-hidden rounded-card",
          thumbs.length >= 3 && "md:grid-cols-4 md:grid-rows-2",
          thumbs.length > 0 && thumbs.length < 3 && "md:grid-cols-3 md:grid-rows-2",
          // One thumbnail spans both rows, so nothing else gives the grid a height.
          thumbs.length === 1 && "md:aspect-hero",
        )}
      >
        <GalleryButton
          // One photo: keep a wide banner shape (without thumbnails the grid gives it no height).
          className={cn("aspect-photo", thumbs.length ? "md:col-span-2 md:row-span-2 md:aspect-auto" : "md:aspect-hero")}
          onClick={() => open(0)}
          label={`Open photo 1 of ${total}: ${cover.alt}`}
        >
          <SafeImage src={cover.src} alt="" fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </GalleryButton>
        {thumbs.map((image, i) => (
          <GalleryButton
            key={image.src}
            className={cn(
              "hidden aspect-photo md:block",
              // Fill the grid when there are fewer than four thumbnails.
              thumbs.length === 3 && i === 2 && "md:col-span-2 md:aspect-auto",
              thumbs.length === 1 && "md:row-span-2 md:aspect-auto",
            )}
            onClick={() => open(i + 1)}
            label={`Open photo ${i + 2} of ${total}: ${image.alt}`}
          >
            <SafeImage src={image.src} alt="" fill sizes="25vw" className="object-cover" />
          </GalleryButton>
        ))}
      </div>
      {total > 1 ? (
        <Button size="sm" variant="outline" className="absolute bottom-3 right-3" onClick={() => open(0)}>
          <Icon name="image" size={15} /> Show all {total} photos
        </Button>
      ) : null}

      <Dialog open={index !== null} onClose={() => setIndex(null)} title={`${name} — photos`}
        size="xl"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") step(1);
          if (event.key === "ArrowLeft") step(-1);
        }}
      >
        {index !== null ? (
          <div>
            <figure>
              <div className="relative aspect-photo overflow-hidden rounded-media bg-surface-muted">
                <SafeImage src={images[index].src} alt={images[index].alt} fill sizes="(min-width: 1024px) 960px, 100vw" className="object-contain" />
              </div>
              <figcaption className="mt-3 flex items-center justify-between gap-4 text-small text-body">
                <span>{images[index].alt}</span>
                <span className="shrink-0 tabular-nums" aria-live="polite">
                  {index + 1} / {total}
                </span>
              </figcaption>
            </figure>
            {total > 1 ? (
              <div className="mt-4 flex justify-between gap-3">
                <Button variant="outline" onClick={() => step(-1)}>
                  <Icon name="chevronLeft" size={16} /> Previous
                </Button>
                <Button variant="outline" onClick={() => step(1)}>
                  Next <Icon name="chevronRight" size={16} />
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}

function GalleryButton({
  className,
  onClick,
  label,
  children,
}: {
  className?: string;
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "relative block overflow-hidden bg-surface-muted focus-visible:outline-none focus-visible:focus-ring",
        "after:absolute after:inset-0 after:bg-black/0 after:transition-colors hover:after:bg-black/10",
        className,
      )}
    >
      {children}
    </button>
  );
}
