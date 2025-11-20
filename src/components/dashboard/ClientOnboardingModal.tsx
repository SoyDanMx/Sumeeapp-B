"use client";

import { useState, useEffect, Fragment, useRef, useCallback } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faLocationArrow,
  faCheckCircle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { supabase } from "@/lib/supabase/client";
import { geocodeAddress } from "@/lib/geocoding";
import { Profile } from "@/types/supabase";
import { getAddressSuggestions, formatAddressSuggestion, AddressSuggestion } from "@/lib/address-autocomplete";

interface ClientOnboardingModalProps {
  isOpen: boolean;
  userProfile: Profile;
  onComplete: () => void;
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

export default function ClientOnboardingModal({
  isOpen,
  userProfile,
  onComplete,
}: ClientOnboardingModalProps) {
  const [formData, setFormData] = useState({
    whatsapp: "",
    city: "Ciudad de México",
    otherCity: "",
    address: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [whatsappError, setWhatsappError] = useState<string | null>(null);
  const [useGPS, setUseGPS] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [selectedAddressCoords, setSelectedAddressCoords] = useState<{ lat: number; lng: number } | null>(null);
  
  // Estados para autocompletado de direcciones
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const addressInputRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Prefill WhatsApp si ya existe en el perfil
  useEffect(() => {
    if (userProfile?.whatsapp) {
      setFormData((prev) => ({ ...prev, whatsapp: userProfile.whatsapp || "" }));
    }
  }, [userProfile]);

  // Cerrar sugerencias al hacer clic fuera
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
    
    // Si se limpia el campo, limpiar también las coordenadas seleccionadas
    if (value.length === 0) {
      setSelectedAddressCoords(null);
    }
    
    if (value.length >= 3) {
      fetchAddressSuggestions(value);
    } else {
      setAddressSuggestions([]);
    }
  };

  // Manejar selección de sugerencia
  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    const formatted = formatAddressSuggestion(suggestion);
    console.log("✅ Sugerencia seleccionada:", formatted);
    console.log("📋 Datos completos de sugerencia:", suggestion);
    
    setFormData((prev) => {
      const updated = { ...prev, address: formatted };
      console.log("📝 Prellenando dirección desde sugerencia:", formatted);
      
      // Si la sugerencia tiene coordenadas, guardarlas
      if (suggestion.lat && suggestion.lon) {
        const lat = parseFloat(suggestion.lat);
        const lng = parseFloat(suggestion.lon);
        if (!isNaN(lat) && !isNaN(lng)) {
          console.log("📍 Guardando coordenadas de sugerencia:", { lat, lng });
          setSelectedAddressCoords({ lat, lng });
          setUseGPS(false); // No usar GPS, usar coordenadas de la sugerencia
        }
      }
      
      // Si la sugerencia tiene información de ciudad, actualizarla
      if (suggestion.address?.city) {
        const cityName = suggestion.address.city;
        console.log("🏙️ Ciudad detectada desde sugerencia:", cityName);
        
        // Buscar ciudad en la lista (case insensitive)
        const cityMatch = CITIES.find(c => c.toLowerCase() === cityName.toLowerCase());
        
        if (cityMatch) {
          console.log("✅ Ciudad encontrada en lista:", cityMatch);
          updated.city = cityMatch;
          updated.otherCity = "";
        } else {
          console.log("⚠️ Ciudad no está en lista, usando 'Otra':", cityName);
          updated.city = "Otra";
          updated.otherCity = cityName;
        }
      }
      
      console.log("📝 formData actualizado:", updated);
      return updated;
    });
    
    setShowSuggestions(false);
    setAddressSuggestions([]);
  };

  // Manejar navegación con teclado en sugerencias
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

  // Validación de WhatsApp en tiempo real
  const validateWhatsapp = (value: string): boolean => {
    const cleaned = value.replace(/\D/g, "");
    
    if (!cleaned) {
      setWhatsappError("El WhatsApp es obligatorio");
      return false;
    }
    
    if (cleaned.length !== 10) {
      setWhatsappError("Debe tener exactamente 10 dígitos");
      return false;
    }
    
    if (cleaned.startsWith("0")) {
      setWhatsappError("No debe comenzar con 0");
      return false;
    }
    
    setWhatsappError(null);
    return true;
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, whatsapp: value }));
    validateWhatsapp(value);
  };

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
    setUseGPS(true);
    setSelectedAddressCoords(null); // Limpiar coordenadas de dirección seleccionada

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0,
            }
          );
        }
      );

      console.log("✅ Ubicación GPS obtenida:", position.coords);
      
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      
      // Guardar coordenadas
      setSelectedAddressCoords({ lat: latitude, lng: longitude });
      
      // Hacer reverse geocoding para obtener la dirección y prellenar el campo
      try {
        console.log("🗺️ Obteniendo dirección desde coordenadas GPS...");
        
        // Agregar un pequeño delay para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=es&zoom=18`,
          {
            headers: {
              "User-Agent": "SumeeApp/1.0 (https://sumeeapp.com; contact@sumeeapp.com)",
              "Accept-Language": "es-MX,es;q=0.9",
            },
          }
        );
        
        console.log("📡 Respuesta OpenStreetMap desde GPS:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("📋 Datos OpenStreetMap desde GPS:", data);
          
          if (data && data.display_name) {
            const address = data.display_name;
            console.log("✅ Dirección obtenida desde GPS:", address);
            console.log("📝 Prellenando dirección en formulario...");
            
            // Actualizar el estado de forma explícita y completa
            setFormData((prev) => {
              const updated = { ...prev, address };
              console.log("📝 formData actualizado con dirección:", updated);
              return updated;
            });
            
            // Si la dirección tiene información de ciudad, actualizarla
            if (data.address) {
              const cityName = data.address.city || data.address.town || data.address.municipality || data.address.county;
              console.log("🏙️ Ciudad detectada desde GPS:", cityName);
              
              if (cityName) {
                // Buscar ciudad en la lista (case insensitive)
                const cityMatch = CITIES.find(c => c.toLowerCase() === cityName.toLowerCase());
                
                if (cityMatch) {
                  console.log("✅ Ciudad encontrada en lista:", cityMatch);
                  setFormData((prev) => ({ ...prev, city: cityMatch, otherCity: "" }));
                } else {
                  console.log("⚠️ Ciudad no está en lista, usando 'Otra':", cityName);
                  setFormData((prev) => ({ 
                    ...prev, 
                    city: "Otra",
                    otherCity: cityName 
                  }));
                }
              }
            }
            
            setError(null); // Limpiar cualquier error previo
          } else {
            console.warn("⚠️ No se pudo obtener dirección desde GPS, datos:", data);
          }
        } else {
          console.error("❌ Error en respuesta de OpenStreetMap:", response.status);
        }
      } catch (geocodeError) {
        console.warn("⚠️ Error al obtener dirección desde GPS:", geocodeError);
        // No es crítico, el usuario puede ingresar la dirección manualmente
      }
      
      // Mostrar feedback visual
      setError(null);
      
    } catch (err: any) {
      console.error("❌ Error obteniendo GPS:", err);
      setUseGPS(false);
      
      if (err.code === 1) {
        setError("Permiso de ubicación denegado. Selecciona tu ciudad manualmente.");
      } else if (err.code === 2) {
        setError("Ubicación no disponible. Selecciona tu ciudad manualmente.");
      } else if (err.code === 3) {
        setError("Tiempo de espera agotado. Selecciona tu ciudad manualmente.");
      } else {
        setError("Error al obtener ubicación. Selecciona tu ciudad manualmente.");
      }
    } finally {
      setGpsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar WhatsApp
    if (!validateWhatsapp(formData.whatsapp)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let ubicacion_lat = 19.4326; // Fallback CDMX
      let ubicacion_lng = -99.1332;
      let finalCity = formData.city === "Otra" ? formData.otherCity : formData.city;

      if (!finalCity) {
        setError("Por favor selecciona una ciudad");
        setLoading(false);
        return;
      }

      // Obtener coordenadas (prioridad: GPS > Sugerencia seleccionada > Dirección manual > Ciudad)
      if (useGPS && navigator.geolocation) {
        // Usar GPS
        console.log("📍 Usando coordenadas GPS...");
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              resolve,
              reject,
              { enableHighAccuracy: true, timeout: 10000 }
            );
          }
        );
        ubicacion_lat = position.coords.latitude;
        ubicacion_lng = position.coords.longitude;
        console.log("✅ Coordenadas GPS:", { ubicacion_lat, ubicacion_lng });
      } else if (selectedAddressCoords) {
        // Usar coordenadas de la sugerencia seleccionada
        console.log("📍 Usando coordenadas de dirección seleccionada:", selectedAddressCoords);
        ubicacion_lat = selectedAddressCoords.lat;
        ubicacion_lng = selectedAddressCoords.lng;
      } else if (formData.address && formData.address.length >= 3) {
        // Si hay dirección manual, geocodificarla
        console.log("🗺️ Geocodificando dirección manual:", formData.address);
        const addressCoords = await geocodeAddress(formData.address);
        if (addressCoords) {
          ubicacion_lat = addressCoords.lat;
          ubicacion_lng = addressCoords.lng;
          console.log("✅ Coordenadas de dirección:", { ubicacion_lat, ubicacion_lng });
        } else {
          // Fallback: geocodificar ciudad
          console.log("⚠️ No se pudo geocodificar dirección, usando ciudad:", finalCity);
          const coords = await geocodeAddress(`${finalCity}, México`);
          if (coords) {
            ubicacion_lat = coords.lat;
            ubicacion_lng = coords.lng;
          } else {
            console.warn("⚠️ No se pudo geocodificar, usando fallback CDMX");
          }
        }
      } else {
        // Geocodificar ciudad
        console.log("🗺️ Geocodificando ciudad:", finalCity);
        const coords = await geocodeAddress(`${finalCity}, México`);
        if (coords) {
          ubicacion_lat = coords.lat;
          ubicacion_lng = coords.lng;
          console.log("✅ Coordenadas geocodificadas:", { ubicacion_lat, ubicacion_lng });
        } else {
          console.warn("⚠️ No se pudo geocodificar, usando fallback CDMX");
        }
      }

      // Actualizar perfil en profiles
      console.log("📤 Actualizando perfil en Supabase...");
      
      // Primero intentar con 'city', si falla, actualizar sin 'city'
      let updateError = null;
      const updateData: any = {
        whatsapp: formData.whatsapp,
        ubicacion_lat,
        ubicacion_lng,
        updated_at: new Date().toISOString(),
      };
      
      // Intentar incluir 'city' (podría no existir en schema antiguo)
      try {
        const result = await (supabase
          .from("profiles") as any)
          .update({
            ...updateData,
            city: finalCity,
          })
          .eq("user_id", userProfile.user_id);
        
        updateError = result.error;
        
        // Si error es por columna 'city', reintentar sin ella
        if (updateError && updateError.message?.includes("city")) {
          console.warn("⚠️ Columna 'city' no existe, reintentando sin ella...");
          const retryResult = await (supabase
            .from("profiles") as any)
            .update(updateData)
            .eq("user_id", userProfile.user_id);
          
          updateError = retryResult.error;
        }
      } catch (err) {
        console.error("❌ Error en actualización:", err);
        updateError = err;
      }

      if (updateError) {
        console.error("❌ Error actualizando perfil:", updateError);
        throw updateError;
      }

      // Actualizar metadata de auth.users
      console.log("📤 Actualizando metadata de auth...");
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          whatsapp: formData.whatsapp,
          city: finalCity,
          ubicacion_lat,
          ubicacion_lng,
        },
      });

      if (authError) {
        console.error("❌ Error actualizando auth metadata:", authError);
        // No lanzar error, no es crítico
      }

      console.log("✅ Perfil actualizado exitosamente");
      
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
      onComplete();
      
    } catch (err: any) {
      console.error("❌ Error en handleSubmit:", err);
      setError(err.message || "Error al guardar tu información");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[200]" onClose={() => {}}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-bold text-gray-900 mb-2 text-center"
                >
                  ¡Bienvenido a Sumee! 🎉
                </Dialog.Title>
                
                <p className="text-sm text-gray-600 mb-6 text-center">
                  Completa tu perfil para encontrar profesionales cerca de ti
                </p>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* WhatsApp */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <FontAwesomeIcon
                        icon={faWhatsapp}
                        className="mr-2 text-green-600"
                      />
                      WhatsApp *
                    </label>
                    <input
                      type="tel"
                      value={formData.whatsapp}
                      onChange={handleWhatsappChange}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        whatsappError ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="5512345678 (10 dígitos)"
                      maxLength={10}
                      required
                    />
                    {whatsappError && (
                      <p className="text-xs text-red-600 mt-1">{whatsappError}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Se usará para coordinar servicios con profesionales
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
                      />
                    </div>
                  )}

                  {/* Campo de dirección con autocompletado */}
                  <div className="relative" ref={addressInputRef}>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="mr-2 text-red-600"
                      />
                      Dirección Completa (Opcional)
                    </label>
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
                      disabled={loading || (useGPS && !gpsLoading)}
                      autoComplete="off"
                    />
                    {isLoadingSuggestions && (
                      <div className="absolute right-3 top-9 transform -translate-y-1/2">
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
                    <p className="text-xs text-gray-500 mt-1">
                      Escribe tu dirección y selecciona una sugerencia para mayor precisión
                    </p>
                  </div>

                  {/* Botón GPS */}
                  <div>
                    <button
                      type="button"
                      onClick={handleUseGPS}
                      disabled={gpsLoading}
                      className={`w-full p-3 border-2 rounded-lg font-medium transition-all ${
                        useGPS
                          ? "bg-green-50 border-green-500 text-green-700"
                          : "bg-gray-50 border-gray-300 text-gray-700 hover:border-blue-500 hover:bg-blue-50"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={useGPS ? faCheckCircle : faLocationArrow}
                        className={`mr-2 ${useGPS ? "text-green-600" : "text-gray-600"}`}
                      />
                      {gpsLoading
                        ? "Obteniendo ubicación..."
                        : useGPS
                        ? "✅ GPS Activado"
                        : "📍 Usar mi ubicación GPS (Opcional)"}
                    </button>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      GPS es más preciso pero requiere permiso del navegador
                    </p>
                  </div>

                  {/* Botón Submit */}
                  <button
                    type="submit"
                    disabled={loading || !!whatsappError || !formData.whatsapp}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
                  >
                    {loading ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                        Guardar y Continuar
                      </>
                    )}
                  </button>
                </form>

                <p className="text-xs text-gray-400 mt-4 text-center">
                  Esta información nos ayuda a conectarte con los mejores profesionales
                  cerca de ti
                </p>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

