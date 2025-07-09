import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Optimized fonts for luxury watch dashboard
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Richard Mille Dashboard | Luxury Watch Experience",
  description: "Experience the pinnacle of horological excellence with our interactive Richard Mille watch dashboard featuring immersive 3D visualizations, premium materials, and cutting-edge technology.",
  keywords: "Richard Mille, luxury watches, 3D visualization, horology, premium timepieces, carbon fiber, sapphire crystal",
  authors: [{ name: "Richard Mille Dashboard Team" }],
  creator: "Richard Mille Dashboard",
  openGraph: {
    title: "Richard Mille Dashboard | Luxury Watch Experience",
    description: "Immersive 3D visualization of Richard Mille luxury timepieces",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Richard Mille Dashboard",
    description: "Experience luxury watches in stunning 3D detail",
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-black text-white min-h-screen overflow-x-hidden`}
      >
        <div className="relative">
          {children}
        </div>
      </body>
    </html>
  );
}
