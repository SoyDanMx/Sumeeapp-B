'use client';

import { useState, useEffect, useCallback } from 'react';

interface GeolocationState {
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean; // Si true, actualiza la ubicación continuamente
  updateInterval?: number; // Intervalo en ms para actualizar cuando watch=true
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    watch = false,
    updateInterval = 30000, // 30 segundos por defecto
  } = options;

  const [state, setState] = useState<GeolocationState>({
    lat: null,
    lng: null,
    accuracy: null,
    error: null,
    loading: false,
  });

  const updateLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocalización no está disponible en este navegador',
        loading: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false,
        });
      },
      (error) => {
        let errorMessage = 'Error desconocido al obtener la ubicación';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso de geolocalización denegado';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Información de ubicación no disponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado para obtener la ubicación';
            break;
        }
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    );
  }, [enableHighAccuracy, timeout, maximumAge]);

  useEffect(() => {
    if (watch) {
      // Actualizar inmediatamente
      updateLocation();

      // Configurar intervalo para actualizaciones periódicas
      const intervalId = setInterval(updateLocation, updateInterval);

      return () => clearInterval(intervalId);
    } else {
      // Solo actualizar una vez
      updateLocation();
    }
  }, [watch, updateInterval, updateLocation]);

  return {
    ...state,
    updateLocation,
  };
}

