"use client";

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { MarketplaceProduct } from "@/types/supabase";
import {
  getBestImageForProduct,
  getLocalFallbackImage,
} from "@/lib/marketplace/imageFallback";
import {
  getSmartImageForProduct,
  getAllImageVariations,
} from "@/lib/marketplace/imageUrlResolver";

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
  // Obtener todas las variaciones posibles primero
  const allVariations = React.useMemo(() => {
    return getAllImageVariations(product);
  }, [product]);

  // Usar el resolvedor inteligente para obtener la mejor imagen inicial
  const initialImage = React.useMemo(() => {
    const smartImage = getSmartImageForProduct(product) || getBestImageForProduct(product);
    // Si no hay imagen inicial pero hay variaciones, usar la primera variación
    if (!smartImage && allVariations.length > 0) {
      return allVariations[0];
    }
    return smartImage;
  }, [product, allVariations]);

  const [currentImage, setCurrentImage] = useState<string | null>(initialImage);
  const [hasError, setHasError] = useState(false);
  const [attemptedVariations, setAttemptedVariations] = useState<Set<string>>(new Set());

  const handleImageError = useCallback(() => {
    setAttemptedVariations((prev) => {
      const newSet = new Set(prev);
      if (currentImage) {
        newSet.add(currentImage);
      }
      
      // Encontrar la siguiente variación que no hayamos intentado
      const nextImage = allVariations.find((img) => {
        return img !== currentImage && !newSet.has(img);
      });

      if (nextImage) {
        // Usar setTimeout para evitar actualizar estado durante render
        setTimeout(() => {
          setCurrentImage(nextImage);
        }, 0);
      } else {
        // Si ya intentamos todas las variaciones, mostrar placeholder
        setTimeout(() => {
          setHasError(true);
        }, 0);
      }
      
      return newSet;
    });
  }, [currentImage, allVariations]);

  // Si no hay imagen inicial pero hay variaciones, intentar la primera
  useEffect(() => {
    if (!currentImage && allVariations.length > 0 && !hasError) {
      setCurrentImage(allVariations[0]);
    }
  }, [currentImage, allVariations, hasError]);

  // Si no hay imagen o hubo error sin fallback, mostrar placeholder
  // Pero solo si ya intentamos todas las variaciones o no hay variaciones disponibles
  const shouldShowPlaceholder = !currentImage && (
    allVariations.length === 0 || 
    (hasError && attemptedVariations.size >= allVariations.length)
  );

  if (shouldShowPlaceholder) {
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

  // Si no hay imagen actual pero hay variaciones disponibles, mostrar un estado de carga
  if (!currentImage && allVariations.length > 0) {
    if (fill) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse">
          <span className="text-gray-400 text-sm">Cargando...</span>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" style={{ width, height }}>
        <span className="text-gray-400 text-sm">Cargando...</span>
      </div>
    );
  }

  // Si no hay imagen válida, mostrar placeholder
  if (!currentImage) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`} style={fill ? { width: '100%', height: '100%' } : { width: width || 400, height: height || 400 }}>
        {placeholder || <span className="text-gray-400 text-sm">Sin imagen</span>}
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

