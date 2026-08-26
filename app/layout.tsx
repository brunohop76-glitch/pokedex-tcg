import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./generation-enhancements.css";
import "./pokemon-enhancements.css";
import "./pokemon-detail-enhancements.css";
import "./pokemon-detail-fix.css";
import "./pokemon-detail-hero-reset.css";
import "./pokemon-detail-polish.css";
import "./home.css";
import "./home-final.css";
import "./generations-final.css";
import "./pokemon-catalog-final.css";
import "./pokemon-detail-micro.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pokédex TCG",
  description: "Pokédex retrô com Pokémon, gerações, evoluções e cartas TCG.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
