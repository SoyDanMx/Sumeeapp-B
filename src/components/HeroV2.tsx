"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faMapMarkerAlt,
  faCheckCircle,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";

export const HeroV2 = () => {
  const [serviceQuery, setServiceQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (serviceQuery.trim() || locationQuery.trim()) {
      // Redirigir a búsqueda de profesionales o servicios
      const params = new URLSearchParams();
      if (serviceQuery.trim()) params.set("service", serviceQuery);
      if (locationQuery.trim()) params.set("location", locationQuery);
      router.push(`/professionals?${params.toString()}`);
    } else {
      router.push("/professionals");
    }
  };

  return (
    <section className="relative min-h-[600px] md:min-h-[700px] flex items-center overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Sección Izquierda - Fondo Azul */}
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl lg:rounded-3xl p-8 md:p-10 lg:p-12 text-white shadow-2xl">
            {/* Título Principal */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
              Encuentra técnicos verificados en minutos
            </h1>

            {/* Subtítulo */}
            <p className="text-lg md:text-xl lg:text-2xl text-blue-100 mb-8 md:mb-10 leading-relaxed">
              Conectamos expertos certificados con usuarios que necesitan servicios técnicos de calidad
            </p>

            {/* Campos de Búsqueda */}
            <div className="space-y-4 mb-8">
              {/* Campo: ¿Qué servicio necesitas? */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="text-gray-400 text-lg"
                  />
                </div>
                <input
                  type="text"
                  value={serviceQuery}
                  onChange={(e) => setServiceQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                  className="w-full pl-12 pr-4 py-4 text-gray-900 bg-white rounded-lg focus:ring-4 focus:ring-yellow-400 focus:outline-none text-base md:text-lg font-medium placeholder-gray-500"
                  placeholder="¿Qué servicio necesitas?"
                />
              </div>

              {/* Campo: Tu ubicación */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    className="text-gray-400 text-lg"
                  />
                </div>
                <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                  className="w-full pl-12 pr-4 py-4 text-gray-900 bg-white rounded-lg focus:ring-4 focus:ring-yellow-400 focus:outline-none text-base md:text-lg font-medium placeholder-gray-500"
                  placeholder="Tu ubicación"
                />
              </div>
            </div>

            {/* Botón Buscar */}
            <button
              onClick={handleSearch}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-4 px-6 rounded-lg text-lg md:text-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] mb-8"
            >
              Buscar
            </button>

            {/* Características con Checkmarks */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-green-600 text-sm"
                  />
                </div>
                <span className="text-white text-base md:text-lg font-medium">
                  Garantía de Satisfacción
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-green-600 text-sm"
                  />
                </div>
                <span className="text-white text-base md:text-lg font-medium">
                  Verificación de Identidad
                </span>
              </div>
            </div>
          </div>

          {/* Sección Derecha - Tarjeta de Técnico */}
          <div className="relative lg:pl-8">
            <div className="bg-white rounded-2xl lg:rounded-3xl shadow-2xl overflow-hidden transform lg:-translate-x-8 relative">
              {/* Imagen del Técnico */}
              <div className="relative w-full h-64 md:h-80 lg:h-96">
                <Image
                  src="/images/hero/professional-hero.webp"
                  alt="Técnico verificado - Carlos / Electricista"
                  fill
                  className="object-cover"
                  priority
                />
                {/* Overlay Amarillo con Rating - Posicionado en la parte inferior izquierda */}
                <div className="absolute bottom-4 left-4 bg-yellow-400 px-3 py-2 rounded-lg shadow-lg">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-white font-bold text-sm md:text-base">
                    Carlos / Electricista
                    </span>
                    <FontAwesomeIcon
                      icon={faStar}
                      className="text-white text-xs md:text-sm"
                    />
                    <span className="text-white font-bold text-sm md:text-base">
                      5/5
                    </span>
                  </div>
                </div>
              </div>

              {/* Información del Técnico - Fondo oscuro para contraste con texto blanco */}
              <div className="p-6 md:p-8 bg-gradient-to-br from-gray-800 to-gray-900 relative">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Carlos / Electricista
                </h3>
                <div className="flex items-center space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <FontAwesomeIcon
                      key={i}
                      icon={faStar}
                      className="text-yellow-400 text-lg md:text-xl"
                    />
                  ))}
                  <span className="text-white font-semibold text-base md:text-lg ml-2">
                    5.0
                  </span>
                  <span className="text-white/80 text-sm md:text-base ml-1">
                    (2,500+ reseñas)
                  </span>
                </div>
                {/* Badge de Rating en esquina superior derecha */}
                <div className="absolute top-4 right-4 bg-yellow-400 rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
                  <div className="text-center">
                    <FontAwesomeIcon
                      icon={faStar}
                      className="text-white text-lg"
                    />
                    <div className="text-white font-bold text-xs mt-1">5/5</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


