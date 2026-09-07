import { SiteChrome } from "@/components/layout/site-chrome";
import { Analytics } from "@/components/analytics/analytics";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Storefront only. Nobody wants the shop's own admin sessions counted
          as traffic, or an admin's test order reported as a Purchase. */}
      <Analytics />
      <SiteChrome>{children}</SiteChrome>
    </>
  );
}
