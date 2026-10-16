import { JsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { AccountStep } from "@/features/onboarding/steps/AccountStep";
import { WizardShell } from "@/features/onboarding/components/WizardShell";
import {
  AccountPanelBenefits,
  AccountPanelIntro,
  PreviewPanel,
} from "@/features/onboarding/components/PreviewPanel";

export const metadata = pageMetadata({
  title: "Create your own booking page for free",
  description: siteConfig.description,
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <WizardShell
        step="account"
        aside={<PreviewPanel variant="details" intro={<AccountPanelIntro />} footer={<AccountPanelBenefits />} />}
      >
        <AccountStep />
      </WizardShell>
      {siteConfig.url ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: siteConfig.name,
            url: siteConfig.url,
            description: siteConfig.description,
          }}
        />
      ) : null}
    </>
  );
}
