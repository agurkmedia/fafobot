import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from 'next/link';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OHLCV Data Manager",
  description: "Manage and download OHLCV data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        <header className="border-b">
          <div className="container mx-auto flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-xl font-bold">
                OHLCV Data Manager
              </Link>
              <nav className="flex gap-4">
                <Link href="/" className="text-sm font-medium hover:underline">
                  Home
                </Link>
                <Link href="/dashboard" className="text-sm font-medium hover:underline">
                  Download Dashboard
                </Link>
              </nav>
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
