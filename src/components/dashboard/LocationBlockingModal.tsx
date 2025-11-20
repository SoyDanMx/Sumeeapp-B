"use client";

import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faLocationArrow,
  faCheckCircle,
  faSpinner,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { supabase } from "@/lib/supabase/client";
import { geocodeAddress } from "@/lib/geocoding";
import { Profile } from "@/types/supabase";
import { getAddressSuggestions, formatAddressSuggestion, AddressSuggestion } from "@/lib/address-autocomplete";
import { useRef, useEffect, useCallback } from "react";

interface LocationBlockingModalProps {
  isOpen: boolean;
  userProfile: Profile;
  onLocationSaved: () => void;
}

const CITIES = [
  "Ciudad de México",
  "Monterrey",
  "Guadalajara",
  "Puebla",
  "Querétaro",
  "Tijuana",
  "León",
  "Mérida",
  "Cancún",
  "Otra",
];

export default function LocationBlockingModal({
  isOpen,
  userProfile,
  onLocationSaved,
}: LocationBlockingModalProps) {
  const [formData, setFormData] = useState({
    city: "Ciudad de México",
    otherCity: "",
    address: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useGPS, setUseGPS] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  
  // Estados para autocompletado
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Función para buscar sugerencias de direcciones
  const fetchAddressSuggestions = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    
    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce: esperar 500ms antes de buscar
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const suggestions = await getAddressSuggestions(query, 5);
        setAddressSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
        setSelectedSuggestionIndex(-1);
      } catch (error) {
        console.error("Error al obtener sugerencias:", error);
        setAddressSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 500);
  }, []);

  // Manejar cambio en el input de dirección
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, address: value }));
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    
    if (value.length >= 3) {
      fetchAddressSuggestions(value);
    } else {
      setAddressSuggestions([]);
    }
  };

  // Manejar selección de sugerencia
  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    const formatted = formatAddressSuggestion(suggestion);
    setFormData((prev) => {
      const updated = { ...prev, address: formatted };
      
      // Si la sugerencia tiene información de ciudad, actualizarla automáticamente
      if (suggestion.address?.city) {
        const cityName = suggestion.address.city;
        // Verificar si la ciudad está en la lista de ciudades
        const cityExists = CITIES.some(city => 
          city.toLowerCase().includes(cityName.toLowerCase()) || 
          cityName.toLowerCase().includes(city.toLowerCase())
        );
        
        if (cityExists) {
          updated.city = CITIES.find(city => 
            city.toLowerCase().includes(cityName.toLowerCase()) || 
            cityName.toLowerCase().includes(city.toLowerCase())
          ) || prev.city;
        } else if (cityName) {
          // Si no está en la lista, usar "Otra" y poner el nombre en otherCity
          updated.city = "Otra";
          updated.otherCity = cityName;
        }
      }
      
      return updated;
    });
    
    setShowSuggestions(false);
    setAddressSuggestions([]);
    setSelectedSuggestionIndex(-1);
    
    // Si la sugerencia tiene coordenadas, usarlas (esto prellenará el GPS)
    if (suggestion.lat && suggestion.lon) {
      const coords = {
        lat: parseFloat(suggestion.lat),
        lng: parseFloat(suggestion.lon),
      };
      setGpsCoords(coords);
      setUseGPS(true);
      setGpsSuccess(true);
      console.log("✅ Dirección seleccionada con coordenadas:", { coords, address: formatted });
    }
  };

  // Manejar teclado en el input de dirección
  const handleAddressKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || addressSuggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev < addressSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(addressSuggestions[selectedSuggestionIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        addressInputRef.current &&
        !addressInputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /**
   * Llama a la Edge Function reverse-geocode para enriquecer datos geográficos
   * Se ejecuta de forma asíncrona sin bloquear al usuario
   */
  const callReverseGeocode = async (userId: string, lat: number, lng: number) => {
    try {
      console.log("🗺️ Llamando a Edge Function reverse-geocode...", { userId, lat, lng });
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn("⚠️ No hay sesión, no se puede llamar a reverse-geocode");
        return;
      }

      // Usar la API de Supabase para invocar la Edge Function (más confiable)
      const { data, error } = await supabase.functions.invoke("reverse-geocode", {
        body: {
          user_id: userId,
          lat,
          lng,
        },
      });

      if (error) {
        throw error;
      }

      console.log("✅ reverse-geocode completado:", data);
    } catch (error: any) {
      // No lanzar error, solo loguear (proceso de background)
      // Este es un proceso no crítico, no debe bloquear al usuario
      console.error("❌ Error en reverse-geocode (no crítico):", error);
      // No re-lanzar el error para que no interrumpa el flujo principal
    }
  };

  const handleUseGPS = async () => {
    if (!navigator.geolocation) {
      setError("La geolocalización no está disponible en tu navegador");
      return;
    }

    setGpsLoading(true);
    setError(null);
    setGpsSuccess(false);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 0,
            }
          );
        }
      );

      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      setGpsCoords(coords);
      setGpsSuccess(true);
      setUseGPS(true);
      setError(null);
      
      console.log("✅ Ubicación GPS obtenida:", coords);
      
    } catch (err: any) {
      console.error("❌ Error obteniendo GPS:", err);
      setUseGPS(false);
      setGpsSuccess(false);
      setGpsCoords(null);
      
      if (err.code === 1) {
        setError("Permiso de ubicación denegado. Por favor, ingresa tu dirección manualmente.");
      } else if (err.code === 2) {
        setError("Ubicación no disponible. Por favor, ingresa tu dirección manualmente.");
      } else if (err.code === 3) {
        setError("Tiempo de espera agotado. Por favor, ingresa tu dirección manualmente.");
      } else {
        setError("Error al obtener ubicación. Por favor, ingresa tu dirección manualmente.");
      }
    } finally {
      setGpsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    setError(null);

    try {
      let ubicacion_lat: number;
      let ubicacion_lng: number;
      let ubicacion_direccion: string = "";

      // Prioridad 1: Usar GPS si está disponible
      if (gpsCoords && useGPS) {
        ubicacion_lat = gpsCoords.lat;
        ubicacion_lng = gpsCoords.lng;
        ubicacion_direccion = "Ubicación GPS";
        console.log("📍 Usando coordenadas GPS:", { ubicacion_lat, ubicacion_lng });
      } 
      // Prioridad 2: Geocodificar dirección manual
      else if (formData.address.trim()) {
        console.log("🗺️ Geocodificando dirección:", formData.address);
        const coords = await geocodeAddress(formData.address);
        if (coords) {
          ubicacion_lat = coords.lat;
          ubicacion_lng = coords.lng;
          ubicacion_direccion = coords.displayName || formData.address;
          console.log("✅ Coordenadas geocodificadas:", { ubicacion_lat, ubicacion_lng });
        } else {
          throw new Error("No se pudo encontrar la ubicación. Intenta ser más específico con la dirección.");
        }
      }
      // Prioridad 3: Geocodificar ciudad
      else {
        const finalCity = formData.city === "Otra" ? formData.otherCity : formData.city;
        if (!finalCity) {
          setError("Por favor selecciona una ciudad o ingresa una dirección");
          setLoading(false);
          return;
        }
        console.log("🗺️ Geocodificando ciudad:", finalCity);
        const coords = await geocodeAddress(`${finalCity}, México`);
        if (coords) {
          ubicacion_lat = coords.lat;
          ubicacion_lng = coords.lng;
          ubicacion_direccion = `${finalCity}, México`;
          console.log("✅ Coordenadas geocodificadas:", { ubicacion_lat, ubicacion_lng });
        } else {
          // Fallback a CDMX
          ubicacion_lat = 19.4326;
          ubicacion_lng = -99.1332;
          ubicacion_direccion = `${finalCity}, México`;
          console.warn("⚠️ No se pudo geocodificar, usando fallback CDMX");
        }
      }

      // Actualizar perfil en Supabase
      console.log("📤 Actualizando perfil con ubicación...");
      
      // NOTA: ubicacion_direccion NO existe en la tabla profiles
      // Solo guardamos las coordenadas y la ciudad
      const updateData: any = {
        ubicacion_lat,
        ubicacion_lng,
      };
      
      // Intentar incluir 'city' si existe
      const finalCity = formData.city === "Otra" ? formData.otherCity : formData.city;
      if (finalCity) {
        updateData.city = finalCity;
      }

      const { error: updateError } = await (supabase
        .from("profiles") as any)
        .update(updateData)
        .eq("user_id", userProfile.user_id);

      if (updateError) {
        // Si falla por 'city', reintentar sin ella
        if (updateError.message?.includes("city") || updateError.message?.includes("ubicacion_direccion")) {
          console.warn("⚠️ Columna no existe, reintentando solo con coordenadas...");
          const { error: retryError } = await (supabase
            .from("profiles") as any)
            .update({
              ubicacion_lat,
              ubicacion_lng,
            })
            .eq("user_id", userProfile.user_id);
          
          if (retryError) {
            throw retryError;
          }
        } else {
          throw updateError;
        }
      }

      console.log("✅ Ubicación guardada exitosamente");
      
      // 🆕 Llamar a la Edge Function de geocodificación inversa de forma asíncrona
      // No bloquea al usuario, se ejecuta en background
      if (ubicacion_lat && ubicacion_lng) {
        callReverseGeocode(userProfile.user_id, ubicacion_lat, ubicacion_lng)
          .catch((err) => {
            console.error("⚠️ Error al enriquecer datos geográficos (no crítico):", err);
            // No mostrar error al usuario, es un proceso de background
          });
      }
      
      // Callback para refrescar el dashboard (no espera a la Edge Function)
      onLocationSaved();
      
    } catch (err: any) {
      console.error("❌ Error en handleSubmit:", err);
      setError(err.message || "Error al guardar tu ubicación. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[9999]" onClose={() => {}}>
        {/* Backdrop con blur */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-2xl transition-all border-2 border-blue-500">
                {/* Header con ícono de advertencia */}
                <div className="flex items-center justify-center mb-4">
                  <div className="rounded-full bg-red-100 p-3">
                    <FontAwesomeIcon
                      icon={faExclamationTriangle}
                      className="text-2xl text-red-600"
                    />
                  </div>
                </div>

                <Dialog.Title
                  as="h3"
                  className="text-2xl font-bold text-gray-900 mb-2 text-center"
                >
                  📍 Ubicación Requerida
                </Dialog.Title>
                
                <p className="text-sm text-gray-600 mb-6 text-center">
                  Necesitamos tu ubicación para conectarte con profesionales cerca de ti. 
                  <strong className="block mt-2 text-gray-900">No podrás usar el dashboard hasta completar este paso.</strong>
                </p>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Botón GPS - Opción Principal */}
                  <div>
                    <button
                      type="button"
                      onClick={handleUseGPS}
                      disabled={gpsLoading || loading}
                      className={`w-full p-4 border-2 rounded-lg font-medium transition-all ${
                        gpsSuccess
                          ? "bg-green-50 border-green-500 text-green-700"
                          : gpsLoading
                          ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-50 border-blue-500 text-blue-700 hover:bg-blue-100"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={gpsLoading ? faSpinner : gpsSuccess ? faCheckCircle : faLocationArrow}
                        className={`mr-2 ${gpsLoading ? "animate-spin" : ""} ${
                          gpsSuccess ? "text-green-600" : "text-blue-600"
                        }`}
                      />
                      {gpsLoading
                        ? "Obteniendo ubicación..."
                        : gpsSuccess
                        ? "✅ Ubicación GPS Obtenida"
                        : "📍 Usar mi ubicación GPS (Recomendado)"}
                    </button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Permite el acceso a tu ubicación para mayor precisión
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">O ingresa manualmente</span>
                    </div>
                  </div>

                  {/* Campo de dirección manual con autocompletado */}
                  <div className="relative">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="mr-2 text-red-600"
                      />
                      Dirección Completa (Opcional)
                    </label>
                    <div className="relative" ref={addressInputRef}>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={handleAddressChange}
                        onKeyDown={handleAddressKeyDown}
                        onFocus={() => {
                          if (addressSuggestions.length > 0) {
                            setShowSuggestions(true);
                          }
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                        placeholder="Ej: Calle Principal 123, Col. Centro, CDMX"
                        disabled={loading || gpsSuccess}
                        autoComplete="off"
                      />
                      {isLoadingSuggestions && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <FontAwesomeIcon
                            icon={faSpinner}
                            className="animate-spin text-gray-400"
                          />
                        </div>
                      )}
                      
                      {/* Dropdown de sugerencias */}
                      {showSuggestions && addressSuggestions.length > 0 && (
                        <div
                          ref={suggestionsRef}
                          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                        >
                          {addressSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleSelectSuggestion(suggestion)}
                              className={`w-full text-left px-4 py-3 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors ${
                                index === selectedSuggestionIndex
                                  ? "bg-blue-50 border-l-4 border-blue-500"
                                  : "border-l-4 border-transparent"
                              }`}
                            >
                              <div className="flex items-start">
                                <FontAwesomeIcon
                                  icon={faMapMarkerAlt}
                                  className="mr-2 text-blue-600 mt-1 flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-900 truncate">
                                    {formatAddressSuggestion(suggestion)}
                                  </p>
                                  {suggestion.address?.city && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      {suggestion.address.city}
                                      {suggestion.address.state && `, ${suggestion.address.state}`}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.address.length > 0 && formData.address.length < 3
                        ? "Escribe al menos 3 caracteres para ver sugerencias"
                        : "Mientras más específica, mejor será el matching"}
                    </p>
                  </div>

                  {/* Ciudad */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="mr-2 text-red-600"
                      />
                      Ciudad *
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, city: e.target.value }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      disabled={loading || gpsSuccess}
                    >
                      {CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Otra ciudad */}
                  {formData.city === "Otra" && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Especifica tu ciudad *
                      </label>
                      <input
                        type="text"
                        value={formData.otherCity}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            otherCity: e.target.value,
                          }))
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Escribe tu ciudad"
                        required
                        disabled={loading || gpsSuccess}
                      />
                    </div>
                  )}

                  {/* Botón Submit */}
                  <button
                    type="submit"
                    disabled={loading || (gpsLoading && !gpsSuccess)}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                  >
                    {loading ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
                        Guardando ubicación...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                        Guardar Ubicación y Continuar
                      </>
                    )}
                  </button>
                </form>

                <p className="text-xs text-gray-400 mt-4 text-center">
                  🔒 Este paso es obligatorio para usar SumeeApp
                </p>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

