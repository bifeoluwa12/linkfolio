
import type { Metadata } from "next";
import { DM_Mono, Sora } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Linkfolio — Link-in-Bio for Professionals",
  description: "The link-in-bio builder built for real estate agents, SaaS founders, and serious creators.",
  openGraph: {
    title: "Linkfolio",
    description: "Your entire professional presence. One link.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${dmMono.variable}`}>
      <body className="bg-[#070707] text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}