import type { Metadata } from "next";
import { Outfit, Fraunces } from "next/font/google";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import { AuthProvider } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";
import { CommandPalette } from "@/components/command-palette";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Housiee - Premium Services Marketplace",
    template: "%s | Housiee",
  },
  description:
    "Discover and book premium accommodation and food services. Connect with verified providers for your perfect experience.",
  keywords: ["marketplace", "accommodation", "food", "booking", "services", "premium", "verified"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://housiee.com",
    siteName: "Housiee",
    title: "Housiee - Premium Services Marketplace",
    description:
      "Discover and book premium accommodation and food services. Connect with verified providers for your perfect experience.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Housiee - Premium Services Marketplace",
    description:
      "Discover and book premium accommodation and food services. Connect with verified providers for your perfect experience.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${outfit.variable} ${fraunces.variable} font-sans antialiased`}>
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <CommandPalette />
          <Toaster richColors position="top-right" />
        </AuthProvider>
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
