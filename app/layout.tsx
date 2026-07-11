import type { Metadata } from "next";
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
  title: "NutriCraft",
  description: "Explora recetas, gestiona tu heladera y planifica tus comidas semanales.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NutriCraft",
  },
};

import { ClerkProvider } from '@clerk/nextjs';
import { MaterialWrapper } from '@/components/ui/MaterialWrapper';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-background text-on-background`}
      >
        <body className="min-h-full flex flex-col">
          <MaterialWrapper>
            {children}
          </MaterialWrapper>
        </body>
      </html>
    </ClerkProvider>
  );
}
