import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "MANJE",
  description: "Rental listings platform for Waterloo Region",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full bg-black">
      <body className="h-full bg-black text-white m-0 p-0">
        <Navbar />
        <main className="pt-24 bg-black min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}


