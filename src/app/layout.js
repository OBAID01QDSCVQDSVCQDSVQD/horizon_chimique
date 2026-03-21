import { Inter } from "next/font/google";
import { Providers } from "./providers";
import InstallPWA from "@/components/InstallPWA";
import MobileNavBar from "@/components/MobileNavBar";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SDK BATIMENT - L'Expertise en Étanchéité",
  description: "Solutions innovantes et durables pour l'étanchéité et la protection du bâtiment en Tunisie. Partenaire certifié HORIZON CHIMIQUE.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#1e40af",
};

import dbConnect from "@/lib/db";
import Setting from "@/models/Setting";
import Script from "next/script";

export default async function RootLayout({ children }) {
  let fbPixelId = null;

  try {
    await dbConnect();
    const settings = await Setting.findOne().lean();
    if (settings && settings.facebookPixelId) {
      fbPixelId = settings.facebookPixelId;
    }
  } catch (error) {
    console.error("Failed to fetch settings for Facebook Pixel:", error);
  }

  return (
    <html lang="fr" className="scroll-smooth">
      <head>
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
      </head>
      <body className={inter.className}>
        <Providers>
          <LayoutWrapper>
            {children}
            <InstallPWA />
            <MobileNavBar />
          </LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
