"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authNav } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ensureSignupLoaded, logoutSignup, useSignupSession } from "@/features/onboarding/signup-session";
import { hrefForNextStep, LIVE_HREF } from "@/features/onboarding/steps";
import { cn } from "@/lib/utils";

/**
 * "Log in / Create free page", or — when a host is logged in on this browser (sign-up token) —
 * "My page / Continue setup" and "Log out", so someone else can register or log in afterwards.
 */
export function AuthNav({ variant }: { variant: "desktop" | "mobile" }) {
  const router = useRouter();
  const { token, state, phase } = useSignupSession();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    void ensureSignupLoaded();
  }, []);

  const loggedIn = Boolean(token && state);
  // Until the saved sign-up is known, keep the space without flashing the wrong links.
  const pending = phase !== "ready" && !loggedIn;
  const mobile = variant === "mobile";

  async function logout() {
    setLeaving(true);
    await logoutSignup();
    setLeaving(false);
    router.push(authNav.login.href);
  }

  if (loggedIn && state) {
    const completed = state.status === "completed";
    const name = state.account.first_name || state.account.name;
    return (
      <div className={cn(mobile ? "grid gap-3" : "flex items-center gap-4")}>
        {!mobile && name ? (
          <span className="flex max-w-40 items-center gap-2 truncate text-small text-body">
            <span
              aria-hidden="true"
              className="grid size-8 shrink-0 place-items-center rounded-pill bg-primary-soft font-bold text-primary-strong"
            >
              {name.charAt(0).toUpperCase()}
            </span>
            <span className="truncate">
              <span className="sr-only">Logged in as </span>
              {name}
            </span>
          </span>
        ) : null}
        {mobile && name ? <p className="text-small text-body">Logged in as {name}</p> : null}
        <Button href={completed ? LIVE_HREF : hrefForNextStep(state.next_step)} size={mobile ? "lg" : "md"} fullWidth={mobile}>
          {completed ? "My page" : "Continue setup"}
        </Button>
        <Button
          variant="outline"
          size={mobile ? "lg" : "md"}
          fullWidth={mobile}
          onClick={logout}
          disabled={leaving}
          aria-busy={leaving}
        >
          <Icon name="logout" size={16} /> {leaving ? "Logging out…" : "Log out"}
        </Button>
      </div>
    );
  }

  if (mobile) {
    return (
      <div className={cn("grid gap-3", pending && "invisible")}>
        <Button href={authNav.cta.href} size="lg" fullWidth>
          {authNav.cta.label}
        </Button>
        <Button href={authNav.login.href} variant="outline" size="lg" fullWidth>
          {authNav.login.label}
        </Button>
      </div>
    );
  }
  return (
    <div className={cn("flex items-center gap-5", pending && "invisible")} aria-hidden={pending || undefined}>
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
  );
}
