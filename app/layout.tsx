import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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
  title: "Weekly Accomplishment Report Monitor",
  description: "Online itinerary and accomplishment reporting app for staff monitoring.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/mao-weekly-icon.svg",
    shortcut: "/icons/mao-weekly-icon.svg",
    apple: "/icons/mao-weekly-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Script id="register-mao-report-service-worker" strategy="afterInteractive">
          {`if ('serviceWorker' in navigator) window.addEventListener('load', function () { navigator.serviceWorker.register('/service-worker.js').catch(function () {}); });`}
        </Script>
      </body>
    </html>
  );
}
