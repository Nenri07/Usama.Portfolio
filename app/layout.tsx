import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import ChapterRail from "@/components/ChapterRail";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";

// Confident sans-serif stack via next/font (Requirement 7.2).
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Premium editorial display face for headings.
const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  title: "Qasim Events",
  description:
    "Qatar-based event activation company — premium activations at scale.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <SmoothScrollProvider>
          <ChapterRail />
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
