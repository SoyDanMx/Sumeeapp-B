"use client";

import React, { useEffect } from "react";
import { MarketplaceCategory } from "@/lib/marketplace/categories";
import { MarketplaceProduct } from "@/types/supabase";

interface MarketplaceSEOProps {
  type: "home" | "category" | "product";
  category?: MarketplaceCategory;
  product?: MarketplaceProduct;
  productCount?: number;
  searchQuery?: string;
}

/**
 * Componente para manejar SEO dinámico en componentes client-side
 * Usa document.head para inyectar meta tags dinámicamente
 * Nota: En App Router, la metadata estática se maneja mejor en layouts/metadata
 * Este componente es útil para metadata dinámica basada en estado del cliente
 */
export function MarketplaceSEO({
  type,
  category,
  product,
  productCount,
  searchQuery,
}: MarketplaceSEOProps) {
  const baseUrl = "https://www.sumeeapp.com";

  useEffect(() => {
    const getMetadata = () => {
      switch (type) {
        case "home":
          return {
            title: "Marketplace de Herramientas y Equipos | Sumee App",
            description:
              "Compra y vende herramientas, equipos y suministros de construcción entre profesionales verificados. Marketplace exclusivo para técnicos confiables en CDMX.",
            url: `${baseUrl}/marketplace`,
            image: `${baseUrl}/og-marketplace.png`,
          };

        case "category":
          if (!category) return null;
          const countText = productCount
            ? `${productCount} ${productCount === 1 ? "producto" : "productos"} disponibles`
            : "productos disponibles";
          return {
            title: `${category.namePlural} - Marketplace Profesional | Sumee App`,
            description: `${category.description}. ${countText} en ${category.name}. Compra y vende herramientas entre profesionales verificados en CDMX.`,
            url: `${baseUrl}/marketplace/categoria/${category.slug}`,
            image: `${baseUrl}/og-marketplace-${category.slug}.png`,
          };

        case "product":
          if (!product) return null;
          const imageUrl =
            product.images && product.images.length > 0
              ? product.images[0].startsWith("http")
                ? product.images[0]
                : `${baseUrl}${product.images[0]}`
              : `${baseUrl}/images/marketplace/default-product.jpg`;
          return {
            title: `${product.title} - Marketplace Sumee App`,
            description: `${product.description.substring(0, 160)}...`,
            url: `${baseUrl}/marketplace/producto/${product.id}`,
            image: imageUrl,
            price: product.price,
            currency: "MXN",
          };

        default:
          return null;
      }
    };

    const metadata = getMetadata();
    if (!metadata) return;

    // Update document title
    document.title = metadata.title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement("meta");
        if (property) {
          meta.setAttribute("property", name);
        } else {
          meta.setAttribute("name", name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", metadata.url);

    // Update meta tags
    updateMetaTag("description", metadata.description);
    updateMetaTag("og:title", metadata.title, true);
    updateMetaTag("og:description", metadata.description, true);
    updateMetaTag("og:url", metadata.url, true);
    updateMetaTag("og:image", metadata.image, true);
    updateMetaTag("og:type", type === "product" ? "product" : "website", true);
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", metadata.title);
    updateMetaTag("twitter:description", metadata.description);
    updateMetaTag("twitter:image", metadata.image);

    if (type === "product" && "price" in metadata && metadata.price) {
      updateMetaTag("product:price:amount", metadata.price.toString(), true);
      updateMetaTag("product:price:currency", metadata.currency || "MXN", true);
    }

    if (searchQuery) {
      updateMetaTag("robots", "noindex, follow");
    }
  }, [type, category, product, productCount, searchQuery]);

  return null; // Este componente no renderiza nada visualmente
}

