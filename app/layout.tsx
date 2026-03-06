import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function getBaseUrl(): URL {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : undefined) ??
    "http://localhost:3456";
  const normalized = raw.endsWith("/") ? raw.slice(0, -1) : raw;
  return new URL(normalized);
}

export const metadata: Metadata = {
  metadataBase: getBaseUrl(),
  icons: {
    icon: "/logo.jpg",
    shortcut: "/logo.jpg",
    apple: "/logo.jpg",
  },
  title: {
    default: "TLG | Japan Talent and Hiring Platform",
    template: "%s | TLG",
  },
  description:
    "TLG connects candidates with trusted employers in Japan through curated jobs, company news, and direct recruiting support.",
  applicationName: "TLG",
  category: "recruitment",
  keywords: [
    "TLG",
    "Japan jobs",
    "recruitment",
    "career opportunities",
    "hiring platform",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "TLG",
    locale: "en_US",
    title: "TLG | Japan Talent and Hiring Platform",
    description:
      "Discover opportunities in Japan and stay updated with recruiting news from TLG.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "TLG | Japan Talent and Hiring Platform",
    description:
      "Discover opportunities in Japan and stay updated with recruiting news from TLG.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
