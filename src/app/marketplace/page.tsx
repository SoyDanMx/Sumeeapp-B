"use client";

import React, { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faMapMarkerAlt,
  faStar,
  faHeart,
  faShoppingCart,
  faCheckCircle,
  faTools,
  faHammer,
  faBolt,
  faWrench,
  faPaintRoller,
  faTruck,
  faShieldAlt,
  faRocket,
  faUsers,
  faChartLine,
  faTree,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { MarketplaceProduct } from "@/types/supabase";
import ProductModal from "@/components/marketplace/ProductModal";
import { MarketplaceSEO } from "@/components/marketplace/MarketplaceSEO";
import { StructuredData } from "@/components/marketplace/StructuredData";
import { useMarketplacePagination } from "@/hooks/useMarketplacePagination";
import { InfiniteScrollTrigger } from "@/components/marketplace/InfiniteScrollTrigger";
import { MARKETPLACE_CATEGORIES, getCategoryUrl } from "@/lib/marketplace/categories";

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPowerType, setSelectedPowerType] = useState<string | null>(null);

  // Usar hook de paginación con infinite scroll
  const {
    products,
    loading,
    error,
    pagination,
    loadNextPage,
  } = useMarketplacePagination({
    pageSize: 24,
    categoryId: selectedCategory || undefined,
    searchQuery: searchQuery || undefined,
    filters: {
      powerType: selectedPowerType || undefined,
    },
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null);

  const handleProductClick = (product: MarketplaceProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  // Filtrar solo productos con imágenes y ordenar por importancia (para la página principal)
  const featuredProducts = useMemo(() => {
    return products
      .filter((product) => product.images && product.images.length > 0 && product.images[0])
      .sort((a, b) => {
        // Ordenar por importancia: más vistas + más likes + más reciente
        const scoreA = (a.views_count || 0) + (a.likes_count || 0) * 2 + (a.seller?.verified ? 10 : 0);
        const scoreB = (b.views_count || 0) + (b.likes_count || 0) * 2 + (b.seller?.verified ? 10 : 0);
        return scoreB - scoreA;
      })
      .slice(0, 12); // Mostrar solo los 12 más importantes en la página principal
  }, [products]);

  // Calcular contadores reales por categoría
  const categoriesWithCounts = MARKETPLACE_CATEGORIES.map((cat) => ({
    ...cat,
    count: products.filter((p) => p.category_id === cat.id).length,
  }));

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 pb-20">
      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 text-white py-12 md:py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 md:px-4 md:py-2 rounded-full mb-4 md:mb-6">
              <FontAwesomeIcon icon={faRocket} className="text-xs md:text-sm" />
              <span className="text-xs md:text-sm font-semibold">Marketplace Exclusivo para Profesionales</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-3 md:mb-4 leading-tight px-2">
              Marketplace de
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Herramientas y Equipos
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
              Compra y vende herramientas, equipos y suministros de construcción entre profesionales verificados.
              Red social de técnicos confiables.
            </p>

            {/* Búsqueda Principal */}
            <div className="bg-white rounded-2xl shadow-2xl p-2 md:p-3 flex flex-col sm:flex-row gap-2 max-w-3xl mx-auto">
              <div className="flex-1 relative">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Busca herramientas, equipos, suministros..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 md:py-4 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                />
              </div>
              <button className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2">
                <FontAwesomeIcon icon={faSearch} />
                <span className="hidden sm:inline">Buscar</span>
              </button>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedPowerType(null);
                }}
                className="bg-gray-100 text-gray-700 px-4 md:px-6 py-3 md:py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <FontAwesomeIcon icon={faFilter} />
                <span className="hidden sm:inline">Limpiar</span>
              </button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-6 md:mt-8 text-xs sm:text-sm px-4">
              <div className="flex items-center gap-1.5 md:gap-2">
                <FontAwesomeIcon icon={faChartLine} className="text-yellow-300 text-sm md:text-base" />
                <span className="font-semibold">1,234+</span>
                <span className="text-blue-100 hidden sm:inline">Productos</span>
                <span className="text-blue-100 sm:hidden">Prod.</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2">
                <FontAwesomeIcon icon={faUsers} className="text-yellow-300 text-sm md:text-base" />
                <span className="font-semibold">456+</span>
                <span className="text-blue-100 hidden sm:inline">Vendedores Verificados</span>
                <span className="text-blue-100 sm:hidden">Vendedores</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2">
                <FontAwesomeIcon icon={faCheckCircle} className="text-yellow-300 text-sm md:text-base" />
                <span className="font-semibold">98%</span>
                <span className="text-blue-100">Satisfacción</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Explora por Categoría
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Encuentra exactamente lo que necesitas para tu próximo proyecto
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
            {categoriesWithCounts.map((category) => (
              <Link
                key={category.id}
                href={getCategoryUrl(category)}
                className={`group relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl block ${
                  selectedCategory === category.id
                    ? "ring-2 sm:ring-4 ring-indigo-500 ring-offset-1 sm:ring-offset-2 scale-105 shadow-xl"
                    : ""
                }`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-90 group-hover:opacity-100 transition-opacity`}
                />
                <div className="relative z-10">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-2 sm:mb-3 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={category.icon}
                      className="text-lg sm:text-xl md:text-2xl text-white"
                    />
                  </div>
                  <h3 className="font-bold text-white text-xs sm:text-sm md:text-base mb-0.5 sm:mb-1">
                    {category.name}
                  </h3>
                  <p className="text-white/80 text-[10px] sm:text-xs">
                    {category.count} {category.count === 1 ? "prod." : "prod."}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Special Filter: Herramienta Eléctrica */}
          <div className="mt-6 sm:mt-8 flex justify-center px-4">
            <button
              onClick={() => setSelectedPowerType(selectedPowerType === 'electric_all' ? null : 'electric_all')}
              className={`group relative overflow-hidden rounded-xl sm:rounded-2xl px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl w-full sm:w-auto ${selectedPowerType === 'electric_all'
                ? "ring-2 sm:ring-4 ring-cyan-500 ring-offset-1 sm:ring-offset-2 scale-105 shadow-xl"
                : ""
                }`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 opacity-90 group-hover:opacity-100 transition-opacity`}
              />
              <div className="relative z-10 flex items-center gap-3 sm:gap-4 justify-center sm:justify-start">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon
                    icon={faBolt}
                    className="text-xl sm:text-2xl text-white"
                  />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-white text-base sm:text-lg mb-0.5 sm:mb-1">
                    Herramienta Eléctrica
                  </h3>
                  <p className="text-white/80 text-xs sm:text-sm">
                    Eléctricas e inalámbricas
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Productos */}
      <section className="py-12 md:py-16 bg-gray-50 min-h-[500px]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
                {selectedCategory
                  ? `Resultados en ${categoriesWithCounts.find(c => c.id === selectedCategory)?.name || "Categoría"}`
                  : "Productos Destacados"}
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Seleccionados por nuestros profesionales verificados
              </p>
            </div>
            <Link
              href="/marketplace/all"
              className="flex sm:hidden md:flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 text-sm sm:text-base self-start sm:self-auto"
            >
              Ver todos
              <FontAwesomeIcon icon={faSearch} />
            </Link>
          </div>


          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-gray-500">Cargando productos...</p>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faSearch} className="text-gray-400 text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No se encontraron productos</h3>
              <p className="text-gray-500">Intenta con otra búsqueda o categoría</p>
              <button
                onClick={() => { setSearchQuery(""); setSelectedCategory(null); setSelectedPowerType(null); }}
                className="mt-4 text-indigo-600 font-semibold hover:underline"
              >
                Ver todos los productos
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {featuredProducts.map((product) => {
                const condition = getConditionLabel(product.condition);
                return (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-1"
                  >
                    {/* Imagen */}
                    <div className="relative h-40 sm:h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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
                    <div className="p-4 sm:p-5">
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 h-10 sm:h-12 leading-tight group-hover:text-indigo-600 transition-colors text-sm sm:text-base">
                        {product.title}
                      </h3>

                      {/* Precio */}
                      <div className="flex items-baseline gap-2 mb-2 sm:mb-3">
                        <span className="text-xl sm:text-2xl font-black text-indigo-600">
                          ${Number(product.price).toLocaleString("es-MX")}
                        </span>
                        {product.original_price && (
                          <span className="text-xs sm:text-sm text-gray-400 line-through decoration-red-300">
                            ${Number(product.original_price).toLocaleString("es-MX")}
                          </span>
                        )}
                      </div>

                      {/* Condición */}
                      <span
                        className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold mb-3 ${condition.color}`}
                      >
                        {condition.text}
                      </span>

                      {/* Vendedor */}
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-sm">
                          {product.seller?.full_name[0] || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {product.seller?.full_name || "Usuario"}
                            </p>
                            {product.seller?.verified && (
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
                              {product.seller?.calificacion_promedio || 5.0} ({product.seller?.review_count || 0})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Ubicación */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-xs" />
                          <span className="truncate max-w-[120px]">{product.location_zone}, {product.location_city}</span>
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

              {/* Enlace para explorar todos los artículos */}
              {pagination.total > featuredProducts.length && (
                <div className="mt-8 sm:mt-12 text-center px-4">
                  <Link
                    href="/marketplace/all"
                    className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-center sm:text-left">Explora todos nuestros artículos</span>
                      <FontAwesomeIcon icon={faRocket} className="text-lg sm:text-xl" />
                    </div>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs sm:text-sm">
                      {pagination.total - featuredProducts.length} más disponibles
                    </span>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Dual CTA Section */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">

            {/* Card 1: Sell Your Tools */}
            <div className="group relative bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 text-white overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-white/5 rounded-full -translate-y-24 sm:-translate-y-32 translate-x-24 sm:translate-x-32 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="absolute bottom-0 left-0 w-36 sm:w-48 h-36 sm:h-48 bg-white/5 rounded-full translate-y-16 sm:translate-y-24 -translate-x-16 sm:-translate-x-24 group-hover:scale-110 transition-transform duration-500"></div>

              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                  <FontAwesomeIcon icon={faShoppingCart} className="text-2xl sm:text-3xl" />
                </div>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3">
                  ¿Eres Profesional Verificado?
                </h3>
                <p className="text-blue-100 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                  Únete a nuestra red y comienza a vender tus herramientas y equipos a otros profesionales de confianza
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/join-as-pro"
                    className="flex-1 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <FontAwesomeIcon icon={faRocket} />
                    Únete Ahora
                  </Link>
                  <Link
                    href="/marketplace/sell"
                    className="flex-1 bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-800 transition-all border-2 border-white/20 flex items-center justify-center gap-2"
                  >
                    <FontAwesomeIcon icon={faShoppingCart} />
                    Publicar
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 2: Request a Tool */}
            <div className="group relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 text-white overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-white/5 rounded-full -translate-y-24 sm:-translate-y-32 translate-x-24 sm:translate-x-32 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="absolute bottom-0 left-0 w-36 sm:w-48 h-36 sm:h-48 bg-white/5 rounded-full translate-y-16 sm:translate-y-24 -translate-x-16 sm:-translate-x-24 group-hover:scale-110 transition-transform duration-500"></div>

              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                  <FontAwesomeIcon icon={faTools} className="text-2xl sm:text-3xl" />
                </div>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3">
                  ¿No Encuentras lo que Buscas?
                </h3>
                <p className="text-emerald-100 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                  ¿Tienes un equipo o herramienta especializada que no se muestra en el marketplace? Pregúntanos y lo buscamos por ti
                </p>

                <a
                  href="https://wa.me/525636741156?text=Hola%2C%20estoy%20buscando%20una%20herramienta%20que%20no%20encuentro%20en%20el%20marketplace%3A%20"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-white text-emerald-600 px-6 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl group/btn"
                >
                  <svg className="w-6 h-6 group-hover/btn:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span>Solicitar por WhatsApp</span>
                  <FontAwesomeIcon icon={faRocket} className="text-sm group-hover/btn:translate-x-1 transition-transform" />
                </a>

                <p className="text-emerald-100 text-sm mt-4 text-center">
                  Respuesta en menos de 24 horas
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}

