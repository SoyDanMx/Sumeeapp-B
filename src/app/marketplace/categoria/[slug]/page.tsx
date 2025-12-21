"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { MarketplaceProduct } from "@/types/supabase";
import ProductModal from "@/components/marketplace/ProductModal";
import { CategoryBreadcrumbs } from "@/components/marketplace/CategoryBreadcrumbs";
import WorkingFilters from "@/components/marketplace/WorkingFilters";
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
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { InfiniteScrollTrigger } from "@/components/marketplace/InfiniteScrollTrigger";
import { filterProductsWithImages } from "@/lib/marketplace/imageFilter";

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;

  const category = getCategoryBySlug(slug);
  const isSistemasCategory = slug === 'sistemas'; // Determinar si es la categoría sistemas
  const { exchangeRate } = useExchangeRate(); // Hook para obtener tasa de cambio
  const [error, setError] = useState<string | null>(null);
  const [showExchangeRateModal, setShowExchangeRateModal] = useState(false); // Estado para modal de tasa de cambio
  const [filters, setFilters] = useState<MarketplaceFilters>({
    ...DEFAULT_FILTERS,
    categoryId: category?.id || null,
    searchQuery: searchParams.get("q") || "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null);

  // Determinar si hay filtros activos (para forzar carga)
  const hasActiveFilters = useMemo(() => {
    return (
      filters.searchQuery !== "" ||
      filters.categoryId !== null ||
      filters.subcategoryId !== null ||
      filters.rama !== null ||
      filters.subrama !== null ||
      filters.conditions.length > 0 ||
      (filters.brands && filters.brands.length > 0) ||
      filters.priceRange.min !== null ||
      filters.priceRange.max !== null
    );
  }, [filters]);

  // Usar hook de paginación con infinite scroll
  // ✅ Los productos con precio 0 se filtran automáticamente en useMarketplacePagination con .gt("price", 0)
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
    },
    forceInitialLoad: hasActiveFilters || !!category?.id,
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
        rama: filters.rama,
        subrama: filters.subrama,
        categoryId: filters.categoryId,
        conditions: filters.conditions,
        brands: filters.brands,
        priceRange: filters.priceRange,
      });
    }
  }, [
    filters.subcategoryId ?? '',
    filters.rama ?? '',
    filters.subrama ?? '',
    filters.categoryId ?? '',
    filters.conditions?.length ?? 0,
    filters.brands?.length ?? 0,
    filters.priceRange?.min ?? null,
    filters.priceRange?.max ?? null,
  ]);

  // Aplicar filtros adicionales incluyendo subcategoría (keywords)
  // ✅ Los productos con precio 0 se filtran automáticamente en applyFilters y filterProductsWithImages
  const filteredProducts = useMemo(() => {
    // Debug en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 [CATEGORÍA] Aplicando filtros:', {
        productosAntes: products.length,
        categoria: category?.name,
        categoriaId: category?.id,
        filters: {
          subcategoryId: filters.subcategoryId,
          rama: filters.rama,
          subrama: filters.subrama,
          categoryId: filters.categoryId,
          conditions: filters.conditions,
          brands: filters.brands || [],
          priceRange: filters.priceRange,
        },
      });
      
      // Si hay rama/subrama seleccionada, mostrar información
      if (filters.rama || filters.subrama) {
        const { getRamaById, getSubramaById } = require('@/lib/marketplace/hierarchy');
        if (filters.subrama && filters.rama) {
          const subrama = getSubramaById(filters.categoryId || '', filters.rama, filters.subrama);
          if (subrama) {
            console.log(`📌 Subrama seleccionada: "${subrama.name}"`, {
              keywords: subrama.keywords,
            });
          }
        } else if (filters.rama) {
          const rama = getRamaById(filters.categoryId || '', filters.rama);
          if (rama) {
            console.log(`📌 Rama seleccionada: "${rama.name}"`, {
              keywords: rama.keywords,
            });
          }
        }
      }
      
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
    
    // Asegurar que categoryId esté en los filtros para que funcione el filtro jerárquico
    // Si categoryId es un UUID, usar el slug de la categoría para la jerarquía
    const categoryIdForFilters = filters.categoryId || category?.id || null;
    const categorySlugForHierarchy = category?.slug || (categoryIdForFilters === category?.id ? slug : null);
    
    const filtersWithCategory = {
      ...filters,
      categoryId: categoryIdForFilters,
      // Agregar slug para que el filtro jerárquico funcione
      categorySlug: categorySlugForHierarchy,
    };
    
    const result = applyFilters(productsWithImages, filtersWithCategory);
    
    // Debug en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [CATEGORÍA] Productos después de aplicar filtros:', {
        antes: productsWithImages.length,
        despues: result.length,
        filtrosAplicados: {
          rama: filters.rama,
          subrama: filters.subrama,
          brands: filters.brands?.length || 0,
          conditions: filters.conditions?.length || 0,
          priceRange: filters.priceRange,
        },
      });
      
      if (result.length === 0 && productsWithImages.length > 0) {
        console.warn('⚠️ Los filtros filtraron todos los productos.');
        console.warn('⚠️ Verifica que los filtros sean correctos.');
      } else if (products.length === 0) {
        console.warn('⚠️ No hay productos cargados. Verifica que la categoría tenga productos en la BD.');
      }
    }
    
    return result;
  }, [products, filters, category]);


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
            {/* Botón categorías móvil */}


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
        <div className="flex gap-4">
          {/* Sidebar de filtros funcionales - Desktop (solo para categoría sistemas) */}
          {slug === "sistemas" && (
            <WorkingFilters
              products={products}
              categoryId={category?.id || "sistemas"}
              filters={{
                rama: filters.rama || null,
                subrama: filters.subrama || null,
                condition: filters.conditions || [],
                brands: filters.brands || [],
                priceRange: filters.priceRange || { min: null, max: null },
              }}
              onFiltersChange={(newFilters) => {
                setFilters({
                  ...filters,
                  rama: newFilters.rama,
                  subrama: newFilters.subrama,
                  conditions: newFilters.condition,
                  brands: newFilters.brands,
                  priceRange: newFilters.priceRange,
                });
              }}
              onClearFilters={() => {
                setFilters({
                  ...DEFAULT_FILTERS,
                  categoryId: category?.id || null,
                  searchQuery: filters.searchQuery,
                });
              }}
            />
          )}

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

      {/* Sidebar de categorías móvil */}


      {/* Modal de producto */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          exchangeRate={isSistemasCategory ? exchangeRate : null}
        />
      )}

    </div>
  );
}

