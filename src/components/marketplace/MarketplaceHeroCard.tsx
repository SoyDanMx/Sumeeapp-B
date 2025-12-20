"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTools,
  faShoppingCart,
  faRocket,
  faBolt,
  faHammer,
  faWrench,
  faArrowRight,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { MARKETPLACE_CATEGORIES } from "@/lib/marketplace/categories";

/**
 * Componente Hero Card para Marketplace
 * Diseño moderno tipo "card flotante" con animaciones sutiles
 * Principios UX/UI aplicados:
 * - Jerarquía visual clara y mejorada
 * - Contraste y legibilidad optimizados (WCAG AA)
 * - Microinteracciones mejoradas con feedback claro
 * - Accesibilidad: focus states, touch targets ≥44px
 * - Sistema de espaciado consistente (4px base)
 * - Diseño responsive mobile-first mejorado
 * - Principio de proximidad: agrupación lógica
 * - Simplicidad: elementos esenciales destacados
 */
export function MarketplaceHeroCard() {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Categorías destacadas para preview
  const featuredCategories = MARKETPLACE_CATEGORIES.slice(0, 3);

  return (
    <Link
      href="/marketplace"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className="group relative block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-xl md:rounded-2xl transition-all duration-200"
      aria-label="Explorar marketplace de herramientas y equipos profesionales"
    >
      {/* Card Principal con Glassmorphism - Compacto para Hero - Responsive */}
      <div
        className={`relative overflow-hidden rounded-lg sm:rounded-xl md:rounded-xl p-3 sm:p-4 md:p-5 bg-gradient-to-br from-indigo-500/90 via-purple-500/90 to-pink-500/90 backdrop-blur-md border border-white/30 shadow-lg transition-all duration-300 transform ${
          isHovered || isFocused
            ? "scale-[1.02] shadow-xl border-white/40"
            : "scale-100"
        }`}
        style={{
          boxShadow:
            "0 8px 24px rgba(99, 102, 241, 0.3), inset 0 1px 0 rgba(255,255,255,0.3)",
        }}
      >
        {/* Overlay sutil para contraste */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-transparent to-black/5 pointer-events-none z-0"></div>

        {/* Contenido - Mejorado jerarquía visual */}
        <div className="relative z-10">
          {/* Header Compacto para Hero - Responsive */}
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
              {/* Icono compacto - Responsive */}
              <div className="relative flex-shrink-0">
                <div className="relative bg-white/30 backdrop-blur-sm rounded-md sm:rounded-lg p-1.5 sm:p-2 border border-white/40">
                  <FontAwesomeIcon
                    icon={faShoppingCart}
                    className="text-white text-sm sm:text-base md:text-lg drop-shadow-sm"
                    aria-hidden="true"
                  />
                </div>
              </div>
              {/* Título y badge - Responsive */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 flex-wrap">
                  <h3 className="text-white font-bold text-sm sm:text-base md:text-lg drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)] leading-tight truncate">
                    Marketplace
                  </h3>
                  <span className="bg-yellow-400 text-yellow-900 px-1 sm:px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] md:text-[10px] font-bold flex items-center gap-0.5 shadow-md flex-shrink-0">
                    <FontAwesomeIcon icon={faStar} className="text-[6px] sm:text-[7px]" aria-hidden="true" />
                    Nuevo
                  </span>
                </div>
                <p className="text-white/95 text-[9px] sm:text-[10px] md:text-xs font-medium leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] line-clamp-1">
                  Herramientas y equipos profesionales
                </p>
              </div>
            </div>

            {/* Icono de flecha compacto - Responsive */}
            <div className="flex-shrink-0 ml-1.5 sm:ml-2">
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-white/25 backdrop-blur-sm border border-white/35 flex items-center justify-center transition-all duration-300 ${
                  isHovered || isFocused
                    ? "bg-white/35 translate-x-0.5 scale-105 border-white/45"
                    : ""
                }`}
                aria-hidden="true"
              >
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className={`text-white text-[10px] sm:text-xs md:text-sm transition-transform duration-300 ${
                    isHovered || isFocused ? "translate-x-0.5" : ""
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Preview de Categorías - Responsive */}
          <div className="grid grid-cols-3 gap-1 sm:gap-1.5 md:gap-2 mb-2 sm:mb-3">
            {featuredCategories.map((category, index) => (
              <div
                key={category.id}
                className="bg-white/20 backdrop-blur-sm rounded-md sm:rounded-lg p-1.5 sm:p-2 md:p-2.5 border border-white/25 hover:bg-white/30 hover:border-white/35 transition-all duration-300 group/cat cursor-pointer"
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
                aria-label={`Categoría ${category.name}`}
              >
                <div className="flex flex-col items-center text-center gap-1 sm:gap-1.5">
                  <div
                    className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-md sm:rounded-lg bg-gradient-to-br ${category.gradient} flex items-center justify-center shadow-md group-hover/cat:scale-110 transition-all duration-300`}
                  >
                    <FontAwesomeIcon
                      icon={category.icon}
                      className="text-white text-[10px] sm:text-xs md:text-sm drop-shadow-sm"
                      aria-hidden="true"
                    />
                  </div>
                  <span className="text-white text-[8px] sm:text-[9px] md:text-[10px] font-bold line-clamp-1 leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                    {category.name}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Compacto para Hero - Responsive */}
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
              <FontAwesomeIcon
                icon={faRocket}
                className="text-yellow-300 text-xs sm:text-sm md:text-base flex-shrink-0 drop-shadow-sm"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <span className="text-white font-bold text-[10px] sm:text-xs md:text-sm leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)] block truncate">
                  Compra y vende herramientas
                </span>
                <span className="text-white/90 text-[8px] sm:text-[9px] md:text-[10px] leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] block truncate">
                  1,234+ productos disponibles
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <span className="text-white/90 text-[9px] sm:text-[10px] md:text-xs font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] whitespace-nowrap">
                Explorar →
              </span>
            </div>
          </div>
        </div>

      </div>
    </Link>
  );
}

