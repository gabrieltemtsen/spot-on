import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#081C15",
};

export const metadata: Metadata = {
  title: "Spot-On | Fresh Juices & Salads",
  description: "Cold-pressed juices, power smoothies, and fresh salads — made to order. Fresh ingredients. Zero compromise.",
  keywords: ["Juice", "Smoothies", "Salads", "Healthy Food", "Cold-pressed", "Spot-On"],
  openGraph: {
    title: "Spot-On | Fresh Juices & Salads",
    description: "Cold-pressed juices, power smoothies, and fresh salads — made to order fast. Explore our menu of natural, healthy, and delicious options.",
    siteName: "Spot-On",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Spot-On Fresh Juices and Salads",
      },
    ],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Spot-On | Fresh Juices & Salads",
    description: "Cold-pressed juices, power smoothies, and fresh salads — made to order.",
    images: ["/og.png"],
  },
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍊</text></svg>" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
