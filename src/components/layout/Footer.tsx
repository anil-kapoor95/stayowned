import Link from "next/link";
import { footerNav, siteConfig } from "@/config/site";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-auto bg-footer-bg text-footer-text">
      <div className="container-page pb-8 pt-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)] md:gap-8">
          <div className="max-w-xs">
            <Logo inverted />
            <p className="mt-3 text-small">{siteConfig.tagline}</p>
          </div>
          {footerNav.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="font-body text-small font-semibold text-footer-heading">{group.title}</h2>
              <ul className="mt-4 space-y-3">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="rounded-sm text-small transition-colors hover:text-on-dark focus-visible:outline-none focus-visible:focus-ring"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-footer-divider pt-6 text-caption sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CopyrightYear /> {siteConfig.name}. All rights reserved.
          </p>
          <p>Demo build · static data only</p>
        </div>
      </div>
    </footer>
  );
}

/** Cached at build/revalidation time (Cache Components disallow raw `new Date()` in prerender). */
async function CopyrightYear() {
  "use cache";
  return new Date().getFullYear();
}
