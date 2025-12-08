"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faStar,
  faCheckCircle,
  faTools,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import { MarketplaceProduct } from "@/types/supabase";
import { ViewMode } from "@/lib/marketplace/filters";

interface ProductGridProps {
  products: MarketplaceProduct[];
  viewMode: ViewMode;
  onProductClick: (product: MarketplaceProduct) => void;
}

const getConditionLabel = (condition: string) => {
  const labels: Record<string, { text: string; color: string }> = {
    nuevo: { text: "Nuevo", color: "bg-green-100 text-green-700" },
    usado_excelente: {
      text: "Usado - Excelente",
      color: "bg-blue-100 text-blue-700",
    },
    usado_bueno: { text: "Usado - Bueno", color: "bg-yellow-100 text-yellow-700" },
    usado_regular: {
      text: "Usado - Regular",
      color: "bg-orange-100 text-orange-700",
    },
    para_reparar: {
      text: "Para Reparar",
      color: "bg-red-100 text-red-700",
    },
  };
  return labels[condition] || labels.usado_bueno;
};

export function ProductGrid({
  products,
  viewMode,
  onProductClick,
}: ProductGridProps) {
  // Filtrar duplicados por ID antes de renderizar (seguridad adicional)
  const uniqueProducts = useMemo(() => {
    const seen = new Set<string>();
    return products.filter((product) => {
      if (seen.has(product.id)) {
        return false;
      }
      seen.add(product.id);
      return true;
    });
  }, [products]);

  if (viewMode === "list") {
    return (
      <div className="space-y-4">
        {products.map((product) => {
          const condition = getConditionLabel(product.condition);
          return (
            <div
              key={product.id}
              onClick={() => onProductClick(product)}
              className="bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
            >
              <div className="flex gap-4 p-4">
                {/* Imagen */}
                <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      width={128}
                      height={128}
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      quality={85}
                      sizes="128px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FontAwesomeIcon
                        icon={faTools}
                        className="text-2xl text-gray-300"
                      />
                    </div>
                  )}
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {product.seller?.verified && (
                          <span className="bg-green-500 text-white px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-[10px]" />
                            Verificado
                          </span>
                        )}
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${condition.color}`}
                        >
                          {condition.text}
                        </span>
                      </div>

                      <h3 className="font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {product.title}
                      </h3>

                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {product.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-xs" />
                          <span>{product.location_zone || product.location_city || "CDMX"}</span>
                        </div>
                        {product.seller && (
                          <div className="flex items-center gap-1">
                            <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xs" />
                            <span>
                              {product.seller.calificacion_promedio?.toFixed(1) || "5.0"} (
                              {product.seller.review_count || 0})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Precio */}
                    <div className="flex-shrink-0 text-right">
                      <div className="text-2xl font-black text-indigo-600 mb-1">
                        ${Number(product.price).toLocaleString("es-MX")}
                      </div>
                      {product.original_price && (
                        <div className="text-sm text-gray-400 line-through">
                          ${Number(product.original_price).toLocaleString("es-MX")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Vista Grid
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {uniqueProducts.map((product) => {
        const condition = getConditionLabel(product.condition);
        return (
          <div
            key={product.id}
            onClick={() => onProductClick(product)}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-1"
          >
            {/* Imagen */}
            <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                  quality={85}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faTools}
                    className="text-6xl text-gray-400"
                  />
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                {product.seller?.verified && (
                  <span className="bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                    Verificado
                  </span>
                )}
                {product.original_price && (
                  <span className="bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                    -{Math.round((1 - product.price / product.original_price) * 100)}%
                  </span>
                )}
              </div>

              <button className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors z-10 shadow-sm opacity-0 group-hover:opacity-100 duration-300">
                <FontAwesomeIcon
                  icon={faHeart}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-5">
              <div className="mb-2">
                <span
                  className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold ${condition.color}`}
                >
                  {condition.text}
                </span>
              </div>

              <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 h-12 leading-tight group-hover:text-indigo-600 transition-colors">
                {product.title}
              </h3>

              {/* Precio */}
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-black text-indigo-600">
                  ${Number(product.price).toLocaleString("es-MX")}
                </span>
                {product.original_price && (
                  <span className="text-sm text-gray-400 line-through decoration-red-300">
                    ${Number(product.original_price).toLocaleString("es-MX")}
                  </span>
                )}
              </div>

              {/* Vendedor */}
              {product.seller && (
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-sm">
                    {product.seller.full_name[0] || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {product.seller.full_name || "Usuario"}
                      </p>
                      {product.seller.verified && (
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="text-blue-500 text-[10px]"
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <FontAwesomeIcon
                        icon={faStar}
                        className="text-yellow-400 text-xs"
                      />
                      <span className="text-xs text-gray-500">
                        {product.seller.calificacion_promedio || 5.0} ({product.seller.review_count || 0})
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Ubicación */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-xs" />
                  <span className="truncate max-w-[120px]">
                    {product.location_zone || product.location_city || "CDMX"}
                  </span>
                </div>
                <span className="text-indigo-600 text-sm font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center">
                  Ver detalles
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

