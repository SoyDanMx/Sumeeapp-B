import { Metadata } from "next";
import { getCategoryBySlug, MARKETPLACE_CATEGORIES } from "@/lib/marketplace/categories";

/**
 * Genera metadata SEO dinámica para páginas de categoría
 */
export async function generateCategoryMetadata(
  slug: string,
  productCount?: number
): Promise<Metadata> {
  const category = getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Categoría no encontrada | Sumee App",
      description: "La categoría solicitada no existe.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const baseUrl = "https://www.sumeeapp.com";
  const categoryUrl = `${baseUrl}/marketplace/categoria/${category.slug}`;
  const countText = productCount
    ? `${productCount} ${productCount === 1 ? "producto" : "productos"} disponibles`
    : "productos disponibles";

  // Keywords específicos por categoría
  const getCategoryKeywords = (categorySlug: string) => {
    const baseKeywords = [
      "marketplace",
      "herramientas",
      "equipos",
      "CDMX",
      "profesionales",
      "verificados",
    ];

    const categoryKeywords: Record<string, string[]> = {
      electricidad: [
        "herramientas eléctricas",
        "taladros",
        "sierras eléctricas",
        "pulidoras",
        "equipos eléctricos",
        "herramientas inalámbricas",
      ],
      plomeria: [
        "herramientas plomería",
        "llaves",
        "desatascadores",
        "equipos plomería",
        "herramientas fontanería",
      ],
      construccion: [
        "herramientas construcción",
        "martillos",
        "niveles",
        "equipos construcción",
        "herramientas pesadas",
      ],
      mecanica: [
        "herramientas mecánicas",
        "llaves mecánicas",
        "equipos automotrices",
        "herramientas automotrices",
      ],
      pintura: [
        "herramientas pintura",
        "rodillos",
        "brochas",
        "pistolas pintura",
        "equipos pintura",
      ],
      jardineria: [
        "herramientas jardinería",
        "podadoras",
        "rastrillos",
        "equipos jardinería",
        "herramientas paisajismo",
      ],
      sistemas: [
        "sistemas informáticos",
        "redes",
        "informática",
        "sistemas fotovoltaicos",
        "cámaras CCTV",
        "videovigilancia",
        "equipos de red",
        "servidores",
        "almacenamiento",
        "equipos de cómputo",
        "sistemas de seguridad",
      ],
    };

    return [
      ...baseKeywords,
      ...(categoryKeywords[categorySlug] || []),
      category.name.toLowerCase(),
    ];
  };

  const title = `${category.namePlural} - Marketplace Profesional | Sumee App`;
  const description = `${category.description}. ${countText} en ${category.name}. Compra y vende herramientas entre profesionales verificados en CDMX.`;

  return {
    title,
    description,
    keywords: getCategoryKeywords(category.slug),
    openGraph: {
      title,
      description,
      type: "website",
      url: categoryUrl,
      siteName: "Sumee App",
      images: [
        {
          url: `/og-marketplace-${category.slug}.png`,
          width: 1200,
          height: 630,
          alt: `${category.namePlural} - Sumee App`,
        },
      ],
      locale: "es_MX",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/og-marketplace-${category.slug}.png`],
    },
    alternates: {
      canonical: categoryUrl,
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
}

/**
 * Genera metadata estática para todas las categorías (para sitemap)
 */
export function generateAllCategoriesMetadata() {
  return MARKETPLACE_CATEGORIES.map((category) => ({
    slug: category.slug,
    url: `https://www.sumeeapp.com/marketplace/categoria/${category.slug}`,
    lastmod: new Date().toISOString(),
    changefreq: "daily" as const,
    priority: 0.8,
  }));
}

