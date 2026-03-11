import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rabbit-Sync | AI Sales Insight Automator",
  description: "Upload sales data and receive instant AI-generated summaries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-white tracking-tight`}>
        {children}
      </body>
    </html>
  );
}
