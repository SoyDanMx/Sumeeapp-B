"use client";

import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faSync } from "@fortawesome/free-solid-svg-icons";
import { useProductPrice } from "@/hooks/useProductPrice";
import { useSyncProductPrice } from "@/hooks/useSyncProductPrice";
import { useExchangeRate } from "@/hooks/useExchangeRate";

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
  const { exchangeRate, loading: loadingExchangeRate } = useExchangeRate();

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

  // Determinar si el producto es de Syscom (tiene external_code)
  const isSyscomProduct = !!externalCode;

  // Convertir precios de USD a MXN para productos de Syscom
  const convertToMXN = (price: number) => {
    // Solo convertir si:
    // 1. Es producto de Syscom (tiene external_code)
    // 2. Hay tasa de cambio disponible
    // 3. El precio es mayor a 0
    if (isSyscomProduct && exchangeRate && exchangeRate.rate > 0 && price > 0) {
      return price * exchangeRate.rate;
    }
    return price;
  };

  // Aplicar conversión a los precios
  const finalPrice = convertToMXN(displayPrice);
  const finalOriginalPrice = displayOriginalPrice ? convertToMXN(displayOriginalPrice) : null;

  // Formatear precio en MXN
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

  if (loadingPrice || syncing || loadingExchangeRate) {
    return (
      <div className={`flex items-center gap-2 text-gray-500 ${className}`}>
        <FontAwesomeIcon 
          icon={syncing ? faSync : faSpinner} 
          className={`${syncing ? 'animate-pulse' : 'animate-spin'} text-sm`} 
        />
        <span className="text-sm">
          {syncing ? "Actualizando precio..." : loadingExchangeRate ? "Cargando..." : "Obteniendo precio..."}
        </span>
      </div>
    );
  }

  // NUNCA mostrar $0 - siempre mostrar "Consultar precio" si el precio es 0 o null
  if (finalPrice > 0) {
    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        <span className={`font-black text-indigo-600 ${sizeClasses[size]}`}>
          {formatPrice(finalPrice)}
        </span>
        {showOriginal && finalOriginalPrice && finalOriginalPrice > finalPrice && (
          <span className={`text-gray-400 line-through decoration-red-300 ${originalSizeClasses[size]}`}>
            {formatPrice(finalOriginalPrice)}
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

