/**
 * Geolocalización Inversa Precisa con Google Maps API
 * Soluciona el problema de códigos postales incorrectos
 */

export interface LocationResult {
  postalCode: string | null;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  confidence: number;
}

export interface GeolocationError {
  code: number;
  message: string;
  type: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'API_ERROR';
}

/**
 * Obtiene el código postal preciso desde coordenadas usando Google Maps Geocoding API
 * @param lat - Latitud
 * @param lng - Longitud
 * @returns Promise<LocationResult> - Resultado de la geolocalización inversa
 */
export async function getPostalCodeFromCoords(
  lat: number, 
  lng: number
): Promise<LocationResult> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Maps API key not configured');
  }

  try {
    // Construir URL para Google Maps Geocoding API
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.set('latlng', `${lat},${lng}`);
    url.searchParams.set('result_type', 'postal_code');
    url.searchParams.set('key', apiKey);
    url.searchParams.set('language', 'es'); // Español para México
    url.searchParams.set('region', 'mx'); // Restringir a México

    console.log('🔍 Solicitando geolocalización inversa:', { lat, lng });

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('❌ Error en Google Maps API:', data.status, data.error_message);
      throw new Error(`Google Maps API error: ${data.status} - ${data.error_message}`);
    }

    if (!data.results || data.results.length === 0) {
      console.warn('⚠️ No se encontraron resultados para las coordenadas:', { lat, lng });
      return {
        postalCode: null,
        address: null,
        neighborhood: null,
        city: null,
        state: null,
        country: null,
        confidence: 0
      };
    }

    // Buscar el resultado con código postal
    const postalCodeResult = data.results.find((result: any) => 
      result.types.includes('postal_code')
    );

    if (!postalCodeResult) {
      console.warn('⚠️ No se encontró código postal en los resultados');
      return {
        postalCode: null,
        address: data.results[0]?.formatted_address || null,
        neighborhood: null,
        city: null,
        state: null,
        country: null,
        confidence: 0
      };
    }

    // Extraer información detallada
    const addressComponents = postalCodeResult.address_components;
    const postalCode = addressComponents.find((component: any) => 
      component.types.includes('postal_code')
    )?.long_name || null;

    const neighborhood = addressComponents.find((component: any) => 
      component.types.includes('sublocality') || component.types.includes('neighborhood')
    )?.long_name || null;

    const city = addressComponents.find((component: any) => 
      component.types.includes('locality') || component.types.includes('administrative_area_level_2')
    )?.long_name || null;

    const state = addressComponents.find((component: any) => 
      component.types.includes('administrative_area_level_1')
    )?.long_name || null;

    const country = addressComponents.find((component: any) => 
      component.types.includes('country')
    )?.long_name || null;

    const result: LocationResult = {
      postalCode,
      address: postalCodeResult.formatted_address,
      neighborhood,
      city,
      state,
      country,
      confidence: postalCodeResult.geometry?.location_type === 'ROOFTOP' ? 1.0 : 0.8
    };

    console.log('✅ Geolocalización inversa exitosa:', result);
    return result;

  } catch (error) {
    console.error('❌ Error en geolocalización inversa:', error);
    throw new Error(`Error al obtener código postal: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

/**
 * Obtiene la ubicación actual del usuario con alta precisión
 * @returns Promise<{lat: number, lng: number, accuracy: number}>
 */
export function getCurrentLocation(): Promise<{lat: number, lng: number, accuracy: number}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: -1,
        message: 'Geolocalización no soportada por este navegador',
        type: 'POSITION_UNAVAILABLE' as const
      });
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true, // Usar GPS si está disponible
      timeout: 10000, // 10 segundos timeout
      maximumAge: 300000 // Cache por 5 minutos máximo
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log('📍 Ubicación obtenida:', { latitude, longitude, accuracy });
        resolve({
          lat: latitude,
          lng: longitude,
          accuracy
        });
      },
      (error) => {
        let errorMessage = '';
        let errorType: GeolocationError['type'] = 'POSITION_UNAVAILABLE';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso de ubicación denegado. Por favor, permite el acceso a tu ubicación.';
            errorType = 'PERMISSION_DENIED';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Ubicación no disponible. Verifica tu conexión a internet.';
            errorType = 'POSITION_UNAVAILABLE';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado. Intenta de nuevo.';
            errorType = 'TIMEOUT';
            break;
          default:
            errorMessage = 'Error desconocido al obtener ubicación.';
            errorType = 'POSITION_UNAVAILABLE';
        }

        console.error('❌ Error de geolocalización:', errorMessage);
        reject({
          code: error.code,
          message: errorMessage,
          type: errorType
        });
      },
      options
    );
  });
}

/**
 * Función completa para obtener código postal desde ubicación actual
 * @returns Promise<LocationResult>
 */
export async function getCurrentPostalCode(): Promise<LocationResult> {
  try {
    console.log('🚀 Iniciando proceso de geolocalización...');
    
    // 1. Obtener ubicación actual
    const location = await getCurrentLocation();
    console.log('📍 Ubicación obtenida:', location);

    // 2. Convertir a código postal
    const result = await getPostalCodeFromCoords(location.lat, location.lng);
    console.log('✅ Proceso completado:', result);

    return result;
  } catch (error) {
    console.error('❌ Error en proceso completo:', error);
    throw error;
  }
}

/**
 * Valida si un código postal es válido para México
 * @param postalCode - Código postal a validar
 * @returns boolean
 */
export function isValidMexicanPostalCode(postalCode: string): boolean {
  // Códigos postales mexicanos tienen 5 dígitos
  const postalCodeRegex = /^\d{5}$/;
  return postalCodeRegex.test(postalCode);
}

/**
 * Formatea un código postal para mostrar
 * @param postalCode - Código postal
 * @returns string formateado
 */
export function formatPostalCode(postalCode: string): string {
  if (!postalCode) return '';
  return postalCode.replace(/\D/g, '').slice(0, 5);
}
