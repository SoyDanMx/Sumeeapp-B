// src/lib/geocoding.ts

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface ReverseNominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    road?: string;
    house_number?: string;
    suburb?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

/**
 * Convierte una dirección de texto a coordenadas (lat, lng) usando Nominatim (gratis).
 */
export async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number; displayName: string } | null> {
  if (!address) return null;

  // Usamos el punto final de búsqueda de Nominatim
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    address
  )}&format=json&limit=1`;

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

/**
 * Convierte coordenadas (lat, lng) a una dirección usando Nominatim (reverse geocoding).
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{ address: string; displayName: string } | null> {
  if (!lat || !lng) return null;

  // Usamos el endpoint de reverse geocoding de Nominatim
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "SumeeApp/1.0", // Nominatim requiere User-Agent
      },
    });
    const data: ReverseNominatimResult = await response.json();

    if (data && data.display_name) {
      // Construir dirección formateada
      let formattedAddress = data.display_name;

      // Intentar construir una dirección más legible usando los campos del address
      if (data.address) {
        const parts: string[] = [];
        if (data.address.road) {
          if (data.address.house_number) {
            parts.push(`${data.address.road} #${data.address.house_number}`);
          } else {
            parts.push(data.address.road);
          }
        }
        if (data.address.suburb) parts.push(data.address.suburb);
        if (data.address.city) parts.push(data.address.city);
        if (data.address.state) parts.push(data.address.state);
        if (data.address.postcode) parts.push(data.address.postcode);
        if (data.address.country) parts.push(data.address.country);

        if (parts.length > 0) {
          formattedAddress = parts.join(", ");
        }
      }

      return {
        address: formattedAddress,
        displayName: data.display_name,
      };
    }
  } catch (error) {
    console.error("Error al hacer reverse geocoding:", error);
  }

  return null;
}
