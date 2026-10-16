import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export function InfoPageLayout({
  title,
  description,
  path,
  children,
}: {
  title: string;
  description: string;
  path: string;
  children: ReactNode;
}) {
  return (
    <div className="container-page py-8 sm:py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: title, href: path }]} />
      <header className="mt-4 max-w-3xl">
        <h1 className="text-display">{title}</h1>
        <p className="mt-2 text-lead text-body">{description}</p>
      </header>
      <div className="mt-8">{children}</div>
    </div>
  );
}
