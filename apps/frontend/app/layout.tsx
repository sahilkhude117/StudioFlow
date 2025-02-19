import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Appbar } from "../../../packages/ui/src/Appbar"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StudioFlow",
  description: "Automate your workflows with ai",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Appbar/>
        {children}
      </body>
    </html>
  );
}
