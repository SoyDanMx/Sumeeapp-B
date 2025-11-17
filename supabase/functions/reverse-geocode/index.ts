// supabase/functions/reverse-geocode/index.ts
// Edge Function para geocodificación inversa y enriquecimiento de datos geográficos

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReverseGeocodeRequest {
  user_id: string;
  lat: number;
  lng: number;
}

interface GeocodeResponse {
  city: string | null;
  sub_city_zone: string | null;
  postal_code: string | null;
  address: string | null;
}

serve(async (req) => {
  // Manejar CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: ReverseGeocodeRequest = await req.json();
    console.log("🗺️ reverse-geocode: Solicitud recibida:", body);

    // Validar parámetros
    if (!body.user_id || !body.lat || !body.lng) {
      throw new Error("user_id, lat y lng son requeridos");
    }

    const { user_id, lat, lng } = body;

    // Obtener API key de Google Maps
    const GOOGLE_MAPS_API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY") || 
                                 Deno.env.get("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY") || "";

    if (!GOOGLE_MAPS_API_KEY) {
      console.warn("⚠️ Google Maps API key no configurada, usando OpenStreetMap...");
      // Fallback a OpenStreetMap Nominatim
      const result = await geocodeWithOpenStreetMap(lat, lng);
      await updateProfile(user_id, result);
      return new Response(
        JSON.stringify({ success: true, data: result }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Llamar a Google Maps Geocoding API
    const geocodeResult = await geocodeWithGoogleMaps(lat, lng, GOOGLE_MAPS_API_KEY);
    
    // Actualizar perfil en Supabase
    await updateProfile(user_id, geocodeResult);

    console.log("✅ reverse-geocode: Perfil actualizado exitosamente");

    return new Response(
      JSON.stringify({ success: true, data: geocodeResult }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("❌ Error en reverse-geocode:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Error al realizar geocodificación inversa" 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

/**
 * Geocodificación inversa usando Google Maps API
 */
async function geocodeWithGoogleMaps(
  lat: number,
  lng: number,
  apiKey: string
): Promise<GeocodeResponse> {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("latlng", `${lat},${lng}`);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("language", "es");
  url.searchParams.set("region", "mx"); // Restringir a México

  console.log("🔍 Llamando a Google Maps Geocoding API...");

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(`Google Maps API error: ${data.status} - ${data.error_message || ""}`);
  }

  if (!data.results || data.results.length === 0) {
    console.warn("⚠️ No se encontraron resultados para las coordenadas");
    return {
      city: null,
      sub_city_zone: null,
      postal_code: null,
      address: null,
    };
  }

  // Procesar el primer resultado (más preciso)
  const result = data.results[0];
  const addressComponents = result.address_components || [];
  const formattedAddress = result.formatted_address || null;

  // Extraer componentes
  let city: string | null = null;
  let sub_city_zone: string | null = null;
  let postal_code: string | null = null;
  let state: string | null = null;

  for (const component of addressComponents) {
    const types = component.types || [];
    
    // Código postal
    if (types.includes("postal_code") && !postal_code) {
      postal_code = component.long_name;
    }
    
    // Ciudad (locality o administrative_area_level_2)
    if (types.includes("locality") && !city) {
      city = component.long_name;
    } else if (types.includes("administrative_area_level_2") && !city) {
      city = component.long_name;
    }
    
    // Sub-city zone (sublocality, sublocality_level_1, o neighborhood)
    if (types.includes("sublocality") || types.includes("sublocality_level_1")) {
      sub_city_zone = component.long_name;
    } else if (types.includes("neighborhood") && !sub_city_zone) {
      sub_city_zone = component.long_name;
    } else if (types.includes("administrative_area_level_3") && !sub_city_zone) {
      // En CDMX, esto puede ser la alcaldía
      sub_city_zone = component.long_name;
    }
    
    // Estado
    if (types.includes("administrative_area_level_1")) {
      state = component.long_name;
    }
  }

  // Normalizar nombres para México
  if (city) {
    city = normalizeCityName(city);
  }
  
  if (sub_city_zone) {
    sub_city_zone = normalizeSubCityZone(sub_city_zone);
  }

  // Si estamos en CDMX y no hay sub_city_zone, intentar extraer de formatted_address
  if (!sub_city_zone && formattedAddress && city?.includes("Ciudad de México")) {
    const cdmxZones = [
      "Álvaro Obregón", "Azcapotzalco", "Benito Juárez", "Coyoacán",
      "Cuajimalpa", "Cuauhtémoc", "Gustavo A. Madero", "Iztacalco",
      "Iztapalapa", "Magdalena Contreras", "Miguel Hidalgo", "Milpa Alta",
      "Tláhuac", "Tlalpan", "Venustiano Carranza", "Xochimilco"
    ];
    
    for (const zone of cdmxZones) {
      if (formattedAddress.includes(zone)) {
        sub_city_zone = zone;
        break;
      }
    }
  }

  console.log("✅ Datos extraídos:", { city, sub_city_zone, postal_code });

  return {
    city,
    sub_city_zone,
    postal_code,
    address: formattedAddress,
  };
}

/**
 * Geocodificación inversa usando OpenStreetMap Nominatim (fallback)
 */
async function geocodeWithOpenStreetMap(
  lat: number,
  lng: number
): Promise<GeocodeResponse> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", lat.toString());
  url.searchParams.set("lon", lng.toString());
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "es");

  console.log("🔍 Llamando a OpenStreetMap Nominatim...");

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": "SumeeApp/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  if (!data || !data.address) {
    console.warn("⚠️ No se encontraron resultados en OpenStreetMap");
    return {
      city: null,
      sub_city_zone: null,
      postal_code: null,
      address: data?.display_name || null,
    };
  }

  const address = data.address;
  
  // Extraer componentes de OpenStreetMap
  const city = address.city || 
               address.town || 
               address.municipality || 
               address.county || 
               null;
  
  const sub_city_zone = address.suburb || 
                        address.neighbourhood || 
                        address.quarter || 
                        null;
  
  const postal_code = address.postcode || null;

  return {
    city: city ? normalizeCityName(city) : null,
    sub_city_zone: sub_city_zone ? normalizeSubCityZone(sub_city_zone) : null,
    postal_code,
    address: data.display_name || null,
  };
}

/**
 * Normalizar nombre de ciudad
 */
function normalizeCityName(city: string): string {
  // Normalizaciones comunes para México
  const normalizations: Record<string, string> = {
    "Ciudad de México": "Ciudad de México",
    "Mexico City": "Ciudad de México",
    "CDMX": "Ciudad de México",
    "Guadalajara": "Guadalajara",
    "Monterrey": "Monterrey",
  };

  const normalized = city.trim();
  return normalizations[normalized] || normalized;
}

/**
 * Normalizar sub-city zone (alcaldía, delegación)
 */
function normalizeSubCityZone(zone: string): string {
  // Normalizaciones para CDMX
  const normalizations: Record<string, string> = {
    "Benito Juárez": "Benito Juárez",
    "Coyoacán": "Coyoacán",
    "Cuauhtémoc": "Cuauhtémoc",
    "Miguel Hidalgo": "Miguel Hidalgo",
    "Álvaro Obregón": "Álvaro Obregón",
  };

  const normalized = zone.trim();
  return normalizations[normalized] || normalized;
}

/**
 * Actualizar perfil en Supabase con datos geográficos
 */
async function updateProfile(
  user_id: string,
  geocodeData: GeocodeResponse
): Promise<void> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Configuración de Supabase faltante");
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const updateData: any = {};

  // Solo actualizar campos que tienen valores
  if (geocodeData.city) {
    updateData.city = geocodeData.city;
  }
  
  if (geocodeData.sub_city_zone) {
    updateData.sub_city_zone = geocodeData.sub_city_zone;
  }
  
  if (geocodeData.postal_code) {
    updateData.postal_code = geocodeData.postal_code;
  }

  // Si no hay datos para actualizar, no hacer nada
  if (Object.keys(updateData).length === 0) {
    console.warn("⚠️ No hay datos geográficos para actualizar");
    return;
  }

  console.log("📤 Actualizando perfil con datos geográficos:", updateData);

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("user_id", user_id);

  if (error) {
    console.error("❌ Error al actualizar perfil:", error);
    throw new Error(`Error al actualizar perfil: ${error.message}`);
  }

  console.log("✅ Perfil actualizado exitosamente");
}

