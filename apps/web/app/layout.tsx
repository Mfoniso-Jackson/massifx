import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MassifX",
  description: "AI quant infrastructure for crypto traders, funds, and autonomous trading agents."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
