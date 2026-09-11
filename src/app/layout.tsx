import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OAK Zimbabwe Partner Gathering",
  description: "Registration and attendance platform for the OAK Zimbabwe Partner Gathering.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}