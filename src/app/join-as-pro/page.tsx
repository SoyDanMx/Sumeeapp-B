"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client-new";
import { getEmailConfirmationUrl } from "@/lib/utils";
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
  });

  // Estado local para el input de ciudad cuando se selecciona "Otra"
  const [otherCityInput, setOtherCityInput] = useState("");

  // Función genérica para actualizar el estado del formulario
  const handleChange = (
    field: keyof ProfesionalRegistrationData,
    value: string | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Limpiar errores de validación cuando el usuario empiece a escribir
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
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

    // Validar ciudad
    if (
      !formData.city ||
      formData.city.trim() === "" ||
      formData.city === "Otra"
    ) {
      errors.workZones =
        formData.city === "Otra"
          ? "Por favor escribe el nombre de tu ciudad"
          : "Por favor selecciona tu ciudad principal";
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
      // Añadir console.log para depuración en el navegador
      console.log("🚀 INICIANDO REGISTRO PROFESIONAL...");
      const sanitizedPhone = formData.phone.replace(/[^\\d+]/g, "");
      const normalizedPhone = sanitizedPhone || formData.phone.trim();

      console.log("📋 Datos del formulario:", {
        fullName: formData.fullName,
        profession: formData.profession,
        phone: formData.phone,
        phone_normalized: normalizedPhone,
        email: formData.email,
        registration_type: "profesional",
        city: formData.city,
        workZones: formData.workZones,
        work_zones_other: formData.work_zones_other,
        bio: formData.bio,
      });

      // Construir dinámicamente la URL redirectTo usando window.location.origin
      const emailRedirectTo = getEmailConfirmationUrl();
      console.log("🔗 URL de redirección:", emailRedirectTo);

      // Preparar datos para enviar a Supabase (con nuevos campos city y work_zones)
      // Determinar el valor real de city
      // Si city es "Otra", usar el valor de otherCityInput (lo que el usuario escribió)
      const realCity =
        formData.city === "Otra"
          ? otherCityInput.trim() || "Ciudad de México" // Si seleccionó "Otra", usar lo que escribió
          : formData.city || "Ciudad de México";

      const userMetadata: Record<string, any> = {
        full_name: formData.fullName?.trim() || "Nuevo Usuario",
        profession: formData.profession,
        city: realCity,
        bio: formData.bio || "",
        phone: normalizedPhone,
        whatsapp: normalizedPhone,
        phone_original: formData.phone,
        registration_type: "professional",
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

      console.log("📤 Enviando metadatos a Supabase:", userMetadata);

      // Realizar la llamada a supabase.auth.signUp()
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo,
          data: userMetadata,
        },
      });

      console.log("📥 Respuesta completa de Supabase:", {
        authData,
        authError,
        user: authData?.user,
        session: authData?.session,
      });

      // Manejar los casos de éxito y error de la llamada signUp
      if (authError) {
        console.error("❌ Error de autenticación:", authError);
        console.error("❌ Detalles del error:", {
          message: authError.message,
          status: authError.status,
          name: authError.name,
        });

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
        console.log("✅ Usuario creado exitosamente:", {
          id: authData.user.id,
          email: authData.user.email,
          email_confirmed: authData.user.email_confirmed_at,
          created_at: authData.user.created_at,
        });

        // El trigger se encarga automáticamente de crear el perfil
        console.log(
          "🔧 El trigger creará el perfil automáticamente con los metadatos enviados"
        );

        // Mensaje de éxito positivo e inclusivo para todas las ciudades
        const successMessage = realCity === "Ciudad de México"
          ? "¡Excelente! Revisa tu correo electrónico para confirmar tu cuenta y acceder a tu dashboard profesional."
          : "¡Bienvenido a Sumee App! Tu registro ha sido recibido exitosamente. Revisa tu correo electrónico para confirmar tu cuenta. Estamos expandiendo nuestro servicio y te notificaremos cuando estemos disponibles en tu ciudad.";
        
        setSuccess(successMessage);

        // Redirigir después de 3 segundos
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      } else {
        console.warn("⚠️ No se recibió información del usuario creado");
        setError(
          "El usuario se creó pero no se recibió confirmación. Por favor, verifica tu correo electrónico."
        );
      }
    } catch (err) {
      console.error("❌ Error en registro profesional:", err);
      console.error("❌ Stack trace:", err instanceof Error ? err.stack : 'No stack trace available');

      // En caso de error, mostrarlo al usuario
      const errorMessage = err instanceof Error 
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Únete como Profesional
          </h1>
          <p className="text-xl text-gray-600">
            Conecta con clientes y haz crecer tu negocio. Disponible en toda México.
          </p>
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
                className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  validationErrors.fullName
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
                className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  validationErrors.profession
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
                className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  validationErrors.phone
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
                className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  validationErrors.email
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
                  className={`w-full px-4 py-3 pr-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    validationErrors.password
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
                Actualmente operamos en Ciudad de México. Si vives en otra ciudad, 
                te agregaremos a nuestra lista de espera y te notificaremos cuando expandamos a tu área.
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
                className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  validationErrors.workZones
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300"
                }`}
              >
                <option value="">Selecciona tu ciudad</option>
                <option value="Ciudad de México">Ciudad de México</option>
                <option value="Otra">Otra ciudad</option>
              </select>
              {validationErrors.workZones && formData.city !== "Otra" && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="mr-1"
                  />
                  {validationErrors.workZones}
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
                      className={`p-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                        formData.workZones?.includes(zone)
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
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      validationErrors.workZones
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {validationErrors.workZones &&
                    (formData.city === "Otra" || !formData.city) && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <FontAwesomeIcon
                          icon={faExclamationTriangle}
                          className="mr-1"
                        />
                        {validationErrors.workZones}
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
              className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                loading
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
