import type { ReactNode } from "react";

/** Branding line of the websites: text and link from the back office (System Options > Visual & Branding). */
export type BrandingLine = { text: string; footer: string; url: string };

const fallback: BrandingLine = { text: "Designed by PHPJabbers", footer: "Website by PHPJabbers", url: "https://www.phpjabbers.com" };

function Linked({ url, children }: { url: string; children: ReactNode }) {
  return url ? (
    <a href={url} target="_blank" rel="noopener" className="hover:underline">
      {children}
    </a>
  ) : (
    <>{children}</>
  );
}

/** The line at the top of the page; nothing when the plan hides it or the text is empty. */
export function BrandingBar({ show, line }: { show?: boolean; line?: BrandingLine }) {
  const l = line ?? fallback;
  if (show === false || !l.text) return null;
  return (
    <p className="bg-(--p-brand) py-2 text-center text-[0.75rem] font-medium text-white">
      <span aria-hidden="true" className="mr-1.5 inline-block size-1.5 rounded-full bg-(--p-accent) align-middle" />
      <Linked url={l.url}>{l.text}</Linked>
    </p>
  );
}

/** " | Website by …" after the footer's copyright; nothing when hidden. */
export function BrandingFooter({ show, line }: { show?: boolean; line?: BrandingLine }) {
  const l = line ?? fallback;
  if (show === false || !l.footer) return null;
  return (
    <>
      {" | "}
      <Linked url={l.url}>{l.footer}</Linked>
    </>
  );
}
