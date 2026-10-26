import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BoltIcon, PiggyBankIcon, VerifiedIcon } from "./figma-icons";

/**
 * "Elevated Minimal Hero" shared by the Figma "pricing page" and "Themes page" frames:
 * pill eyebrow, two-tone display title, short intro and three trust pills.
 */
export function PageHero({
  id,
  eyebrow,
  title,
  intro,
  introClassName = "font-normal text-slate",
}: {
  id: string;
  eyebrow: string;
  title: ReactNode;
  intro: string;
  /** Pricing: regular #68708c; Themes: medium #5a607f (body). */
  introClassName?: string;
}) {
  return (
    <section aria-labelledby={id} className="relative overflow-hidden bg-hero-wash">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-[141px] top-[29px] size-[420px] rounded-pill bg-hero-glow blur-[32px]"
      />
      <div className="container-page relative flex flex-col items-center gap-4 pb-[84px] pt-14 text-center">
        <p className="inline-flex items-center gap-2.5 rounded-pill border border-chip-border-warm bg-white/90 px-[17px] py-[7px] font-display text-caption font-bold uppercase leading-[18px] tracking-[0.1em] text-brand opsz-14 shadow-chip backdrop-blur-[2px]">
          <span aria-hidden="true" className="size-2 rounded-pill bg-brand" />
          {eyebrow}
        </p>
        <h1 id={id} className="max-w-[600px] pt-2 font-display text-hero-xl text-heading opsz-14">
          {title}
        </h1>
        <p className={cn("max-w-[680px] font-display text-[1.125rem] leading-[1.65] opsz-14", introClassName)}>{intro}</p>
        <ul className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <TrustPill icon={<BoltIcon />}>
            WhatsApp reply <span className="text-brand">&lt; 5 mins</span>
          </TrustPill>
          <TrustPill icon={<VerifiedIcon />}>100% Free Concierge Setup</TrustPill>
          <TrustPill icon={<PiggyBankIcon />}>0% Commission Guaranteed</TrustPill>
        </ul>
      </div>
    </section>
  );
}

function TrustPill({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="inline-flex h-[33.5px] items-center gap-2.5 rounded-pill border border-chip-border-warm bg-white px-3.5 font-display text-[0.8125rem] font-bold leading-[19.5px] text-heading opsz-14 drop-shadow-hairline">
      {icon}
      <span className="whitespace-nowrap">{children}</span>
    </li>
  );
}

/** Orange second line of the hero title (Figma uses the 96pt optical size for it). */
export function HeroAccent({ children }: { children: ReactNode }) {
  return <span className="text-brand opsz-96">{children}</span>;
}
