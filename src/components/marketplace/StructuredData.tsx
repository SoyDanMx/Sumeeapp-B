"use client";

import React from "react";
import { MarketplaceProduct } from "@/types/supabase";
import { MarketplaceCategory } from "@/lib/marketplace/categories";

interface StructuredDataProps {
  type: "Product" | "ProductCollection" | "BreadcrumbList" | "Organization";
  data: any;
}

/**
 * Componente para generar Structured Data (JSON-LD) para SEO
 * Compatible con Schema.org y Google Rich Results
 */
export function StructuredData({ type, data }: StructuredDataProps) {
  const getStructuredData = () => {
    switch (type) {
      case "Product":
        return {
          "@context": "https://schema.org",
          "@type": "Product",
          ...data,
        };

      case "ProductCollection":
        return {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          ...data,
        };

      case "BreadcrumbList":
        return {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: data.items.map(
            (item: { name: string; url: string }, index: number) => ({
              "@type": "ListItem",
              position: index + 1,
              name: item.name,
              item: item.url,
            })
          ),
        };

      case "Organization":
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          ...data,
        };

      default:
        return data;
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData(), null, 2),
      }}
    />
  );
}

/**
 * Genera structured data para un producto individual
 */
export function ProductStructuredData({
  product,
  category,
}: {
  product: MarketplaceProduct;
  category?: MarketplaceCategory;
}) {
  const baseUrl = "https://www.sumeeapp.com";
  const productUrl = `${baseUrl}/marketplace/producto/${product.id}`;
  const imageUrl = product.images && product.images.length > 0 
    ? product.images[0].startsWith("http")
      ? product.images[0]
      : `${baseUrl}${product.images[0]}`
    : `${baseUrl}/images/marketplace/default-product.jpg`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: imageUrl,
    sku: product.id,
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "MXN",
      price: product.price.toString(),
      priceValidUntil: new Date(
        Date.now() + 90 * 24 * 60 * 60 * 1000
      ).toISOString(),
      availability:
        product.status === "active"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: getConditionSchema(product.condition),
      seller: {
        "@type": "Organization",
        name: product.seller?.full_name || "Sumee Supply",
      },
    },
    brand: {
      "@type": "Brand",
      name: product.seller?.full_name || "Sumee Supply",
    },
    category: category?.name || "Herramientas",
    aggregateRating: product.seller?.calificacion_promedio
      ? {
          "@type": "AggregateRating",
          ratingValue: product.seller.calificacion_promedio.toString(),
          reviewCount: product.seller.review_count?.toString() || "0",
        }
      : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  );
}

/**
 * Genera structured data para una colección de productos (categoría)
 */
export function ProductCollectionStructuredData({
  category,
  productCount,
}: {
  category: MarketplaceCategory;
  productCount: number;
}) {
  const baseUrl = "https://www.sumeeapp.com";
  const categoryUrl = `${baseUrl}/marketplace/categoria/${category.slug}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.namePlural,
    description: category.description,
    url: categoryUrl,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: productCount,
      itemListElement: {
        "@type": "ListItem",
        position: 1,
        name: category.namePlural,
      },
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Marketplace",
          item: `${baseUrl}/marketplace`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: category.name,
          item: categoryUrl,
        },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  );
}

/**
 * Genera structured data para breadcrumbs
 */
export function BreadcrumbStructuredData({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  return <StructuredData type="BreadcrumbList" data={{ items }} />;
}

/**
 * Convierte condición del producto a Schema.org condition
 */
function getConditionSchema(
  condition: string
): "https://schema.org/NewCondition" | "https://schema.org/UsedCondition" {
  if (condition === "nuevo") {
    return "https://schema.org/NewCondition";
  }
  return "https://schema.org/UsedCondition";
}

