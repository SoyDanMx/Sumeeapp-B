// src/components/Hero.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faMapMarkerAlt, faSpinner, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';

export const Hero = () => {
  const [postalCode, setPostalCode] = useState('');
  const [isPostalCodeValid, setIsPostalCodeValid] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isUsingCurrentLocation, setIsUsingCurrentLocation] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  // Validación de código postal mexicano (5 dígitos)
  const validatePostalCode = (code: string) => {
    const postalCodeRegex = /^\d{5}$/;
    return postalCodeRegex.test(code);
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
    const value = e.target.value.replace(/\D/g, ''); // Solo números
    if (value.length <= 5) {
      setPostalCode(value);
    }
  };

  const handleUseCurrentLocation = () => {
    setIsUsingCurrentLocation(true);
    
    // Simular solicitud de permiso de ubicación
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Simular que aceptó y usar CP de prueba
          setPostalCode('03100'); // CP de prueba para CDMX
          setIsUsingCurrentLocation(false);
        },
        (error) => {
          // Si no permite, usar CP de prueba de todas formas
          setPostalCode('03100');
          setIsUsingCurrentLocation(false);
        }
      );
    } else {
      // Fallback si no soporta geolocation
      setPostalCode('03100');
      setIsUsingCurrentLocation(false);
    }
  };

  return (
    <section className="relative h-[500px] md:h-[600px] flex items-center bg-gray-800">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent z-10"></div>
        <Image 
          src={imageError ? 
            "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" : 
            "https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          }
          alt="Profesionales de servicios para el hogar trabajando en CDMX"
          fill
          className="object-cover"
          priority
          onError={() => setImageError(true)}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-20">
        <div className="max-w-4xl text-white">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Plomeros, Electricistas y Más Verificados en CDMX
          </h1>
          <p className="text-lg sm:text-xl mb-8">
            Encuentra técnicos profesionales de confianza para tu hogar en Ciudad de México. 
            Servicios 100% verificados con garantía de satisfacción.
          </p>
          
          {/* Búsqueda por Código Postal */}
          <div className="bg-white p-6 rounded-xl shadow-2xl">
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
                placeholder="Ingresa tu Código Postal (CP) para buscar servicios en CDMX"
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
              {isUsingCurrentLocation ? 'Obteniendo ubicación...' : 'Usar mi Ubicación Actual'}
            </button>

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