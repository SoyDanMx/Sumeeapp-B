"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { MarketplaceProduct } from "@/types/supabase";
import {
  getBestImageForProduct,
  getLocalFallbackImage,
} from "@/lib/marketplace/imageFallback";

interface HybridImageProps {
  product: MarketplaceProduct;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  quality?: number;
  priority?: boolean;
  loading?: "lazy" | "eager";
  placeholder?: React.ReactNode;
}

/**
 * Componente de imagen híbrida que maneja fallback automático:
 * 1. Intenta cargar URL externa primero
 * 2. Si falla, intenta cargar imagen local basada en identificadores del producto
 * 3. Si ambas fallan, muestra placeholder
 */
export function HybridImage({
  product,
  alt,
  fill = false,
  width,
  height,
  className = "",
  sizes,
  quality = 85,
  priority = false,
  loading = "lazy",
  placeholder,
}: HybridImageProps) {
  const initialImage = getBestImageForProduct(product);
  const [currentImage, setCurrentImage] = useState<string | null>(initialImage);
  const [hasError, setHasError] = useState(false);
  const [attemptedFallback, setAttemptedFallback] = useState(false);

  const handleImageError = useCallback(() => {
    // Si ya intentamos el fallback, mostrar placeholder
    if (attemptedFallback) {
      setHasError(true);
      return;
    }

    // Intentar imagen local como fallback
    if (currentImage && currentImage.startsWith("http")) {
      const fallbackImage = getLocalFallbackImage(product, currentImage);
      if (fallbackImage) {
        setCurrentImage(fallbackImage);
        setAttemptedFallback(true);
        return;
      }
    }

    // Si no hay fallback disponible, mostrar placeholder
    setHasError(true);
  }, [currentImage, attemptedFallback, product]);

  // Si no hay imagen o hubo error sin fallback, mostrar placeholder
  if (!currentImage || hasError) {
    if (placeholder) {
      return <>{placeholder}</>;
    }
    // Si fill está activado, retornar div absoluto
    if (fill) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
          <span className="text-gray-400 text-sm">Sin imagen</span>
        </div>
      );
    }
    // Si no es fill, retornar div normal
    return (
      <div className="flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200" style={{ width, height }}>
        <span className="text-gray-400 text-sm">Sin imagen</span>
      </div>
    );
  }

  // Renderizar imagen con Next.js Image
  const imageProps = {
    src: currentImage,
    alt,
    className,
    quality,
    priority,
    loading,
    onError: handleImageError,
    ...(fill
      ? {
          fill: true,
          sizes: sizes || "(max-width: 768px) 100vw, 50vw",
        }
      : {
          width: width || 400,
          height: height || 400,
        }),
  };

  return <Image {...imageProps} />;
}

