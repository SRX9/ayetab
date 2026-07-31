import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { WEB_APP_ORIGIN } from "@ayetab/utils";
import { Providers } from "@/components/providers";
import { homeMetadata } from "@/lib/seo-metadata";
import "./globals.css";

/* Geist reads close to SF Pro — clean macOS app typography */
const sans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const base = homeMetadata();

export const metadata: Metadata = {
  metadataBase: new URL(WEB_APP_ORIGIN),
  title: {
    default: typeof base.title === "string" ? base.title : "AyeTab — Developer Utilities",
    template: "%s | AyeTab",
  },
  description: base.description,
  keywords: base.keywords,
  applicationName: "AyeTab",
  authors: [{ name: "AyeTab" }],
  creator: "AyeTab",
  openGraph: base.openGraph,
  twitter: base.twitter,
  alternates: { canonical: WEB_APP_ORIGIN },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${mono.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
