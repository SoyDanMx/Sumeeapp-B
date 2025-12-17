"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faWandSparkles,
  faChartLine,
  faUserPlus,
  faCheckCircle,
  faArrowRight,
  faTools,
} from "@fortawesome/free-solid-svg-icons";

interface HeroSectionV2Props {
  totalProducts: number;
  totalSellers: number;
  onSearch?: (query: string) => void;
}

/**
 * Hero Section V2 - Diseño inspirado en Syscom "Top Soluciones 2025"
 * Características:
 * - Imagen de fondo profesional con overlay
 * - Estadísticas animadas con contador
 * - Badges dinámicos
 * - Búsqueda prominente
 * - Diseño responsive
 */
export function HeroSectionV2({
  totalProducts = 13226,
  totalSellers = 500,
  onSearch,
}: HeroSectionV2Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [countedProducts, setCountedProducts] = useState(0);
  const [countedSellers, setCountedSellers] = useState(0);

  // Animación de contador para estadísticas
  useEffect(() => {
    const duration = 2000; // 2 segundos
    const steps = 60;
    const stepDuration = duration / steps;
    const productStep = totalProducts / steps;
    const sellerStep = totalSellers / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setCountedProducts(Math.min(Math.floor(productStep * currentStep), totalProducts));
      setCountedSellers(Math.min(Math.floor(sellerStep * currentStep), totalSellers));

      if (currentStep >= steps) {
        clearInterval(interval);
        setCountedProducts(totalProducts);
        setCountedSellers(totalSellers);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [totalProducts, totalSellers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <section className="relative h-[500px] sm:h-[600px] md:h-[700px] lg:h-[800px] overflow-hidden">
      {/* Imagen de fondo con overlay */}
      <div className="absolute inset-0 z-0">
        {/* Imagen de fondo - Usar imagen profesional de herramientas */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-green-600">
          {/* Placeholder: En producción usar imagen real */}
          <div className="absolute inset-0 bg-[url('/images/services/construccion.jpg')] bg-cover bg-center opacity-30"></div>
        </div>
        
        {/* Overlay con gradiente */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/85 via-indigo-700/80 to-green-600/85"></div>
        
        {/* Patrón decorativo sutil */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.1) 0px, transparent 1px, transparent 20px, rgba(255,255,255,0.1) 21px), repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0px, transparent 1px, transparent 20px, rgba(255,255,255,0.1) 21px)',
          }}
        ></div>
      </div>

      {/* Contenido del hero */}
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-5xl mx-auto w-full">
          {/* Badge animado */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm sm:text-base font-semibold text-white border border-white/30 shadow-lg animate-pulse">
              <FontAwesomeIcon icon={faWandSparkles} className="text-yellow-300" />
              <span>🏆 Marketplace #1 para Profesionales</span>
            </div>
          </div>

          {/* Título principal */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white mb-3 sm:mb-4 md:mb-6 text-center leading-tight">
            Herramientas y Equipos
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-200 via-yellow-200 to-orange-300">
              para Profesionales
            </span>
          </h1>

          {/* Subtítulo */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-6 sm:mb-8 md:mb-10 text-center max-w-3xl mx-auto leading-relaxed px-2">
            Compra y vende herramientas, equipos y suministros entre profesionales verificados.
            <br className="hidden sm:block" />
            <span className="text-white/80"> Red social de técnicos confiables.</span>
          </p>

          {/* Barra de búsqueda prominente */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-6 sm:mb-8">
            <div className="relative bg-white rounded-2xl shadow-2xl p-2 sm:p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 relative">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg sm:text-xl"
                />
                <input
                  type="text"
                  placeholder="Busca herramientas, equipos, suministros..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 sm:pl-14 pr-4 py-3 sm:py-4 rounded-xl text-gray-900 text-sm sm:text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 border-0"
                />
              </div>
              <button
                type="submit"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <FontAwesomeIcon icon={faSearch} />
                <span>Buscar</span>
              </button>
            </div>
          </form>

          {/* Estadísticas animadas */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-12">
            {/* Productos */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-4 sm:px-6 py-3 sm:py-4 border border-white/20 shadow-lg">
              <div className="bg-white/20 rounded-full p-2 sm:p-3">
                <FontAwesomeIcon icon={faChartLine} className="text-xl sm:text-2xl text-white" />
              </div>
              <div className="text-left">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                  {countedProducts.toLocaleString('es-MX')}+
                </div>
                <div className="text-xs sm:text-sm md:text-base text-white/90">Productos</div>
              </div>
            </div>

            {/* Vendedores */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-4 sm:px-6 py-3 sm:py-4 border border-white/20 shadow-lg">
              <div className="bg-white/20 rounded-full p-2 sm:p-3">
                <FontAwesomeIcon icon={faUserPlus} className="text-xl sm:text-2xl text-white" />
              </div>
              <div className="text-left">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                  {countedSellers.toLocaleString('es-MX')}+
                </div>
                <div className="text-xs sm:text-sm md:text-base text-white/90">Vendedores</div>
              </div>
            </div>

            {/* Satisfacción */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-4 sm:px-6 py-3 sm:py-4 border border-white/20 shadow-lg">
              <div className="bg-white/20 rounded-full p-2 sm:p-3">
                <FontAwesomeIcon icon={faCheckCircle} className="text-xl sm:text-2xl text-yellow-300" />
              </div>
              <div className="text-left">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">98%</div>
                <div className="text-xs sm:text-sm md:text-base text-white/90">Satisfacción</div>
              </div>
            </div>
          </div>

          {/* Botones CTA adicionales */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
            <Link 
              href="#categorias"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 text-sm sm:text-base"
            >
              <FontAwesomeIcon icon={faTools} />
              <span>Explorar Categorías</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
            </Link>
            <Link 
              href="/marketplace/all"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-md text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/30 shadow-lg hover:shadow-xl flex items-center gap-2 text-sm sm:text-base"
            >
              <span>Ver Productos Destacados</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
            </Link>
          </div>
        </div>
      </div>

      {/* Elementos decorativos flotantes (opcional) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Partículas decorativas */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 30}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}
      </div>
    </section>
  );
}

