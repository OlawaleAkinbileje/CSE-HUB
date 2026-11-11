import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "CSE Hub | CSE Academic Resources",
    template: "%s | CSE Hub",
  },
  description:
    "Discover Computer Science and Engineering lecture notes, past questions, projects, and code samples in one searchable academic resource hub.",
  applicationName: "CSE Hub",
  category: "education",
  keywords: [
    "CSE Hub",
    "Computer Science",
    "Engineering",
    "lecture notes",
    "past questions",
    "student projects",
    "academic resources",
  ],
  openGraph: {
    type: "website",
    siteName: "CSE Hub",
    title: "CSE Hub | CSE Academic Resources",
    description:
      "Search Computer Science and Engineering lecture notes, past questions, projects, and code samples.",
    locale: "en_NG",
  },
  twitter: {
    card: "summary",
    title: "CSE Hub | CSE Academic Resources",
    description:
      "Search Computer Science and Engineering lecture notes, past questions, projects, and code samples.",
  },
  robots: {
    index: process.env.NODE_ENV === "production" && Boolean(process.env.NEXT_PUBLIC_SITE_URL),
    follow: process.env.NODE_ENV === "production" && Boolean(process.env.NEXT_PUBLIC_SITE_URL),
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
