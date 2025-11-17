import { MetadataRoute } from "next";

// Importar los posts del blog (en producción vendría de una base de datos o CMS)
const blogPosts = [
  {
    slug: "consejos-mantener-hogar-excelente-estado",
    publishDate: "2024-01-15",
  },
  {
    slug: "elegir-profesional-perfecto-proyecto",
    publishDate: "2024-01-20",
  },
  {
    slug: "millonarios-sin-titulo-universitario-profecia-nvidia",
    publishDate: "2025-11-04",
  },
  {
    slug: "actualizaciones-seguridad-hogar-2024",
    publishDate: "2024-01-25",
  },
  {
    slug: "instalacion-bomba-agua-cdmx",
    publishDate: "2024-01-30",
  },
  {
    slug: "instalaciones-electricas-riesgos-cdmx",
    publishDate: "2024-02-05",
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.sumeeapp.com";

  // Páginas estáticas principales
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/servicios`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/professionals`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/join-as-pro`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/registro`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ];

  // Páginas de servicios específicos
  const servicePages = [
    "plomeria",
    "electricidad",
    "aire-acondicionado",
    "carpinteria",
    "limpieza",
    "pintura",
    "jardineria",
    "cctv",
    "fumigacion",
    "tablaroca",
    "wifi",
    "cargadores-electricos",
    "paneles-solares",
  ].map((service) => ({
    url: `${baseUrl}/servicios/${service}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Entradas del blog
  const blogEntries = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishDate),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...servicePages, ...blogEntries];
}
