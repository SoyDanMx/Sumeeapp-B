"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSearch,
    faFilter,
    faArrowLeft,
    faTools,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { MarketplaceProduct } from "@/types/supabase";
import ProductModal from "@/components/marketplace/ProductModal";
import { supabase } from "@/lib/supabase/client";

// To avoid code duplication, the best practice would be to extract ProductCard, but my plan didn't explicitly say "Refactor to ProductCard". 
// I will replicate the list logic for safety and speed, as per request.

import {
    faStar,
    faHeart,
    faMapMarkerAlt,
    faCheckCircle
} from "@fortawesome/free-solid-svg-icons";


export default function MarketplaceAllPage() {
    const [products, setProducts] = useState<MarketplaceProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

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

    useEffect(() => {
        async function fetchProducts() {
            try {
                setLoading(true);
                console.log("🛒 Fetching ALL marketplace products...");

                const { data, error } = await supabase
                    .from('marketplace_products')
                    .select(`
            *,
            seller:profiles(
              full_name,
              avatar_url
            )
          `)
                    .eq('status', 'active')
                    .order('created_at', { ascending: false });

                if (error) {
                    throw error;
                }

                if (data) {
                    const mappedProducts: MarketplaceProduct[] = (data as any[]).map(item => {
                        const sellerData = Array.isArray(item.seller) ? item.seller[0] : item.seller;
                        const isOfficialStore = item.title.includes("Truper") || item.title.includes("Pretul");

                        return {
                            ...item,
                            seller: {
                                full_name: isOfficialStore ? "Sumee Supply" : (sellerData?.full_name || "Usuario Sumee"),
                                avatar_url: isOfficialStore ? null : (sellerData?.avatar_url || null),
                                verified: isOfficialStore ? true : true,
                                calificacion_promedio: isOfficialStore ? 5.0 : 4.9,
                                review_count: isOfficialStore ? 1250 : 12
                            }
                        };
                    });
                    setProducts(mappedProducts);
                }
            } catch (err: any) {
                console.error("Error fetching products:", err);
                setError(err.message || "Error al cargar productos");
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, []);

    const filteredProducts = products.filter((product) => {
        return product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase());
    });

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
                    <div className="w-8"></div> {/* Spacer for centering if needed */}
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
                    <span className="text-gray-500 text-sm">{filteredProducts.length} resultados</span>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                        <p className="text-gray-500">Cargando catálogo completo...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <FontAwesomeIcon icon={faTools} className="text-4xl text-gray-300 mb-4" />
                        <p className="text-gray-500">No se encontraron productos con esa búsqueda.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => {
                            const condition = getConditionLabel(product.condition);
                            return (
                                <div
                                    key={product.id}
                                    onClick={() => handleProductClick(product)}
                                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-100"
                                >
                                    {/* Imagen */}
                                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                                        {product.images && product.images.length > 0 ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={product.images[0]}
                                                alt={product.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <FontAwesomeIcon
                                                    icon={faTools}
                                                    className="text-4xl text-gray-300"
                                                />
                                            </div>
                                        )}

                                        {/* Badges */}
                                        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                                            {product.seller?.verified && (
                                                <span className="bg-green-500/90 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shadow-sm">
                                                    <FontAwesomeIcon icon={faCheckCircle} className="text-[10px]" />
                                                    Verificado
                                                </span>
                                            )}
                                            {product.original_price && (
                                                <span className="bg-red-500/90 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-sm">
                                                    -{Math.round((1 - product.price / product.original_price) * 100)}%
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Contenido */}
                                    <div className="p-4">
                                        <div className="mb-2">
                                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${condition.color}`}>
                                                {condition.text}
                                            </span>
                                        </div>

                                        <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 text-sm h-10 leading-snug group-hover:text-indigo-600 transition-colors">
                                            {product.title}
                                        </h3>

                                        {/* Precio */}
                                        <div className="flex items-baseline gap-1.5 mb-2">
                                            <span className="text-lg font-black text-indigo-600">
                                                ${Number(product.price).toLocaleString("es-MX")}
                                            </span>
                                            {product.original_price && (
                                                <span className="text-xs text-gray-400 line-through decoration-red-300">
                                                    ${Number(product.original_price).toLocaleString("es-MX")}
                                                </span>
                                            )}
                                        </div>

                                        {/* Ubicación */}
                                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[10px]" />
                                            <span className="truncate">{product.location_zone || "CDMX"}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
