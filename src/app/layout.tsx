// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { SkipLinks } from "@/components/UX/AccessibilityHelpers";
import CriticalCSS from "@/components/Performance/CriticalCSS";
import ResourceHints from "@/components/Performance/ResourceHints";
import ClientAnalytics from "@/components/ClientAnalytics";
import ClientWhatsAppWidget from "@/components/ClientWhatsAppWidget";
import { Header } from "@/components/Header";
import { LocationProvider } from "@/context/LocationContext";
import { AuthProvider } from "@/context/AuthContext";
import { UserProvider } from "@/context/UserContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { QueryProvider } from "@/providers/QueryProvider";
import { ToasterProvider } from "@/providers/ToasterProvider";

// Fuente optimizada para CLS - auto-hospedada con next/font
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

// Metadata optimizada para SEO y conversión
export const metadata: Metadata = {
  metadataBase: new URL("https://www.sumeeapp.com"),
  title: {
    default: "Plomeros, Electricistas y Más Verificados en CDMX | Sumee App",
    template: `%s | Sumee App CDMX`,
  },
  description:
    "Encuentra técnicos profesionales de confianza para tu hogar en Ciudad de México. Servicios 100% verificados con garantía de satisfacción. ¡Cotiza fácil y rápido!",
  keywords: [
    "plomeros CDMX",
    "electricistas CDMX",
    "servicios para el hogar CDMX",
    "técnicos verificados CDMX",
    "reparaciones a domicilio",
    "mantenimiento del hogar Ciudad de México",
    "Sumee App",
    "servicios profesionales CDMX",
    "cargadores eléctricos CDMX",
    "instalación cargador eléctrico",
    "cargador para auto eléctrico",
    "paneles solares CDMX",
    "energía solar CDMX",
    "instalación paneles solares",
    "sistema fotovoltaico CDMX",
    "energía renovable CDMX",
  ],
  icons: {
    // Next.js 13+ App Router maneja automáticamente /favicon.ico desde src/app/icon.tsx
    // Solo especificamos los iconos adicionales para compatibilidad
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "icon",
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        rel: "icon",
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Plomeros, Electricistas y Más Verificados en CDMX | Sumee App",
    description:
      "Encuentra técnicos profesionales de confianza para tu hogar en Ciudad de México. Servicios 100% verificados con garantía de satisfacción. ¡Cotiza fácil y rápido!",
    url: "https://www.sumeeapp.com",
    siteName: "Sumee App",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Sumee App Logo",
      },
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sumee App - Servicios Profesionales CDMX",
      },
    ],
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Plomeros, Electricistas y Más Verificados en CDMX | Sumee App",
    description:
      "Encuentra técnicos profesionales de confianza para tu hogar en Ciudad de México. Servicios 100% verificados con garantía de satisfacción.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX">
      <head>
        <ResourceHints />
        <CriticalCSS />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <QueryProvider>
            <SkipLinks />
            <ClientAnalytics />
            <LocationProvider>
              <AuthProvider>
                <UserProvider>
                  <Header />
                  <main id="main-content" className="pt-0">
                    {children}
                  </main>
                  <ToasterProvider />
                </UserProvider>
              </AuthProvider>
            </LocationProvider>
            <ClientWhatsAppWidget />
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
