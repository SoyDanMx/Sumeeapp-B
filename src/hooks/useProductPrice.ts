import { useState, useEffect, useCallback } from "react";

interface PriceData {
  price: number | null;
  originalPrice?: number | null;
  source: string;
  currency: string;
  error?: string;
}

interface UseProductPriceResult {
  price: number | null;
  originalPrice: number | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook para obtener precio dinámico de un producto
 * 
 * @param externalCode - Código externo del producto (ej: ID de Syscom)
 * @param currentPrice - Precio actual en la base de datos (si es 0, intenta obtener dinámicamente)
 * @param enabled - Si está habilitado para hacer la petición
 */
export function useProductPrice(
  externalCode: string | number | null | undefined,
  currentPrice: number = 0,
  enabled: boolean = true
): UseProductPriceResult {
  const [price, setPrice] = useState<number | null>(currentPrice > 0 ? currentPrice : null);
  const [originalPrice, setOriginalPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = useCallback(async () => {
    // ⚠️ API DE SYSCOM TEMPORALMENTE DESHABILITADA
    // No hacer ninguna petición a la API de Syscom
    // Usar solo el precio de la base de datos
    
    // Si ya hay precio en BD y es válido, usarlo
    if (currentPrice > 0) {
      setPrice(currentPrice);
      setError(null);
      return;
    }

    // Si no hay precio en BD, retornar null sin hacer petición
    setPrice(null);
    setOriginalPrice(null);
    setError(null);
    setLoading(false);
    
    /* CÓDIGO DESHABILITADO TEMPORALMENTE
    // Si no hay external_code, no se puede obtener precio
    if (!externalCode || !enabled) {
      // No establecer error, solo no hacer petición
      setPrice(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const externalCodeStr = typeof externalCode === "number" 
        ? externalCode.toString() 
        : externalCode;

      const response = await fetch(
        `/api/marketplace/price?external_code=${encodeURIComponent(externalCodeStr)}`
      );

      // El endpoint ahora siempre retorna 200, incluso si no hay precio
      const data: PriceData = await response.json();
      
      // Si hay precio, usarlo
      if (data.price && data.price > 0) {
        setPrice(data.price);
        setOriginalPrice(data.originalPrice || null);
        setError(null);
      } else {
        // Si no hay precio, no es un error, solo no hay precio disponible
        setPrice(null);
        setOriginalPrice(null);
        setError(null); // No establecer error para evitar mostrar mensajes innecesarios
      }
    } catch (err: any) {
      console.warn("Error obteniendo precio dinámico:", err);
      setError(err.message || "No se pudo obtener el precio");
      setPrice(null);
      setOriginalPrice(null);
    } finally {
      setLoading(false);
    }
    */ // FIN DE CÓDIGO DESHABILITADO
  }, [externalCode, currentPrice, enabled]);

  useEffect(() => {
    fetchPrice();
  }, [fetchPrice]);

  return {
    price,
    originalPrice,
    loading,
    error,
    refetch: fetchPrice,
  };
}

