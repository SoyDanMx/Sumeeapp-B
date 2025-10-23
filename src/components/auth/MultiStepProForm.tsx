'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { getEmailConfirmationUrl } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faLock, 
  faPhone, 
  faMapMarkerAlt, 
  faBriefcase,
  faArrowRight, 
  faArrowLeft,
  faCheckCircle,
  faSpinner,
  faExclamationTriangle,
  faEye,
  faEyeSlash
} from '@fortawesome/free-solid-svg-icons';

interface FormData {
  // Paso 1: Captura de Lead
  profession: string;
  workZones: string[];
  
  // Paso 2: Creación de Cuenta
  fullName: string;
  email: string;
  password: string;
  
  // Paso 3: Completar Perfil
  phone: string;
  bio: string;
}

interface ValidationErrors {
  profession?: string;
  workZones?: string;
  fullName?: string;
  email?: string;
  password?: string;
  phone?: string;
}

const PROFESSIONS = [
  'Electricista',
  'Plomero',
  'Carpintero',
  'Pintor',
  'Albañil',
  'Técnico en Refrigeración',
  'Técnico en Aire Acondicionado',
  'Soldador',
  'Herrero',
  'Técnico en Seguridad',
  'Instalador de Pisos',
  'Técnico en Gas',
  'Otro'
];

const WORK_ZONES = [
  'Álvaro Obregón',
  'Azcapotzalco',
  'Benito Juárez',
  'Coyoacán',
  'Cuajimalpa',
  'Cuauhtémoc',
  'Gustavo A. Madero',
  'Iztacalco',
  'Iztapalapa',
  'La Magdalena Contreras',
  'Miguel Hidalgo',
  'Milpa Alta',
  'Tláhuac',
  'Tlalpan',
  'Venustiano Carranza',
  'Xochimilco'
];

export default function MultiStepProForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    profession: '',
    workZones: [],
    fullName: '',
    email: '',
    password: '',
    phone: '',
    bio: ''
  });

  const validateStep1 = (): boolean => {
    const errors: ValidationErrors = {};
    
    if (!formData.profession.trim()) {
      errors.profession = 'Selecciona tu profesión principal';
    }
    
    if (formData.workZones.length === 0) {
      errors.workZones = 'Selecciona al menos una zona de trabajo';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: ValidationErrors = {};
    
    if (!formData.fullName.trim()) {
      errors.fullName = 'El nombre completo es requerido';
    } else if (formData.fullName.trim().length < 4) {
      errors.fullName = 'El nombre debe tener al menos 4 caracteres';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'El correo electrónico es requerido';
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
      errors.email = 'Por favor ingresa un correo electrónico válido';
    }
    
    if (!formData.password.trim()) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const errors: ValidationErrors = {};
    
    if (!formData.phone.trim()) {
      errors.phone = 'El teléfono es requerido para contactarte';
    } else if (!/^[0-9+\-\s()]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Ingresa un número de teléfono válido';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('🚀 INICIANDO REGISTRO PROFESIONAL MULTI-PASO...');
      console.log('📋 Datos del formulario:', {
        profession: formData.profession,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        workZones: formData.workZones,
        bio: formData.bio
      });
      
      // Construir URL de redirección dinámicamente
      const emailRedirectTo = getEmailConfirmationUrl();
      console.log('🔗 URL de redirección:', emailRedirectTo);
      
      // Preparar datos para enviar a Supabase
      const userMetadata = {
        full_name: formData.fullName,
        whatsapp: formData.phone,
        registration_type: 'profesional',
        profession: formData.profession,
        work_zones: formData.workZones,
        bio: formData.bio,
        descripcion_perfil: `Profesional verificado en Sumee App - ${formData.profession}`,
        source_url: window.location.href // Para debugging en el trigger
      };
      
      console.log('📤 Enviando datos de registro:', userMetadata);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo,
          data: userMetadata
        }
      });

      console.log('📥 Respuesta de Supabase:', { authData, authError });

      if (authError) {
        console.error('❌ Error de autenticación:', authError);
        throw new Error(`Error al crear usuario: ${authError.message}`);
      }

      if (authData.user) {
        console.log('✅ Usuario creado exitosamente:', authData.user.id);
        setSuccess('¡Excelente! Revisa tu correo electrónico para confirmar tu cuenta y acceder a tu dashboard profesional.');
        
        // Redirigir después de 3 segundos
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      }
    } catch (err: any) {
      console.error('❌ Error en registro profesional:', err);
      setError(err.message || 'Hubo un problema al procesar tu registro. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar errores de validación cuando el usuario empiece a escribir
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleWorkZone = (zone: string) => {
    setFormData(prev => ({
      ...prev,
      workZones: prev.workZones.includes(zone)
        ? prev.workZones.filter(z => z !== zone)
        : [...prev.workZones, zone]
    }));
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Cuéntanos sobre tu profesión';
      case 2: return 'Crea tu cuenta';
      case 3: return 'Completa tu perfil';
      default: return '';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1: return 'Esto nos ayuda a conectarte con los clientes correctos';
      case 2: return 'Información básica para tu cuenta profesional';
      case 3: return 'Información adicional para mejorar tu perfil';
      default: return '';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600">
            Paso {currentStep} de 3
          </span>
          <span className="text-sm font-medium text-blue-600">
            {Math.round((currentStep / 3) * 100)}% Completado
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Header */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {getStepTitle()}
        </h3>
        <p className="text-gray-600">
          {getStepDescription()}
        </p>
      </div>

      {/* Step 1: Captura de Lead */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <FontAwesomeIcon icon={faBriefcase} className="mr-2 text-blue-600" />
              ¿Cuál es tu profesión principal?
            </label>
            <select
              value={formData.profession}
              onChange={(e) => updateFormData('profession', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                validationErrors.profession ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Selecciona tu profesión</option>
              {PROFESSIONS.map(prof => (
                <option key={prof} value={prof}>{prof}</option>
              ))}
            </select>
            {validationErrors.profession && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                {validationErrors.profession}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-green-600" />
              ¿En qué zonas trabajas? (Selecciona todas las que apliquen)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {WORK_ZONES.map(zone => (
                <button
                  key={zone}
                  type="button"
                  onClick={() => toggleWorkZone(zone)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                    formData.workZones.includes(zone)
                      ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {zone}
                </button>
              ))}
            </div>
            {validationErrors.workZones && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                {validationErrors.workZones}
              </p>
            )}
            {formData.workZones.length > 0 && (
              <p className="mt-2 text-sm text-green-600">
                <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                {formData.workZones.length} zona{formData.workZones.length > 1 ? 's' : ''} seleccionada{formData.workZones.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Creación de Cuenta */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FontAwesomeIcon icon={faUser} className="mr-2 text-blue-600" />
              Nombre Completo
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => updateFormData('fullName', e.target.value)}
              placeholder="Ej: Juan Pérez"
              className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                validationErrors.fullName ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.fullName && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                {validationErrors.fullName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-blue-600" />
              Correo Electrónico
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData('email', e.target.value)}
              placeholder="tu-email@ejemplo.com"
              className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                validationErrors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                {validationErrors.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FontAwesomeIcon icon={faLock} className="mr-2 text-blue-600" />
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => updateFormData('password', e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className={`w-full px-4 py-3 pr-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  validationErrors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
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
                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                {validationErrors.password}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Completar Perfil */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FontAwesomeIcon icon={faPhone} className="mr-2 text-green-600" />
              Teléfono/WhatsApp
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => updateFormData('phone', e.target.value)}
              placeholder="+52 55 1234 5678"
              className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                validationErrors.phone ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
              }`}
            />
            <p className="mt-1 text-xs text-gray-500">
              Para que los clientes puedan contactarte directamente
            </p>
            {validationErrors.phone && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                {validationErrors.phone}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FontAwesomeIcon icon={faUser} className="mr-2 text-blue-600" />
              Breve Biografía (Opcional)
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => updateFormData('bio', e.target.value)}
              placeholder="Cuéntanos sobre tu experiencia y especialidades..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              Esto aparecerá en tu perfil profesional
            </p>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
            currentStep === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Anterior</span>
        </button>

        {currentStep < 3 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <span>Siguiente</span>
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
              loading
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl'
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
                <span>Finalizar Registro</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 mr-2" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 mr-2" />
            <p className="text-green-800 font-medium">{success}</p>
          </div>
        </div>
      )}
    </div>
  );
}
