import { supabase } from '@/lib/supabase/client';

export interface PriceCalculationParams {
  serviceId: string;
  latitude?: number;
  longitude?: number;
  urgency?: 'low' | 'normal' | 'high' | 'urgent';
  requestTime?: Date;
  zoneName?: string;
}

export interface PriceResult {
  finalPrice: number;
  minPrice: number;
  maxPrice: number | null;
  priceType: 'fixed' | 'range' | 'starting_at';
  appliedRules: any[];
  calculationDetails: {
    baseMinPrice: number;
    baseMaxPrice: number | null;
    basePriceType: string;
    zoneMultiplier: number;
    urgencyMultiplier: number;
    timeMultiplier: number;
    dayMultiplier: number;
    seasonMultiplier: number;
    totalMultiplier: number;
    zoneId: string | null;
    zoneName: string | null;
    urgency: string;
    requestTime: string;
  };
}

export interface BasePrice {
  min_price: number;
  max_price: number | null;
  price_type: 'fixed' | 'range' | 'starting_at';
  service_name: string;
  unit: string;
  includes_materials: boolean;
}

// Caché en memoria para precios
const priceCache = new Map<string, { result: PriceResult; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

/**
 * Servicio para gestión de precios dinámicos
 */
export const PriceService = {
  /**
   * Obtener precio dinámico para un servicio
   * Considera: zona, urgencia, hora, día, temporada
   */
  async getDynamicPrice(
    params: PriceCalculationParams
  ): Promise<PriceResult | null> {
    try {
      // Generar clave de caché (por hora para considerar cambios de hora/día)
      const cacheKey = `${params.serviceId}-${params.zoneName || 'default'}-${params.urgency || 'normal'}-${params.requestTime?.toISOString().slice(0, 13) || new Date().toISOString().slice(0, 13)}`;
      
      // Verificar caché
      const cached = priceCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
        console.log('[PriceService] Using cached price for:', cacheKey);
        return cached.result;
      }

      const { data, error } = await supabase.rpc('get_dynamic_price', {
        p_service_catalog_id: params.serviceId,
        p_latitude: params.latitude || null,
        p_longitude: params.longitude || null,
        p_urgency: params.urgency || 'normal',
        p_request_time: params.requestTime?.toISOString() || new Date().toISOString(),
        p_zone_name: params.zoneName || null,
      });

      if (error) {
        console.error('[PriceService] Error getting dynamic price:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.warn('[PriceService] No price data returned for service:', params.serviceId);
        return null;
      }

      const result = data[0];

      const priceResult: PriceResult = {
        finalPrice: parseFloat(result.final_price),
        minPrice: parseFloat(result.min_price),
        maxPrice: result.max_price ? parseFloat(result.max_price) : null,
        priceType: result.price_type,
        appliedRules: result.applied_rules || [],
        calculationDetails: result.calculation_details || {},
      };

      // Guardar en caché
      priceCache.set(cacheKey, {
        result: priceResult,
        timestamp: Date.now(),
      });

      return priceResult;
    } catch (error) {
      console.error('[PriceService] Error getting dynamic price:', error);
      return null;
    }
  },

  /**
   * Obtener precio base de un servicio (sin factores dinámicos)
   */
  async getBasePrice(serviceId: string): Promise<BasePrice | null> {
    try {
      const { data, error } = await supabase
        .from('service_catalog')
        .select('min_price, max_price, price_type, service_name, unit, includes_materials')
        .eq('id', serviceId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('[PriceService] Error getting base price:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('[PriceService] Error getting base price:', error);
      return null;
    }
  },

  /**
   * Determinar zona geográfica desde coordenadas
   * TODO: Implementar lógica de geocodificación inversa o polígonos
   */
  async getZoneFromCoordinates(
    latitude: number,
    longitude: number
  ): Promise<string | null> {
    try {
      // Opción 1: Consultar zonas desde BD con polígonos (futuro)
      // Por ahora, usar lógica simple basada en coordenadas conocidas
      
      // CDMX aproximado
      if (latitude >= 19.0 && latitude <= 19.6 && 
          longitude >= -99.3 && longitude <= -98.9) {
        return 'CDMX';
      }
      
      // GDL aproximado
      if (latitude >= 20.5 && latitude <= 20.8 && 
          longitude >= -103.5 && longitude <= -103.2) {
        return 'GDL';
      }
      
      // MTY aproximado
      if (latitude >= 25.5 && latitude <= 25.8 && 
          longitude >= -100.4 && longitude <= -100.2) {
        return 'MTY';
      }
      
      // PUE aproximado
      if (latitude >= 19.0 && latitude <= 19.1 && 
          longitude >= -98.2 && longitude <= -98.1) {
        return 'PUE';
      }
      
      // QRO aproximado
      if (latitude >= 20.5 && latitude <= 20.7 && 
          longitude >= -100.4 && longitude <= -100.3) {
        return 'QRO';
      }
      
      // Por defecto, CDMX
      return 'CDMX';
    } catch (error) {
      console.error('[PriceService] Error getting zone:', error);
      return 'CDMX';
    }
  },

  /**
   * Formatear precio para mostrar en UI
   */
  formatPrice(
    price: number | null,
    priceType: 'fixed' | 'range' | 'starting_at' = 'starting_at',
    maxPrice?: number | null
  ): string {
    if (price === null || price === 0) {
      return 'Precio a cotizar';
    }

    const formattedPrice = price.toLocaleString('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    switch (priceType) {
      case 'fixed':
        return `$${formattedPrice}`;
      case 'range':
        if (maxPrice) {
          const formattedMax = maxPrice.toLocaleString('es-MX', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
          return `$${formattedPrice} - $${formattedMax}`;
        }
        return `$${formattedPrice}`;
      case 'starting_at':
      default:
        return `Desde $${formattedPrice}`;
    }
  },

  /**
   * Obtener precio con fallback a precio base
   */
  async getPriceWithFallback(
    params: PriceCalculationParams
  ): Promise<{ price: number; isDynamic: boolean; details?: any }> {
    // Intentar obtener precio dinámico
    const dynamicPrice = await this.getDynamicPrice(params);

    if (dynamicPrice) {
      return {
        price: dynamicPrice.finalPrice,
        isDynamic: true,
        details: dynamicPrice.calculationDetails,
      };
    }

    // Fallback a precio base
    const basePrice = await this.getBasePrice(params.serviceId);

    if (basePrice) {
      return {
        price: basePrice.min_price,
        isDynamic: false,
      };
    }

    // Último fallback
    return {
      price: 0,
      isDynamic: false,
    };
  },

  /**
   * Limpiar caché de precios
   */
  clearCache() {
    priceCache.clear();
    console.log('[PriceService] Cache cleared');
  },
};

