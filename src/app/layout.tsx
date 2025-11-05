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
import { MembershipProvider } from "@/context/MembershipContext";

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
  ],
  openGraph: {
    title: "Plomeros, Electricistas y Más Verificados en CDMX | Sumee App",
    description:
      "Encuentra técnicos profesionales de confianza para tu hogar en Ciudad de México. Servicios 100% verificados con garantía de satisfacción. ¡Cotiza fácil y rápido!",
    url: "https://www.sumeeapp.com",
    siteName: "Sumee App",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    locale: "es_MX",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <ResourceHints />
        <CriticalCSS />
      </head>
      <body className={inter.className}>
        <SkipLinks />
        <ClientAnalytics />
        <LocationProvider>
          <AuthProvider>
            <UserProvider>
              <MembershipProvider>
                <Header />
                <main id="main-content" className="pt-0">
                  {children}
                </main>
              </MembershipProvider>
            </UserProvider>
          </AuthProvider>
        </LocationProvider>
        <ClientWhatsAppWidget />
      </body>
    </html>
  );
}
