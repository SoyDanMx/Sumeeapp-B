"use client";

import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition, Tab } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faMapMarkerAlt,
  faLocationArrow,
  faCheckCircle,
  faSpinner,
  faTimes,
  faBriefcase,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { supabase } from "@/lib/supabase/client";
import { geocodeAddress } from "@/lib/geocoding";
import { Profile } from "@/types/supabase";
import { PROFESSIONAL_PROFESSIONS } from "@/constants/professions";

interface UpdateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: "client" | "professional";
  currentProfile: Profile;
  onSuccess: () => void;
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

const WORK_ZONES_CDMX = [
  "Álvaro Obregón",
  "Azcapotzalco",
  "Benito Juárez",
  "Coyoacán",
  "Cuajimalpa",
  "Cuauhtémoc",
  "Gustavo A. Madero",
  "Iztacalco",
  "Iztapalapa",
  "La Magdalena Contreras",
  "Miguel Hidalgo",
  "Milpa Alta",
  "Tláhuac",
  "Tlalpan",
  "Venustiano Carranza",
  "Xochimilco",
];

export default function UpdateProfileModal({
  isOpen,
  onClose,
  userRole,
  currentProfile,
  onSuccess,
}: UpdateProfileModalProps) {
  const [formData, setFormData] = useState({
    full_name: currentProfile.full_name || "",
    whatsapp: currentProfile.whatsapp || "",
    city: currentProfile.city || "Ciudad de México",
    otherCity: "",
    ubicacion_lat: currentProfile.ubicacion_lat || null,
    ubicacion_lng: currentProfile.ubicacion_lng || null,
    bio: currentProfile.bio || "",
    profession: currentProfile.profession || "",
    work_zones: currentProfile.work_zones || [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [whatsappError, setWhatsappError] = useState<string | null>(null);
  const [useGPS, setUseGPS] = useState(
    !!(currentProfile.ubicacion_lat && currentProfile.ubicacion_lng)
  );
  const [gpsLoading, setGpsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Resetear formData cuando cambia currentProfile
  useEffect(() => {
    setFormData({
      full_name: currentProfile.full_name || "",
      whatsapp: currentProfile.whatsapp || "",
      city: currentProfile.city || "Ciudad de México",
      otherCity: "",
      ubicacion_lat: currentProfile.ubicacion_lat || null,
      ubicacion_lng: currentProfile.ubicacion_lng || null,
      bio: currentProfile.bio || "",
      profession: currentProfile.profession || "",
      work_zones: currentProfile.work_zones || [],
    });
    setUseGPS(!!(currentProfile.ubicacion_lat && currentProfile.ubicacion_lng));
  }, [currentProfile]);

  // Detectar cambios
  useEffect(() => {
    const hasChanged =
      formData.full_name !== (currentProfile.full_name || "") ||
      formData.whatsapp !== (currentProfile.whatsapp || "") ||
      formData.city !== (currentProfile.city || "Ciudad de México") ||
      formData.bio !== (currentProfile.bio || "") ||
      formData.profession !== (currentProfile.profession || "") ||
      JSON.stringify(formData.work_zones) !== JSON.stringify(currentProfile.work_zones || []) ||
      formData.ubicacion_lat !== (currentProfile.ubicacion_lat ?? null) ||
      formData.ubicacion_lng !== (currentProfile.ubicacion_lng ?? null);

    setHasChanges(hasChanged);
  }, [formData, currentProfile]);

  // Validación de WhatsApp
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

  const callReverseGeocode = async (userId: string, lat: number, lng: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await supabase.functions.invoke("reverse-geocode", {
        body: { user_id: userId, lat, lng },
      });
    } catch (error: any) {
      console.error("❌ Error en reverse-geocode (no crítico):", error);
    }
  };

  const handleUseGPS = async () => {
    if (!navigator.geolocation) {
      setError("La geolocalización no está disponible en tu navegador");
      return;
    }

    setGpsLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        }
      );

      const newLat = position.coords.latitude;
      const newLng = position.coords.longitude;
      
      setFormData((prev) => ({
        ...prev,
        ubicacion_lat: newLat,
        ubicacion_lng: newLng,
      }));
      setUseGPS(true);
      setHasChanges(true);
    } catch (err: any) {
      setUseGPS(false);
      if (err.code === 1) {
        setError("Permiso de ubicación denegado");
      } else if (err.code === 2) {
        setError("Ubicación no disponible");
      } else {
        setError("Error al obtener ubicación");
      }
    } finally {
      setGpsLoading(false);
    }
  };

  const handleWorkZoneToggle = (zone: string) => {
    setFormData((prev) => {
      const currentZones = prev.work_zones || [];
      const newZones = currentZones.includes(zone)
        ? currentZones.filter((z) => z !== zone)
        : [...currentZones, zone];
      return { ...prev, work_zones: newZones };
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    // ✅ FIX: Permitir llamada sin evento (desde botón fuera del form)
    if (e) {
      e.preventDefault();
    }

    if (!validateWhatsapp(formData.whatsapp)) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      let ubicacion_lat = formData.ubicacion_lat;
      let ubicacion_lng = formData.ubicacion_lng;
      const finalCity = formData.city === "Otra" ? formData.otherCity : formData.city;

      if (useGPS && ubicacion_lat && ubicacion_lng) {
        // Usar coordenadas GPS
      } else if (!ubicacion_lat || !ubicacion_lng || formData.city !== currentProfile.city) {
        const coords = await geocodeAddress(`${finalCity}, México`);
        if (coords) {
          ubicacion_lat = coords.lat;
          ubicacion_lng = coords.lng;
        } else {
          ubicacion_lat = 19.4326;
          ubicacion_lng = -99.1332;
        }
      }

      const updateData: any = {
        full_name: formData.full_name,
        whatsapp: formData.whatsapp,
        ubicacion_lat,
        ubicacion_lng,
        updated_at: new Date().toISOString(),
      };

      try {
        updateData.city = finalCity;
      } catch (e) {
        // Ignorar si city no existe
      }

      if (userRole === "professional") {
        updateData.bio = formData.bio;
        updateData.profession = formData.profession;
        updateData.work_zones = formData.work_zones;
      }

      const { updated_at, ...updateDataWithoutTimestamp } = updateData;
      
      let updateResult = await (supabase
        .from("profiles") as any)
        .update(updateDataWithoutTimestamp)
        .eq("user_id", currentProfile.user_id)
        .select();

      if (updateResult.error) {
        if (updateResult.error.message?.includes("city")) {
          const { city, ...updateDataWithoutCity } = updateDataWithoutTimestamp;
          updateResult = await (supabase
            .from("profiles") as any)
            .update(updateDataWithoutCity)
            .eq("user_id", currentProfile.user_id)
            .select();
        }
        
        if (updateResult.error) {
          throw new Error(updateResult.error.message || "Error al actualizar el perfil");
        }
      }

      if (!updateResult.data || updateResult.data.length === 0) {
        throw new Error("No se pudo actualizar el perfil. Verifica tus permisos.");
      }

      // Actualizar metadata de auth (opcional)
      try {
        await supabase.auth.updateUser({
          data: {
            full_name: formData.full_name,
            whatsapp: formData.whatsapp,
            city: finalCity,
            ubicacion_lat,
            ubicacion_lng,
            ...(userRole === "professional" && {
              bio: formData.bio,
              profession: formData.profession,
            }),
          },
        });
      } catch (authError: any) {
        console.warn("⚠️ Error actualizando auth metadata (no crítico):", authError);
      }

      // Llamar reverse-geocode de forma asíncrona
      if ((ubicacion_lat !== currentProfile.ubicacion_lat || ubicacion_lng !== currentProfile.ubicacion_lng) && ubicacion_lat && ubicacion_lng) {
        callReverseGeocode(currentProfile.user_id, ubicacion_lat, ubicacion_lng).catch(() => {});
      }
      
      setSuccess(true);
      setError(null);

      setTimeout(() => {
        onSuccess();
        setTimeout(() => {
          onClose();
        }, 300);
      }, 1500);
    } catch (err: any) {
      console.error("❌ Error actualizando perfil:", err);
      setError(err.message || "Error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (hasChanges && !success) {
      const confirmed = window.confirm(
        "Tienes cambios sin guardar. ¿Estás seguro de cerrar?"
      );
      if (!confirmed) return;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[9999]" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-xl bg-white shadow-xl transition-all">
                {/* Header compacto */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <FontAwesomeIcon icon={faUser} className="text-sm" />
                      </div>
                      <div>
                        <Dialog.Title className="text-lg font-semibold">
                          Actualizar Perfil
                        </Dialog.Title>
                        <p className="text-xs text-white/90">
                          {userRole === "professional" ? "Información profesional" : "Información de contacto"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleClose}
                      className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
                      aria-label="Cerrar"
                    >
                      <FontAwesomeIcon icon={faTimes} className="text-sm" />
                    </button>
                  </div>
                </div>

                {/* Content compacto */}
                <div className="px-4 py-3 max-h-[65vh] overflow-y-auto">
                  {/* Mensajes de estado */}
                  {success && (
                    <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 flex items-center">
                      <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-green-600 flex-shrink-0" />
                      <span>¡Perfil actualizado exitosamente!</span>
                    </div>
                  )}

                  {error && !success && (
                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 flex items-start">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <strong className="block mb-1">Error:</strong>
                        <p className="text-xs text-red-700">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* ✅ FIX: Un solo formulario que envuelve todo */}
                  <form onSubmit={handleSubmit} id="profile-update-form">
                    {userRole === "professional" ? (
                      <Tab.Group>
                        <Tab.List className="flex space-x-1 rounded-lg bg-gray-100 p-1 mb-4">
                          <Tab
                            className={({ selected }) =>
                              `flex-1 rounded-md py-1.5 text-xs font-medium transition-all ${
                                selected
                                  ? "bg-white text-indigo-600 shadow-sm"
                                  : "text-gray-600 hover:text-gray-900"
                              }`
                            }
                          >
                            Básico
                          </Tab>
                          <Tab
                            className={({ selected }) =>
                              `flex-1 rounded-md py-1.5 text-xs font-medium transition-all ${
                                selected
                                  ? "bg-white text-indigo-600 shadow-sm"
                                  : "text-gray-600 hover:text-gray-900"
                              }`
                            }
                          >
                            Profesional
                          </Tab>
                        </Tab.List>
                        <Tab.Panels>
                          {/* TAB: Básico */}
                          <Tab.Panel className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Nombre Completo *
                              </label>
                              <input
                                type="text"
                                value={formData.full_name}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    full_name: e.target.value,
                                  }))
                                }
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                required
                              />
                            </div>

                            <div>
                              <label className="flex items-center text-xs font-medium text-gray-700 mb-1">
                                <FontAwesomeIcon
                                  icon={faWhatsapp}
                                  className="mr-1.5 text-green-600 text-xs"
                                />
                                WhatsApp *
                              </label>
                              <input
                                type="tel"
                                value={formData.whatsapp}
                                onChange={handleWhatsappChange}
                                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                  whatsappError ? "border-red-500" : "border-gray-300"
                                }`}
                                placeholder="5512345678"
                                maxLength={10}
                                required
                              />
                              {whatsappError && (
                                <p className="text-xs text-red-600 mt-0.5">{whatsappError}</p>
                              )}
                            </div>

                            <div>
                              <label className="flex items-center text-xs font-medium text-gray-700 mb-1">
                                <FontAwesomeIcon
                                  icon={faMapMarkerAlt}
                                  className="mr-1.5 text-red-600 text-xs"
                                />
                                Ciudad *
                              </label>
                              <select
                                value={formData.city}
                                onChange={(e) => {
                                  setFormData((prev) => ({ ...prev, city: e.target.value }));
                                  if (e.target.value !== currentProfile.city) {
                                    setUseGPS(false);
                                  }
                                }}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                required
                              >
                                {CITIES.map((city) => (
                                  <option key={city} value={city}>
                                    {city}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {formData.city === "Otra" && (
                              <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">
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
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                  placeholder="Escribe tu ciudad"
                                  required
                                />
                              </div>
                            )}

                            {formData.city === "Ciudad de México" && (
                              <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">
                                  Zonas de Trabajo
                                </label>
                                <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded-lg bg-gray-50">
                                  {WORK_ZONES_CDMX.map((zone) => (
                                    <label
                                      key={zone}
                                      className="flex items-center space-x-1.5 text-xs cursor-pointer hover:bg-white p-1 rounded"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={formData.work_zones?.includes(zone)}
                                        onChange={() => handleWorkZoneToggle(zone)}
                                        className="rounded text-indigo-600 focus:ring-indigo-500"
                                      />
                                      <span className="text-gray-700">{zone}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div>
                              <button
                                type="button"
                                onClick={handleUseGPS}
                                disabled={gpsLoading}
                                className={`w-full px-3 py-2 text-sm border-2 rounded-lg font-medium transition-all ${
                                  useGPS
                                    ? "bg-green-50 border-green-500 text-green-700"
                                    : "bg-gray-50 border-gray-300 text-gray-700 hover:border-indigo-500 hover:bg-indigo-50"
                                }`}
                              >
                                <FontAwesomeIcon
                                  icon={useGPS ? faCheckCircle : faLocationArrow}
                                  className="mr-1.5 text-xs"
                                />
                                {gpsLoading
                                  ? "Obteniendo ubicación..."
                                  : useGPS
                                  ? "GPS Activado"
                                  : "Actualizar ubicación GPS"}
                              </button>
                            </div>
                          </Tab.Panel>

                          {/* TAB: Profesional */}
                          <Tab.Panel className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Profesión *
                              </label>
                              <select
                                value={formData.profession}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    profession: e.target.value,
                                  }))
                                }
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                required
                              >
                                <option value="">Selecciona tu profesión</option>
                                {PROFESSIONAL_PROFESSIONS.map((prof) => (
                                  <option key={prof} value={prof}>
                                    {prof}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Bio / Descripción
                              </label>
                              <textarea
                                value={formData.bio}
                                onChange={(e) =>
                                  setFormData((prev) => ({ ...prev, bio: e.target.value }))
                                }
                                rows={4}
                                maxLength={500}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                                placeholder="Cuéntanos sobre tu experiencia..."
                              />
                              <p className="text-xs text-gray-500 mt-0.5">
                                {formData.bio.length}/500 caracteres
                              </p>
                            </div>
                          </Tab.Panel>
                        </Tab.Panels>
                      </Tab.Group>
                    ) : (
                      // FORMULARIO SIMPLE PARA CLIENTES
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Nombre Completo *
                          </label>
                          <input
                            type="text"
                            value={formData.full_name}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, full_name: e.target.value }))
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="flex items-center text-xs font-medium text-gray-700 mb-1">
                            <FontAwesomeIcon
                              icon={faWhatsapp}
                              className="mr-1.5 text-green-600 text-xs"
                            />
                            WhatsApp *
                          </label>
                          <input
                            type="tel"
                            value={formData.whatsapp}
                            onChange={handleWhatsappChange}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                              whatsappError ? "border-red-500" : "border-gray-300"
                            }`}
                            placeholder="5512345678"
                            maxLength={10}
                            required
                          />
                          {whatsappError && (
                            <p className="text-xs text-red-600 mt-0.5">{whatsappError}</p>
                          )}
                        </div>

                        <div>
                          <label className="flex items-center text-xs font-medium text-gray-700 mb-1">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1.5 text-red-600 text-xs" />
                            Ciudad *
                          </label>
                          <select
                            value={formData.city}
                            onChange={(e) => {
                              setFormData((prev) => ({ ...prev, city: e.target.value }));
                              if (e.target.value !== currentProfile.city) {
                                setUseGPS(false);
                              }
                            }}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                          >
                            {CITIES.map((city) => (
                              <option key={city} value={city}>
                                {city}
                              </option>
                            ))}
                          </select>
                        </div>

                        {formData.city === "Otra" && (
                          <div>
                            <label className="text-xs font-medium text-gray-700 mb-1 block">
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
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Escribe tu ciudad"
                              required
                            />
                          </div>
                        )}

                        <div>
                          <button
                            type="button"
                            onClick={handleUseGPS}
                            disabled={gpsLoading}
                            className={`w-full px-3 py-2 text-sm border-2 rounded-lg font-medium transition-all ${
                              useGPS
                                ? "bg-green-50 border-green-500 text-green-700"
                                : "bg-gray-50 border-gray-300 text-gray-700 hover:border-indigo-500 hover:bg-indigo-50"
                            }`}
                          >
                            <FontAwesomeIcon
                              icon={useGPS ? faCheckCircle : faLocationArrow}
                              className="mr-1.5 text-xs"
                            />
                            {gpsLoading
                              ? "Obteniendo ubicación..."
                              : useGPS
                              ? "GPS Activado"
                              : "Actualizar ubicación GPS"}
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                </div>

                {/* Footer compacto */}
                <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  {/* ✅ FIX: Botón dentro del form usando form attribute */}
                  <button
                    type="submit"
                    form="profile-update-form"
                    disabled={loading || !hasChanges || !!whatsappError}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-1.5 rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
                  >
                    {loading ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="mr-1.5 animate-spin text-xs" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheckCircle} className="mr-1.5 text-xs" />
                        Guardar
                      </>
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
