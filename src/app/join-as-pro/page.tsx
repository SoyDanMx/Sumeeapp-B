"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { getEmailConfirmationUrl } from "@/lib/utils";
import { geocodeAddress, reverseGeocode } from "@/lib/geocoding";
import dynamic from "next/dynamic";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faLock,
  faPhone,
  faMapMarkerAlt,
  faBriefcase,
  faCheckCircle,
  faSpinner,
  faExclamationTriangle,
  faEye,
  faEyeSlash,
  faLocationCrosshairs,
  faMapLocationDot,
  faLocationDot,
  faRotateRight,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import {
  ProfesionalRegistrationData,
  ValidationErrors,
} from "@/types/supabase";
import { PROFESSIONAL_PROFESSIONS } from "@/constants/professions";

const WORK_ZONES = [
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

const ProfessionalLocationMap = dynamic(
  () => import("@/components/pro/ProfessionalLocationMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-white">
        <div className="text-center text-sm text-gray-500">
          <FontAwesomeIcon
            icon={faSpinner}
            className="mr-2 animate-spin text-indigo-500"
          />
          Cargando mapa interactivo...
        </div>
      </div>
    ),
  }
);

import ProTestimonials from "@/components/pro/ProTestimonials";


const CDMX_COORDS = {
  lat: 19.410894,
  lng: -99.170816,
};

type LocationSource = "manual" | "gps" | "search" | "fallback";

// Áreas de servicio disponibles
const SERVICE_AREAS = [
  "Electricistas",
  "CCTV y Alarmas",
  "Redes WiFi",
  "Plomeros",
  "Pintores",
  "Aire Acondicionado",
  "Carpintería",
  "Limpieza",
  "Jardinería",
  "Fumigación",
  "Tablaroca",
  "Construcción",
];

// Mapeo de profesiones a áreas de servicio (sincronización automática)
const PROFESSION_TO_AREAS: Record<string, string[]> = {
  "Electricista": ["Electricistas"],
  "Ayudante Eléctrico": ["Electricistas"],
  "Plomero": ["Plomeros"],
  "Técnico en Aire Acondicionado": ["Aire Acondicionado"],
  "Técnico en Refrigeración": ["Aire Acondicionado"],
  "Especialista en CCTV y Seguridad": ["CCTV y Alarmas"],
  "Técnico en Seguridad": ["CCTV y Alarmas"],
  "Especialista en Redes y WiFi": ["Redes WiFi"],
  "Carpintero": ["Carpintería"],
  "Pintor": ["Pintores"],
  "Especialista en Limpieza": ["Limpieza"],
  "Jardinero": ["Jardinería"],
  "Especialista en Fumigación": ["Fumigación"],
  "Especialista en Tablaroca": ["Tablaroca"],
  "Especialista en Construcción": ["Construcción"],
  "Arquitecto": ["Construcción"],
  "Ingeniero": ["Construcción"],
};

export default function JoinAsPro() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Estado del formulario con todos los campos necesarios
  const [formData, setFormData] = useState<ProfesionalRegistrationData>({
    fullName: "",
    profession: "",
    phone: "",
    email: "",
    password: "",
    bio: "",
    workZones: [],
    city: "",
    work_zones_other: "",
    experience: undefined,
    areas_servicio: [],
  });

  // Estado local para el input de ciudad cuando se selecciona "Otra"
  const [otherCityInput, setOtherCityInput] = useState("");
  const [addressInput, setAddressInput] = useState("Colonia Condesa, CDMX");
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
    hasCustom: boolean;
    source: LocationSource;
  }>({
    lat: CDMX_COORDS.lat,
    lng: CDMX_COORDS.lng,
    address: "Colonia Condesa, CDMX",
    hasCustom: false,
    source: "fallback",
  });
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const clearLocationErrorState = useCallback(() => {
    setValidationErrors((prev) =>
      prev.location ? { ...prev, location: undefined } : prev
    );
  }, [setValidationErrors]);

  // Función genérica para actualizar el estado del formulario
  const handleChange = (
    field: keyof ProfesionalRegistrationData,
    value: string | string[] | number
  ) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Sincronización automática: cuando cambia profession, actualizar areas_servicio
      if (field === "profession" && typeof value === "string") {
        const autoAreas = PROFESSION_TO_AREAS[value] || [];
        // Si ya hay áreas seleccionadas, mantenerlas y agregar las nuevas si no están
        const currentAreas = prev.areas_servicio || [];
        const newAreas = [...new Set([...autoAreas, ...currentAreas])];
        updated.areas_servicio = newAreas;
      }

      return updated;
    });

    // Limpiar errores de validación cuando el usuario empiece a escribir
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    if (field === "city") {
      clearLocationErrorState();

      if (typeof value === "string") {
        if (!location.hasCustom) {
          const cityLabel =
            value === "Ciudad de México"
              ? "Ciudad de México, CDMX"
              : value === "Otra"
                ? ""
                : `${value}, México`;

          if (value === "Otra") {
            setAddressInput("");
          } else {
            setAddressInput(cityLabel);
            setLocation((prev) => ({
              ...prev,
              address: cityLabel || prev.address,
            }));
          }
        }

        setValidationErrors((prev) =>
          prev.city ? { ...prev, city: undefined } : prev
        );
      }
    }
  };

  const updateLocationFromCoords = useCallback(
    async (lat: number, lng: number, source: LocationSource) => {
      clearLocationErrorState();
      setLocationStatus("loading");
      setLocation((prev) => ({
        ...prev,
        lat,
        lng,
        hasCustom: true,
        source,
      }));

      try {
        const reverseResult = await reverseGeocode(lat, lng);
        const resolvedAddress =
          reverseResult?.address ||
          reverseResult?.displayName ||
          `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

        setLocation({
          lat,
          lng,
          address: resolvedAddress,
          hasCustom: true,
          source,
        });

        setAddressInput(resolvedAddress);
        setLocationStatus("success");
        setLocationError(null);
      } catch (reverseError) {

        setLocation((prev) => ({
          ...prev,
          lat,
          lng,
          hasCustom: true,
          source,
        }));
        setLocationStatus("error");
        setLocationError(
          "No pudimos obtener la dirección exacta. Ajusta el marcador manualmente."
        );
      }
    },
    [clearLocationErrorState]
  );

  const handleUseGPS = async () => {
    if (!navigator.geolocation) {
      setLocationError(
        "Tu navegador no soporta geolocalización. Escribe tu dirección o ajusta el mapa."
      );
      setLocationStatus("error");
      return;
    }

    setLocationStatus("loading");
    clearLocationErrorState();

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await updateLocationFromCoords(latitude, longitude, "gps");
      },
      (geoError) => {

        setLocationStatus("error");
        setLocationError(
          "No pudimos acceder a tu ubicación. Activa el GPS o permite el acceso en tu navegador."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
      }
    );
  };

  const handleSearchAddress = async () => {
    if (!addressInput.trim()) {
      setLocationError("Escribe una dirección o colonia para buscarla en el mapa.");
      setLocationStatus("error");
      return;
    }

    setLocationStatus("loading");
    clearLocationErrorState();

    try {
      const coords = await geocodeAddress(`${addressInput.trim()}, México`);
      if (coords) {
        await updateLocationFromCoords(coords.lat, coords.lng, "search");
      } else {
        setLocationStatus("error");
        setLocationError(
          "No encontramos la dirección. Intenta incluir colonia, ciudad y estado."
        );
      }
    } catch (error) {
      setLocationStatus("error");

      setLocationError(
        "Ocurrió un error al buscar la dirección. Intenta nuevamente."
      );
    }
  };

  const handleMapLocationChange = async (
    lat: number,
    lng: number,
    source: LocationSource = "manual"
  ) => {
    await updateLocationFromCoords(lat, lng, source);
  };

  const handleResetLocation = () => {
    setLocation({
      lat: CDMX_COORDS.lat,
      lng: CDMX_COORDS.lng,
      address: "Ciudad de México, CDMX",
      hasCustom: false,
      source: "fallback",
    });
    setAddressInput("Ciudad de México, CDMX");
    setLocationStatus("idle");
    setLocationError(null);
    clearLocationErrorState();
  };

  // Validación del formulario
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = "El nombre completo es requerido";
    } else if (formData.fullName.trim().length < 4) {
      errors.fullName = "El nombre debe tener al menos 4 caracteres";
    }

    if (!formData.profession.trim()) {
      errors.profession = "Selecciona tu profesión";
    }

    if (!formData.phone.trim()) {
      errors.phone = "El teléfono es requerido";
    } else if (
      !/^[0-9+\-\s()]{10,15}$/.test(formData.phone.replace(/\s/g, ""))
    ) {
      errors.phone = "Ingresa un número de teléfono válido";
    }

    if (!formData.email.trim()) {
      errors.email = "El correo electrónico es requerido";
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
      errors.email = "Por favor ingresa un correo electrónico válido";
    }

    if (!formData.password.trim()) {
      errors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password =
        "La contraseña debe contener al menos una mayúscula, una minúscula y un número";
    }

    if (!formData.city || formData.city.trim() === "") {
      errors.city = "Por favor selecciona tu ciudad principal";
    } else if (formData.city === "Otra" && !otherCityInput.trim()) {
      errors.city = "Por favor escribe el nombre de tu ciudad";
    }

    if (!location.hasCustom) {
      errors.location =
        "Confirma tu ubicación usando GPS, búsqueda o moviendo el pin en el mapa.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Función principal de envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevenir el comportamiento por defecto del formulario
    if (!validateForm()) return;

    // Establecer el estado de carga (loading) a true
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const sanitizedPhone = formData.phone.replace(/[^\\d+]/g, "");
      const normalizedPhone = sanitizedPhone || formData.phone.trim();



      // Construir dinámicamente la URL redirectTo usando window.location.origin
      const emailRedirectTo = getEmailConfirmationUrl();


      // Preparar datos para enviar a Supabase (con nuevos campos city y work_zones)
      // Determinar el valor real de city
      // Si city es "Otra", usar el valor de otherCityInput (lo que el usuario escribió)
      const realCity =
        formData.city === "Otra"
          ? otherCityInput.trim() || "Ciudad de México" // Si seleccionó "Otra", usar lo que escribió
          : formData.city || "Ciudad de México";


      let ubicacion_lat = location.lat ?? CDMX_COORDS.lat;
      let ubicacion_lng = location.lng ?? CDMX_COORDS.lng;
      let ubicacion_direccion =
        location.address ||
        (addressInput.trim()
          ? addressInput.trim()
          : `${realCity}, México`);
      let locationSource: LocationSource = location.hasCustom
        ? location.source
        : "fallback";

      if (!location.hasCustom) {
        try {
          const coords = await geocodeAddress(`${realCity}, México`);
          if (coords) {
            ubicacion_lat = coords.lat;
            ubicacion_lng = coords.lng;
            ubicacion_direccion = coords.displayName || ubicacion_direccion;
            locationSource = "fallback";
          }
        } catch (geoError) {
          // Silent catch for geocoding fallback
        }

      }

      const userMetadata: Record<string, any> = {
        full_name: formData.fullName?.trim() || "Nuevo Usuario",
        profession: formData.profession,
        city: realCity,
        bio: formData.bio || "",
        phone: normalizedPhone,
        whatsapp: normalizedPhone,
        phone_original: formData.phone,
        registration_type: "professional",
        ubicacion_lat,
        ubicacion_lng,
        ubicacion_direccion,
        location_source: locationSource,
        location_has_custom: location.hasCustom,
        location_address_input: addressInput.trim() || null,
        experience: formData.experience || null,
        areas_servicio: formData.areas_servicio || [],
      };

      // Añadir work_zones según la ciudad seleccionada
      if (realCity === "Ciudad de México") {
        userMetadata.work_zones = formData.workZones || [];
      } else {
        // Si es otra ciudad, usar work_zones_other si existe
        if (formData.work_zones_other) {
          userMetadata.work_zones_other = formData.work_zones_other;
        }
      }



      // Realizar la llamada a supabase.auth.signUp()
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo,
          data: userMetadata,
        },
      });




      // Manejar los casos de éxito y error de la llamada signUp
      if (authError) {


        // Proporcionar mensajes de error más específicos
        let errorMessage = "Error al crear usuario: ";
        if (authError.message.includes("Database error")) {
          errorMessage +=
            "Error en la base de datos. Verifica que el trigger esté configurado correctamente.";
        } else if (authError.message.includes("User already registered")) {
          errorMessage += "Este correo electrónico ya está registrado.";
        } else if (authError.message.includes("Invalid email")) {
          errorMessage += "El correo electrónico no es válido.";
        } else {
          errorMessage += authError.message;
        }

        throw new Error(errorMessage);
      }

      if (authData.user) {
        // El trigger se encarga automáticamente de crear el perfil


        // Mensaje de éxito positivo e inclusivo para todas las ciudades
        const successMessage =
          realCity === "Ciudad de México"
            ? "¡Excelente! Revisa tu correo electrónico para confirmar tu cuenta y acceder a tu dashboard profesional."
            : "¡Bienvenido a Sumee App! Tu registro ha sido recibido exitosamente. Revisa tu correo electrónico para confirmar tu cuenta. Estamos expandiendo nuestro servicio y te notificaremos cuando estemos disponibles en tu ciudad.";

        setSuccess(successMessage);

        // Redirigir después de 3 segundos
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      } else {

        setError(
          "El usuario se creó pero no se recibió confirmación. Por favor, verifica tu correo electrónico."
        );
      }
    } catch (err) {
      // En caso de error, mostrarlo al usuario

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Hubo un problema al procesar tu registro. Por favor, inténtalo de nuevo.";
      setError(errorMessage);
    } finally {
      // Al finalizar, establecer el estado de carga (loading) a false
      setLoading(false);
    }
  };

  const toggleWorkZone = (zone: string) => {
    setFormData((prev) => ({
      ...prev,
      workZones: prev.workZones?.includes(zone)
        ? prev.workZones.filter((z) => z !== zone)
        : [...(prev.workZones || []), zone],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-20 md:pt-24 pb-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Hero Section Compacto con Imagen Full Width */}
        <div className="mb-8">
          {/* Imagen Full Width */}
          <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden shadow-xl mb-6">
            <Image
              src="/images/banners/join-as-pro-worker.jpg"
              alt="Profesionales trabajando - Únete a Sumee App"
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            {/* Overlay para legibilidad del texto */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20" />

            {/* Contenido sobre la imagen - Posicionado abajo a la izquierda */}
            <div className="absolute inset-0 flex flex-col justify-end items-start p-4 md:p-6 lg:p-8 text-white">
              <div className="w-full max-w-md md:max-w-lg">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs md:text-sm font-semibold mb-3">
                  <FontAwesomeIcon icon={faBriefcase} />
                  <span>Para Profesionales</span>
                </div>
                <p className="text-sm md:text-base text-white/95 max-w-md leading-relaxed mb-3 drop-shadow-lg">
                  Conecta con clientes verificados y haz crecer tu negocio. Disponible en toda México.
                </p>

                {/* Beneficios compactos */}
                <div className="flex flex-wrap gap-2 md:gap-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs md:text-sm">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-300" />
                    <span>Registro gratuito</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs md:text-sm">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-blue-300" />
                    <span>Clientes verificados</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs md:text-sm">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-purple-300" />
                    <span>Pago seguro</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre Completo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FontAwesomeIcon icon={faUser} className="mr-2 text-blue-600" />
                Nombre Completo
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                placeholder="Ej: Juan Pérez"
                className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${validationErrors.fullName
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300"
                  }`}
              />
              {validationErrors.fullName && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="mr-1"
                  />
                  {validationErrors.fullName}
                </p>
              )}
            </div>

            {/* Profesión */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FontAwesomeIcon
                  icon={faBriefcase}
                  className="mr-2 text-blue-600"
                />
                Profesión
              </label>
              <select
                value={formData.profession}
                onChange={(e) => handleChange("profession", e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${validationErrors.profession
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300"
                  }`}
              >
                <option value="">Selecciona tu profesión</option>
                {PROFESSIONAL_PROFESSIONS.map((prof) => (
                  <option key={prof} value={prof}>
                    {prof}
                  </option>
                ))}
              </select>
              {validationErrors.profession && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="mr-1"
                  />
                  {validationErrors.profession}
                </p>
              )}
            </div>

            {/* Años de Experiencia */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FontAwesomeIcon
                  icon={faBriefcase}
                  className="mr-2 text-purple-600"
                />
                Años de Experiencia
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={formData.experience || ""}
                onChange={(e) => {
                  const value = e.target.value === "" ? undefined : parseInt(e.target.value, 10);
                  handleChange("experience", value as any);
                }}
                placeholder="Ej: 5"
                className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${validationErrors.experience
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300"
                  }`}
              />
              <p className="mt-1 text-xs text-gray-500">
                Indica cuántos años de experiencia tienes en tu profesión
              </p>
              {validationErrors.experience && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="mr-1"
                  />
                  {validationErrors.experience}
                </p>
              )}
            </div>

            {/* Áreas de Servicio (Especialidades) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="mr-2 text-indigo-600"
                />
                Áreas de Servicio (Especialidades)
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Selecciona todas las áreas en las que trabajas. Se seleccionaron automáticamente según tu profesión.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                {SERVICE_AREAS.map((area) => {
                  const isSelected = formData.areas_servicio?.includes(area) || false;
                  return (
                    <label
                      key={area}
                      className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all ${isSelected
                        ? "bg-indigo-100 border-2 border-indigo-500 text-indigo-900"
                        : "bg-white border-2 border-gray-200 hover:border-indigo-300 text-gray-700"
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const currentAreas = formData.areas_servicio || [];
                          if (e.target.checked) {
                            handleChange("areas_servicio", [...currentAreas, area]);
                          } else {
                            handleChange(
                              "areas_servicio",
                              currentAreas.filter((a) => a !== area)
                            );
                          }
                        }}
                        className="sr-only"
                      />
                      <span className="text-xs font-medium">{area}</span>
                      {isSelected && (
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="text-indigo-600 text-xs"
                        />
                      )}
                    </label>
                  );
                })}
              </div>
              {formData.areas_servicio && formData.areas_servicio.length > 0 && (
                <p className="mt-2 text-xs text-indigo-600 font-medium">
                  {formData.areas_servicio.length} área{formData.areas_servicio.length !== 1 ? "s" : ""} seleccionada{formData.areas_servicio.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FontAwesomeIcon
                  icon={faPhone}
                  className="mr-2 text-green-600"
                />
                Teléfono/WhatsApp
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+52 55 1234 5678"
                className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${validationErrors.phone
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300"
                  }`}
              />
              {validationErrors.phone && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="mr-1"
                  />
                  {validationErrors.phone}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="mr-2 text-blue-600"
                />
                Correo Electrónico
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="tu-email@ejemplo.com"
                className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${validationErrors.email
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300"
                  }`}
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="mr-1"
                  />
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FontAwesomeIcon icon={faLock} className="mr-2 text-blue-600" />
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className={`w-full px-4 py-3 pr-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${validationErrors.password
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Debe contener al menos una mayúscula, una minúscula y un número
              </p>
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="mr-1"
                  />
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Ciudad Principal */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className="mr-2 text-green-600"
                />
                Tu Ciudad Principal *
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Actualmente operamos en Ciudad de México. Si vives en otra
                ciudad, te agregaremos a nuestra lista de espera y te
                notificaremos cuando expandamos a tu área.
              </p>
              <select
                value={
                  formData.city === "Otra" ||
                    (formData.city && formData.city !== "Ciudad de México")
                    ? "Otra"
                    : formData.city || ""
                }
                onChange={(e) => {
                  const selectedValue = e.target.value;
                  if (selectedValue === "Otra") {
                    handleChange("city", "Otra");
                    setOtherCityInput(""); // Limpiar el input cuando se selecciona "Otra"
                  } else {
                    handleChange("city", selectedValue);
                    setOtherCityInput(""); // Limpiar cuando se selecciona CDMX
                  }
                }}
                className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${validationErrors.city
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300"
                  }`}
              >
                <option value="">Selecciona tu ciudad</option>
                <option value="Ciudad de México">Ciudad de México</option>
                <option value="Otra">Otra ciudad</option>
              </select>
              {validationErrors.city && formData.city !== "Otra" && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="mr-1"
                  />
                  {validationErrors.city}
                </p>
              )}
            </div>

            {/* Zonas de Trabajo - Condicional según ciudad */}
            {formData.city === "Ciudad de México" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    className="mr-2 text-green-600"
                  />
                  Alcaldías donde Trabajas (Opcional)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {WORK_ZONES.map((zone) => (
                    <button
                      key={zone}
                      type="button"
                      onClick={() => toggleWorkZone(zone)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-all duration-200 ${formData.workZones?.includes(zone)
                        ? "bg-blue-50 border-blue-300 text-blue-700 shadow-sm"
                        : "bg-white border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                        }`}
                    >
                      {zone}
                    </button>
                  ))}
                </div>
                {formData.workZones && formData.workZones.length > 0 && (
                  <p className="mt-2 text-sm text-green-600">
                    <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                    {formData.workZones.length} alcaldía
                    {formData.workZones.length > 1 ? "s" : ""} seleccionada
                    {formData.workZones.length > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            )}

            {/* Campos para otras ciudades */}
            {(formData.city === "Otra" ||
              (formData.city && formData.city !== "Ciudad de México")) && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="mr-2 text-green-600"
                      />
                      Escribe tu Ciudad *
                    </label>
                    <input
                      type="text"
                      value={
                        formData.city === "Otra" ? otherCityInput : formData.city
                      }
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        setOtherCityInput(inputValue);
                        clearLocationErrorState();

                        if (!location.hasCustom) {
                          setAddressInput(inputValue);
                          setLocation((prev) => ({
                            ...prev,
                            address: inputValue,
                          }));
                        }

                        // Cuando el usuario escribe, actualizar city directamente con el valor
                        if (inputValue.trim()) {
                          handleChange("city", inputValue.trim());
                        } else {
                          // Si borra todo, volver a "Otra"
                          handleChange("city", "Otra");
                        }
                      }}
                      onBlur={(e) => {
                        const inputValue = e.target.value.trim();
                        // Si el campo queda vacío al perder el foco, volver a "Otra"
                        if (!inputValue) {
                          handleChange("city", "Otra");
                          setOtherCityInput("");
                        }
                      }}
                      placeholder="Ej: Monterrey, Guadalajara, Puebla..."
                      className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${validationErrors.city
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300"
                        }`}
                    />
                    {validationErrors.city &&
                      (formData.city === "Otra" || !formData.city) && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <FontAwesomeIcon
                            icon={faExclamationTriangle}
                            className="mr-1"
                          />
                          {validationErrors.city}
                        </p>
                      )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="mr-2 text-green-600"
                      />
                      Zonas de Trabajo Principales (Opcional)
                    </label>
                    <textarea
                      value={formData.work_zones_other || ""}
                      onChange={(e) =>
                        handleChange("work_zones_other", e.target.value)
                      }
                      placeholder="Ej: Centro, Zona Norte, Fraccionamiento ABC..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Indica las colonias, municipios o zonas donde ofreces tus
                      servicios
                    </p>
                  </div>
                </div>
              )}

            {/* Ubicación precisa */}
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FontAwesomeIcon
                      icon={faMapLocationDot}
                      className="text-indigo-600"
                    />
                    Confirma tu ubicación en el mapa *
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Usa tu GPS o ajusta el pin para que podamos recomendarte
                    clientes cercanos, igual que en apps tipo Uber o Didi.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleUseGPS}
                    disabled={locationStatus === "loading"}
                    className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${locationStatus === "loading"
                      ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                      : "border-indigo-200 bg-white text-indigo-700 hover:border-indigo-300 hover:text-indigo-800"
                      }`}
                  >
                    <FontAwesomeIcon icon={faLocationCrosshairs} />
                    Usar mi GPS
                  </button>
                  <button
                    type="button"
                    onClick={handleResetLocation}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-800"
                  >
                    <FontAwesomeIcon icon={faRotateRight} />
                    Restablecer
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={addressInput}
                    onChange={(e) => {
                      setAddressInput(e.target.value);
                      setLocationStatus("idle");
                      setLocationError(null);
                      clearLocationErrorState();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSearchAddress();
                      }
                    }}
                    placeholder="Ej. Calle, número, colonia y ciudad"
                    className="w-full rounded-lg border border-indigo-200 px-4 py-3 pr-32 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                  <button
                    type="button"
                    onClick={handleSearchAddress}
                    disabled={locationStatus === "loading"}
                    className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                  >
                    {locationStatus === "loading" ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin />
                        Buscando...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faMapLocationDot} />
                        Buscar
                      </>
                    )}
                  </button>
                </div>

                {locationStatus === "success" && !locationError && (
                  <p className="flex items-center gap-2 text-xs font-medium text-emerald-600">
                    <FontAwesomeIcon icon={faCheck} />
                    Ubicación actualizada
                  </p>
                )}

                {locationError && (
                  <p className="flex items-center gap-2 text-sm text-red-600">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    {locationError}
                  </p>
                )}

                <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-indigo-100 bg-white">
                  <ProfessionalLocationMap
                    lat={location.lat}
                    lng={location.lng}
                    onChange={handleMapLocationChange}
                    onReady={() => setIsMapReady(true)}
                  />
                  {!isMapReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 text-sm text-gray-500">
                      <FontAwesomeIcon
                        icon={faSpinner}
                        className="mr-2 animate-spin"
                      />
                      Preparando mapa...
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                  <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1.5 font-medium">
                    <FontAwesomeIcon icon={faLocationDot} className="text-indigo-500" />
                    {location.address || "Selecciona tu ubicación"}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1.5">
                    Lat {location.lat.toFixed(5)}, Lng {location.lng.toFixed(5)}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1.5 capitalize">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500" />
                    {location.source === "gps"
                      ? "Tomado con GPS"
                      : location.source === "search"
                        ? "Dirección buscada"
                        : location.source === "manual"
                          ? "Pin ajustado manualmente"
                          : "Ubicación base (CDMX)"}
                  </span>
                </div>

                {validationErrors.location && (
                  <p className="flex items-center gap-2 text-sm text-red-600">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    {validationErrors.location}
                  </p>
                )}
              </div>
            </div>

            {/* Biografía */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FontAwesomeIcon icon={faUser} className="mr-2 text-blue-600" />
                Breve Biografía (Opcional)
              </label>
              <textarea
                value={formData.bio || ""}
                onChange={(e) => handleChange("bio", e.target.value)}
                placeholder="Cuéntanos sobre tu experiencia y especialidades..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              />
              <p className="mt-1 text-xs text-gray-500">
                Esto aparecerá en tu perfil profesional
              </p>
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${loading
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl"
                }`}
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <span>Registrarse como Profesional</span>
                </>
              )}
            </button>
          </form>

          {/* Mensajes de error y éxito */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="text-red-600 mr-2"
                />
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="text-green-600 mr-2"
                />
                <p className="text-green-800 font-medium">{success}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sección de Testimonios (Prueba Social) */}
        <ProTestimonials />

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            ¿Ya tienes cuenta?{" "}
            <a
              href="/login"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Inicia sesión aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
