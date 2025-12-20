"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faBars,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { MarketplaceProduct } from "@/types/supabase";
import ProductModal from "@/components/marketplace/ProductModal";
import { CategoryBreadcrumbs } from "@/components/marketplace/CategoryBreadcrumbs";
import { CategoryFilters } from "@/components/marketplace/CategoryFilters";
import { SortAndViewControls } from "@/components/marketplace/SortAndViewControls";
import { ProductGrid } from "@/components/marketplace/ProductGrid";
import {
  ProductCollectionStructuredData,
  BreadcrumbStructuredData,
} from "@/components/marketplace/StructuredData";
import {
  getCategoryBySlug,
  MARKETPLACE_CATEGORIES,
} from "@/lib/marketplace/categories";
import {
  MarketplaceFilters,
  DEFAULT_FILTERS,
  applyFilters,
  SortOption,
  ViewMode,
} from "@/lib/marketplace/filters";
import { useMarketplacePagination } from "@/hooks/useMarketplacePagination";
import { InfiniteScrollTrigger } from "@/components/marketplace/InfiniteScrollTrigger";
import { ExchangeRateModal } from "@/components/marketplace/ExchangeRateModal";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { filterProductsWithImages } from "@/lib/marketplace/imageFilter";

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;

  const category = getCategoryBySlug(slug);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MarketplaceFilters>({
    ...DEFAULT_FILTERS,
    categoryId: category?.id || null,
    searchQuery: searchParams.get("q") || "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showExchangeRateModal, setShowExchangeRateModal] = useState(false);
  
  // Hook para tasa de cambio (solo para categoría sistemas)
  const isSistemasCategory = slug === "sistemas";
  const { exchangeRate, convertToMXN, formatMXN } = useExchangeRate();

  // Determinar si hay filtros activos (para forzar carga)
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

  // Usar hook de paginación con infinite scroll
  const {
    products,
    loading,
    error: paginationError,
    pagination,
    loadNextPage,
  } = useMarketplacePagination({
    pageSize: 24,
    categoryId: category?.id || undefined,
    searchQuery: filters.searchQuery || undefined,
    filters: {
      minPrice: filters.priceRange?.min || undefined,
      maxPrice: filters.priceRange?.max || undefined,
      condition: filters.conditions.length > 0 ? filters.conditions : undefined,
      powerType: filters.powerType || undefined,
    },
    forceInitialLoad: hasActiveFilters || !!category?.id, // Forzar carga cuando hay categoría o filtros activos
  });

  // Sincronizar estados
  useEffect(() => {
    if (paginationError) {
      setError(paginationError);
    }
  }, [paginationError]);

  // Update filters when category changes
  useEffect(() => {
    if (category) {
      setFilters((prev) => ({
        ...prev,
        categoryId: category.id,
      }));
    }
  }, [category]);

  // Debug: Log cuando cambian los filtros
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 [CATEGORÍA] Filtros actualizados:', {
        subcategoryId: filters.subcategoryId,
        categoryId: filters.categoryId,
        conditions: filters.conditions,
        priceRange: filters.priceRange,
        powerType: filters.powerType,
      });
    }
  }, [filters.subcategoryId, filters.categoryId, filters.conditions.length, filters.priceRange.min, filters.priceRange.max, filters.powerType]);

  // Aplicar filtros adicionales incluyendo subcategoría (keywords)
  const filteredProducts = useMemo(() => {
    // Debug en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 [CATEGORÍA] Aplicando filtros:', {
        productosAntes: products.length,
        categoria: category?.name,
        categoriaId: category?.id,
        filters: {
          subcategoryId: filters.subcategoryId,
          categoryId: filters.categoryId,
          conditions: filters.conditions,
          priceRange: filters.priceRange,
          powerType: filters.powerType,
        },
      });
      
      // Si hay subcategoría seleccionada, mostrar información
      if (filters.subcategoryId && filters.categoryId) {
        const { getSubcategoryById } = require('@/lib/marketplace/categories');
        const subcategory = getSubcategoryById(filters.categoryId, filters.subcategoryId);
        if (subcategory) {
          console.log(`📌 Subcategoría seleccionada: "${subcategory.name}"`, {
            keywords: subcategory.keywords,
          });
        }
      }
    }
    
    // Filtrar productos sin imágenes válidas primero
    const productsWithImages = filterProductsWithImages(products);
    const result = applyFilters(productsWithImages, filters);
    
    // Debug en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [CATEGORÍA] Productos después de aplicar filtros:', result.length);
      if (filters.subcategoryId && result.length === 0 && products.length > 0) {
        console.warn('⚠️ El filtro de subcategoría filtró todos los productos.');
        console.warn('⚠️ Esto puede significar que:');
        console.warn('   1. Las keywords no coinciden con los títulos/descripciones');
        console.warn('   2. Los productos no tienen las palabras clave esperadas');
        console.warn('   3. Hay un problema con la búsqueda de keywords');
      } else if (products.length === 0) {
        console.warn('⚠️ No hay productos cargados. Verifica que la categoría tenga productos en la BD.');
      }
    }
    
    return result;
  }, [products, filters, category]);

  // Calculate stats basado en todos los productos de la categoría (no solo los cargados)
  // Nota: Para estadísticas precisas, idealmente deberíamos hacer una consulta separada
  // Por ahora usamos los productos cargados como aproximación
  const priceStats = useMemo(() => {
    if (filteredProducts.length === 0) {
      return { min: 0, max: 0 };
    }
    const prices = filteredProducts.map((p) => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [filteredProducts]);

  const availableConditions = useMemo(() => {
    const conditions = new Set(
      filteredProducts.map((p) => p.condition)
    );
    return Array.from(conditions);
  }, [filteredProducts]);

  const handleProductClick = (product: MarketplaceProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Categoría no encontrada
          </h1>
          <Link
            href="/marketplace"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Volver al marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 md:pt-28">
      {/* SEO Structured Data */}
      <ProductCollectionStructuredData
        category={category}
        productCount={filteredProducts.length}
      />
      <BreadcrumbStructuredData
        items={[
          { name: "Marketplace", url: "https://www.sumeeapp.com/marketplace" },
          { name: category.name, url: `https://www.sumeeapp.com/marketplace/categoria/${category.slug}` },
        ]}
      />

      {/* Breadcrumbs */}
      <CategoryBreadcrumbs
        category={category}
        searchQuery={filters.searchQuery || undefined}
        productCount={filteredProducts.length}
      />

      {/* Header con búsqueda */}
      <div className="bg-white border-b border-gray-200 sticky top-24 md:top-28 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {/* Botón filtros móvil */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <FontAwesomeIcon icon={faFilter} />
              <span>Filtros</span>
            </button>

            {/* Búsqueda */}
            <div className="flex-1 relative">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder={`Buscar en ${category.name}...`}
                value={filters.searchQuery}
                onChange={(e) =>
                  setFilters({ ...filters, searchQuery: e.target.value })
                }
                className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar de filtros - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-32 md:top-36">
              <CategoryFilters
                filters={filters}
                onFiltersChange={setFilters}
                showPowerType={category.filters?.powerType}
                availableConditions={availableConditions}
                priceStats={priceStats}
                products={products}
              />
            </div>
          </aside>

          {/* Contenido principal */}
          <main className="flex-1 min-w-0">
            {/* Header de categoría */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center`}
                  >
                    <FontAwesomeIcon
                      icon={category.icon}
                      className="text-white text-xl"
                    />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {category.namePlural}
                    </h1>
                    <p className="text-gray-600">{category.description}</p>
                  </div>
                </div>
                {/* Botón de tasa de cambio para categoría sistemas */}
                {isSistemasCategory && exchangeRate && (
                  <button
                    onClick={() => setShowExchangeRateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                  >
                    <span className="text-sm font-semibold">
                      1 USD = ${exchangeRate.rate.toLocaleString("es-MX", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} MXN
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Controles de ordenamiento y vista */}
            <SortAndViewControls
              sortBy={filters.sortBy}
              viewMode={filters.viewMode}
              onSortChange={(sort) => setFilters({ ...filters, sortBy: sort })}
              onViewModeChange={(mode) =>
                setFilters({ ...filters, viewMode: mode })
              }
              productCount={filteredProducts.length}
            />

            {/* Grid de productos */}
            {loading && products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-500">Cargando productos...</p>
              </div>
            ) : filteredProducts.length === 0 && !loading ? (
              <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="text-gray-400 text-3xl"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-gray-500 mb-4">
                  Intenta ajustar los filtros o buscar con otros términos
                </p>
                <button
                  onClick={() =>
                    setFilters({
                      ...DEFAULT_FILTERS,
                      categoryId: category.id,
                    })
                  }
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <>
                <div className="mt-6">
                  <ProductGrid
                    products={filteredProducts}
                    viewMode={filters.viewMode}
                    onProductClick={handleProductClick}
                    exchangeRate={isSistemasCategory ? exchangeRate : null}
                  />
                </div>

                {/* Infinite Scroll Trigger */}
                {pagination.hasMore && (
                  <InfiniteScrollTrigger
                    onLoadMore={loadNextPage}
                    hasMore={pagination.hasMore}
                    loading={loading}
                  />
                )}
                
                {/* Debug info en desarrollo */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs">
                    <p>📊 Debug Info:</p>
                    <p>Productos cargados: {products.length}</p>
                    <p>Productos filtrados: {filteredProducts.length}</p>
                    <p>Página actual: {pagination.page}</p>
                    <p>Total páginas: {pagination.totalPages}</p>
                    <p>Total productos: {pagination.total}</p>
                    <p>Has more: {pagination.hasMore ? 'Sí' : 'No'}</p>
                    <p>Loading: {loading ? 'Sí' : 'No'}</p>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Modal de filtros móvil */}
      {showMobileFilters && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="fixed inset-y-0 left-0 w-80 bg-white z-50 lg:hidden overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Filtros</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="p-4">
              <CategoryFilters
                filters={filters}
                onFiltersChange={(newFilters) => {
                  setFilters(newFilters);
                  setShowMobileFilters(false);
                }}
                showPowerType={category.filters?.powerType}
                availableConditions={availableConditions}
                priceStats={priceStats}
                products={products}
              />
            </div>
          </div>
        </>
      )}

      {/* Modal de producto */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          exchangeRate={isSistemasCategory ? exchangeRate : null}
        />
      )}

      {/* Modal de tasa de cambio */}
      {isSistemasCategory && (
        <ExchangeRateModal
          isOpen={showExchangeRateModal}
          onClose={() => setShowExchangeRateModal(false)}
        />
      )}
    </div>
  );
}

