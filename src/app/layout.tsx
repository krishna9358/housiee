import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import { AuthProvider } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Marketplace - Multi-Service Platform",
    template: "%s | Marketplace",
  },
  description:
    "Discover and book premium accommodation and food services. Connect with verified providers for your perfect experience.",
  keywords: ["marketplace", "accommodation", "food", "booking", "services"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://marketplace.example.com",
    siteName: "Marketplace",
    title: "Marketplace - Multi-Service Platform",
    description:
      "Discover and book premium accommodation and food services. Connect with verified providers for your perfect experience.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Marketplace - Multi-Service Platform",
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
    <html lang="en">
      <body className={`${dmSans.variable} ${playfair.variable} font-sans antialiased`}>
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </AuthProvider>
        <VisualEditsMessenger />
      </body>
    </html>
  );
}