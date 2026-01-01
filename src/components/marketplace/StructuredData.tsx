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
 * Optimizado para Google Rich Results y Shopping
 */
export function ProductStructuredData({
  product,
  category,
}: {
  product: MarketplaceProduct;
  category?: MarketplaceCategory;
}) {
  const baseUrl = "https://www.sumeeapp.com";
  const productUrl = `${baseUrl}/marketplace/${product.id}`;
  const imageUrl = product.images && product.images.length > 0 
    ? product.images[0].startsWith("http")
      ? product.images[0]
      : `${baseUrl}${product.images[0]}`
    : `${baseUrl}/images/marketplace/default-product.jpg`;

  // Preparar todas las imágenes
  const images = product.images && product.images.length > 0
    ? product.images.map(img => 
        img.startsWith("http") ? img : `${baseUrl}${img}`
      )
    : [imageUrl];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description || product.title,
    image: images,
    sku: product.id,
    mpn: product.id,
    brand: {
      "@type": "Brand",
      name: product.seller?.full_name || "TRUPER" || "Sumee Supply",
    },
    category: category?.name || "Herramientas",
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
        "@type": product.seller_id ? "Person" : "Organization",
        name: product.seller?.full_name || "Sumee Supply",
        ...(product.seller_id ? {} : {
          "@id": `${baseUrl}#organization`,
        }),
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "MXN",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "MX",
          addressRegion: "CDMX",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          businessDays: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          },
          cutoffTime: "14:00",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 3,
            unitCode: "DAY",
          },
        },
      },
    },
    ...(product.seller?.calificacion_promedio ? {
      aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: product.seller.calificacion_promedio.toString(),
          reviewCount: product.seller.review_count?.toString() || "0",
        bestRating: "5",
        worstRating: "1",
      },
    } : {}),
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
  products,
}: {
  category: MarketplaceCategory;
  productCount: number;
  products?: any[]; // Productos destacados para incluir en structured data
}) {
  const baseUrl = "https://www.sumeeapp.com";
  const categoryUrl = `${baseUrl}/marketplace/categoria/${category.slug}`;

  // Preparar itemListElement con productos destacados (máximo 10)
  const itemListElement = products && products.length > 0
    ? products.slice(0, 10).map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          "@id": `${baseUrl}/marketplace/${product.id}`,
          name: product.title,
          image: product.images && product.images.length > 0
            ? product.images[0].startsWith("http")
              ? product.images[0]
              : `${baseUrl}${product.images[0]}`
            : undefined,
          offers: {
            "@type": "Offer",
            price: product.price?.toString() || "0",
            priceCurrency: "MXN",
            availability: product.status === "active"
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          },
        },
      }))
    : [];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.namePlural,
    description: category.description,
    url: categoryUrl,
    inLanguage: "es-MX",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: productCount,
      ...(itemListElement.length > 0 && {
        itemListElement,
      }),
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

