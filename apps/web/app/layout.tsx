import type { Metadata, Viewport } from "next";
import { Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { WEB_APP_ORIGIN } from "@ayetab/utils";
import { Providers } from "@/components/providers";
import { homeMetadata } from "@/lib/seo-metadata";
import "./globals.css";

/* Instrument Sans — cool geometric professional face for titles + UI */
const sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

const base = homeMetadata();
const titleDefault =
  typeof base.title === "string" ? base.title : "AyeTab — Developer Utilities";
const description =
  base.description ??
  "All-in-one developer toolbox. Format, convert, generate, and debug — 100 tools, all offline in your browser.";

export const metadata: Metadata = {
  metadataBase: new URL(WEB_APP_ORIGIN),
  title: {
    default: titleDefault,
    template: "%s · AyeTab",
  },
  description,
  keywords: base.keywords,
  applicationName: "AyeTab",
  authors: [{ name: "AyeTab" }],
  creator: "AyeTab",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/logo-icon.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/favicon-32.png"],
  },
  openGraph: {
    ...base.openGraph,
    locale: "en_US",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AyeTab — 100 developer tools. Offline. Instant.",
        type: "image/jpeg",
      },
      {
        url: "/logo-icon.png",
        width: 512,
        height: 512,
        alt: "AyeTab logo",
        type: "image/png",
      },
    ],
  },
  twitter: {
    ...base.twitter,
    card: "summary_large_image",
    images: ["/og-image.jpg"],
  },
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
  manifest: "/site.webmanifest",
  other: {
    "og:logo": `${WEB_APP_ORIGIN}/logo-icon.png`,
  },
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#F5F9FD" }],
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "AyeTab",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description,
    url: WEB_APP_ORIGIN,
    image: `${WEB_APP_ORIGIN}/og-image.jpg`,
    logo: `${WEB_APP_ORIGIN}/logo-icon.png`,
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${mono.variable} font-sans`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
