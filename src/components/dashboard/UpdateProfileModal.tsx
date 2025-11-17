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
  faCamera,
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
  // 🔍 DEBUG: Verificar que el modal se está renderizando
  console.log("🟣 UpdateProfileModal renderizado:");
  console.log("   - isOpen:", isOpen);
  console.log("   - userRole:", userRole);
  console.log("   - currentProfile:", currentProfile);
  
  const [formData, setFormData] = useState({
    full_name: currentProfile.full_name || "",
    whatsapp: currentProfile.whatsapp || "",
    city: currentProfile.city || "Ciudad de México",
    otherCity: "",
    ubicacion_lat: currentProfile.ubicacion_lat || null,
    ubicacion_lng: currentProfile.ubicacion_lng || null,
    // Profesionales
    bio: currentProfile.bio || "",
    profession: currentProfile.profession || "",
    work_zones: currentProfile.work_zones || [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [whatsappError, setWhatsappError] = useState<string | null>(null);
  const [useGPS, setUseGPS] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Detectar cambios
  useEffect(() => {
    const hasChanged =
      formData.full_name !== (currentProfile.full_name || "") ||
      formData.whatsapp !== (currentProfile.whatsapp || "") ||
      formData.city !== (currentProfile.city || "Ciudad de México") ||
      formData.bio !== (currentProfile.bio || "") ||
      formData.profession !== (currentProfile.profession || "") ||
      JSON.stringify(formData.work_zones) !== JSON.stringify(currentProfile.work_zones || []);

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

      setFormData((prev) => ({
        ...prev,
        ubicacion_lat: position.coords.latitude,
        ubicacion_lng: position.coords.longitude,
      }));
      setUseGPS(true);
      console.log("✅ Ubicación GPS obtenida:", position.coords);
    } catch (err: any) {
      console.error("❌ Error obteniendo GPS:", err);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

      // Geocodificar si no hay coordenadas o si cambió la ciudad
      if (!useGPS && (!ubicacion_lat || !ubicacion_lng || formData.city !== currentProfile.city)) {
        console.log("🗺️ Geocodificando ciudad:", finalCity);
        const coords = await geocodeAddress(`${finalCity}, México`);
        if (coords) {
          ubicacion_lat = coords.lat;
          ubicacion_lng = coords.lng;
        } else {
          ubicacion_lat = 19.4326;
          ubicacion_lng = -99.1332;
        }
      }

      // Preparar datos de actualización
      const updateData: any = {
        full_name: formData.full_name,
        whatsapp: formData.whatsapp,
        ubicacion_lat,
        ubicacion_lng,
        updated_at: new Date().toISOString(),
      };

      // Intentar incluir city
      try {
        updateData.city = finalCity;
      } catch (e) {
        console.warn("City column might not exist, continuing without it");
      }

      // Agregar campos de profesional
      if (userRole === "professional") {
        updateData.bio = formData.bio;
        updateData.profession = formData.profession;
        updateData.work_zones = formData.work_zones;
      }

      console.log("📤 Actualizando perfil...", updateData);

      // Remover updated_at si puede causar problemas (algunos esquemas no lo tienen)
      const { updated_at, ...updateDataWithoutTimestamp } = updateData;
      
      // Actualizar en profiles con verificación
      let updateResult = await supabase
        .from("profiles")
        .update(updateDataWithoutTimestamp)
        .eq("user_id", currentProfile.user_id)
        .select(); // CRÍTICO: Verificar que se actualizó

      // Si falla por city, reintentar sin city
      if (updateResult.error) {
        if (updateResult.error.message?.includes("city") || updateResult.error.message?.includes("column") && updateResult.error.message?.includes("city")) {
          console.warn("⚠️ Reintentando sin columna city...");
          const { city, ...updateDataWithoutCity } = updateDataWithoutTimestamp;
          updateResult = await supabase
            .from("profiles")
            .update(updateDataWithoutCity)
            .eq("user_id", currentProfile.user_id)
            .select();
        }
        
        if (updateResult.error) {
          console.error("❌ Error de Supabase:", updateResult.error);
          throw new Error(updateResult.error.message || "Error al actualizar el perfil en la base de datos");
        }
      }

      // Verificar que realmente se actualizó
      if (!updateResult.data || updateResult.data.length === 0) {
        console.error("❌ No se actualizó ningún registro");
        throw new Error("No se pudo actualizar el perfil. Verifica que tengas permisos para editar tu perfil.");
      }

      console.log("✅ Perfil actualizado en BD:", updateResult.data[0]);

      // Actualizar metadata de auth (opcional, no crítico)
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
        console.log("✅ Metadata de auth actualizada");
      } catch (authError: any) {
        console.warn("⚠️ Error actualizando auth metadata (no crítico):", authError);
        // No lanzar error, la actualización en profiles ya fue exitosa
      }

      console.log("✅ Perfil actualizado exitosamente");
      setSuccess(true);
      setError(null); // Limpiar cualquier error previo

      // Mostrar mensaje de éxito por 1.5 segundos antes de cerrar
      setTimeout(() => {
        // Llamar onSuccess primero para refrescar datos
        onSuccess();
        // Cerrar después de un pequeño delay para que el usuario vea el mensaje
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

  // Si no está abierto, no renderizar nada
  if (!isOpen) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[9999]" onClose={handleClose}>
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
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all z-[10000]">
                {/* Header mejorado */}
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5 text-white relative overflow-hidden">
                  {/* Elementos decorativos */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                  
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <FontAwesomeIcon icon={faUser} className="text-xl" />
                      </div>
                      <div>
                        <Dialog.Title className="text-2xl font-bold flex items-center">
                          Actualizar Mi Perfil
                        </Dialog.Title>
                        <p className="text-sm text-white/90 mt-0.5">
                          {userRole === "professional"
                            ? "Mantén tu perfil profesional actualizado"
                            : "Actualiza tu información de contacto"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleClose}
                      className="w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all flex items-center justify-center"
                      aria-label="Cerrar"
                    >
                      <FontAwesomeIcon icon={faTimes} className="text-lg" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                  {/* Mensaje de éxito */}
                  {success && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-lg text-sm text-green-800 flex items-center shadow-lg">
                      <FontAwesomeIcon icon={faCheckCircle} className="mr-3 text-green-600 text-xl flex-shrink-0" />
                      <div>
                        <strong className="text-base">¡Perfil actualizado exitosamente! ✅</strong>
                        <p className="text-xs text-green-600 mt-1">Los cambios se han guardado correctamente en la base de datos.</p>
                      </div>
                    </div>
                  )}

                  {/* Mensaje de error */}
                  {error && !success && (
                    <div className="mb-4 p-4 bg-red-50 border-2 border-red-400 rounded-lg text-sm text-red-800 flex items-start shadow-lg">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="mr-3 text-red-600 text-xl mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <strong className="text-base block mb-1">Error al guardar cambios:</strong>
                        <p className="text-sm text-red-700 mb-2">{error}</p>
                        <button
                          type="button"
                          onClick={() => setError(null)}
                          className="text-xs text-red-600 hover:text-red-800 underline font-medium"
                        >
                          Cerrar mensaje
                        </button>
                      </div>
                    </div>
                  )}

                  {userRole === "professional" ? (
                    <Tab.Group>
                      <Tab.List className="flex space-x-1 rounded-xl bg-blue-50 p-1 mb-6">
                        <Tab
                          className={({ selected }) =>
                            `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all
                            ${
                              selected
                                ? "bg-white text-blue-700 shadow"
                                : "text-gray-600 hover:bg-white/50"
                            }`
                          }
                        >
                          📝 Básico
                        </Tab>
                        <Tab
                          className={({ selected }) =>
                            `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all
                            ${
                              selected
                                ? "bg-white text-blue-700 shadow"
                                : "text-gray-600 hover:bg-white/50"
                            }`
                          }
                        >
                          💼 Profesional
                        </Tab>
                      </Tab.List>
                      <Tab.Panels>
                        {/* TAB: Básico */}
                        <Tab.Panel>
                          <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Nombre */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                              />
                            </div>

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
                                placeholder="5512345678"
                                maxLength={10}
                                required
                              />
                              {whatsappError && (
                                <p className="text-xs text-red-600 mt-1">{whatsappError}</p>
                              )}
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

                            {/* Zonas de Trabajo (CDMX) */}
                            {formData.city === "Ciudad de México" && (
                              <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                  Zonas de Trabajo en CDMX
                                </label>
                                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                                  {WORK_ZONES_CDMX.map((zone) => (
                                    <label
                                      key={zone}
                                      className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={formData.work_zones?.includes(zone)}
                                        onChange={() => handleWorkZoneToggle(zone)}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                      />
                                      <span>{zone}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* GPS */}
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
                                  className="mr-2"
                                />
                                {gpsLoading
                                  ? "Obteniendo ubicación..."
                                  : useGPS
                                  ? "✅ GPS Activado"
                                  : "📍 Actualizar ubicación GPS"}
                              </button>
                            </div>
                          </form>
                        </Tab.Panel>

                        {/* TAB: Profesional */}
                        <Tab.Panel>
                          <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Profesión */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

                            {/* Bio */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bio / Descripción
                              </label>
                              <textarea
                                value={formData.bio}
                                onChange={(e) =>
                                  setFormData((prev) => ({ ...prev, bio: e.target.value }))
                                }
                                rows={4}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Cuéntanos sobre tu experiencia, especialidades y por qué eres el mejor en lo que haces..."
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                {formData.bio.length}/500 caracteres
                              </p>
                            </div>
                          </form>
                        </Tab.Panel>
                      </Tab.Panels>
                    </Tab.Group>
                  ) : (
                    // FORMULARIO SIMPLE PARA CLIENTES
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Nombre */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre Completo *
                        </label>
                        <input
                          type="text"
                          value={formData.full_name}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, full_name: e.target.value }))
                          }
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

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
                          placeholder="5512345678"
                          maxLength={10}
                          required
                        />
                        {whatsappError && (
                          <p className="text-xs text-red-600 mt-1">{whatsappError}</p>
                        )}
                      </div>

                      {/* Ciudad */}
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-red-600" />
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

                      {formData.city === "Otra" && (
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Especifica tu ciudad *
                          </label>
                          <input
                            type="text"
                            value={formData.otherCity}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, otherCity: e.target.value }))
                            }
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Escribe tu ciudad"
                            required
                          />
                        </div>
                      )}

                      {/* GPS */}
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
                            className="mr-2"
                          />
                          {gpsLoading
                            ? "Obteniendo ubicación..."
                            : useGPS
                            ? "✅ GPS Activado"
                            : "📍 Actualizar ubicación GPS"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !hasChanges || !!whatsappError}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
                  >
                    {loading ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                        Guardar Cambios
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


