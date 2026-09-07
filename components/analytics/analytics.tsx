"use client";

import * as React from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { FB_PIXEL_ID, GA_ID, track } from "@/lib/analytics/events";

/**
 * Loads GA4 and the Meta Pixel, and reports a page view on every route change.
 *
 * Both are opt-in: with neither NEXT_PUBLIC_GA_ID nor NEXT_PUBLIC_FB_PIXEL_ID
 * set this renders nothing, loads nothing and costs nothing. That keeps local
 * development and preview deploys out of the production data.
 *
 * The route-change listener matters more than it looks. This is a client-side
 * app, so moving from the shop to a product page never reloads the document —
 * without this, both tools would record a single page view per session and
 * every funnel report would be wrong.
 */
function RouteChangeReporter() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  React.useEffect(() => {
    track.pageView(search ? `${pathname}?${search}` : pathname);
  }, [pathname, search]);

  return null;
}

export function Analytics() {
  if (!GA_ID && !FB_PIXEL_ID) return null;

  return (
    <>
      {GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
window.gtag=gtag;gtag('js',new Date());
gtag('config','${GA_ID}',{send_page_view:false});`}
          </Script>
        </>
      )}

      {FB_PIXEL_ID && (
        <Script id="meta-pixel-init" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${FB_PIXEL_ID}');`}
        </Script>
      )}

      {/* useSearchParams needs a Suspense boundary or it opts the whole route
          out of static rendering. */}
      <React.Suspense fallback={null}>
        <RouteChangeReporter />
      </React.Suspense>
    </>
  );
}
