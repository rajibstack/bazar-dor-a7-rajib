import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "বাজার দর - নিত্যপ্রয়োজনীয় পণ্যের সঠিক দাম",
  description: "বাংলাদেশী নিত্যপ্রয়োজনীয় পণ্যের বাজার দর অ্যাপ",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="bn"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col bg-gray-50 text-gray-900"
        suppressHydrationWarning={true}
      >
        <Suspense fallback={<div className="h-16 bg-white border-b" />}>
          <Navbar />
        </Suspense>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}