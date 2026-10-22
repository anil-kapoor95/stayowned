"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

/**
 * next/image with graceful failure: shows a neutral placeholder when the file
 * is missing, and serves blob: previews and back-end (absolute URL) photos unoptimised.
 */
export function SafeImage({ src, alt, className, ...props }: ImageProps) {
  const [failedSrc, setFailedSrc] = useState<ImageProps["src"] | null>(null);
  // Local previews (blob:) and files served by the PHP back end are shown as they are.
  const isBlob = typeof src === "string" && /^(blob:|https?:)/.test(src);

  if (failedSrc === src) {
    return (
      <span
        role="img"
        aria-label={alt || "Image unavailable"}
        className={cn(
          "flex size-full items-center justify-center bg-surface-muted text-muted",
          props.fill && "absolute inset-0",
          className,
        )}
      >
        <Icon name="image" size={28} />
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      {...props}
      unoptimized={isBlob || props.unoptimized}
      onError={() => setFailedSrc(src)}
    />
  );
}
