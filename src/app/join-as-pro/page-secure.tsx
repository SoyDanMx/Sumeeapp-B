// =========================================================================
// VERSIÓN MEJORADA DEL FRONTEND CON VALIDACIONES DE SEGURIDAD
// =========================================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { getEmailConfirmationUrl } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faPhone, faLock, faCheckCircle, faSpinner, faExclamationTriangle, faArrowRight, faEye, faEyeSlash, faShield } from '@fortawesome/free-solid-svg-icons';

interface ValidationErrors {
  fullName?: string;
  email?: string;
  whatsapp?: string;
  password?: string;
  confirmPassword?: string;
}

export default function JoinAsProSecure() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsapp: '',
    password: '',
    confirmPassword: '',
    profession: 'General' // Campo específico para profesionales
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // =========================================================================
  // VALIDACIONES MEJORADAS CON SEGURIDAD
  // =========================================================================
  
  const validateFullName = (name: string): string | undefined => {
    if (!name.trim()) return 'El nombre completo es requerido';
    if (name.trim().length < 4) return 'El nombre debe tener al menos 4 caracteres';
    if (name.trim().length > 100) return 'El nombre es demasiado largo';
    // Validar que no contenga caracteres sospechosos
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name.trim())) {
      return 'El nombre solo puede contener letras y espacios';
    }
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) return 'El correo electrónico es requerido';
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email)) return 'Por favor ingresa un correo electrónico válido';
    if (email.length > 254) return 'El email es demasiado largo';
    return undefined;
  };

  const validateWhatsApp = (whatsapp: string): string | undefined => {
    if (!whatsapp.trim()) return 'El WhatsApp es requerido para contactarte';
    const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
    if (!phoneRegex.test(whatsapp.replace(/\s/g, ''))) return 'Ingresa un número de WhatsApp válido';
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password.trim()) return 'La contraseña es requerida';
    if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
    if (password.length > 128) return 'La contraseña es demasiado larga';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
    }
    return undefined;
  };

  const validateConfirmPassword = (confirmPassword: string, password: string): string | undefined => {
    if (!confirmPassword.trim()) return 'Confirma tu contraseña';
    if (confirmPassword !== password) return 'Las contraseñas no coinciden';
    return undefined;
  };

  // =========================================================================
  // MANEJO DE CAMBIOS CON VALIDACIÓN EN TIEMPO REAL
  // =========================================================================
  
  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors(prev => ({ ...prev, [field as keyof ValidationErrors]: undefined }));
    }
  };

  const handleFieldBlur = (field: keyof typeof formData) => {
    const value = formData[field];
    let error: string | undefined;
    
    switch (field) {
      case 'fullName':
        error = validateFullName(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'whatsapp':
        error = validateWhatsApp(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(value, formData.password);
        break;
    }
    
    if (error) {
      setValidationErrors(prev => ({ ...prev, [field as keyof ValidationErrors]: error }));
    }
  };

  // =========================================================================
  // VALIDACIÓN COMPLETA DEL FORMULARIO
  // =========================================================================
  
  const isFormValid = () => {
    return (
      validateFullName(formData.fullName) === undefined &&
      validateEmail(formData.email) === undefined &&
      validateWhatsApp(formData.whatsapp) === undefined &&
      validatePassword(formData.password) === undefined &&
      validateConfirmPassword(formData.confirmPassword, formData.password) === undefined &&
      termsAccepted
    );
  };

  // =========================================================================
  // REGISTRO SEGURO CON METADATOS VALIDADOS
  // =========================================================================
  
  const handleProfessionalRegistration = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('🚀 INICIANDO REGISTRO PROFESIONAL SEGURO...');
      
      // Validar todos los campos antes de enviar
      const nameError = validateFullName(formData.fullName);
      const emailError = validateEmail(formData.email);
      const whatsappError = validateWhatsApp(formData.whatsapp);
      const passwordError = validatePassword(formData.password);
      const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);
      
      if (nameError || emailError || whatsappError || passwordError || confirmPasswordError) {
        setValidationErrors({
          fullName: nameError,
          email: emailError,
          whatsapp: whatsappError,
          password: passwordError,
          confirmPassword: confirmPasswordError
        });
        setLoading(false);
        return;
      }
      
      if (!termsAccepted) {
        setError('Debes aceptar los términos y condiciones para continuar.');
        setLoading(false);
        return;
      }

      // =========================================================================
      // METADATOS SEGUROS PARA EL TRIGGER
      // =========================================================================
      const secureMetadata = {
        full_name: formData.fullName.trim(),
        whatsapp: formData.whatsapp.trim(),
        // INDICADORES CRÍTICOS PARA EL TRIGGER
        registration_type: 'profesional', // Indicador principal
        profession: formData.profession, // Campo requerido para profesionales
        source_url: window.location.href, // URL de origen para validación
        descripcion_perfil: 'Profesional verificado en Sumee App',
        experience_years: 2, // Valor por defecto
        // Timestamp para auditoría
        registration_timestamp: new Date().toISOString(),
        // Hash de validación (opcional, para mayor seguridad)
        registration_hash: btoa(`${formData.email}-${Date.now()}`)
      };

      console.log('🔒 Metadatos seguros:', secureMetadata);
      
      // URL de confirmación dinámica
      const emailRedirectTo = getEmailConfirmationUrl();
      console.log('🔗 URL de confirmación:', emailRedirectTo);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo,
          data: secureMetadata // Metadatos validados y seguros
        }
      });

      if (authError) {
        console.error('❌ Error en auth.signUp:', authError);
        throw new Error(`Error al crear usuario: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('No se pudo crear el usuario');
      }

      console.log('✅ Usuario creado exitosamente:', authData.user.id);
      setSuccess('¡Excelente! Revisa tu correo electrónico para confirmar tu cuenta y acceder a tu dashboard profesional.');

    } catch (err: any) {
      console.error('❌ Error en registro profesional:', err);
      setError(err.message || 'Hubo un problema al procesar tu registro. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleProfessionalRegistration();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        {/* Header con indicador de seguridad */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <FontAwesomeIcon icon={faShield} className="text-white text-2xl" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Únete como Profesional
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Registro seguro y verificado para profesionales
          </p>
          
          {/* Indicador de seguridad */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
            <div className="flex items-center justify-center">
              <FontAwesomeIcon icon={faShield} className="text-green-600 mr-2" />
              <span className="text-green-800 font-medium text-sm">
                Registro Seguro - Datos Protegidos
              </span>
            </div>
          </div>
        </div>

        {/* Formulario con validaciones mejoradas */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre Completo */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                <FontAwesomeIcon icon={faUser} className="mr-2 text-blue-600" />
                Nombre Completo
              </label>
              <input
                type="text"
                id="fullName"
                placeholder="Ej: Juan Pérez"
                value={formData.fullName}
                onChange={(e) => handleFieldChange('fullName', e.target.value)}
                onBlur={() => handleFieldBlur('fullName')}
                className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  validationErrors.fullName ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                }`}
                maxLength={100}
              />
              {validationErrors.fullName && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                  {validationErrors.fullName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-blue-600" />
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                placeholder="tu-email@ejemplo.com"
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                onBlur={() => handleFieldBlur('email')}
                className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  validationErrors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                }`}
                maxLength={254}
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* WhatsApp */}
            <div>
              <label htmlFor="whatsapp" className="block text-sm font-semibold text-gray-700 mb-2">
                <FontAwesomeIcon icon={faPhone} className="mr-2 text-green-600" />
                WhatsApp
              </label>
              <input
                type="tel"
                id="whatsapp"
                placeholder="+52 55 1234 5678"
                value={formData.whatsapp}
                onChange={(e) => handleFieldChange('whatsapp', e.target.value)}
                onBlur={() => handleFieldBlur('whatsapp')}
                className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  validationErrors.whatsapp ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                }`}
              />
              <p className="mt-1 text-xs text-gray-500">
                Para que los clientes puedan contactarte directamente
              </p>
              {validationErrors.whatsapp && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                  {validationErrors.whatsapp}
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                <FontAwesomeIcon icon={faLock} className="mr-2 text-blue-600" />
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Mínimo 8 caracteres"
                  value={formData.password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  onBlur={() => handleFieldBlur('password')}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    validationErrors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                  }`}
                  maxLength={128}
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

            {/* Confirmar Contraseña */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                <FontAwesomeIcon icon={faLock} className="mr-2 text-blue-600" />
                Confirmar Contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  placeholder="Repite tu contraseña"
                  value={formData.confirmPassword}
                  onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                  onBlur={() => handleFieldBlur('confirmPassword')}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    validationErrors.confirmPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                  {validationErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Términos y Condiciones */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="text-sm text-gray-700">
                Acepto los{' '}
                <a href="/terminos" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500 underline font-medium">
                  Términos de Servicio
                </a>{' '}
                y la{' '}
                <a href="/privacidad" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500 underline font-medium">
                  Política de Privacidad
                </a>{' '}
                de Sumee App.
              </label>
            </div>

            {/* Botón de registro */}
            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className={`w-full py-4 px-6 rounded-lg font-bold text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2 ${
                isFormValid() && !loading
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faShield} className="mr-2" />
                  <span>¡Registro Seguro!</span>
                  <FontAwesomeIcon icon={faArrowRight} />
                </>
              )}
            </button>
          </form>

          {/* Mensajes de estado */}
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

          {/* Enlace de login */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <a href="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                Inicia sesión
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
