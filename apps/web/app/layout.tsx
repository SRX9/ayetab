import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
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

const siteUrl = "https://app.ayetab.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AyeTab — Developer Utilities",
    template: "%s · AyeTab",
  },
  description:
    "All-in-one developer toolbox. Format, convert, generate, and debug — 100 tools, all offline in your browser.",
  applicationName: "AyeTab",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    siteName: "AyeTab",
    title: "AyeTab — Developer Utilities",
    description:
      "All-in-one developer toolbox. Format, convert, generate, and debug — 100 tools, all offline in your browser.",
    url: siteUrl,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AyeTab — 100 developer tools. Offline. Instant.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AyeTab — Developer Utilities",
    description:
      "All-in-one developer toolbox. Format, convert, generate, and debug — 100 tools, all offline in your browser.",
    images: ["/og-image.jpg"],
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F9FD" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1220" },
  ],
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
