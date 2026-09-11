import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

export const metadata: Metadata = {
  title: "OAK Partner Convening 2026",
  description: "Registration, check-in, programme and partner directory for the OAK Zimbabwe Partner Gathering.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-canvas text-ink">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 min-w-0">
            <MobileNav />
            <main className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
