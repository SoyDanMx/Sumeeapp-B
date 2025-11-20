'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faLock, 
  faSpinner, 
  faEye, 
  faEyeSlash, 
  faCheckCircle,
  faPhone,
  faMapMarkerAlt,
  faLocationArrow,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabase/client';
import { normalizeWhatsappNumber, formatWhatsappForDisplay } from '@/lib/utils';

export default function ClientRegistrationForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    whatsapp: ''
  });
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [whatsappError, setWhatsappError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // Capturar ubicación automáticamente al montar el componente
  useEffect(() => {
    const getLocation = async () => {
      if (!navigator.geolocation) {
        setLocationError('Tu navegador no soporta geolocalización');
        return;
      }

      setIsGettingLocation(true);
      setLocationError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          setLocationError('No pudimos obtener tu ubicación. Por favor, permite el acceso a la ubicación en tu navegador.');
          setIsGettingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    };

    getLocation();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'whatsapp') {
      // Solo permitir números
      const digits = value.replace(/\D/g, '');
      // Limitar a 10 dígitos
      const limited = digits.slice(0, 10);
      
      setFormData(prev => ({
        ...prev,
        [name]: limited
      }));
      
      // Validar en tiempo real
      if (limited.length > 0) {
        const { isValid } = normalizeWhatsappNumber(limited);
        if (!isValid && limited.length === 10) {
          setWhatsappError('Número inválido. Debe tener 10 dígitos (ej: 55 1234 5678)');
        } else {
          setWhatsappError(null);
        }
      } else {
        setWhatsappError(null);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (error) setError(null);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Tu navegador no soporta geolocalización');
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        setLocationError('No pudimos obtener tu ubicación. Por favor, permite el acceso a la ubicación en tu navegador.');
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('El nombre completo es requerido');
      return false;
    }
    if (!formData.email.trim()) {
      setError('El correo electrónico es requerido');
      return false;
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    
    // Validar WhatsApp
    const { normalized, isValid } = normalizeWhatsappNumber(formData.whatsapp);
    if (!isValid || !formData.whatsapp) {
      setWhatsappError('El número de WhatsApp es requerido y debe tener 10 dígitos (ej: 55 1234 5678)');
      setError('Por favor, completa todos los campos requeridos');
      return false;
    }
    
    // Validar ubicación
    if (!location) {
      setLocationError('La ubicación es requerida para poder asignarte técnicos cercanos');
      setError('Por favor, permite el acceso a tu ubicación o intenta nuevamente');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Normalizar WhatsApp
      const { normalized: normalizedWhatsapp, isValid: whatsappValid } = normalizeWhatsappNumber(formData.whatsapp);
      
      if (!whatsappValid || !location) {
        setError('Por favor, completa todos los campos requeridos');
        setLoading(false);
        return;
      }

      // Registrar usuario con role 'client' y datos completos
      // IMPORTANTE: WhatsApp y ubicación son OBLIGATORIOS para clientes
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: 'client', // Asegurar que se registre como cliente
            registration_type: 'client', // Tipo de registro explícito
            plan: 'express_free', // Plan Express gratuito por defecto
            whatsapp: normalizedWhatsapp, // WhatsApp normalizado (OBLIGATORIO)
            ubicacion_lat: location.lat.toString(), // Latitud (OBLIGATORIO)
            ubicacion_lng: location.lng.toString(), // Longitud (OBLIGATORIO)
            phone: normalizedWhatsapp, // También guardar como phone para compatibilidad
            city: 'Ciudad de México' // Ciudad por defecto (se puede mejorar con reverse geocoding)
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (data.user) {
        setSuccess(true);
        // Redirigir a página de confirmación o pago de servicios
        setTimeout(() => {
          router.push('/pago-de-servicios');
        }, 2000);
      }

    } catch (error: any) {
      console.error('Error en registro:', error);
      
      let errorMessage = 'Error al crear la cuenta. ';
      
      // Manejar errores específicos del trigger
      if (error.message?.includes('CLIENT_REQUIRES_WHATSAPP')) {
        setWhatsappError('El número de WhatsApp es obligatorio y debe tener 10 dígitos');
        errorMessage = 'Por favor, proporciona un número de WhatsApp válido (10 dígitos)';
      } else if (error.message?.includes('CLIENT_REQUIRES_LOCATION')) {
        setLocationError('La ubicación es obligatoria para poder asignarte técnicos cercanos');
        errorMessage = 'Por favor, permite el acceso a tu ubicación o intenta nuevamente';
      } else if (error.message?.includes('User already registered')) {
        errorMessage = 'Este correo electrónico ya está registrado. ';
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = 'El formato del correo electrónico es inválido. ';
      } else if (error.message?.includes('Password')) {
        errorMessage = 'La contraseña debe tener al menos 6 caracteres. ';
      } else {
        errorMessage += error.message || 'Por favor, verifica que todos los campos estén completos';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FontAwesomeIcon icon={faCheckCircle} className="text-3xl text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          ¡Registro Exitoso!
        </h3>
        <p className="text-gray-600 mb-4">
          Te hemos enviado un enlace de confirmación a tu correo electrónico.
        </p>
        <p className="text-sm text-gray-500">
          Redirigiendo a la página de membresía...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nombre Completo */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
          Nombre Completo
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={faUser} className="text-gray-400" />
          </div>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            value={formData.fullName}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Tu nombre completo"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Correo Electrónico
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="tu@email.com"
          />
        </div>
      </div>

      {/* Contraseña */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Contraseña
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={faLock} className="text-gray-400" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Mínimo 6 caracteres"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <FontAwesomeIcon 
              icon={showPassword ? faEyeSlash : faEye} 
              className="text-gray-400 hover:text-gray-600" 
            />
          </button>
        </div>
      </div>

      {/* Confirmar Contraseña */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Confirmar Contraseña
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={faLock} className="text-gray-400" />
          </div>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Repite tu contraseña"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <FontAwesomeIcon 
              icon={showConfirmPassword ? faEyeSlash : faEye} 
              className="text-gray-400 hover:text-gray-600" 
            />
          </button>
        </div>
      </div>

      {/* WhatsApp - Campo Obligatorio */}
      <div>
        <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
          WhatsApp <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={faPhone} className="text-gray-400" />
          </div>
          <input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            required
            value={formData.whatsapp}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              whatsappError ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="55 1234 5678"
            maxLength={10}
          />
        </div>
        {whatsappError && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-xs" />
            {whatsappError}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Necesitamos tu WhatsApp para contactarte cuando solicites un servicio
        </p>
      </div>

      {/* Ubicación - Campo Obligatorio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ubicación <span className="text-red-500">*</span>
        </label>
        <div className={`border rounded-lg p-4 ${
          locationError ? 'border-red-300 bg-red-50' : location ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
        }`}>
          {isGettingLocation ? (
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faSpinner} spin className="text-blue-500" />
              <span className="text-sm text-gray-600">Obteniendo tu ubicación...</span>
            </div>
          ) : location ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Ubicación capturada</p>
                  <p className="text-xs text-gray-500">
                    Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleGetLocation}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Actualizar
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">No se pudo obtener tu ubicación</p>
                  {locationError && (
                    <p className="text-xs text-red-600 mt-1">{locationError}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleGetLocation}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FontAwesomeIcon icon={faLocationArrow} />
                Obtener Ubicación
              </button>
            </div>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Necesitamos tu ubicación para asignarte técnicos cercanos a tu zona
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center"
      >
        {loading ? (
          <>
            <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
            Creando cuenta...
          </>
        ) : (
          'Crear Cuenta de Cliente'
        )}
      </button>

      {/* Terms */}
      <p className="text-xs text-gray-500 text-center">
        Al registrarte, aceptas nuestros{' '}
        <Link href="/terminos" className="text-blue-600 hover:text-blue-700">
          Términos de Servicio
        </Link>
        {' '}y{' '}
        <Link href="/privacidad" className="text-blue-600 hover:text-blue-700">
          Política de Privacidad
        </Link>
      </p>
    </form>
  );
}
