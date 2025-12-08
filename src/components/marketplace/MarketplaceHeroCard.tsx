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
 * - Jerarquía visual clara
 * - Contraste y legibilidad
 * - Microinteracciones
 * - Feedback visual inmediato
 * - Diseño responsive mobile-first
 */
export function MarketplaceHeroCard() {
  const [isHovered, setIsHovered] = useState(false);

  // Categorías destacadas para preview
  const featuredCategories = MARKETPLACE_CATEGORIES.slice(0, 3);

  return (
    <Link
      href="/marketplace"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative block w-full"
    >
      {/* Card Principal con Glassmorphism */}
      <div
        className="relative overflow-hidden rounded-2xl md:rounded-3xl p-6 md:p-8 bg-gradient-to-br from-indigo-600/90 via-purple-600/90 to-pink-600/90 backdrop-blur-xl border-2 border-white/30 shadow-2xl transition-all duration-500 transform hover:scale-[1.02] hover:shadow-3xl"
        style={{
          boxShadow:
            "0 20px 60px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
        }}
      >
        {/* Efecto de brillo animado */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div
            className="absolute inset-0 animate-shimmer"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)",
              backgroundSize: "200% 200%",
              animationDuration: "3s",
            }}
          />
        </div>

        {/* Partículas decorativas flotantes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/30 rounded-full animate-float"
              style={{
                left: `${20 + i * 15}%`,
                top: `${10 + (i % 3) * 30}%`,
                animationDuration: `${3 + i * 0.5}s`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>

        {/* Contenido */}
        <div className="relative z-10">
          {/* Header con Badge */}
          <div className="flex items-start justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300" />
                <div className="relative bg-white/30 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/40">
                  <FontAwesomeIcon
                    icon={faShoppingCart}
                    className="text-white text-xl md:text-2xl"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-bold text-lg md:text-xl lg:text-2xl">
                    Marketplace
                  </h3>
                  <span className="bg-yellow-400/90 text-yellow-900 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold flex items-center gap-1">
                    <FontAwesomeIcon icon={faStar} className="text-[8px]" />
                    Nuevo
                  </span>
                </div>
                <p className="text-white/80 text-xs md:text-sm">
                  Herramientas y equipos profesionales
                </p>
              </div>
            </div>

            {/* Icono de flecha animado */}
            <div className="flex-shrink-0">
              <div
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center transition-all duration-300 ${
                  isHovered
                    ? "bg-white/30 translate-x-1 scale-110"
                    : ""
                }`}
              >
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className={`text-white text-sm md:text-base transition-transform duration-300 ${
                    isHovered ? "translate-x-1" : ""
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Preview de Categorías */}
          <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4 md:mb-6">
            {featuredCategories.map((category, index) => (
              <div
                key={category.id}
                className="bg-white/15 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 border border-white/20 hover:bg-white/25 transition-all duration-300 group/cat"
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br ${category.gradient} flex items-center justify-center mb-2 group-hover/cat:scale-110 transition-transform duration-300`}
                  >
                    <FontAwesomeIcon
                      icon={category.icon}
                      className="text-white text-sm md:text-base"
                    />
                  </div>
                  <span className="text-white text-[10px] md:text-xs font-semibold line-clamp-1">
                    {category.name}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Principal */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-5 border border-white/30">
              <div className="flex items-center gap-3 mb-2">
                <FontAwesomeIcon
                  icon={faRocket}
                  className="text-yellow-300 text-lg md:text-xl"
                />
                <span className="text-white font-bold text-sm md:text-base">
                  Compra y vende herramientas
                </span>
              </div>
              <p className="text-white/80 text-xs md:text-sm leading-relaxed">
                Entre profesionales verificados. Encuentra lo que necesitas o vende lo que ya no usas.
              </p>
            </div>

            <div className="flex items-center gap-2 sm:flex-col sm:gap-3">
              <div className="text-center sm:text-right">
                <div className="text-white font-black text-2xl md:text-3xl mb-0.5">
                  1,234+
                </div>
                <div className="text-white/70 text-[10px] md:text-xs">
                  Productos
                </div>
              </div>
            </div>
          </div>

          {/* Indicador de acción */}
          <div className="mt-4 md:mt-6 flex items-center justify-center gap-2 text-white/60 text-xs md:text-sm">
            <span>Explora ahora</span>
            <FontAwesomeIcon
              icon={faArrowRight}
              className={`text-[10px] transition-transform duration-300 ${
                isHovered ? "translate-x-1" : ""
              }`}
            />
          </div>
        </div>

        {/* Borde brillante animado */}
        <div className="absolute inset-0 rounded-2xl md:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div
            className="absolute inset-0 rounded-2xl md:rounded-3xl animate-shimmer"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(255,255,255,0.3) 100%)",
              backgroundSize: "200% 200%",
            }}
          />
        </div>
      </div>
    </Link>
  );
}

