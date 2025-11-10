"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMap,
  faUsers,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

interface ExploreMapCTACompactProps {
  professionalCount?: number;
  maxRadius?: number;
}

export default function ExploreMapCTACompact({
  professionalCount = 50,
  maxRadius = 15,
}: ExploreMapCTACompactProps) {
  return (
    <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-purple-500/20">
      {/* Header Compacto - RESPONSIVE */}
      <div className="px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center space-x-1.5 sm:space-x-2 mb-1.5 sm:mb-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
            <FontAwesomeIcon icon={faMap} className="text-white text-xs sm:text-sm" />
          </div>
          <h3 className="text-white font-bold text-xs sm:text-sm truncate">
            Descubre Profesionales
          </h3>
        </div>
        <p className="text-white/80 text-[10px] sm:text-xs leading-relaxed">
          Explora técnicos verificados en tu zona
        </p>
      </div>

      {/* Stats Inline - RESPONSIVE */}
      <div className="px-3 sm:px-4 pb-2 sm:pb-3 grid grid-cols-2 gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
        <div className="flex items-center space-x-1 sm:space-x-1.5 text-white/90">
          <FontAwesomeIcon icon={faUsers} className="text-[9px] sm:text-[10px] flex-shrink-0" />
          <span className="font-medium truncate">+{professionalCount} técnicos</span>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-1.5 text-white/90">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[9px] sm:text-[10px] flex-shrink-0" />
          <span className="font-medium truncate">Hasta {maxRadius} km</span>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-1.5 text-white/90 col-span-2">
          <FontAwesomeIcon icon={faWhatsapp} className="text-[9px] sm:text-[10px] flex-shrink-0" />
          <span className="font-medium">Contacto directo</span>
        </div>
      </div>

      {/* CTA Button - RESPONSIVE */}
      <div className="px-3 sm:px-4 pb-2.5 sm:pb-3">
        <Link
          href="/tecnicos"
          className="block w-full bg-white hover:bg-gray-50 active:bg-gray-100 text-purple-700 font-bold py-2.5 sm:py-2 px-3 sm:px-4 rounded-lg transition-all duration-200 active:scale-95 shadow-lg text-center text-xs touch-manipulation"
        >
          <span className="hidden sm:inline">Explorar Mapa →</span>
          <span className="sm:hidden">Ver Mapa →</span>
        </Link>
      </div>

      {/* Avatars Placeholder - RESPONSIVE */}
      <div className="px-3 sm:px-4 pb-2.5 sm:pb-3 flex items-center justify-center space-x-1">
        <div className="flex -space-x-1.5 sm:-space-x-2">
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white/20 backdrop-blur-sm rounded-full border-2 border-purple-600 flex items-center justify-center">
            <span className="text-white text-[9px] sm:text-[10px] font-bold">+</span>
          </div>
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white/20 backdrop-blur-sm rounded-full border-2 border-purple-600"></div>
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white/20 backdrop-blur-sm rounded-full border-2 border-purple-600"></div>
        </div>
        <span className="text-white/70 text-[9px] sm:text-[10px] font-medium ml-1.5 sm:ml-2">
          {professionalCount}+ activos
        </span>
      </div>
    </div>
  );
}

