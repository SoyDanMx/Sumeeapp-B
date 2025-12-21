import { useState, useCallback } from "react";

interface SyncPriceResult {
  success: boolean;
  price: number | null;
  originalPrice: number | null;
  synced: boolean;
  error?: string;
  message?: string;
}

/**
 * Hook para sincronizar precio de un producto desde Syscom a la BD
 * Actualiza el precio en la base de datos cuando se obtiene de Syscom
 * 
 * @param externalCode - Código externo del producto (ej: ID de Syscom)
 * @param productId - ID del producto en la BD (opcional, si no se proporciona no actualiza BD)
 */
export function useSyncProductPrice() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syncPrice = useCallback(async (
    externalCode: string | number,
    productId?: string
  ): Promise<SyncPriceResult | null> => {
    // ⚠️ API DE SYSCOM TEMPORALMENTE DESHABILITADA
    // No hacer ninguna petición de sincronización
    console.warn("⚠️ Sincronización de precios deshabilitada temporalmente");
    setLoading(false);
    setError("API de Syscom temporalmente deshabilitada");
    return {
      success: false,
      price: null,
      originalPrice: null,
      synced: false,
      error: "API de Syscom temporalmente deshabilitada",
    };
    
    /* CÓDIGO DESHABILITADO TEMPORALMENTE
    if (!externalCode) {
      setError("external_code es requerido");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const externalCodeStr = typeof externalCode === "number" 
        ? externalCode.toString() 
        : externalCode;

      const response = await fetch("/api/marketplace/price/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          external_code: externalCodeStr,
          product_id: productId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al sincronizar precio");
      }

      const data: SyncPriceResult = await response.json();
      
      if (data.success) {
        setError(null);
        return data;
      } else {
        setError(data.error || "No se pudo obtener el precio");
        return data;
      }
    } catch (err: any) {
      console.error("Error sincronizando precio:", err);
      setError(err.message || "Error al sincronizar precio");
      return null;
    } finally {
      setLoading(false);
    }
    */ // FIN DE CÓDIGO DESHABILITADO
  }, []);

  return {
    syncPrice,
    loading,
    error,
  };
}

