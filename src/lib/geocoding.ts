// src/lib/geocoding.ts

interface NominatimResult {
    lat: string;
    lon: string;
    display_name: string;
  }
  
  /**
   * Convierte una dirección de texto a coordenadas (lat, lng) usando Nominatim (gratis).
   */
  export async function geocodeAddress(address: string): Promise<{ lat: number, lng: number, displayName: string } | null> {
      if (!address) return null;
  
      // Usamos el punto final de búsqueda de Nominatim
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
  
      try {
          const response = await fetch(url);
          const data: NominatimResult[] = await response.json();
  
          if (data && data.length > 0) {
              const result = data[0];
              return {
                  lat: parseFloat(result.lat),
                  lng: parseFloat(result.lon),
                  displayName: result.display_name,
              };
          }
      } catch (error) {
          console.error("Error al geocodificar la dirección:", error);
      }
      
      return null;
  }
  