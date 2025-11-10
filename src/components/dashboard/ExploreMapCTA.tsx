"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkedAlt,
  faCheckCircle,
  faArrowRight,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";

interface ExploreMapCTAProps {
  professionalCount?: number;
  maxRadius?: number;
}

export default function ExploreMapCTA({
  professionalCount = 50,
  maxRadius = 15,
}: ExploreMapCTAProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-2xl shadow-2xl">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Left Side - Text Content */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <FontAwesomeIcon
                  icon={faMapMarkedAlt}
                  className="text-2xl text-white"
                />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white">
                Descubre Profesionales en tu Zona
              </h3>
            </div>

            <p className="text-blue-100 text-base sm:text-lg mb-6 leading-relaxed">
              Explora técnicos verificados en nuestro mapa interactivo. Ve su
              ubicación exacta, calificaciones y disponibilidad en tiempo real.
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 lg:mb-0">
              <div className="flex items-center gap-2 text-white">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="text-green-300"
                />
                <span className="text-sm sm:text-base">
                  +{professionalCount} profesionales verificados
                </span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className="text-green-300"
                />
                <span className="text-sm sm:text-base">
                  Hasta {maxRadius} km de distancia
                </span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="text-green-300"
                />
                <span className="text-sm sm:text-base">
                  Filtros por especialidad
                </span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="text-green-300"
                />
                <span className="text-sm sm:text-base">
                  Contacto directo por WhatsApp
                </span>
              </div>
            </div>
          </div>

          {/* Right Side - CTA Button */}
          <div className="lg:flex-shrink-0">
            <Link href="/tecnicos">
              <button className="w-full lg:w-auto bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group">
                <span>Explorar Mapa</span>
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </Link>

            {/* Mobile: Additional info */}
            <p className="text-center text-blue-100 text-xs mt-3 lg:hidden">
              Descubre quién está cerca de ti ahora
            </p>
          </div>
        </div>

        {/* Bottom Badge - Desktop Only */}
        <div className="hidden lg:flex items-center justify-center gap-2 mt-6 pt-6 border-t border-white/20">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm border-2 border-white"></div>
            <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm border-2 border-white"></div>
            <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm border-2 border-white"></div>
            <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm border-2 border-white flex items-center justify-center text-xs font-bold text-white">
              +{professionalCount}
            </div>
          </div>
          <p className="text-blue-100 text-sm">
            Profesionales activos esperando tu solicitud
          </p>
        </div>
      </div>
    </div>
  );
}

