import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./components/AuthProvider";
import { AccountProvider } from "./components/AccountProvider";
import { SidebarProvider } from "./contexts/SidebarContext";
import { AMTraderProvider } from "./contexts/AMTraderContext";
import AppLayout from "./components/AppLayout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TradingCalc Pro - Professional Trading Journal",
  description: "Professional trading journal and analytics platform for serious traders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <AuthProvider>
          <AccountProvider>
            <SidebarProvider>
              <AMTraderProvider>
                <AppLayout>
                  {children}
                </AppLayout>
              </AMTraderProvider>
            </SidebarProvider>
          </AccountProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
