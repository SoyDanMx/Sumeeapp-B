// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css"; // 1. Importamos los estilos de Leaflet aquí

// --- IMPORTS ADICIONALES NECESARIOS ---
import { Header } from "../components/Header"; // Importa tu componente Header
import { LocationProvider } from "../context/LocationContext"; // Importa el LocationProvider
import { AuthProvider } from "../components/AuthProvider"; // Importa el AuthProvider
import { UserProvider } from "../context/UserContext"; // Importa el UserProvider
import { MembershipProvider } from "../context/MembershipContext"; // Importa el MembershipProvider
// --- FIN IMPORTS ADICIONALES ---

import { WhatsAppButton } from "@/components/WhatsAppButton";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { MetaPixel } from "@/components/analytics/MetaPixel";
import StructuredData from "@/components/SEO/StructuredData";
import { SkipLinks } from "@/components/UX/AccessibilityHelpers";
import CriticalCSS from "@/components/Performance/CriticalCSS";
import ResourceHints from "@/components/Performance/ResourceHints";
import ServiceWorker from "@/components/Performance/ServiceWorker";
import PerformanceMonitor from "@/components/Performance/PerformanceMonitor";


const inter = Inter({ subsets: ["latin"] });

// Metadata optimizada para SEO y conversión
export const metadata: Metadata = {
  metadataBase: new URL('https://www.sumeeapp.com'),
  
  title: {
    default: "Plomeros, Electricistas y Más Verificados en CDMX | Sumee App",
    template: `%s | Sumee App CDMX`,
  },
  description: "Encuentra técnicos profesionales de confianza para tu hogar en Ciudad de México. Servicios 100% verificados con garantía de satisfacción. ¡Cotiza fácil y rápido!",
  
  keywords: ["plomeros CDMX", "electricistas CDMX", "servicios para el hogar CDMX", "técnicos verificados CDMX", "reparaciones a domicilio", "mantenimiento del hogar Ciudad de México", "Sumee App", "servicios profesionales CDMX"],
  
  openGraph: {
    title: "Plomeros, Electricistas y Más Verificados en CDMX | Sumee App",
    description: "Encuentra técnicos profesionales de confianza para tu hogar en Ciudad de México. Servicios 100% verificados con garantía de satisfacción. ¡Cotiza fácil y rápido!",
    url: 'https://www.sumeeapp.com',
    siteName: 'Sumee App',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'es_MX',
    type: 'website',
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
        {/* Resource Hints para performance */}
        <ResourceHints />
        
        {/* Critical CSS inline */}
        <CriticalCSS />
      </head>
      <body className={inter.className}>
        <GoogleAnalytics />
        <MetaPixel />
        
        {/* Structured Data para SEO */}
        <StructuredData type="Organization" data={{}} />
        <StructuredData type="LocalBusiness" data={{}} />
        <StructuredData type="WebSite" data={{}} />
        
        {/* Skip Links para accesibilidad */}
        <SkipLinks />
        
        {/* Service Worker para PWA */}
        <ServiceWorker />
        
        {/* Performance Monitor para Web Vitals */}
        <PerformanceMonitor />
        
        {/*
          ENVOLVEMOS EL HEADER Y EL CONTENIDO PRINCIPAL (children)
          CON EL LOCATIONPROVIDER PARA QUE TODOS TENGAN ACCESO AL CONTEXTO DE UBICACIÓN.
        */}
        <LocationProvider>
          <AuthProvider>
            <UserProvider>
              <MembershipProvider>
                <Header /> {/* El Header ahora forma parte del layout */}
                <main id="main-content" className="pt-20"> {/* Añadimos padding-top para que el contenido no quede bajo el fixed header */}
                  {children} {/* Aquí se renderiza el contenido de cada página */}
                </main>
              </MembershipProvider>
            </UserProvider>
          </AuthProvider>
        </LocationProvider>
        
        <WhatsAppButton />
      </body>
    </html>
  );
}