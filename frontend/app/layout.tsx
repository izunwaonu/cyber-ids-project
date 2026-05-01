import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Cyber IDS Project",
    template: "%s | Cyber IDS Project",
  },
  description:
    "Cyber IDS Project is a modern intrusion detection system platform designed to monitor, analyze, and secure network environments effectively.",
  keywords: [
    "Cybersecurity",
    "Intrusion Detection System",
    "IDS",
    "Network Security",
    "Cyber IDS Project",
  ],
  authors: [{ name: "Justus Izuchukwu Onuh" }],
  creator: "Justus Izuchukwu Onuh",
  metadataBase: new URL("https://cyber-ids-project.vercel.app"),
  openGraph: {
    title: "Cyber IDS Project",
    description:
      "A modern intrusion detection system platform for monitoring and securing networks.",
    url: "https://cyber-ids-project.vercel.app",
    siteName: "Cyber IDS Project",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cyber IDS Project",
    description:
      "Monitor, analyze, and secure your network with Cyber IDS Project.",
    creator: "@yourhandle", // optional
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
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-black">
        {children}
      </body>
    </html>
  );
}