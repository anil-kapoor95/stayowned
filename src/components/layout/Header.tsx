import Link from "next/link";
import { authNav, mainNav } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { Logo } from "./Logo";
import { MobileNav, NavLinks } from "./Navigation";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-divider bg-header-bg/95 backdrop-blur supports-[backdrop-filter]:bg-header-bg/85">
      <div className="container-page flex h-header items-center justify-between gap-6">
        <Logo />
        <nav aria-label="Main" className="hidden lg:block">
          <NavLinks items={mainNav} />
        </nav>
        <div className="hidden items-center gap-5 lg:flex">
          <Link
            href={authNav.login.href}
            className="rounded-sm text-menu font-semibold text-nav transition-colors hover:text-link-hover focus-visible:outline-none focus-visible:focus-ring"
          >
            {authNav.login.label}
          </Link>
          <Button href={authNav.cta.href} size="md">
            {authNav.cta.label}
          </Button>
        </div>
        <MobileNav items={mainNav} />
      </div>
    </header>
  );
}
