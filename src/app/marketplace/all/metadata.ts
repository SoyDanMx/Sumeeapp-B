import { Metadata } from "next";

const baseUrl = "https://www.sumeeapp.com";

export const metadata: Metadata = {
  title: "Todos los Productos - Marketplace Completo | Sumee App",
  description:
    "Explora todos los productos disponibles en nuestro marketplace. Herramientas, equipos y suministros profesionales para técnicos en CDMX. Más de 13,000 productos disponibles.",
  keywords: [
    "todos los productos",
    "marketplace completo",
    "herramientas CDMX",
    "equipos profesionales",
    "catálogo completo",
    "herramientas construcción",
    "suministros técnicos",
  ],
  openGraph: {
    title: "Todos los Productos - Marketplace Sumee App",
    description:
      "Explora más de 13,000 productos disponibles en nuestro marketplace profesional.",
    type: "website",
    url: `${baseUrl}/marketplace/all`,
    siteName: "Sumee App",
    images: [
      {
        url: `${baseUrl}/og-marketplace.png`,
        width: 1200,
        height: 630,
        alt: "Marketplace Completo - Sumee App",
      },
    ],
    locale: "es_MX",
  },
  twitter: {
    card: "summary_large_image",
    title: "Todos los Productos - Marketplace Sumee App",
    description: "Explora más de 13,000 productos disponibles.",
    images: [`${baseUrl}/og-marketplace.png`],
  },
  alternates: {
    canonical: `${baseUrl}/marketplace/all`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};


