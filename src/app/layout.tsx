import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import QueryProvider from "@/components/query-client-provider";

import { EmbeddingProvider } from "@/components/embed-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { SuspenseBoundry } from "./components/suspense-boundry";
import TelemetryProvider from "@/components/telemetry-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StudioFlow",
  description: "Automate your workflows without code",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <EmbeddingProvider>
            <SuspenseBoundry>
              {/* <TelemetryProvider> */}
                <TooltipProvider>
                  <SidebarProvider>
                    {children}
                    <Toaster/>
                  </SidebarProvider>
                </TooltipProvider>
              {/* </TelemetryProvider> */}
            </SuspenseBoundry>
          </EmbeddingProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

