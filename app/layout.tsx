import { Geist, Geist_Mono } from "next/font/google";
import Provider from "@/context/Provider";
import type { Metadata } from "next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FACEC | Facíl de facturar",
  description: "Aplicación de facturación electrónica para Ecuador.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >

        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  );
}
