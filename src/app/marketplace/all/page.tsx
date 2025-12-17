"use client";

import React, { useState, useMemo, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSearch,
    faArrowLeft,
    faTools,
    faFilter,
    faTimes,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { MarketplaceProduct } from "@/types/supabase";
import ProductModal from "@/components/marketplace/ProductModal";
import { useMarketplacePagination } from "@/hooks/useMarketplacePagination";
import { InfiniteScrollTrigger } from "@/components/marketplace/InfiniteScrollTrigger";
import { ProductGrid } from "@/components/marketplace/ProductGrid";
import { CategoryFilters } from "@/components/marketplace/CategoryFilters";
import { MobileFiltersDrawer } from "@/components/marketplace/MobileFiltersDrawer";
import { SortAndViewControls } from "@/components/marketplace/SortAndViewControls";
import { MarketplaceBreadcrumbs } from "@/components/marketplace/MarketplaceBreadcrumbs";
import {
    MarketplaceFilters,
    DEFAULT_FILTERS,
    applyFilters,
    SortOption,
    ViewMode,
} from "@/lib/marketplace/filters";
import { MARKETPLACE_CATEGORIES } from "@/lib/marketplace/categories";
import { supabase } from "@/lib/supabase/client";

export default function MarketplaceAllPage() {
    const [filters, setFilters] = useState<MarketplaceFilters>(DEFAULT_FILTERS);
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [searchInput, setSearchInput] = useState("");

    // Determinar si hay filtros activos
    const hasActiveFilters = useMemo(() => {
        return (
            filters.searchQuery !== "" ||
            filters.categoryId !== null ||
            filters.subcategoryId !== null ||
            filters.conditions.length > 0 ||
            filters.priceRange.min !== null ||
            filters.priceRange.max !== null ||
            filters.powerType !== null ||
            filters.brands.length > 0
        );
    }, [filters]);

    // Usar hook de paginación con infinite scroll
    // forceInitialLoad=true para que siempre cargue productos, incluso sin filtros
    const {
        products: paginatedProducts,
        loading,
        error,
        pagination,
        loadNextPage,
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
        forceInitialLoad: true, // Forzar carga inicial para mostrar todos los productos
    });

    // Aplicar filtros adicionales (subcategorías, marcas, etc.)
    const products = useMemo(() => {
        return applyFilters(paginatedProducts, filters);
    }, [paginatedProducts, filters]);

    // Calcular estadísticas de precio y condiciones disponibles
    const [priceStats, setPriceStats] = useState<{ min: number; max: number } | undefined>(undefined);
    const [availableConditions, setAvailableConditions] = useState<string[]>([]);

    useEffect(() => {
        if (paginatedProducts.length > 0) {
            const prices = paginatedProducts
                .map((p) => p.price)
                .filter((p): p is number => p !== null && p !== undefined && p > 0);
            
            if (prices.length > 0) {
                setPriceStats({
                    min: Math.min(...prices),
                    max: Math.max(...prices),
                });
            } else {
                setPriceStats(undefined);
            }

            const conditions = Array.from(
                new Set(
                    paginatedProducts
                        .map((p) => p.condition)
                        .filter((c) => c !== null && c !== undefined)
                )
            ) as string[];
            setAvailableConditions(conditions);
        }
    }, [paginatedProducts]);

    // Debounce para búsqueda
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters((prev) => ({ ...prev, searchQuery: searchInput }));
        }, 300);

        return () => clearTimeout(timer);
    }, [searchInput]);

    const handleClearFilters = () => {
        setSearchInput("");
        setFilters(DEFAULT_FILTERS);
    };

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 pb-24 sm:pb-20">
            {/* Breadcrumbs */}
            <MarketplaceBreadcrumbs
                searchQuery={filters.searchQuery || undefined}
                productCount={products.length}
                hasFilters={hasActiveFilters}
            />

            {/* Mobile Filters Drawer */}
            <MobileFiltersDrawer
                isOpen={showMobileFilters}
                onClose={() => setShowMobileFilters(false)}
                filters={filters}
                onFiltersChange={setFilters}
                showPowerType={filters.categoryId ? MARKETPLACE_CATEGORIES.find(c => c.id === filters.categoryId)?.filters?.powerType : true}
                availableConditions={availableConditions}
                priceStats={priceStats}
                products={paginatedProducts}
            />

            {/* Product Modal */}
            {selectedProduct && (
                <ProductModal
                    product={selectedProduct}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                />
            )}

            {/* Header con búsqueda y navegación */}
            <div className="bg-white shadow-sm sticky top-0 z-30 border-b border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between gap-4 mb-4">
                        <Link href="/marketplace" className="text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-2">
                            <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
                            <span className="hidden sm:inline">Volver al Marketplace</span>
                        </Link>
                        <div className="flex-1 max-w-2xl relative">
                            <FontAwesomeIcon
                                icon={faSearch}
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg"
                            />
                            <input
                                type="text"
                                placeholder="Buscar en todo el marketplace..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        setFilters((prev) => ({ ...prev, searchQuery: searchInput }));
                                    }
                                }}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-base"
                            />
                        </div>
                        <button
                            onClick={() => setShowMobileFilters(true)}
                            className="lg:hidden flex items-center gap-2 px-4 py-2.5 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-indigo-50 hover:border-indigo-500 transition-all bg-white shadow-sm"
                        >
                            <FontAwesomeIcon icon={faFilter} />
                            <span>Filtros</span>
                            {hasActiveFilters && (
                                <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                    {[
                                        filters.conditions.length,
                                        filters.priceRange.min ? 1 : 0,
                                        filters.priceRange.max ? 1 : 0,
                                        filters.powerType ? 1 : 0,
                                        filters.brands.length,
                                    ].reduce((a, b) => a + b, 0)}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Botón limpiar filtros */}
                    {hasActiveFilters && (
                        <div className="flex justify-end">
                            <button
                                onClick={handleClearFilters}
                                className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm flex items-center gap-2 px-4 py-2 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                                <FontAwesomeIcon icon={faTimes} className="text-xs" />
                                Limpiar Filtros
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Contenido Principal */}
            <section className="container mx-auto px-4 py-6 md:py-8 lg:py-12">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar de Filtros - Desktop - Siempre visible para facilitar filtrado */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="sticky top-24 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faFilter} className="text-indigo-600" />
                                    Filtros
                                </h3>
                                {hasActiveFilters && (
                                    <button
                                        onClick={handleClearFilters}
                                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
                                    >
                                        Limpiar
                                    </button>
                                )}
                            </div>
                            <CategoryFilters
                                filters={filters}
                                onFiltersChange={setFilters}
                                showPowerType={filters.categoryId ? MARKETPLACE_CATEGORIES.find(c => c.id === filters.categoryId)?.filters?.powerType : true}
                                availableConditions={availableConditions}
                                priceStats={priceStats}
                                products={paginatedProducts}
                            />
                        </div>
                    </aside>

                    {/* Contenido Principal */}
                    <div className="flex-1 min-w-0">
                        {/* Header con título y controles */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-4 flex-1 flex-wrap">
                                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                                    {hasActiveFilters ? "Resultados de Búsqueda" : "Todos los Productos"}
                                </h1>
                                <span className="text-gray-500 text-sm md:text-base">
                                    {pagination.total} {pagination.total === 1 ? "resultado" : "resultados"}
                                </span>
                            </div>
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
                        {loading && products.length === 0 ? (
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
                            <>
                                <ProductGrid
                                    products={products}
                                    viewMode={viewMode}
                                    onProductClick={handleProductClick}
                                />

                                {/* Infinite Scroll Trigger */}
                                <InfiniteScrollTrigger
                                    onLoadMore={loadNextPage}
                                    hasMore={pagination.hasMore}
                                    loading={loading}
                                />
                            </>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
