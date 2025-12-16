"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  faTimes,
  faWandSparkles,
  faUserPlus,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { MarketplaceProduct } from "@/types/supabase";
import ProductModal from "@/components/marketplace/ProductModal";
import { MarketplaceSEO } from "@/components/marketplace/MarketplaceSEO";
import { StructuredData } from "@/components/marketplace/StructuredData";
import { useMarketplacePagination } from "@/hooks/useMarketplacePagination";
import { MARKETPLACE_CATEGORIES, getCategoryUrl } from "@/lib/marketplace/categories";
import { supabase } from "@/lib/supabase/client";
import { CategoryFilters } from "@/components/marketplace/CategoryFilters";
import { MobileFiltersDrawer } from "@/components/marketplace/MobileFiltersDrawer";
import { MarketplaceBreadcrumbs } from "@/components/marketplace/MarketplaceBreadcrumbs";
import { SortAndViewControls } from "@/components/marketplace/SortAndViewControls";
import { ProductGrid } from "@/components/marketplace/ProductGrid";
import { MarketplaceFooterBanner } from "@/components/marketplace/MarketplaceFooterBanner";
import {
  MarketplaceFilters,
  DEFAULT_FILTERS,
  SortOption,
  ViewMode,
  applyFilters,
} from "@/lib/marketplace/filters";

export default function MarketplacePage() {
  const [filters, setFilters] = useState<MarketplaceFilters>(DEFAULT_FILTERS);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchInput, setSearchInput] = useState(""); // Estado local para el input (con debounce)
  
  // Estado para productos cuando NO hay filtros (página principal)
  const [featuredProductsDirect, setFeaturedProductsDirect] = useState<MarketplaceProduct[]>([]);
  const [loadingDirect, setLoadingDirect] = useState(false);
  
  // Determinar si hay filtros activos
  const hasActiveFilters = useMemo(() => {
    return (
      filters.searchQuery !== "" ||
      filters.categoryId !== null ||
      filters.subcategoryId !== null ||
      filters.conditions.length > 0 ||
      filters.priceRange.min !== null ||
      filters.priceRange.max !== null ||
      filters.powerType !== null
    );
  }, [filters]);
  
  // Usar hook de paginación cuando hay filtros activos
  // Necesitamos cargar productos para aplicar filtros de subcategoría (keywords)
  const shouldUsePagination = hasActiveFilters;
  
  const {
    products: filteredProducts,
    loading: loadingFiltered,
    error,
    pagination,
  } = useMarketplacePagination({
    pageSize: 24,
    categoryId: filters.categoryId || undefined,
    searchQuery: filters.searchQuery || undefined,
    filters: {
      powerType: filters.powerType || undefined,
      minPrice: filters.priceRange.min || undefined,
      maxPrice: filters.priceRange.max || undefined,
      condition: filters.conditions.length > 0 ? filters.conditions : undefined,
    },
    forceInitialLoad: hasActiveFilters, // Forzar carga cuando hay filtros activos
  });

  // Cargar productos destacados directamente cuando NO hay filtros (más eficiente)
  useEffect(() => {
    if (!shouldUsePagination && featuredProductsDirect.length === 0 && !loadingDirect) {
      async function loadFeaturedProducts() {
        setLoadingDirect(true);
        try {
          const { data, error } = await supabase
            .from("marketplace_products")
            .select("*")
            .eq("status", "active")
            .is("seller_id", null)
            .order("created_at", { ascending: false })
            .limit(24);

          if (error) throw error;
          if (data) setFeaturedProductsDirect(data);
        } catch (err) {
          console.error("Error loading featured products:", err);
        } finally {
          setLoadingDirect(false);
        }
      }
      loadFeaturedProducts();
    }
  }, [shouldUsePagination, featuredProductsDirect.length, loadingDirect]);

  // Aplicar ordenamiento y filtros a los productos
  const products = useMemo(() => {
    const baseProducts = shouldUsePagination ? filteredProducts : featuredProductsDirect;
    // Aplicar filtros incluyendo subcategoría (búsqueda por keywords)
    return applyFilters(baseProducts, { ...filters, sortBy: filters.sortBy });
  }, [shouldUsePagination, filteredProducts, featuredProductsDirect, filters]);

  const loading = shouldUsePagination ? loadingFiltered : loadingDirect;

  // Calcular estadísticas para filtros
  const priceStats = useMemo(() => {
    const allProducts = shouldUsePagination ? filteredProducts : featuredProductsDirect;
    if (allProducts.length === 0) return { min: 0, max: 10000 };
    const prices = allProducts.map((p) => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [shouldUsePagination, filteredProducts, featuredProductsDirect]);

  const availableConditions = useMemo(() => {
    const allProducts = shouldUsePagination ? filteredProducts : featuredProductsDirect;
    const conditions = new Set(allProducts.map((p) => p.condition || "nuevo"));
    return Array.from(conditions);
  }, [shouldUsePagination, filteredProducts, featuredProductsDirect]);

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

  const handleClearFilters = () => {
    setSearchInput(""); // Limpiar primero el input
    setFilters(DEFAULT_FILTERS); // Luego limpiar los filtros
  };

  // Debounce para la búsqueda (300ms) - evita consultas excesivas mientras el usuario escribe
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, searchQuery: searchInput }));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Estado para conteos de categorías desde la BD
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loadingCounts, setLoadingCounts] = useState(true);
  
  // Estado para estadísticas globales
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [totalSellers, setTotalSellers] = useState<number>(0);

  // Cargar conteos reales de productos por categoría y estadísticas globales desde la base de datos
  useEffect(() => {
    async function loadStats() {
      setLoadingCounts(true);
      try {
        // Cargar conteo total de productos activos
        const { count: productsCount, error: productsError } = await supabase
          .from("marketplace_products")
          .select("*", { count: "exact", head: true })
          .eq("status", "active");

        if (productsError) {
          console.warn("Error counting total products:", productsError);
        } else {
          setTotalProducts(productsCount || 0);
        }

        // Cargar conteo de vendedores únicos (seller_id no nulo)
        const { count: sellersCount, error: sellersError } = await supabase
          .from("marketplace_products")
          .select("seller_id", { count: "exact", head: true })
          .eq("status", "active")
          .not("seller_id", "is", null);

        if (sellersError) {
          console.warn("Error counting sellers:", sellersError);
        } else {
          // Contar vendedores únicos
          const { data: uniqueSellers, error: uniqueError } = await supabase
            .from("marketplace_products")
            .select("seller_id")
            .eq("status", "active")
            .not("seller_id", "is", null);

          if (!uniqueError && uniqueSellers) {
            const uniqueSellerIds = new Set(uniqueSellers.map((p: any) => p.seller_id).filter(Boolean));
            setTotalSellers(uniqueSellerIds.size);
          }
        }

        // Obtener todas las categorías de la base de datos con sus slugs
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("marketplace_categories")
          .select("id, slug");

        if (categoriesError) throw categoriesError;
        if (!categoriesData || categoriesData.length === 0) {
          // Si no hay categorías en BD, usar conteos locales como fallback
          const fallbackCounts: Record<string, number> = {};
          MARKETPLACE_CATEGORIES.forEach(cat => {
            fallbackCounts[cat.id] = 0;
          });
          setCategoryCounts(fallbackCounts);
          setLoadingCounts(false);
          return;
        }

        // Para cada categoría, contar productos activos
        const counts: Record<string, number> = {};
        
        for (const dbCategory of categoriesData) {
          const category = dbCategory as any;
          const { count, error: countError } = await supabase
            .from("marketplace_products")
            .select("*", { count: "exact", head: true })
            .eq("category_id", category.id)
            .eq("status", "active");

          if (countError) {
            console.warn(`Error counting products for category ${category.slug}:`, countError);
            continue;
          }

          // Mapear el slug de la BD al ID de la categoría local
          const localCategory = MARKETPLACE_CATEGORIES.find(c => c.slug === category.slug);
          if (localCategory) {
            counts[localCategory.id] = count || 0;
          }
        }

        // Asegurar que todas las categorías tengan un conteo (aunque sea 0)
        MARKETPLACE_CATEGORIES.forEach(cat => {
          if (!(cat.id in counts)) {
            counts[cat.id] = 0;
          }
        });

        setCategoryCounts(counts);
      } catch (err) {
        console.error("Error loading stats:", err);
        // Fallback: usar conteos locales si falla
        const fallbackCounts: Record<string, number> = {};
        MARKETPLACE_CATEGORIES.forEach(cat => {
          fallbackCounts[cat.id] = 0;
        });
        setCategoryCounts(fallbackCounts);
      } finally {
        setLoadingCounts(false);
      }
    }

    loadStats();
  }, []); // Solo ejecutar una vez al montar

  const categoriesWithCounts = useMemo(() => {
    return MARKETPLACE_CATEGORIES.map((cat) => ({
      ...cat,
      count: categoryCounts[cat.id] ?? 0,
    }));
  }, [categoryCounts]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 pb-24 sm:pb-20">
      {/* SEO Component */}
      <MarketplaceSEO
        type="home"
        productCount={products.length}
        searchQuery={filters.searchQuery || undefined}
      />

      {/* Structured Data para Homepage */}
      <StructuredData
        type="Organization"
        data={{
          name: "Sumee App",
          url: "https://www.sumeeapp.com",
          logo: "https://www.sumeeapp.com/logo.png",
          description: "Marketplace profesional de herramientas y equipos para técnicos en CDMX",
          sameAs: [
            "https://www.facebook.com/sumeeapp",
            "https://www.twitter.com/sumeeapp",
            "https://www.instagram.com/sumeeapp",
          ],
        }}
      />

      {/* Breadcrumbs */}
      {(hasActiveFilters || filters.searchQuery) && (
        <MarketplaceBreadcrumbs
          searchQuery={filters.searchQuery || undefined}
          productCount={products.length}
          hasFilters={hasActiveFilters}
        />
      )}

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}

      {/* Mobile Filters Drawer */}
      <MobileFiltersDrawer
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        filters={filters}
        onFiltersChange={setFilters}
        showPowerType={filters.categoryId ? MARKETPLACE_CATEGORIES.find(c => c.id === filters.categoryId)?.filters?.powerType : false}
        availableConditions={availableConditions}
        priceStats={priceStats}
      />

      {/* Hero Section - Diseño Original */}
      <section className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-green-500 text-white py-12 md:py-16 lg:py-24 px-4 overflow-hidden">
        {/* Patrón de fondo con símbolos + */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.1) 0px, transparent 1px, transparent 20px, rgba(255,255,255,0.1) 21px), repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0px, transparent 1px, transparent 20px, rgba(255,255,255,0.1) 21px)',
          }}></div>

        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge destacado */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-full text-sm font-medium mb-6 border border-blue-400">
              <FontAwesomeIcon icon={faWandSparkles} className="text-white" />
              <span className="text-white">Marketplace Exclusivo para Profesionales</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 md:mb-6 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-orange-200 to-orange-300">
                Marketplace de Herramientas y Equipos
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 md:mb-10 text-white max-w-2xl mx-auto leading-relaxed">
              Compra y vende herramientas, equipos y suministros de construcción entre profesionales verificados. Red social de técnicos confiables.
            </p>

            {/* Search Bar con Botones */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative bg-white rounded-2xl shadow-2xl p-2 flex items-center gap-2">
              <div className="flex-1 relative">
                <FontAwesomeIcon
                  icon={faSearch}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg"
                />
                <input
                  type="text"
                  placeholder="Busca herramientas, equipos, suministros..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        setFilters((prev) => ({ ...prev, searchQuery: searchInput }));
                      }
                    }}
                    className="w-full pl-12 pr-4 py-4 md:py-5 rounded-xl text-gray-900 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 border-0"
                />
              </div>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setFilters((prev) => ({ ...prev, searchQuery: searchInput }));
                  }}
                  className="px-6 md:px-8 py-4 md:py-5 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                <FontAwesomeIcon icon={faSearch} />
                  <span>Buscar</span>
              </button>
              <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-4 md:px-6 py-4 md:py-5 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-200 flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faChevronDown} className="rotate-180" />
                  <span>Limpiar</span>
              </button>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-12 mt-8">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faChartLine} className="text-2xl text-white" />
                <div className="text-left">
                  <div className="text-2xl md:text-3xl font-bold text-white">
                    {loadingCounts ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      totalProducts.toLocaleString('es-MX')
                    )}
                  </div>
                  <div className="text-sm md:text-base text-blue-100">Productos</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faUserPlus} className="text-2xl text-white" />
                <div className="text-left">
                  <div className="text-2xl md:text-3xl font-bold text-white">
                    {loadingCounts ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      totalSellers > 0 ? `${totalSellers.toLocaleString('es-MX')}+` : "456+"
                    )}
                  </div>
                  <div className="text-sm md:text-base text-blue-100">Vendedores Verificados</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faCheckCircle} className="text-2xl text-yellow-300" />
                <div className="text-left">
                  <div className="text-2xl md:text-3xl font-bold text-white">98%</div>
                  <div className="text-sm md:text-base text-blue-100">Satisfacción</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section - Diseño Original */}
      <section className="container mx-auto px-4 py-8 md:py-12 lg:py-16 bg-white">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              Explora por Categoría
            </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Encuentra exactamente lo que necesitas para tu próximo proyecto
            </p>
          </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {categoriesWithCounts.map((category, index) => {
            const iconMap: Record<string, any> = {
              electricidad: faBolt,
              plomeria: faWrench,
              construccion: faHammer,
              mecanica: faTools,
              pintura: faPaintRoller,
              jardineria: faTree,
            };
            const Icon = iconMap[category.slug] || faTools;
            
            // Colores únicos por categoría
            const colorGradients: Record<string, string> = {
              electricidad: "from-yellow-400 to-orange-500",
              plomeria: "from-blue-400 to-cyan-500",
              construccion: "from-gray-600 to-gray-800",
              mecanica: "from-red-400 to-pink-500",
              pintura: "from-purple-400 to-indigo-500",
              jardineria: "from-green-400 to-emerald-500",
            };
            const gradient = colorGradients[category.slug] || "from-indigo-500 to-blue-500";

            return (
              <Link
                key={category.id}
                href={getCategoryUrl(category.slug)}
                onClick={() => setFilters({ ...filters, categoryId: category.id })}
                className="group relative bg-white rounded-2xl p-5 md:p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 border border-gray-100 overflow-hidden"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Efecto de brillo al hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/0 group-hover:from-white/10 group-hover:via-white/5 group-hover:to-white/0 transition-all duration-500"></div>
                
                {/* Icono con gradiente mejorado */}
                <div className={`relative w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                  <FontAwesomeIcon icon={Icon} className="text-white text-2xl md:text-3xl relative z-10" />
                  {/* Brillo en el icono */}
                  <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl"></div>
                </div>
                
                {/* Contenido */}
                <div className="relative z-10">
                  <h3 className="font-bold text-gray-900 mb-2 text-base md:text-lg group-hover:text-indigo-600 transition-colors">
                    {category.name}
                  </h3>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm md:text-base font-semibold text-indigo-600">
                      {category.count}
                    </span>
                    <span className="text-xs md:text-sm text-gray-500">
                      {category.count === 1 ? "producto" : "productos"}
                    </span>
                  </div>
                </div>
                
                {/* Indicador de hover */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Products Section con Filtros */}
      <section className="container mx-auto px-4 py-6 md:py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar de Filtros - Desktop */}
          {hasActiveFilters && (
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                <CategoryFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  showPowerType={filters.categoryId ? MARKETPLACE_CATEGORIES.find(c => c.id === filters.categoryId)?.filters?.powerType : false}
                  availableConditions={availableConditions}
                  priceStats={priceStats}
                />
              </div>
            </aside>
          )}

          {/* Contenido Principal */}
          <div className="flex-1 min-w-0">
            {/* Header con controles */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4 flex-1 flex-wrap">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                  {hasActiveFilters ? "Resultados de Búsqueda" : "Productos Destacados"}
                </h2>
                
                {/* Botón Filtros Móvil */}
                {hasActiveFilters && (
              <button
                    onClick={() => setShowMobileFilters(true)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2.5 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-indigo-50 hover:border-indigo-500 transition-all bg-white shadow-sm"
                  >
                    <FontAwesomeIcon icon={faFilter} />
                    <span>Filtros</span>
                    {(filters.conditions.length > 0 || filters.priceRange.min !== null || filters.priceRange.max !== null || filters.powerType) && (
                      <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                        {[filters.conditions.length, filters.priceRange.min ? 1 : 0, filters.priceRange.max ? 1 : 0, filters.powerType ? 1 : 0].reduce((a, b) => a + b, 0)}
                          </span>
                        )}
                  </button>
                        )}
                      </div>

              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm flex items-center gap-2 px-4 py-2 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-xs" />
                  Limpiar Filtros
                      </button>
                        )}
                      </div>

            {/* Controles de Ordenamiento y Vista */}
            {products.length > 0 && (
              <SortAndViewControls
                sortBy={filters.sortBy}
                viewMode={viewMode}
                onSortChange={(sort) => setFilters({ ...filters, sortBy: sort })}
                onViewModeChange={setViewMode}
                productCount={products.length}
              />
            )}

            {/* Loading State */}
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600"></div>
                <p className="mt-6 text-gray-600 text-lg">Cargando productos...</p>
                        </div>
            ) : error ? (
              <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-200">
                <FontAwesomeIcon icon={faTimes} className="text-red-500 text-4xl mb-4" />
                <p className="text-red-600 text-lg font-semibold">Error al cargar productos: {error}</p>
                      </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto">
                  <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <FontAwesomeIcon icon={faTools} className="text-5xl text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No se encontraron productos</h3>
                  <p className="text-gray-600 mb-8 text-lg">
                    {hasActiveFilters
                      ? "Intenta ajustar tus filtros o busca algo diferente"
                      : "No hay productos disponibles en este momento"}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={handleClearFilters}
                      className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Limpiar Filtros
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <ProductGrid
                products={products}
                viewMode={viewMode}
                onProductClick={handleProductClick}
              />
            )}
          </div>
        </div>
      </section>

      {/* Footer Banner - WhatsApp y Ver Todos */}
      <MarketplaceFooterBanner productCount={products.length} />
    </div>
  );
}
