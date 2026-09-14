import type { Metadata } from "next";
import { Geist_Mono, Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({ variable: '--font-jakarta', subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"
  ),
  // Describes what the product does. It is not a job board, does not match you
  // to openings, and cannot promise an outcome — so the copy does not say so.
  title: "Recut | Tailor your resume to every job",
  description:
    "Keep every role, project and skill in one Vault, then re-cut it for each job description. Free, with a daily AI limit.",
  openGraph: {
    title: "Recut",
    description:
      "Write your experience once. Tailor it to every job, and track where it went.",
    // Resolved against metadataBase, so this follows the actual deployment
    // rather than asserting a domain that may not be live.
    url: "/",
    siteName: "Recut",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Recut | Tailor your resume to every job",
    description:
      "One Vault of your experience, re-cut per job description. Free, with a daily AI limit.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jakarta.variable} ${outfit.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
