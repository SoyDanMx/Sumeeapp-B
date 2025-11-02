// src/components/Hero.tsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
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
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import ActivityCard from "./ActivityCard";
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
    <section className="relative min-h-[100vh] md:min-h-[85vh] flex items-center overflow-hidden pt-16 md:pt-20">
      {/* Imagen optimizada para LCP */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero/professional-hero.webp"
          alt="Profesional electricista trabajando - Sumee App"
          fill
          priority
          quality={80}
          className="-z-10 object-cover"
          sizes="100vw"
        />
        {/* Overlay responsivo para mantener la imagen visible */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 md:bg-gradient-to-r md:from-black/40 md:via-transparent md:to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-20">
        <div className="max-w-7xl">
          {/* Layout Mobile-First: Apilado por defecto, Asimétrico en desktop */}
          <div className="flex flex-col lg:flex-row items-center min-h-[calc(100vh-4rem)] md:min-h-[calc(85vh-5rem)]">
            {/* Panel de Control - 100% móvil, 40% desktop */}
            <div className="w-full lg:w-2/5 lg:pr-8 mb-8 lg:mb-0">
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl">
                {/* Badge de confianza */}
                <Link
                  href="/verificacion"
                  className="inline-flex items-center bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 md:px-4 md:py-2 mb-4 md:mb-6 border border-white/30 shadow-lg hover:bg-white/25 transition-all duration-300 group"
                >
                  <FontAwesomeIcon
                    icon={faShieldAlt}
                    className="text-green-400 mr-2 text-sm md:text-lg group-hover:scale-110 transition-transform"
                  />
                  <span className="font-semibold text-xs md:text-sm group-hover:underline">
                    Técnicos Verificados
                  </span>
                </Link>

                {/* Mensaje principal */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 leading-tight text-white">
                  <span className="text-orange-400">La Solución Confiable</span>
                  <br />
                  <span className="text-white">para tu Hogar.</span>
                </h1>

                <p className="text-base md:text-lg text-blue-200 mb-6 md:mb-8">
                  Deja de buscar. Encuentra al técnico perfecto.
                  <span className="block mt-2 text-green-300 font-semibold">
                    Tu primera visita de revisión es gratis.
                  </span>
                </p>

                {/* Tarjetas de Actividad Recientes - Solo visible en desktop */}
                <div className="hidden lg:block mb-8">
                  <h4 className="text-white font-semibold text-lg mb-4 flex items-center">
                    <FontAwesomeIcon
                      icon={faUsers}
                      className="mr-2 text-blue-400"
                    />
                    Recientemente completado:
                  </h4>
                  <div className="space-y-3">
                    <ActivityCard
                      name="Carlos"
                      profession="Electricista"
                      rating={5}
                      jobsCount={150}
                      avatarColor="bg-gradient-to-r from-blue-500 to-purple-600"
                      avatarInitial="C"
                    />
                    <ActivityCard
                      name="Ana"
                      profession="Plomera"
                      rating={5}
                      jobsCount={200}
                      avatarColor="bg-gradient-to-r from-pink-500 to-red-600"
                      avatarInitial="A"
                    />
                    <ActivityCard
                      name="Miguel"
                      profession="Constructor"
                      rating={5}
                      jobsCount={300}
                      avatarColor="bg-gradient-to-r from-green-500 to-teal-600"
                      avatarInitial="M"
                    />
                  </div>
                </div>

                {/* CTA Principal - Formulario de búsqueda */}
                <div className="space-y-3 md:space-y-4">
                  {/* Campo de código postal */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none z-10">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="text-blue-400 text-sm md:text-lg"
                      />
                    </div>
                    <input
                      id="input-postal-code"
                      type="text"
                      inputMode="numeric"
                      maxLength={5}
                      className="w-full pl-10 md:pl-12 pr-4 py-3 md:py-4 text-base md:text-lg border-2 border-white/40 rounded-lg md:rounded-xl text-gray-900 bg-white/95 backdrop-blur-sm focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder-gray-500 font-medium"
                      placeholder="03100"
                      value={postalCode}
                      onChange={handlePostalCodeChange}
                    />
                  </div>

                  {/* Botón Usar mi Ubicación Actual */}
                  <button
                    onClick={handleUseCurrentLocation}
                    disabled={isUsingCurrentLocation}
                    className="w-full bg-white/25 hover:bg-white/35 disabled:bg-white/15 disabled:cursor-not-allowed text-white px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl font-semibold transition-all flex items-center justify-center border border-white/40 text-sm md:text-base"
                  >
                    <FontAwesomeIcon
                      icon={isUsingCurrentLocation ? faSpinner : faLocationDot}
                      className={`mr-2 text-sm ${
                        isUsingCurrentLocation ? "animate-spin" : ""
                      }`}
                    />
                    {isUsingCurrentLocation
                      ? "Detectando..."
                      : "Usar mi Ubicación"}
                  </button>

                  {/* CTA Button principal */}
                  <button
                    onClick={handlePostalCodeSubmit}
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-4 md:px-6 py-3 md:py-4 rounded-lg md:rounded-xl font-bold text-base md:text-lg transition-all transform hover:scale-105 flex items-center justify-center shadow-xl"
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

                  {/* Enlace simplificado a servicios */}
                  <div className="text-center pt-1 md:pt-2">
                    <Link
                      href="/servicios"
                      className="text-blue-200 hover:text-white transition-colors text-xs md:text-sm underline"
                    >
                      O explora todos nuestros servicios
                    </Link>
                  </div>
                </div>

                {/* Trust Bar - Estadísticas compactas */}
                <div className="grid grid-cols-3 gap-2 md:gap-4 mt-6 md:mt-8 pt-4 md:pt-6 border-t border-white/20">
                  <div className="text-center">
                    <div className="text-lg md:text-2xl font-bold text-yellow-400 mb-1">
                      50,000+
                    </div>
                    <div className="text-xs text-blue-200 font-medium">
                      Servicios
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg md:text-2xl font-bold text-green-400 mb-1">
                      2h
                    </div>
                    <div className="text-xs text-blue-200 font-medium">
                      Tiempo Promedio
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg md:text-2xl font-bold text-purple-400 mb-1">
                      4.8
                    </div>
                    <div className="text-xs text-blue-200 font-medium">
                      Calificación
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Espacio para la imagen - Solo visible en desktop */}
            <div className="hidden lg:block w-3/5">
              {/* La imagen de fondo ya está configurada para cubrir toda la sección */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
