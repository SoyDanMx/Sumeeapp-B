import { MetadataRoute } from "next";

/**
 * Configuración de robots.txt para el marketplace
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.sumeeapp.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/marketplace",
          "/marketplace/categoria/",
          "/marketplace/all",
        ],
        disallow: [
          "/marketplace/sell", // Página de creación, no necesita indexación
          "/api/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: [
          "/marketplace",
          "/marketplace/categoria/",
          "/marketplace/all",
        ],
        disallow: ["/marketplace/sell"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

