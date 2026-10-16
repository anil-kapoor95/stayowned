"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { authNav, type NavItem } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <ul className="flex items-center gap-8">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative rounded-sm py-1 text-menu font-medium text-nav transition-colors hover:text-link-hover",
                "focus-visible:outline-none focus-visible:focus-ring",
                active && "text-primary after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:rounded-pill after:bg-primary",
              )}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();

  // Close the menu after navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="grid size-11 place-items-center rounded-button text-nav hover:bg-surface-muted focus-visible:outline-none focus-visible:focus-ring"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name={open ? "x" : "menu"} size={22} />
      </button>
      <div
        id={panelId}
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-(--spacing-header) z-40 overflow-y-auto border-t border-divider bg-header-bg"
      >
        <nav aria-label="Mobile" className="container-page flex flex-col gap-1 py-4">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-12 items-center justify-between rounded-input px-3 text-lead font-medium text-nav hover:bg-surface-muted",
                  "focus-visible:outline-none focus-visible:focus-ring",
                  active && "bg-primary-soft text-primary-strong",
                )}
              >
                {item.label}
                <Icon name="chevronRight" size={18} className="text-muted" />
              </Link>
            );
          })}
          <div className="mt-4 grid gap-3 border-t border-divider pt-5">
            <Button href={authNav.cta.href} size="lg" fullWidth>
              {authNav.cta.label}
            </Button>
            <Button href={authNav.login.href} variant="outline" size="lg" fullWidth>
              {authNav.login.label}
            </Button>
          </div>
        </nav>
      </div>
    </div>
  );
}
