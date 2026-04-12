import { Providers } from "./providers";
import InstallPWA from "@/components/InstallPWA";
import AndroidBanner from "@/components/AndroidBanner";
import MobileNavBar from "@/components/MobileNavBar";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import { Metadata } from 'next';
import dbConnect from "@/lib/db";
import Setting from "@/models/Setting";
import Script from "next/script";
import { Suspense } from "react";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import LocalBusinessSchema from "@/components/seo/LocalBusinessSchema";
import FacebookPixelEvents from "@/components/FacebookPixelEvents";

export async function generateMetadata(): Promise<Metadata> {
  const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://sdkbatiment.com';
  const siteName = "SDK Batiment";

  return {
    metadataBase: new URL(url),
    title: { 
      template: "%s | SDK Batiment", 
      default: "SDK Batiment - Étanchéité & Imperméabilisation Tunisie" 
    },
    description: "SDK Batiment, spécialiste en étanchéité et imperméabilisation à Sousse, Sahel, Tunisie. Toiture, terrasse, sous-sol, piscine.",
    keywords: ["étanchéité", "imperméabilisation", "Sousse", "Sahel", "Tunisie", "SDK Batiment"],
    openGraph: { 
      type: "website", 
      locale: "fr_TN", 
      url, 
      siteName, 
      images: [{ url: "/og-image.jpg", width: 1200, height: 630 }] 
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: url },
    robots: { index: true, follow: true }
  };
}

export const viewport = {
  themeColor: "#1e40af",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Fallback ajouté car .env.local n'est pas envoyé vers Fly.io (bloqué par .dockerignore)
  const fbPixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID || '1681656312474782';

  return (
    <html lang="fr" className="scroll-smooth">
      <head>
      </head>
      <body className="font-sans antialiased overflow-x-hidden">
        {fbPixelId && (
          <Script
            id="fb-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('set', 'autoConfig', false, '${fbPixelId}');
                fbq('init', '${fbPixelId}');
                fbq('track', 'PageView');
              `,
            }}
          />
        )}
        {fbPixelId && (
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${fbPixelId}&ev=PageView&noscript=1`}
            />
          </noscript>
        )}
        <Script
          id="chatwoot-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(d,t) {
                var BASE_URL="https://horizon-chatwoot.fly.dev";
                var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
                g.src=BASE_URL+"/packs/js/sdk.js";
                g.defer = true;
                g.async = true;
                s.parentNode.insertBefore(g,s);
                g.onload=function(){
                  window.chatwootSDK.run({
                    websiteToken: 'sj6WYdfeyFG6HT8sgaLiUcZJ',
                    baseUrl: BASE_URL,
                    locale: 'fr'
                  })
                }
              })(document,"script");
            `
          }}
        />
        <Providers>
          <LayoutWrapper>
            <Suspense fallback={null}>
               <AnalyticsTracker />
               <FacebookPixelEvents />
            </Suspense>
            <LocalBusinessSchema />
            {children}
            <InstallPWA />
            <AndroidBanner />
            <MobileNavBar />
            <WhatsAppWidget />
          </LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
