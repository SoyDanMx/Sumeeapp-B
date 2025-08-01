// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css"; // 1. Importamos los estilos de Leaflet aquí

// --- IMPORTS ADICIONALES NECESARIOS ---
import { Header } from "../components/Header"; // Importa tu componente Header
import { LocationProvider } from "../context/LocationContext"; // Importa el LocationProvider
// --- FIN IMPORTS ADICIONALES ---

import { WhatsAppButton } from "@/components/WhatsAppButton";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { MetaPixel } from "@/components/analytics/MetaPixel";


const inter = Inter({ subsets: ["latin"] });

// Metadata hiper-enfocada en CDMX
export const metadata: Metadata = {
  metadataBase: new URL('https://www.sumeeapp.com'),
  
  title: {
    default: "Sumee App | Profesionales a Domicilio en CDMX",
    template: `%s | Sumee App CDMX`,
  },
  description: "Encuentra plomeros, electricistas, carpinteros y más servicios para el hogar en CDMX. Conectamos con los mejores técnicos y profesionales verificados en tu alcaldía.",
  
  keywords: ["servicios para el hogar CDMX", "plomeros en CDMX", "electricistas urgentes CDMX", "reparaciones a domicilio CDMX", "mantenimiento del hogar Ciudad de México", "técnicos a domicilio", "Sumee App"],
  
  openGraph: {
    title: "Sumee App | Profesionales de Confianza para tu Hogar en CDMX",
    description: "La forma más fácil y segura de encontrar técnicos calificados para cualquier necesidad de tu hogar en la Ciudad de México.",
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
      <body className={inter.className}>
        <GoogleAnalytics />
        <MetaPixel />
        
        {/*
          ENVOLVEMOS EL HEADER Y EL CONTENIDO PRINCIPAL (children)
          CON EL LOCATIONPROVIDER PARA QUE TODOS TENGAN ACCESO AL CONTEXTO DE UBICACIÓN.
        */}
        <LocationProvider>
          <Header /> {/* El Header ahora forma parte del layout */}
          <main className="pt-20"> {/* Añadimos padding-top para que el contenido no quede bajo el fixed header */}
            {children} {/* Aquí se renderiza el contenido de cada página */}
          </main>
        </LocationProvider>
        
        <WhatsAppButton />
      </body>
    </html>
  );
}