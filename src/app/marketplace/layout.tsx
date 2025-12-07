import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marketplace de Herramientas y Equipos | Sumee App",
  description:
    "Compra y vende herramientas, equipos y suministros de construcción entre profesionales verificados. Marketplace exclusivo para técnicos confiables en CDMX.",
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
  ],
  openGraph: {
    title: "Marketplace de Herramientas y Equipos | Sumee App",
    description:
      "Compra y vende herramientas, equipos y suministros de construcción entre profesionales verificados en CDMX.",
    type: "website",
    url: "https://www.sumeeapp.com/marketplace",
    siteName: "Sumee App",
    images: [
      {
        url: "/og-marketplace.png",
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
    images: ["/og-marketplace.png"],
  },
  alternates: {
    canonical: "https://www.sumeeapp.com/marketplace",
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

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

