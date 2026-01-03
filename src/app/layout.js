import { Inter } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "HORIZON CHIMIQUE - L'Expertise en Étanchéité",
  description: "Solutions innovantes et durables pour l'étanchéité et la protection du bâtiment en Tunisie. Étanchéité liquide, adjuvants, revêtements.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={inter.className}>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
