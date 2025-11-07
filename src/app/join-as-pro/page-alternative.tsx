"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
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

export default function JoinAsProAlternative() {
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
  });

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

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Función principal de envío del formulario - SIN TRIGGERS
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log("🚀 INICIANDO REGISTRO PROFESIONAL (SIN TRIGGERS)...");
      console.log("📋 Datos del formulario:", formData);

      // PASO 1: Crear usuario en Supabase SIN metadatos que puedan activar triggers
      const emailRedirectTo = getEmailConfirmationUrl();
      console.log("🔗 URL de redirección:", emailRedirectTo);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo,
          // NO incluir data para evitar triggers
        },
      });

      console.log("📥 Respuesta de Supabase:", { authData, authError });

      if (authError) {
        console.error("❌ Error de autenticación:", authError);
        throw new Error(`Error al crear usuario: ${authError.message}`);
      }

      if (authData.user) {
        console.log("✅ Usuario creado exitosamente:", authData.user.id);

        // PASO 2: Crear perfil manualmente DESPUÉS de que el usuario se cree
        await createUserProfile(authData.user);

        setSuccess(
          "¡Excelente! Revisa tu correo electrónico para confirmar tu cuenta y acceder a tu dashboard profesional."
        );

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
    } catch (err: any) {
      console.error("❌ Error en registro profesional:", err);
      setError(
        err.message ||
          "Hubo un problema al procesar tu registro. Por favor, inténtalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  // Función para crear el perfil del usuario manualmente - SIN TRIGGERS
  const createUserProfile = async (user: any) => {
    try {
      console.log(
        "🔧 Creando perfil manualmente (SIN TRIGGERS) para usuario:",
        user.id
      );

      // Crear perfil completo en la tabla profiles
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .insert({
          user_id: user.id,
          full_name: formData.fullName,
          email: user.email,
          phone: formData.phone,
          profession: formData.profession,
          experience: 2,
          bio:
            formData.bio ||
            `Profesional verificado en Sumee App - ${formData.profession}`,
          work_zones: formData.workZones || [],
          whatsapp: formData.phone,
          descripcion_perfil:
            formData.bio ||
            `Profesional verificado en Sumee App - ${formData.profession}`,
          role: "profesional", // CRÍTICO: Asignar role de profesional
          membership_status: "free",
          status: "active",
          ubicacion_lat: null,
          ubicacion_lng: null,
          calificacion_promedio: 0,
          experiencia_uber: false,
          años_experiencia_uber: 0,
          areas_servicio: [formData.profession],
        })
        .select()
        .single();

      if (profileError) {
        console.error("❌ Error creando perfil:", profileError);
        throw new Error(`Error creando perfil: ${profileError.message}`);
      }

      console.log("✅ Perfil creado exitosamente:", profileData);
      console.log(
        "🎉 Usuario registrado como profesional con role:",
        profileData.role
      );
    } catch (err: any) {
      console.error("❌ Error en createUserProfile:", err);
      // No lanzar el error aquí para no interrumpir el flujo
      console.warn(
        "⚠️ El usuario se creó pero el perfil falló. Se puede crear manualmente después."
      );
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-28 md:pt-32 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Únete como Profesional
          </h1>
          <p className="text-xl text-gray-600">
            Conecta con clientes y haz crecer tu negocio
          </p>
          <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
            <p className="text-green-800 text-sm">
              <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
              <strong>Versión sin triggers:</strong> Registro optimizado para
              evitar errores de base de datos
            </p>
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

            {/* Zonas de Trabajo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className="mr-2 text-green-600"
                />
                Zonas de Trabajo (Opcional)
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
                  {formData.workZones.length} zona
                  {formData.workZones.length > 1 ? "s" : ""} seleccionada
                  {formData.workZones.length > 1 ? "s" : ""}
                </p>
              )}
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
