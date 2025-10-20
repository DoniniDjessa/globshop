import type { Metadata } from "next";
import { Fira_Sans_Condensed, Poppins } from "next/font/google";
import MotionProvider from "@/components/providers/motion-provider";
import { Toaster } from "sonner";
import "./globals.css";

const firaCondensed = Fira_Sans_Condensed({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-fira-condensed",
  display: "swap",
});

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Globshop",
  description: "Plateforme d'administration pour salons, spas et boutiques.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${poppins.variable} ${firaCondensed.variable} antialiased`}>
        <MotionProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </MotionProvider>
      </body>
    </html>
  );
}
