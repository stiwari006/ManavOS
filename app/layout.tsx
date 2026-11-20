import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "HumanOS — AI you can look in the eye",
  description:
    "HumanOS is the platform for real-time, photoreal AI humans that see, listen, remember and act. Build video agents, tutors, coaches and companions with one API.",
  openGraph: {
    title: "HumanOS — AI you can look in the eye",
    description: "Real-time AI humans that see, listen, remember and act.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
