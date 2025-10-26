// src/components/Hero.tsx
"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faMapMarkerAlt,
  faSpinner,
  faLocationDot,
  faCheckCircle,
  faExclamationTriangle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import {
  getCurrentPostalCode,
  isValidMexicanPostalCode,
  formatPostalCode,
  type LocationResult,
  type GeolocationError,
} from "@/lib/location";

export const Hero = () => {
  const [postalCode, setPostalCode] = useState("");
  const [isPostalCodeValid, setIsPostalCodeValid] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isUsingCurrentLocation, setIsUsingCurrentLocation] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [imageError, setImageError] = useState(false);
  const [locationResult, setLocationResult] = useState<LocationResult | null>(
    null
  );
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setIsLoadingUser(false);
    };

    fetchUserAndMembership();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setUser(session?.user ?? null);
      }
    );

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
      alert("Por favor, ingresa un código postal válido de 5 dígitos.");
      return;
    }

    setIsLoadingUser(true);

    if (!user) {
      alert("Por favor, regístrate o inicia sesión para buscar servicios.");
      router.push("/login?redirect=/professionals");
    } else {
      const userMembershipStatus = user.user_metadata?.membership_s || "free";

      if (userMembershipStatus === "free") {
        alert("Necesitas una membresía premium para acceder a los técnicos.");
        router.push("/membresia");
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
      console.log("🚀 Iniciando geolocalización precisa...");
      console.log(
        "🔧 API Key configurada:",
        !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      );

      // Usar la nueva función de geolocalización inversa precisa
      const result = await getCurrentPostalCode();

      console.log("📍 Resultado de geolocalización:", result);

      if (result.postalCode) {
        setPostalCode(result.postalCode);
        setLocationResult(result);
        setShowLocationDetails(true);
        console.log("✅ Código postal obtenido:", result.postalCode);
        console.log("🎯 Confianza:", result.confidence);
      } else {
        setLocationError(
          "No pudimos determinar tu código postal. Por favor, ingrésalo manualmente."
        );
        console.warn("⚠️ No se pudo obtener código postal");
      }
    } catch (error) {
      console.error("❌ Error en geolocalización:", error);

      let errorMessage = "Error al obtener tu ubicación. ";

      if (error instanceof Error) {
        if (error.message.includes("Permiso")) {
          errorMessage =
            "Necesitamos permiso para acceder a tu ubicación. Por favor, permite el acceso y vuelve a intentar.";
        } else if (error.message.includes("timeout")) {
          errorMessage =
            "Tiempo de espera agotado. Verifica tu conexión a internet e intenta de nuevo.";
        } else if (error.message.includes("API")) {
          errorMessage =
            "Error del servicio de ubicación. Por favor, ingresa tu código postal manualmente.";
        } else if (error.message.includes("not configured")) {
          errorMessage =
            "Servicio de ubicación no configurado. Usando ubicación aproximada...";
          // Intentar con fallback
          try {
            const fallbackResult = await getCurrentPostalCode();
            if (fallbackResult.postalCode) {
              setPostalCode(fallbackResult.postalCode);
              setLocationResult(fallbackResult);
              setShowLocationDetails(true);
              console.log("✅ Fallback exitoso:", fallbackResult.postalCode);
              return;
            }
          } catch (fallbackError) {
            console.error("❌ Fallback también falló:", fallbackError);
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
    <section className="relative min-h-[600px] md:min-h-[700px] flex items-center overflow-hidden">
      {/* Fondo con imagen de técnicos */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/hero/electrician-hero.jpg')",
          }}
        ></div>
        {/* Overlay oscuro para legibilidad del texto */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
        {/* Overlay azul para mantener la identidad de marca */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-blue-800/30 to-indigo-900/40"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-20">
        <div className="max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Contenido principal */}
            <div className="text-white">
              {/* Badge de confianza */}
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
                <span className="text-yellow-400 mr-2">⭐</span>
                <span className="text-sm font-medium">
                  +50,000 servicios completados • 4.8/5 estrellas
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                <span className="text-white">Técnicos</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                  Verificados
                </span>
                <br />
                <span className="text-white">Para Tu Hogar</span>
              </h1>

              <p className="text-xl sm:text-2xl mb-8 text-blue-100 leading-relaxed">
                Conectamos hogares mexicanos con los mejores profesionales.
                <br />
                <span className="text-yellow-300 font-semibold">
                  Respuesta en menos de 2 horas.
                </span>
              </p>

              {/* Formulario de búsqueda moderno */}
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-white/20 mb-8">
                <div className="relative mb-4">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="text-blue-400 text-lg"
                    />
                  </div>
                  <input
                    id="input-postal-code"
                    type="text"
                    inputMode="numeric"
                    maxLength={5}
                    className="w-full pl-12 pr-4 py-4 text-lg border-2 border-white/30 rounded-xl text-gray-900 bg-white/90 backdrop-blur-sm focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder-gray-500"
                    placeholder="03100"
                    value={postalCode}
                    onChange={handlePostalCodeChange}
                  />
                </div>

                {/* Botón Usar mi Ubicación Actual */}
                <button
                  onClick={handleUseCurrentLocation}
                  disabled={isUsingCurrentLocation}
                  className="w-full mb-4 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center border border-white/30"
                >
                  <FontAwesomeIcon
                    icon={isUsingCurrentLocation ? faSpinner : faLocationDot}
                    className={`mr-2 ${
                      isUsingCurrentLocation ? "animate-spin" : ""
                    }`}
                  />
                  {isUsingCurrentLocation
                    ? "Detectando ubicación..."
                    : "Usar mi Ubicación Actual"}
                </button>

                {/* CTA Button principal */}
                <button
                  onClick={handlePostalCodeSubmit}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center shadow-lg"
                  disabled={!isPostalCodeValid || isLoadingUser}
                >
                  {isLoadingUser ? (
                    <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSearch} className="mr-2" />
                      Encontrar mi técnico
                    </>
                  )}
                </button>
              </div>

              {/* Estadísticas visuales */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">
                    2,500+
                  </div>
                  <div className="text-sm text-blue-200">Profesionales</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">2h</div>
                  <div className="text-sm text-blue-200">Tiempo Promedio</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">4.8</div>
                  <div className="text-sm text-blue-200">Calificación</div>
                </div>
              </div>
            </div>

            {/* Lado derecho - Elementos visuales con técnicos */}
            <div className="hidden lg:block relative">
              <div className="relative">
                {/* Círculos decorativos */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/20 rounded-full blur-xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-full blur-3xl"></div>

                {/* Tarjetas de servicios principales */}
                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center border border-white/30">
                    <div className="text-3xl mb-2">🔧</div>
                    <div className="text-white font-semibold text-sm">
                      Plomería
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center border border-white/30">
                    <div className="text-3xl mb-2">⚡</div>
                    <div className="text-white font-semibold text-sm">
                      Electricidad
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center border border-white/30">
                    <div className="text-3xl mb-2">🔨</div>
                    <div className="text-white font-semibold text-sm">
                      Construcción
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center border border-white/30">
                    <div className="text-3xl mb-2">🎨</div>
                    <div className="text-white font-semibold text-sm">
                      Pintura
                    </div>
                  </div>
                </div>

                {/* Badge de verificación */}
                <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  ✓ Verificados
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
