import { MetadataRoute } from "next";
import { MARKETPLACE_CATEGORIES } from "@/lib/marketplace/categories";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const baseUrl = "https://www.sumeeapp.com";

/**
 * Genera sitemap dinámico para el marketplace
 * Incluye todas las categorías, páginas principales y productos destacados
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
      priority: 0.7,
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

  // Productos destacados (limitado a 1000 para no sobrecargar el sitemap)
  let productPages: MetadataRoute.Sitemap = [];
  
  try {
    const supabase = await createSupabaseServerClient();
    const { data: products } = await supabase
      .from("marketplace_products")
      .select("id, updated_at")
      .eq("status", "active")
      .is("seller_id", null) // Solo productos oficiales de Sumee
      .order("updated_at", { ascending: false })
      .limit(1000);

    if (products) {
      productPages = products.map((product) => ({
        url: `${baseUrl}/marketplace/${product.id}`,
        lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.error("Error fetching products for sitemap:", error);
    // Continuar sin productos si hay error
  }

  return [...marketplacePages, ...categoryPages, ...productPages];
}
