import { MetadataRoute } from "next";
import { MARKETPLACE_CATEGORIES } from "@/lib/marketplace/categories";

/**
 * Genera sitemap dinámico para el marketplace
 * Incluye todas las categorías y la página principal
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.sumeeapp.com";

  // Página principal del marketplace
  const marketplacePages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/marketplace`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/marketplace/all`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/marketplace/sell`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Páginas de categorías
  const categoryPages: MetadataRoute.Sitemap = MARKETPLACE_CATEGORIES.map(
    (category) => ({
      url: `${baseUrl}/marketplace/categoria/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    })
  );

  return [...marketplacePages, ...categoryPages];
}

