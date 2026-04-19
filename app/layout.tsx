import type { Metadata } from "next";
import { Geist_Mono, Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zinaplus — The Universal Visual Database Designer",
  description: "Design, visualize, and ship database schemas across PostgreSQL, MySQL, MongoDB, Appwrite, Firebase, and more — one canvas for every data layer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable, instrumentSerif.variable)}>
      <body
        className={`${geistMono.variable} antialiased bg-white text-zinc-900`}
      >
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
