"use client";

import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faSync } from "@fortawesome/free-solid-svg-icons";
import { useProductPrice } from "@/hooks/useProductPrice";
import { useSyncProductPrice } from "@/hooks/useSyncProductPrice";

interface ProductPriceProps {
  product: {
    id?: string;
    price: number;
    original_price?: number | null;
    external_code?: string | number | null;
  };
  size?: "sm" | "md" | "lg";
  showOriginal?: boolean;
  className?: string;
  autoSync?: boolean; // Si es true, sincroniza automáticamente cuando obtiene precio dinámico
}

/**
 * Componente reutilizable para mostrar precio de producto
 * Obtiene precio dinámicamente si el precio en BD es 0
 */
export function ProductPrice({
  product,
  size = "md",
  showOriginal = true,
  className = "",
  autoSync = false, // Por defecto no sincroniza automáticamente
}: ProductPriceProps) {
  const productAny = product as any;
  const externalCode = productAny.external_code;
  
  const { price: dynamicPrice, originalPrice: dynamicOriginalPrice, loading: loadingPrice } = useProductPrice(
    externalCode,
    product.price,
    product.price === 0 && !!externalCode
  );

  const { syncPrice, loading: syncing } = useSyncProductPrice();

  // Sincronizar automáticamente si autoSync está activado y se obtuvo un precio dinámico
  useEffect(() => {
    if (
      autoSync &&
      product.id &&
      externalCode &&
      product.price === 0 &&
      dynamicPrice !== null &&
      dynamicPrice > 0 &&
      !syncing
    ) {
      // Sincronizar precio a la BD
      syncPrice(externalCode, product.id).catch((err) => {
        // Silenciar errores de sincronización, no es crítico
        console.warn("No se pudo sincronizar precio automáticamente:", err);
      });
    }
  }, [autoSync, product.id, externalCode, product.price, dynamicPrice, syncing, syncPrice]);

  // Usar precio dinámico si está disponible, sino el de la BD
  const displayPrice = dynamicPrice !== null ? dynamicPrice : product.price;
  const displayOriginalPrice = dynamicOriginalPrice !== null ? dynamicOriginalPrice : product.original_price;

  // Formatear precio en MXN
  // IMPORTANTE: TODOS los precios (Syscom, Truper, etc.) ya están en MXN en la base de datos
  // NO se necesita conversión de moneda
  const formatPrice = (price: number) => {
    return `$${price.toLocaleString("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Tamaños de texto
  const sizeClasses = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  };

  const originalSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-sm",
  };

  if (loadingPrice || syncing) {
    return (
      <div className={`flex items-center gap-2 text-gray-500 ${className}`}>
        <FontAwesomeIcon 
          icon={syncing ? faSync : faSpinner} 
          className={`${syncing ? 'animate-pulse' : 'animate-spin'} text-sm`} 
        />
        <span className="text-sm">
          {syncing ? "Actualizando precio..." : "Obteniendo precio..."}
        </span>
      </div>
    );
  }

  // NUNCA mostrar $0 - siempre mostrar "Consultar precio" si el precio es 0 o null
  // IMPORTANTE: displayPrice puede ser 0 si el precio en BD es 0 y no hay precio dinámico
  if (displayPrice > 0) {
    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        <span className={`font-black text-indigo-600 ${sizeClasses[size]}`}>
          {formatPrice(displayPrice)}
        </span>
        {showOriginal && displayOriginalPrice && displayOriginalPrice > displayPrice && (
          <span className={`text-gray-400 line-through decoration-red-300 ${originalSizeClasses[size]}`}>
            {formatPrice(displayOriginalPrice)}
          </span>
        )}
      </div>
    );
  }

  // Si el precio es 0, null o no válido, mostrar "Consultar precio"
  // Esto previene mostrar "$0.00" que confunde a los clientes
  return (
    <span className={`font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg ${size === "sm" ? "text-sm" : "text-base"} ${className}`}>
      Consultar precio
    </span>
  );
}

