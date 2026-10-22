import { mainNav } from "@/config/site";
import { AuthNav } from "./AuthNav";
import { Logo } from "./Logo";
import { MobileNav, NavLinks } from "./Navigation";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-divider bg-header-bg">
      <div className="container-page flex h-header items-center justify-between gap-6">
        <Logo />
        <nav aria-label="Main" className="hidden lg:block">
          <NavLinks items={mainNav} />
        </nav>
        <div className="hidden lg:block">
          <AuthNav variant="desktop" />
        </div>
        <MobileNav items={mainNav} />
      </div>
    </header>
  );
}
