"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSearch,
    faArrowLeft,
    faTools,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { MarketplaceProduct } from "@/types/supabase";
import ProductModal from "@/components/marketplace/ProductModal";
import { useMarketplacePagination } from "@/hooks/useMarketplacePagination";
import { InfiniteScrollTrigger } from "@/components/marketplace/InfiniteScrollTrigger";
import { ProductGrid } from "@/components/marketplace/ProductGrid";
import { ViewMode } from "@/lib/marketplace/filters";

export default function MarketplaceAllPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<ViewMode>("grid");

    // Usar hook de paginación con infinite scroll
    // forceInitialLoad=true para que siempre cargue productos, incluso sin filtros
    const {
        products,
        loading,
        error,
        pagination,
        loadNextPage,
    } = useMarketplacePagination({
        pageSize: 24,
        searchQuery: searchQuery || undefined,
        forceInitialLoad: true, // Forzar carga inicial para mostrar todos los productos
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

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white shadow-sm sticky top-0 z-30">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
                    <Link href="/marketplace" className="text-gray-500 hover:text-indigo-600 transition-colors">
                        <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
                    </Link>
                    <div className="flex-1 max-w-xl relative">
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            placeholder="Buscar en todo el marketplace..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                        />
                    </div>
                    <div className="w-8"></div>
                </div>
            </div>

            {/* Product Modal */}
            {selectedProduct && (
                <ProductModal
                    product={selectedProduct}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                />
            )}

            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Todos los Productos</h1>
                    <span className="text-gray-500 text-sm">
                        {pagination.total} {pagination.total === 1 ? "resultado" : "resultados"}
                    </span>
                </div>

                {loading && products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                        <p className="text-gray-500">Cargando productos...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <FontAwesomeIcon icon={faTools} className="text-4xl text-red-300 mb-4" />
                        <p className="text-red-500">{error}</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20">
                        <FontAwesomeIcon icon={faTools} className="text-4xl text-gray-300 mb-4" />
                        <p className="text-gray-500">No se encontraron productos.</p>
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
    );
}
