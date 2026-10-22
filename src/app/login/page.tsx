import type { Metadata } from "next";
import { Icon } from "@/components/ui/Icon";
import { LoginForm } from "@/features/onboarding/components/LoginForm";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to manage your StayOwned booking page.",
  robots: { index: false, follow: true },
};

const POINTS = [
  "Share your direct booking link",
  "Set up payments by UPI and cards",
  "Keep your calendar in sync with Airbnb",
];

export default function LoginPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mx-auto grid max-w-5xl grid-cols-1 overflow-hidden rounded-panel border border-border bg-card shadow-panel lg:grid-cols-2">
        <section className="p-6 sm:p-10" aria-labelledby="login-title">
          <h1 id="login-title" className="text-display">
            Welcome back
          </h1>
          <p className="mt-2 mb-7 text-lead text-body">Log in to manage your booking page.</p>
          <LoginForm />
        </section>
        <div className="panel-gradient hidden flex-col justify-center gap-6 p-10 text-on-dark lg:flex">
          <h2 className="font-heading text-section text-on-dark">
            Your page, your guests, <span className="text-primary-on-dark">0% commission.</span>
          </h2>
          <ul className="grid gap-3">
            {POINTS.map((point) => (
              <li key={point} className="flex items-center gap-3 text-small">
                <span className="grid size-5 shrink-0 place-items-center rounded-pill bg-primary text-on-primary">
                  <Icon name="check" size={12} strokeWidth={3} />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
