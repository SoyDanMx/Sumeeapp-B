// src/components/Hero.tsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useUser } from "@/hooks/useUser";
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
  faTools,
} from "@fortawesome/free-solid-svg-icons";
import { MarketplaceHeroCard } from "./marketplace/MarketplaceHeroCard";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import ActivityCard from "./ActivityCard";
import HeroStatistics from "./HeroStatistics";
import {
  getCurrentPostalCode,
  isValidMexicanPostalCode,
  formatPostalCode,
  type LocationResult,
  type GeolocationError,
} from "@/lib/location";
import { toast } from "sonner";

export const Hero = () => {
  const [postalCode, setPostalCode] = useState("");
  const [isPostalCodeValid, setIsPostalCodeValid] = useState(false);
  const [isUsingCurrentLocation, setIsUsingCurrentLocation] = useState(false);

  // Usar el hook useUser en el nivel superior del componente (regla de hooks de React)
  const { user, isLoading: isLoadingUser } = useUser();
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

  // El hook useUser ya maneja la obtención del usuario y los cambios de autenticación
  // No necesitamos suscripción adicional ni fetch manual

  // Validar código postal cuando cambie
  useEffect(() => {
    setIsPostalCodeValid(validatePostalCode(postalCode));
  }, [postalCode]);

  const handlePostalCodeSubmit = async () => {
    if (!isPostalCodeValid) {
      toast.error("Por favor, ingresa un código postal válido de 5 dígitos.");
      return;
    }

    if (!user) {
      // Requerir registro para ver datos de profesionales (Solicitud del usuario)
      toast.info("Para ver a los profesionales verificados, por favor inicia sesión o regístrate.", {
        duration: 4000,
      });
      router.push("/login?redirect=/professionals");
    } else {
      router.push(`/professionals?cp=${encodeURIComponent(postalCode)}`);
    }
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
      // Usar la nueva función de geolocalización inversa precisa
      const result = await getCurrentPostalCode();

      if (result.postalCode) {
        setPostalCode(result.postalCode);
        setLocationResult(result);
        setShowLocationDetails(true);
        toast.success(`Ubicación detectada: C.P. ${result.postalCode}`);
      } else {
        setLocationError(
          "No pudimos determinar tu código postal. Por favor, ingrésalo manualmente."
        );
        toast.warning("No pudimos determinar tu código postal automáticamente.");
      }
    } catch (error) {
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
              toast.success(`Ubicación aproximada: C.P. ${fallbackResult.postalCode}`);
              return;
            }
          } catch (fallbackError) {
            // Silenciosamente fallar en fallback
          }
        } else {
          errorMessage += error.message;
        }
      }

      setLocationError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUsingCurrentLocation(false);
    }
  };

  return (
    <section className="relative overflow-hidden">
      {/* Hero Section - Estilo MyBuilder con fondo oscuro - Responsive */}
      <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 pt-12 sm:pt-16 md:pt-20 pb-10 sm:pb-12 md:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="max-w-7xl mx-auto">
            {/* Layout MyBuilder: Dos columnas principales - Responsive */}
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 sm:gap-8 lg:gap-12">
              {/* Columna Izquierda: Título y Búsqueda - Responsive */}
              <div className="w-full lg:w-[55%] order-2 lg:order-1">
                {/* Título Principal - Responsive */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-3 sm:mb-4 md:mb-6 leading-[1.1] sm:leading-tight">
                  La forma confiable de contratar un técnico
                </h1>
                
                {/* Subtítulo - Responsive */}
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/90 mb-6 sm:mb-8 md:mb-10 font-medium leading-tight">
                  ¿Cuál es tu proyecto?
                </h2>

                {/* Formulario de Búsqueda - Responsive */}
                <div className="mb-6 sm:mb-8">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Por ejemplo: instalación eléctrica"
                        className="w-full px-4 sm:px-5 md:px-6 py-3 sm:py-4 md:py-5 text-sm sm:text-base md:text-lg bg-white rounded-lg sm:rounded-xl md:rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-transparent shadow-lg font-medium"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.currentTarget.value;
                            if (input.trim()) {
                              router.push(`/servicios?q=${encodeURIComponent(input.trim())}`);
                            }
                          }
                        }}
                      />
                    </div>
                    <button
                      onClick={() => {
                        const input = document.querySelector('input[placeholder*="Por ejemplo"]') as HTMLInputElement;
                        if (input?.value.trim()) {
                          router.push(`/servicios?q=${encodeURIComponent(input.value.trim())}`);
                        } else {
                          router.push('/servicios');
                        }
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-6 sm:px-8 py-3 sm:py-4 md:py-5 rounded-lg sm:rounded-xl md:rounded-2xl font-bold text-sm sm:text-base md:text-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 w-full sm:w-auto sm:min-w-[120px] md:min-w-[140px]"
                    >
                      <FontAwesomeIcon icon={faSearch} className="text-xs sm:text-sm md:text-base" />
                      <span className="hidden xs:inline">Buscar</span>
                      <span className="xs:hidden">Buscar</span>
                    </button>
                  </div>
                </div>

                {/* Marketplace Card Integrado - Responsive */}
                <div className="mb-5 sm:mb-6">
                  <MarketplaceHeroCard />
                </div>

                {/* Trust Signals - Responsive */}
                <div className="flex flex-col xs:flex-row flex-wrap items-start xs:items-center gap-3 sm:gap-4 md:gap-6 text-white/80">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <FontAwesomeIcon icon={faShieldAlt} className="text-green-400 text-sm sm:text-base" />
                    <span className="text-xs sm:text-sm md:text-base font-medium">Técnicos verificados</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-sm sm:text-base" />
                    <span className="text-xs sm:text-sm md:text-base font-medium">Calificación promedio 4.9/5</span>
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Card del Técnico - Responsive */}
              <div className="w-full lg:w-[45%] order-1 lg:order-2">
                <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto lg:mx-0">
                  {/* Card del Técnico */}
                  <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl relative group">
                    {/* Imagen del Técnico - Responsive */}
                    <div className="relative w-full h-[280px] xs:h-[320px] sm:h-[380px] md:h-[450px] lg:h-[500px] xl:h-[550px]">
                      <Image
                        src="/images/hero/professional-hero.webp"
                        alt="Técnico verificado - Carlos Electricista"
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        priority
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 45vw"
                      />
                      
                      {/* Badge de Rating - Responsive */}
                      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 md:top-6 md:left-6 bg-green-500 text-white px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg shadow-lg sm:shadow-xl flex items-center gap-1 sm:gap-2 font-bold text-xs sm:text-sm md:text-base">
                        <span>Carlos</span>
                        <FontAwesomeIcon icon={faStar} className="text-yellow-300 text-[10px] sm:text-xs md:text-sm" />
                        <span>5/5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Estadísticas - Responsive */}
      <div className="bg-white py-6 sm:py-8 md:py-12 border-t border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <HeroStatistics />
          </div>
        </div>
      </div>
    </section>
  );
};
