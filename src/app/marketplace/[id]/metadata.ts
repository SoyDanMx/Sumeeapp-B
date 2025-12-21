import { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const baseUrl = "https://www.sumeeapp.com";

/**
 * Genera metadata dinámica para páginas de productos individuales
 * Esto permite que cada producto tenga su propio SEO optimizado
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const supabase = await createSupabaseServerClient();
    const { data: product, error } = await supabase
      .from("marketplace_products")
      .select(`
        id,
        title,
        description,
        price,
        images,
        condition,
        status,
        category_id,
        category:marketplace_categories(name, slug)
      `)
      .eq("id", id)
      .eq("status", "active")
      .gt("price", 0) // Excluir productos con precio 0
      .single();

    if (error || !product) {
      return getDefaultMetadata();
    }

    const imageUrl =
      product.images && product.images.length > 0
        ? product.images[0].startsWith("http")
          ? product.images[0]
          : `${baseUrl}${product.images[0]}`
        : `${baseUrl}/images/marketplace/default-product.jpg`;

    const productUrl = `${baseUrl}/marketplace/${product.id}`;
    const description = product.description
      ? product.description.substring(0, 160)
      : `Compra ${product.title} en Sumee App${product.price > 0 ? `. Precio: $${product.price.toLocaleString("es-MX")} MXN` : ""}. Marketplace profesional de herramientas y equipos.`;

    // Manejar category que puede ser array o objeto
    const categoryName = Array.isArray(product.category) && product.category.length > 0
      ? product.category[0].name
      : (product.category as any)?.name;

    return {
      title: `${product.title}${product.price > 0 ? ` - $${product.price.toLocaleString("es-MX")} MXN` : ""} | Marketplace Sumee App`,
      description,
      keywords: [
        product.title.toLowerCase(),
        "herramientas",
        "equipos profesionales",
        "marketplace CDMX",
        product.condition === "nuevo" ? "herramientas nuevas" : "herramientas usadas",
        ...(categoryName ? [categoryName.toLowerCase()] : []),
      ],
      openGraph: {
        title: `${product.title} - Sumee App`,
        description,
        type: "website",
        url: productUrl,
        siteName: "Sumee App",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: product.title,
          },
        ],
        locale: "es_MX",
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.title}${product.price > 0 ? ` - $${product.price.toLocaleString("es-MX")} MXN` : ""}`,
        description,
        images: [imageUrl],
      },
      alternates: {
        canonical: productUrl,
      },
      other: {
        "product:price:amount": product.price.toString(),
        "product:price:currency": "MXN",
        "product:condition": product.condition,
        "product:availability": product.status === "active" ? "in stock" : "out of stock",
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
  } catch (error) {
    console.error("Error generating product metadata:", error);
    return getDefaultMetadata();
  }
}

function getDefaultMetadata(): Metadata {
  return {
    title: "Producto - Marketplace Sumee App",
    description:
      "Compra herramientas y equipos profesionales en el marketplace de Sumee App.",
    robots: {
      index: false,
      follow: true,
    },
  };
}

