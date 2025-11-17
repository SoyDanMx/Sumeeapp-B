// src/lib/address-autocomplete.ts
// Utilidades para autocompletado de direcciones

export interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
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
 * Obtiene sugerencias de direcciones usando OpenStreetMap Nominatim
 * @param query - Texto de búsqueda (mínimo 3 caracteres)
 * @param limit - Número máximo de sugerencias (default: 5)
 * @returns Array de sugerencias de direcciones
 */
export async function getAddressSuggestions(
  query: string,
  limit: number = 5
): Promise<AddressSuggestion[]> {
  if (!query || query.length < 3) {
    return [];
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&format=json&limit=${limit}&addressdetails=1&countrycodes=mx&accept-language=es`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "SumeeApp/1.0 (https://sumeeapp.com; contact@sumeeapp.com)",
        "Accept-Language": "es-MX,es;q=0.9",
      },
    });

    if (!response.ok) {
      console.warn("⚠️ Nominatim response status:", response.status);
      return [];
    }

    const data: AddressSuggestion[] = await response.json();
    return data || [];
  } catch (error) {
    console.error("❌ Error al obtener sugerencias de dirección:", error);
    return [];
  }
}

/**
 * Obtiene sugerencias usando Google Maps Places API (si está disponible)
 * @param query - Texto de búsqueda
 * @param apiKey - Google Maps API Key
 * @returns Array de sugerencias
 */
export async function getGooglePlacesSuggestions(
  query: string,
  apiKey: string
): Promise<AddressSuggestion[]> {
  if (!query || query.length < 3 || !apiKey) {
    return [];
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      query
    )}&key=${apiKey}&components=country:mx&language=es`;

    const response = await fetch(url);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (data.status === "OK" && data.predictions) {
      // Convertir predicciones de Google a nuestro formato
      return data.predictions.map((prediction: any) => ({
        display_name: prediction.description,
        lat: "",
        lon: "",
        address: {
          city: prediction.terms?.[prediction.terms.length - 2]?.value || "",
          state: prediction.terms?.[prediction.terms.length - 1]?.value || "",
        },
      }));
    }

    return [];
  } catch (error) {
    console.error("❌ Error al obtener sugerencias de Google Places:", error);
    return [];
  }
}

/**
 * Formatea una sugerencia de dirección para mostrar
 */
export function formatAddressSuggestion(suggestion: AddressSuggestion): string {
  if (suggestion.address) {
    const parts: string[] = [];
    if (suggestion.address.road) {
      if (suggestion.address.house_number) {
        parts.push(`${suggestion.address.road} #${suggestion.address.house_number}`);
      } else {
        parts.push(suggestion.address.road);
      }
    }
    if (suggestion.address.suburb) parts.push(suggestion.address.suburb);
    if (suggestion.address.city) parts.push(suggestion.address.city);
    if (suggestion.address.state) parts.push(suggestion.address.state);

    if (parts.length > 0) {
      return parts.join(", ");
    }
  }

  return suggestion.display_name;
}

