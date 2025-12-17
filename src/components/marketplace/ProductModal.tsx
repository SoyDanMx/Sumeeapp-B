"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTimes,
    faMapMarkerAlt,
    faStar,
    faCheckCircle,
    faShareAlt,
    faChevronLeft,
    faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { MarketplaceProduct } from "@/types/supabase";
import { ProductStructuredData } from "./StructuredData";
import { HybridImageGallery } from "./HybridImageGallery";

interface ProductModalProps {
    product: MarketplaceProduct;
    isOpen: boolean;
    onClose: () => void;
    exchangeRate?: { rate: number } | null; // Para conversión USD → MXN
}

export default function ProductModal({
    product,
    isOpen,
    onClose,
    exchangeRate,
}: ProductModalProps) {
    // Función helper para formatear precio con conversión
    const formatPrice = (price: number) => {
        if (exchangeRate) {
            const mxnPrice = price * exchangeRate.rate;
            return `$${mxnPrice.toLocaleString("es-MX", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}`;
        }
        return `$${price.toLocaleString("es-MX")}`;
    };
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!isOpen) return null;

    // Helpers
    const images = product.images && product.images.length > 0
        ? product.images
        : ["/placeholder-tool.jpg"]; // Fallback image

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const getWhatsappLink = () => {
        // Use product-specific contact phone if available, otherwise fallback to support/default number
        const sellerPhone = product.contact_phone || "525636741156";
        const priceText = exchangeRate 
            ? formatPrice(product.price)
            : `$${product.price.toLocaleString("es-MX")}`;
        const message = `Hola, estoy interesado en "${product.title}" que vi en el Marketplace de Sumee por ${priceText}. ¿Sigue disponible?`;
        return `https://wa.me/${sellerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    };

    const getConditionLabel = (condition: string) => {
        const labels: Record<string, string> = {
            nuevo: "Nuevo",
            usado_excelente: "Usado - Excelente",
            usado_bueno: "Usado - Bueno",
            usado_regular: "Usado - Regular",
            para_reparar: "Para Reparar",
        };
        return labels[condition] || condition;
    };

    return (
        <>
            {/* Structured Data for SEO */}
            <ProductStructuredData product={product} />
            
            <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className="flex items-center justify-center min-h-screen p-4 text-center sm:p-0">
                <div className="relative bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-4xl sm:w-full flex flex-col md:flex-row max-h-[90vh]">

                    {/* Close Button Mobile */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-20 md:hidden bg-black/50 text-white rounded-full p-2 w-8 h-8 flex items-center justify-center"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>

                    {/* Left: Image Gallery con fallback híbrido */}
                    <div className="w-full md:w-1/2 bg-gray-100 relative h-64 md:h-auto flex-shrink-0">
                        <div className="relative w-full h-full">
                            <HybridImageGallery
                                product={product}
                                currentIndex={currentImageIndex}
                                onImageChange={setCurrentImageIndex}
                                showThumbnails={false}
                                placeholder={
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                                        <span className="text-gray-400">Sin imagen</span>
                                    </div>
                                }
                            />

                            {/* Navigation Arrows (if multiple images) */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 w-10 h-10 flex items-center justify-center shadow-lg transition-all z-10"
                                    >
                                        <FontAwesomeIcon icon={faChevronLeft} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 w-10 h-10 flex items-center justify-center shadow-lg transition-all z-10"
                                    >
                                        <FontAwesomeIcon icon={faChevronRight} />
                                    </button>

                                    {/* Dots */}
                                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                                        {images.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setCurrentImageIndex(idx)}
                                                className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? "bg-white w-4" : "bg-white/50"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right: Product Details */}
                    <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto">
                        {/* Desktop Close Button */}
                        <div className="hidden md:flex justify-end mb-2">
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <FontAwesomeIcon icon={faTimes} className="text-xl" />
                            </button>
                        </div>

                        <div className="flex-1">
                            {/* Category & Condition */}
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                                    {product.category_id.replace('-', ' ')}
                                </span>
                                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    {getConditionLabel(product.condition)}
                                </span>
                            </div>

                            {/* Title */}
                            <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
                                {product.title}
                            </h2>

                            {/* Price */}
                            <div className="flex items-baseline gap-3 mb-6">
                                <span className="text-3xl font-black text-gray-900">
                                    {formatPrice(product.price)}
                                </span>
                                {product.original_price && (
                                    <span className="text-lg text-gray-400 line-through decoration-red-400">
                                        {formatPrice(product.original_price)}
                                    </span>
                                )}
                                {product.original_price && (
                                    <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                        -{Math.round((1 - product.price / product.original_price) * 100)}%
                                    </span>
                                )}
                            </div>

                            {/* Seller Info */}
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                    {product.seller?.full_name[0] || "U"}
                                </div>
                                <div>
                                    <div className="flex items-center gap-1">
                                        <p className="font-semibold text-gray-900">{product.seller?.full_name || "Usuario Sumee"}</p>
                                        {product.seller?.verified && (
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-blue-500 text-sm" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                        <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xs" />
                                        <span>{product.seller?.calificacion_promedio || 5.0} • Vendedor Verificado</span>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-gray-900 mb-2">Descripción</h3>
                                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                                    {product.description}
                                </p>
                            </div>

                            {/* Location */}
                            <div className="flex items-center gap-2 text-gray-500 text-sm mb-8">
                                <FontAwesomeIcon icon={faMapMarkerAlt} />
                                <span>{product.location_city || "Ciudad de México"}, {product.location_zone || "Zona Metropolitana"}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-auto pt-6 border-t border-gray-100 flex gap-3">
                            <a
                                href={getWhatsappLink()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                <FontAwesomeIcon icon={faWhatsapp} className="text-xl" />
                                <span>Me interesa</span>
                            </a>
                            <button className="px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
                                <FontAwesomeIcon icon={faShareAlt} />
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
        </>
    );
}
