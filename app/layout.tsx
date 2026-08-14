import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import MobileStickyBar from "@/components/MobileStickyBar";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Café Vesper — Good Coffee. Better Moments.",
  description:
    "Café Vesper, Dubai — coffee, conversation, and beautifully unhurried moments. A boutique specialty coffeehouse for lingering afternoons and long evenings.",
  metadataBase: new URL("https://cafevesper.example"),
  openGraph: {
    title: "Café Vesper — Good Coffee. Better Moments.",
    description:
      "Coffee, conversation, and beautifully unhurried moments. Visit Café Vesper, Dubai.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="bg-near-black text-cream">
        {children}
        <MobileStickyBar />
      </body>
    </html>
  );
}
