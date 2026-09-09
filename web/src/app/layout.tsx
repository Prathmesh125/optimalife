import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-serif", // using the serif variable but mapping it to Outfit for heading continuity without breaking tailwind config
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Optima Life Sciences | Advanced Animal Health",
  description: "Innovative feed additives and bio-security solutions for optimum animal performance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Optima Life Sciences",
    "url": "https://www.optimalife.in",
    "logo": "https://www.optimalife.in/logo.png",
    "description": "Innovative feed additives and bio-security solutions for optimum animal performance.",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-020-24420720",
      "contactType": "customer service"
    }
  };

  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
        {children}
      </body>
    </html>
  );
}
