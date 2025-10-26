// src/components/Hero.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faMapMarkerAlt, faSpinner, faLocationDot, faCheckCircle, faExclamationTriangle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentPostalCode, isValidMexicanPostalCode, formatPostalCode, type LocationResult, type GeolocationError } from '@/lib/location';

export const Hero = () => {
  const [postalCode, setPostalCode] = useState('');
  const [isPostalCodeValid, setIsPostalCodeValid] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isUsingCurrentLocation, setIsUsingCurrentLocation] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [imageError, setImageError] = useState(false);
  const [locationResult, setLocationResult] = useState<LocationResult | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showLocationDetails, setShowLocationDetails] = useState(false);
  const router = useRouter();

  // Validación de código postal mexicano usando la función de location.ts
  const validatePostalCode = (code: string) => {
    return isValidMexicanPostalCode(code);
  };

  useEffect(() => {
    const fetchUserAndMembership = async () => {
      setIsLoadingUser(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoadingUser(false);
    };

    fetchUserAndMembership();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Validar código postal cuando cambie
  useEffect(() => {
    setIsPostalCodeValid(validatePostalCode(postalCode));
  }, [postalCode]);

  const handlePostalCodeSubmit = async () => {
    if (!isPostalCodeValid) {
      alert('Por favor, ingresa un código postal válido de 5 dígitos.');
      return;
    }

    setIsLoadingUser(true);
    
    if (!user) {
      alert('Por favor, regístrate o inicia sesión para buscar servicios.');
      router.push('/login?redirect=/professionals');
    } else {
      const userMembershipStatus = user.user_metadata?.membership_s || 'free';
      
      if (userMembershipStatus === 'free') {
        alert('Necesitas una membresía premium para acceder a los técnicos.');
        router.push('/membresia');
      } else {
        router.push(`/professionals?cp=${encodeURIComponent(postalCode)}`);
      }
    }
    setIsLoadingUser(false);
  };

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = formatPostalCode(e.target.value);
    setPostalCode(value);
    // Limpiar errores de ubicación cuando el usuario escribe manualmente
    setLocationError(null);
    setLocationResult(null);
  };

  const handleUseCurrentLocation = async () => {
    setIsUsingCurrentLocation(true);
    setLocationError(null);
    setLocationResult(null);
    
    try {
      console.log('🚀 Iniciando geolocalización precisa...');
      console.log('🔧 API Key configurada:', !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
      
      // Usar la nueva función de geolocalización inversa precisa
      const result = await getCurrentPostalCode();
      
      console.log('📍 Resultado de geolocalización:', result);
      
      if (result.postalCode) {
        setPostalCode(result.postalCode);
        setLocationResult(result);
        setShowLocationDetails(true);
        console.log('✅ Código postal obtenido:', result.postalCode);
        console.log('🎯 Confianza:', result.confidence);
      } else {
        setLocationError('No pudimos determinar tu código postal. Por favor, ingrésalo manualmente.');
        console.warn('⚠️ No se pudo obtener código postal');
      }
    } catch (error) {
      console.error('❌ Error en geolocalización:', error);
      
      let errorMessage = 'Error al obtener tu ubicación. ';
      
      if (error instanceof Error) {
        if (error.message.includes('Permiso')) {
          errorMessage = 'Necesitamos permiso para acceder a tu ubicación. Por favor, permite el acceso y vuelve a intentar.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Tiempo de espera agotado. Verifica tu conexión a internet e intenta de nuevo.';
        } else if (error.message.includes('API')) {
          errorMessage = 'Error del servicio de ubicación. Por favor, ingresa tu código postal manualmente.';
        } else if (error.message.includes('not configured')) {
          errorMessage = 'Servicio de ubicación no configurado. Usando ubicación aproximada...';
          // Intentar con fallback
          try {
            const fallbackResult = await getCurrentPostalCode();
            if (fallbackResult.postalCode) {
              setPostalCode(fallbackResult.postalCode);
              setLocationResult(fallbackResult);
              setShowLocationDetails(true);
              console.log('✅ Fallback exitoso:', fallbackResult.postalCode);
              return;
            }
          } catch (fallbackError) {
            console.error('❌ Fallback también falló:', fallbackError);
          }
        } else {
          errorMessage += error.message;
        }
      }
      
      setLocationError(errorMessage);
    } finally {
      setIsUsingCurrentLocation(false);
    }
  };

  return (
    <section className="relative h-[500px] md:h-[600px] flex items-center bg-gradient-to-br from-blue-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-10"></div>
        {/* Imagen de fondo local */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/hero/professionals-hero.jpg')`
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-20">
        <div className="max-w-4xl text-white">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Técnicos Verificados<br />Para Tu Hogar
          </h1>
          <p className="text-lg sm:text-xl mb-8">
            Conectamos hogares mexicanos con los mejores profesionales. Respuesta en menos de 2 horas.
          </p>
          
          {/* Búsqueda por Código Postal */}
          <div className="bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-2xl border border-white/20">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400 text-lg" />
              </div>
              <input
                id="input-postal-code"
                type="text"
                inputMode="numeric"
                maxLength={5}
                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="03100"
                value={postalCode}
                onChange={handlePostalCodeChange}
              />
            </div>

            {/* Botón Usar mi Ubicación Actual */}
            <button 
              onClick={handleUseCurrentLocation}
              disabled={isUsingCurrentLocation}
              className="w-full mt-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-700 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center btn-primary-location"
            >
              <FontAwesomeIcon 
                icon={isUsingCurrentLocation ? faSpinner : faLocationDot} 
                className={`mr-2 ${isUsingCurrentLocation ? 'animate-spin' : ''}`} 
              />
              {isUsingCurrentLocation ? 'Detectando ubicación...' : 'Usar mi Ubicación Actual'}
            </button>

            {/* Detalles de Ubicación Detectada */}
            {locationResult && showLocationDetails && (
              <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Ubicación detectada correctamente
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {locationResult.neighborhood && `${locationResult.neighborhood}, `}
                        {locationResult.city && `${locationResult.city}, `}
                        {locationResult.state}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Código postal: {locationResult.postalCode}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowLocationDetails(false)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-sm" />
                  </button>
                </div>
              </div>
            )}

            {/* Error de Ubicación */}
            {locationError && (
              <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Error al detectar ubicación
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      {locationError}
                    </p>
                    <button
                      onClick={() => setLocationError(null)}
                      className="text-xs text-red-600 hover:text-red-800 underline mt-1"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Validación visual */}
            {postalCode.length > 0 && (
              <div className="mt-2 text-sm">
                {isPostalCodeValid ? (
                  <span className="text-green-600 flex items-center">
                    <FontAwesomeIcon icon={faSearch} className="mr-1" />
                    CP válido - {postalCode}
                  </span>
                ) : (
                  <span className="text-red-600">
                    Ingresa 5 dígitos para continuar
                  </span>
                )}
              </div>
            )}

            {/* CTA Button */}
            <button 
              onClick={handlePostalCodeSubmit}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center"
              disabled={!isPostalCodeValid || isLoadingUser}
            >
              {isLoadingUser ? (
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
              ) : (
                'Encontrar mi técnico'
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}