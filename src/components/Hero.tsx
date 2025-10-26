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
  faStar,
  faUsers,
  faClock,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
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

  // Servicios populares con enlaces
  const popularServices = [
    { name: "Plomería", icon: "🔧", slug: "plomeria" },
    { name: "Electricidad", icon: "⚡", slug: "electricidad" },
    { name: "Construcción", icon: "🔨", slug: "construccion" },
    { name: "Pintura", icon: "🎨", slug: "pintura" },
    { name: "Limpieza", icon: "🧹", slug: "limpieza" },
    { name: "Jardinería", icon: "🌱", slug: "jardineria" },
  ];

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
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      {/* Fondo con imagen del electricista */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/hero/electrician-hero.jpg')",
          }}
        ></div>
        {/* Overlay oscuro para legibilidad del texto */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40"></div>
        {/* Overlay azul sutil para mantener la identidad de marca */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-transparent to-indigo-900/20"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-20">
        <div className="max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Contenido principal */}
            <div className="text-white">
              {/* Badge de confianza */}
              <div className="inline-flex items-center bg-white/15 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-white/30 shadow-lg">
                <FontAwesomeIcon icon={faShieldAlt} className="text-yellow-400 mr-3 text-lg" />
                <span className="text-sm font-semibold">
                  +50,000 servicios completados • 4.8/5 estrellas
                </span>
              </div>

              {/* Título principal */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                <span className="text-white">La Solución Confiable</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                  para tu Hogar
                </span>
                <br />
                <span className="text-white text-4xl sm:text-5xl lg:text-6xl">
                  Técnicos Verificados en CDMX
                </span>
              </h1>

              {/* Subtítulo */}
              <p className="text-xl sm:text-2xl mb-10 text-blue-100 leading-relaxed max-w-2xl">
                Deja de buscar. Conectamos tu necesidad con el mejor profesional en{" "}
                <span className="text-yellow-300 font-bold">menos de 2 horas</span>.
                <br />
                <span className="text-lg text-blue-200">
                  Respuesta garantizada, trabajo de calidad.
                </span>
              </p>

              {/* Formulario de búsqueda rediseñado */}
              <div className="bg-white/15 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/30 mb-8">
                {/* Campo de código postal */}
                <div className="relative mb-6">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="text-blue-400 text-xl"
                    />
                  </div>
                  <input
                    id="input-postal-code"
                    type="text"
                    inputMode="numeric"
                    maxLength={5}
                    className="w-full pl-14 pr-4 py-5 text-xl border-2 border-white/40 rounded-2xl text-gray-900 bg-white/95 backdrop-blur-sm focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder-gray-500 font-medium"
                    placeholder="03100"
                    value={postalCode}
                    onChange={handlePostalCodeChange}
                  />
                </div>

                {/* Botón Usar mi Ubicación Actual */}
                <button
                  onClick={handleUseCurrentLocation}
                  disabled={isUsingCurrentLocation}
                  className="w-full mb-6 bg-white/25 hover:bg-white/35 disabled:bg-white/15 disabled:cursor-not-allowed text-white px-6 py-4 rounded-2xl font-semibold transition-all flex items-center justify-center border border-white/40 text-lg"
                >
                  <FontAwesomeIcon
                    icon={isUsingCurrentLocation ? faSpinner : faLocationDot}
                    className={`mr-3 text-xl ${
                      isUsingCurrentLocation ? "animate-spin" : ""
                    }`}
                  />
                  {isUsingCurrentLocation
                    ? "Detectando ubicación..."
                    : "Usar mi Ubicación Actual"}
                </button>

                {/* Botones de servicios populares */}
                <div className="mb-6">
                  <p className="text-white/90 text-lg font-semibold mb-4 text-center">
                    O selecciona un servicio:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {popularServices.map((service) => (
                      <Link
                        key={service.slug}
                        href={`/professionals?servicio=${service.slug}&cp=${postalCode || '03100'}`}
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl p-4 text-center border border-white/30 transition-all transform hover:scale-105 hover:shadow-lg"
                      >
                        <div className="text-2xl mb-2">{service.icon}</div>
                        <div className="text-white font-semibold text-sm">
                          {service.name}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* CTA Button principal */}
                <button
                  onClick={handlePostalCodeSubmit}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-8 py-5 rounded-2xl font-bold text-xl transition-all transform hover:scale-105 flex items-center justify-center shadow-2xl"
                  disabled={!isPostalCodeValid || isLoadingUser}
                >
                  {isLoadingUser ? (
                    <FontAwesomeIcon icon={faSpinner} spin className="mr-3 text-xl" />
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSearch} className="mr-3 text-xl" />
                      Encontrar mi técnico
                    </>
                  )}
                </button>
              </div>

              {/* Trust Bar - Estadísticas de confianza */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="text-3xl font-bold text-yellow-400 mb-1">
                    50,000+
                  </div>
                  <div className="text-sm text-blue-200 font-medium">Servicios</div>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="text-3xl font-bold text-green-400 mb-1">2h</div>
                  <div className="text-sm text-blue-200 font-medium">Tiempo Promedio</div>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="text-3xl font-bold text-purple-400 mb-1">4.8</div>
                  <div className="text-sm text-blue-200 font-medium">Calificación</div>
                </div>
              </div>
            </div>

            {/* Lado derecho - Tarjetas de perfiles flotantes */}
            <div className="hidden lg:block relative">
              <div className="relative">
                {/* Tarjetas de perfiles flotantes */}
                <div className="space-y-4">
                  {/* Perfil 1 - Carlos */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-2xl transform hover:scale-105 transition-all">
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        C
                      </div>
                      <div className="ml-4">
                        <div className="text-white font-bold text-lg">Carlos</div>
                        <div className="text-yellow-400 text-sm">★★★★★ 5/5</div>
                      </div>
                    </div>
                    <div className="text-blue-200 text-sm">Electricista • 150+ trabajos</div>
                  </div>

                  {/* Perfil 2 - Ana */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-2xl transform hover:scale-105 transition-all ml-8">
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        A
                      </div>
                      <div className="ml-4">
                        <div className="text-white font-bold text-lg">Ana</div>
                        <div className="text-yellow-400 text-sm">★★★★★ 5/5</div>
                      </div>
                    </div>
                    <div className="text-blue-200 text-sm">Plomera • 200+ trabajos</div>
                  </div>

                  {/* Perfil 3 - Miguel */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-2xl transform hover:scale-105 transition-all -ml-4">
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        M
                      </div>
                      <div className="ml-4">
                        <div className="text-white font-bold text-lg">Miguel</div>
                        <div className="text-yellow-400 text-sm">★★★★★ 5/5</div>
                      </div>
                    </div>
                    <div className="text-blue-200 text-sm">Constructor • 300+ trabajos</div>
                  </div>
                </div>

                {/* Badge de verificación flotante */}
                <div className="absolute -top-6 -right-6 bg-green-500 text-white px-6 py-3 rounded-full text-sm font-bold shadow-2xl flex items-center">
                  <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
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
