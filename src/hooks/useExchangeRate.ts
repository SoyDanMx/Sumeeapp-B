import { useState, useEffect } from 'react';

interface ExchangeRateData {
  rate: number;
  lastUpdated: string;
  source: string;
}

const EXCHANGE_RATE_CACHE_KEY = 'usd_mxn_exchange_rate';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

/**
 * Hook para obtener la tasa de cambio USD → MXN
 * Usa caché local para evitar requests repetidos
 */
export function useExchangeRate() {
  const [exchangeRate, setExchangeRate] = useState<ExchangeRateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExchangeRate() {
      try {
        // Verificar caché primero
        const cached = localStorage.getItem(EXCHANGE_RATE_CACHE_KEY);
        if (cached) {
          const cachedData = JSON.parse(cached);
          const cacheAge = Date.now() - cachedData.timestamp;
          
          // Si el caché es válido (menos de 24 horas), usarlo
          if (cacheAge < CACHE_DURATION) {
            setExchangeRate({
              rate: cachedData.rate,
              lastUpdated: cachedData.lastUpdated,
              source: cachedData.source || 'cache',
            });
            setLoading(false);
            return;
          }
        }

        // Intentar múltiples fuentes de tasa de cambio
        let rate: number | null = null;
        let source = 'unknown';

        // Fuente 1: API de exchangerate-api.com (gratuita, sin API key)
        try {
          const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
          });
          if (response.ok) {
            const data = await response.json();
            rate = data.rates?.MXN || null;
            if (rate) {
              source = 'exchangerate-api.com';
            }
          }
        } catch (err) {
          console.warn('Error obteniendo tasa de exchangerate-api.com:', err);
        }

        // Fuente 2: API de exchangerate.host (gratuita, alternativa)
        if (!rate) {
          try {
            const response = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=MXN', {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
              },
            });
            if (response.ok) {
              const data = await response.json();
              rate = data.rates?.MXN || null;
              if (rate) {
                source = 'exchangerate.host';
              }
            }
          } catch (err) {
            console.warn('Error obteniendo tasa de exchangerate.host:', err);
          }
        }

        // Fuente 3: API de fawazahmed0 (gratuita, sin API key)
        if (!rate) {
          try {
            const response = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json', {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
              },
            });
            if (response.ok) {
              const data = await response.json();
              rate = data.usd?.mxn || null;
              if (rate) {
                source = 'fawazahmed0';
              }
            }
          } catch (err) {
            console.warn('Error obteniendo tasa de fawazahmed0:', err);
          }
        }

        // Si ninguna fuente funciona, usar tasa por defecto
        if (!rate) {
          rate = 17.5; // Tasa aproximada USD → MXN (enero 2025)
          source = 'default';
          console.warn('No se pudo obtener tasa de cambio, usando valor por defecto:', rate);
        }

        const exchangeData: ExchangeRateData = {
          rate,
          lastUpdated: new Date().toISOString(),
          source,
        };

        // Guardar en caché
        localStorage.setItem(EXCHANGE_RATE_CACHE_KEY, JSON.stringify({
          rate,
          lastUpdated: exchangeData.lastUpdated,
          source,
          timestamp: Date.now(),
        }));

        setExchangeRate(exchangeData);
      } catch (err: any) {
        console.error('Error obteniendo tasa de cambio:', err);
        setError(err.message || 'Error al obtener tasa de cambio');
        
        // Intentar usar caché aunque esté expirado
        const cached = localStorage.getItem(EXCHANGE_RATE_CACHE_KEY);
        if (cached) {
          const cachedData = JSON.parse(cached);
          setExchangeRate({
            rate: cachedData.rate,
            lastUpdated: cachedData.lastUpdated,
            source: 'expired-cache',
          });
        } else {
          // Último recurso: tasa por defecto
          setExchangeRate({
            rate: 17.5,
            lastUpdated: new Date().toISOString(),
            source: 'default-fallback',
          });
        }
      } finally {
        setLoading(false);
      }
    }

    fetchExchangeRate();
  }, []);

  /**
   * Convierte precio de USD a MXN
   */
  const convertToMXN = (usdPrice: number): number => {
    if (!exchangeRate) return usdPrice;
    return usdPrice * exchangeRate.rate;
  };

  /**
   * Formatea precio en MXN con símbolo y separadores
   */
  const formatMXN = (price: number): string => {
    return `$${convertToMXN(price).toLocaleString('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return {
    exchangeRate,
    loading,
    error,
    convertToMXN,
    formatMXN,
  };
}

