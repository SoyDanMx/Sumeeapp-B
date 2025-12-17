"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { MarketplaceProduct } from "@/types/supabase";
import {
  getLocalFallbackImage,
  extractProductIdentifiers,
  getLocalImagePaths,
} from "@/lib/marketplace/imageFallback";

interface HybridImageGalleryProps {
  product: MarketplaceProduct;
  currentIndex: number;
  onImageChange?: (index: number) => void;
  showThumbnails?: boolean;
  className?: string;
  placeholder?: React.ReactNode;
}

/**
 * Componente de galería de imágenes híbrida que maneja fallback automático.
 * Si una URL externa falla, intenta cargar la imagen local correspondiente.
 */
export function HybridImageGallery({
  product,
  currentIndex,
  onImageChange,
  showThumbnails = true,
  className = "",
  placeholder,
}: HybridImageGalleryProps) {
  const images = product.images || [];
  const [imageStates, setImageStates] = useState<Map<number, string | null>>(
    new Map()
  );
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  // Inicializar estados de imágenes
  React.useEffect(() => {
    const newStates = new Map<number, string | null>();
    images.forEach((img, index) => {
      if (img && typeof img === "string" && img.trim().length > 0) {
        newStates.set(index, img.trim());
      }
    });
    setImageStates(newStates);
  }, [images]);

  const handleImageError = useCallback(
    (index: number, failedUrl: string) => {
      // Si ya intentamos el fallback para esta imagen, marcarla como fallida
      if (failedImages.has(index)) {
        return;
      }

      // Intentar imagen local como fallback
      const fallbackImage = getLocalFallbackImage(product, failedUrl);
      if (fallbackImage) {
        setImageStates((prev) => {
          const newStates = new Map(prev);
          newStates.set(index, fallbackImage);
          return newStates;
        });
        setFailedImages((prev) => new Set(prev).add(index));
        return;
      }

      // Si no hay fallback, marcar como fallida
      setFailedImages((prev) => new Set(prev).add(index));
    },
    [product, failedImages]
  );

  const currentImage = imageStates.get(currentIndex);

  // Si no hay imagen actual o falló sin fallback, mostrar placeholder
  if (!currentImage || failedImages.has(currentIndex)) {
    if (placeholder) {
      return <>{placeholder}</>;
    }
    return (
      <div className="relative w-full h-full bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center">
        <span className="text-gray-400 text-sm">Sin imagen</span>
      </div>
    );
  }

  return (
    <div className={className || "relative w-full h-full"}>
      {/* Imagen principal */}
      <div className="relative w-full h-full bg-gray-100 rounded-2xl overflow-hidden">
        <Image
          src={currentImage}
          alt={product.title}
          fill
          className="object-cover"
          quality={90}
          priority={currentIndex === 0}
          sizes="(max-width: 1024px) 100vw, 50vw"
          onError={() => {
            if (currentImage) {
              handleImageError(currentIndex, currentImage);
            }
          }}
        />
      </div>

      {/* Miniaturas */}
      {showThumbnails && images.length > 1 && (
        <div className="grid grid-cols-4 gap-2 mt-4">
          {images.map((img, index) => {
            const thumbnailImage = imageStates.get(index);
            const isFailed = failedImages.has(index);
            const isActive = index === currentIndex;

            if (!thumbnailImage || isFailed) {
              return (
                <button
                  key={index}
                  onClick={() => onImageChange?.(index)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    isActive
                      ? "border-indigo-600"
                      : "border-transparent hover:border-gray-300"
                  } bg-gray-100 flex items-center justify-center`}
                >
                  <span className="text-xs text-gray-400">N/A</span>
                </button>
              );
            }

            return (
              <button
                key={index}
                onClick={() => onImageChange?.(index)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  isActive
                    ? "border-indigo-600"
                    : "border-transparent hover:border-gray-300"
                }`}
              >
                <Image
                  src={thumbnailImage}
                  alt={`${product.title} - Imagen ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 25vw, 12.5vw"
                  onError={() => {
                    if (thumbnailImage) {
                      handleImageError(index, thumbnailImage);
                    }
                  }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

