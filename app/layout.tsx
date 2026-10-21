import { Geist, Geist_Mono } from "next/font/google";
import Provider from "@/context/Provider";
import type { Metadata, Viewport } from "next";
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
  applicationName: "Facec",
  // iOS: ícono y modo app al agregar a la pantalla de inicio
  appleWebApp: { capable: true, title: "Facec", statusBarStyle: "default" },
  icons: { apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Pinta bajo el notch; header, sidebar y toasts se apartan con env(safe-area-inset-*)
  viewportFit: "cover",
  // Android: el teclado achica el viewport (como en iOS) y los campos de abajo no quedan tapados
  interactiveWidget: "resizes-content",
  // Barra de estado del color del header en cada esquema
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1e293b" },
  ],
  colorScheme: "light dark",
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
