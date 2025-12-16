import { Metadata } from "next";

const baseUrl = "https://www.sumeeapp.com";

export const metadata: Metadata = {
  title: "Marketplace de Herramientas y Equipos | Sumee App",
  description:
    "Compra y vende herramientas, equipos y suministros de construcción entre profesionales verificados. Marketplace exclusivo para técnicos confiables en CDMX. Más de 13,000 productos disponibles.",
  keywords: [
    "marketplace herramientas",
    "herramientas construcción CDMX",
    "equipos profesionales",
    "herramientas eléctricas",
    "herramientas plomería",
    "herramientas construcción",
    "comprar herramientas CDMX",
    "vender herramientas",
    "marketplace técnicos",
    "herramientas usadas CDMX",
    "equipos profesionales CDMX",
    "suministros construcción",
    "TRUPER",
    "herramientas profesionales",
    "marketplace B2B",
  ],
  authors: [{ name: "Sumee App" }],
  creator: "Sumee App",
  publisher: "Sumee App",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Marketplace de Herramientas y Equipos | Sumee App",
    description:
      "Compra y vende herramientas, equipos y suministros de construcción entre profesionales verificados en CDMX. Más de 13,000 productos disponibles.",
    type: "website",
    url: `${baseUrl}/marketplace`,
    siteName: "Sumee App",
    images: [
      {
        url: `${baseUrl}/og-marketplace.png`,
        width: 1200,
        height: 630,
        alt: "Marketplace Sumee App - Herramientas y Equipos",
      },
    ],
    locale: "es_MX",
  },
  twitter: {
    card: "summary_large_image",
    title: "Marketplace de Herramientas y Equipos | Sumee App",
    description:
      "Compra y vende herramientas entre profesionales verificados en CDMX.",
    images: [`${baseUrl}/og-marketplace.png`],
    creator: "@sumeeapp",
  },
  alternates: {
    canonical: `${baseUrl}/marketplace`,
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
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
};

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

