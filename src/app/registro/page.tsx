// src/app/registro/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPhone, 
  faMapMarkerAlt, 
  faLocationArrow,
  faSpinner,
  faCheckCircle,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { normalizeWhatsappNumber } from '@/lib/utils';

function RegistroPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [whatsappError, setWhatsappError] = useState<string | null>(null);
  // Esta página es solo para registro de clientes
  // Profesionales se redirigen a /join-as-pro
  const userType = 'client';
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // 🆕 Leer parámetros para preservar el servicio seleccionado después del registro
  const redirectParam = searchParams?.get('redirect') || '/dashboard/client';
  const serviceParam = searchParams?.get('service');
  const disciplineParam = searchParams?.get('discipline');
  const descriptionParam = searchParams?.get('description');
  const stepParam = searchParams?.get('step');

  // Capturar ubicación automáticamente al montar
  useEffect(() => {
    if (!location) {
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
    }
  }, [userType, location]);

  const handleWhatsappChange = (value: string) => {
    // Solo permitir números
    const digits = value.replace(/\D/g, '');
    // Limitar a 10 dígitos
    const limited = digits.slice(0, 10);
    
    setWhatsapp(limited);
    
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
    if (!fullName.trim()) {
      setError('El nombre completo es requerido');
      return false;
    }
    if (!email.trim()) {
      setError('El correo electrónico es requerido');
      return false;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    // Validaciones obligatorias para clientes (WhatsApp y ubicación)
    const { normalized, isValid } = normalizeWhatsappNumber(whatsapp);
    if (!isValid || !whatsapp) {
      setWhatsappError('El número de WhatsApp es requerido y debe tener 10 dígitos (ej: 55 1234 5678)');
      setError('Por favor, completa todos los campos requeridos');
      return false;
    }
    
    if (!location) {
      setLocationError('La ubicación es requerida para poder asignarte técnicos cercanos');
      setError('Por favor, permite el acceso a tu ubicación o intenta nuevamente');
      return false;
    }
    
    return true;
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setWhatsappError(null);
    setLocationError(null);

    if (!validateForm()) {
      setLoading(false);
      return;
    }
    
    setLoading(true);

    try {
      // Normalizar WhatsApp (obligatorio para clientes)
      const { normalized: normalizedWhatsapp, isValid } = normalizeWhatsappNumber(whatsapp);
      if (!isValid || !location) {
        setError('Por favor, completa todos los campos requeridos');
        setLoading(false);
        return;
      }

      // Establecer cookie temporal para rastrear el tipo de registro
      document.cookie = `registration_type=client; path=/; max-age=3600; SameSite=Lax`;
      console.log(`🍪 Cookie establecida: registration_type=client`);

      // Preparar metadata para cliente (WhatsApp y ubicación OBLIGATORIOS)
      const metadata: any = {
        full_name: fullName,
        registration_type: 'client',
        role: 'client',
        whatsapp: normalizedWhatsapp,
        ubicacion_lat: location.lat.toString(),
        ubicacion_lng: location.lng.toString(),
        phone: normalizedWhatsapp,
        city: 'Ciudad de México',
        plan: 'express_free',
      };

      // 🆕 Construir URL de redirect para incluir en emailRedirectTo
      const emailRedirectUrl = redirectParam 
        ? `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectParam)}`
        : `${window.location.origin}/auth/callback`;
      
      // Crear la cuenta en Supabase Auth con el tipo de usuario
      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: emailRedirectUrl,
          data: metadata,
        },
      });

      if (error) {
        // Manejar errores específicos del trigger
        if (error.message?.includes('CLIENT_REQUIRES_WHATSAPP')) {
          setWhatsappError('El número de WhatsApp es obligatorio y debe tener 10 dígitos');
          setError('Por favor, proporciona un número de WhatsApp válido (10 dígitos)');
        } else if (error.message?.includes('CLIENT_REQUIRES_LOCATION')) {
          setLocationError('La ubicación es obligatoria para poder asignarte técnicos cercanos');
          setError('Por favor, permite el acceso a tu ubicación o intenta nuevamente');
        } else {
          throw error;
        }
        setLoading(false);
        return;
      }

      // 🆕 Preservar el redirect y parámetros del servicio después del registro
      // Guardar en localStorage para usarlo después de confirmar email y login
      const redirectData = {
        url: redirectParam,
        params: {
          service: serviceParam,
          discipline: disciplineParam,
          description: descriptionParam,
          step: stepParam,
        }
      };
      localStorage.setItem('pendingRedirect', JSON.stringify(redirectData));
      
      alert('¡Registro exitoso! Por favor, revisa tu correo para confirmar tu cuenta.');
      
      // Redirigir a login con los parámetros preservados
      const loginParams = new URLSearchParams();
      if (serviceParam) loginParams.set('service', serviceParam);
      if (disciplineParam) loginParams.set('discipline', disciplineParam);
      if (descriptionParam) loginParams.set('description', descriptionParam);
      if (stepParam) loginParams.set('step', stepParam);
      if (redirectParam) loginParams.set('redirect', redirectParam);
      
      router.push(`/login?${loginParams.toString()}`);

    } catch (error: any) {
      console.error('Error en registro:', error);
      setError(error.message || 'Ocurrió un error durante el registro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Logo de Sumee"
              width={150}
              height={40}
              className="mx-auto mb-4"
            />
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">Crea tu cuenta en Sumee</h2>
          <p className="text-gray-600 mt-2">
            Encuentra los mejores servicios para el hogar con profesionales verificados.
          </p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-6">
          {/* Selector de Tipo de Usuario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Tipo de Usuario</label>
            <div className="grid grid-cols-2 gap-3">
              <div
                className="p-3 rounded-lg border-2 border-blue-500 bg-blue-50 text-blue-700"
              >
                <div className="text-center">
                  <div className="text-lg font-semibold">Cliente</div>
                  <div className="text-xs text-gray-500">Buscar servicios</div>
                </div>
              </div>
              <Link
                href="/join-as-pro"
                className={`p-3 rounded-lg border-2 transition-colors text-center ${
                  'border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-semibold">Profesional</div>
                  <div className="text-xs text-gray-500">Ofrecer servicios</div>
                </div>
              </Link>
            </div>
          </div>

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="text-gray-900 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-gray-900 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-gray-900 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="text-gray-900 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 focus:border-blue-500"
            />
          </div>

          {/* Campos obligatorios para clientes */}
          {(
            <>
              {/* WhatsApp - Campo Obligatorio */}
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">
                  WhatsApp <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faPhone} className="text-gray-400" />
                  </div>
                  <input
                    id="whatsapp"
                    name="whatsapp"
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => handleWhatsappChange(e.target.value)}
                    className={`text-gray-900 block w-full pl-10 pr-4 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 focus:border-blue-500 ${
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
            </>
          )}
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
            >
              {loading ? 'Registrando...' : 'Registrarme como Cliente'}
            </button>
          </div>
        </form>

        {/* Información para profesionales */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">¿Eres Profesional?</h3>
          <p className="text-xs text-blue-800 mb-2">
            Únete como profesional y recibe trabajos verificados en CDMX y área metropolitana.
          </p>
          <Link
            href="/join-as-pro"
            className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            Registrarme como Profesional →
          </Link>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

// Wrapper con Suspense para useSearchParams
export default function RegistroPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <RegistroPageContent />
    </Suspense>
  );
}