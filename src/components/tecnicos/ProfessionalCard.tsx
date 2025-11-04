"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Profesional } from "@/types/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faMapMarkerAlt,
  faEye,
  faBriefcase,
  faClock,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import RatingDisplay from "@/components/RatingDisplay";

interface ProfessionalCardProps {
  professional: Profesional;
}

// Componente para mostrar tags de especialidades (más compacto)
const SpecialtiesTags = ({ specialties }: { specialties: string[] }) => {
  const displaySpecialties = specialties.slice(0, 3);
  const hasMore = specialties.length > 3;

  return (
    <div className="flex flex-wrap gap-1.5">
      {displaySpecialties.map((specialty, index) => (
        <span
          key={index}
          className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-md border border-blue-200"
        >
          {specialty}
        </span>
      ))}
      {hasMore && (
        <span className="inline-block bg-gray-50 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-md border border-gray-200">
          +{specialties.length - 3}
        </span>
      )}
    </div>
  );
};

export default function ProfessionalCard({
  professional,
}: ProfessionalCardProps) {
  const {
    user_id,
    full_name,
    profession,
    avatar_url,
    calificacion_promedio,
    review_count,
    areas_servicio,
    experiencia_uber,
    años_experiencia_uber,
    ubicacion_lat,
    ubicacion_lng,
    descripcion_perfil,
  } = professional;

  const rating = calificacion_promedio || 5;
  const specialties = areas_servicio || [];
  const reviewCount = review_count || 0;
  const experienceYears = años_experiencia_uber || 0;
  const isVerified = true;
  const isAvailable = true;

  // Determinar el color del borde del avatar según disponibilidad
  const avatarBorderColor = isAvailable
    ? "border-green-400"
    : "border-gray-300";

  return (
    <Link href={`/tecnico/${user_id}`} className="group block h-full">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md border border-gray-200 transition-all duration-200 hover:border-blue-300 overflow-hidden h-full flex flex-col">
        {/* Header más compacto */}
        <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 p-4">
          <div className="flex items-start space-x-3">
            {/* Avatar más pequeño */}
            <div className="relative flex-shrink-0">
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-white border-2 ${avatarBorderColor} shadow-md`}
              >
                {avatar_url ? (
                  <Image
                    src={avatar_url}
                    alt={full_name || "Profesional"}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                    {(full_name || "P").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Badge de Disponibilidad más pequeño */}
              {isAvailable && (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>

            {/* Info Principal más compacta */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-1">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                    {full_name || "Profesional"}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5 truncate">
                    {profession || "Técnico Especializado"}
                  </p>
                </div>

                {/* Badge de Verificación más pequeño */}
                {isVerified && (
                  <div
                    className="flex-shrink-0 ml-2"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = "/verificacion";
                    }}
                  >
                    <div className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs font-semibold hover:bg-green-200 transition-colors cursor-pointer">
                      <FontAwesomeIcon icon={faShieldAlt} className="mr-1" />
                      Verificado
                    </div>
                  </div>
                )}
              </div>

              {/* Calificación más compacta */}
              <div className="mt-1.5">
                <RatingDisplay
                  rating={rating}
                  reviewCount={reviewCount}
                  size="sm"
                  showLabel={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contenido Principal más compacto */}
        <div className="p-4 flex-grow flex flex-col">
          {/* Métricas Clave más compactas */}
          {(experienceYears > 0 || reviewCount > 0) && (
            <div className="grid grid-cols-2 gap-3 mb-3">
              {experienceYears > 0 && (
                <div className="flex items-center text-xs text-gray-700">
                  <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center mr-2 flex-shrink-0">
                    <FontAwesomeIcon
                      icon={faBriefcase}
                      className="text-blue-600 text-xs"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-xs truncate">
                      {experienceYears}+ años
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      Experiencia
                    </p>
                  </div>
                </div>
              )}

              {reviewCount > 0 && (
                <div className="flex items-center text-xs text-gray-700">
                  <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center mr-2 flex-shrink-0">
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="text-green-600 text-xs"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-xs truncate">
                      {reviewCount} reseñas
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      Calificadas
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Especialidades */}
          {specialties.length > 0 && (
            <div className="mb-3">
              <SpecialtiesTags specialties={specialties} />
            </div>
          )}

          {/* Ubicación más compacta */}
          {ubicacion_lat && ubicacion_lng && (
            <div className="flex items-center text-xs text-gray-600 mb-3">
              <FontAwesomeIcon
                icon={faMapMarkerAlt}
                className="mr-1.5 text-gray-400 text-xs"
              />
              <span className="truncate">Servicio en zona</span>
            </div>
          )}

          {/* Indicador de Respuesta Rápida más compacto */}
          <div className="mb-3 flex items-center justify-center text-xs text-green-600 font-medium">
            <FontAwesomeIcon icon={faClock} className="mr-1 text-xs" />
            <span>Respuesta rápida</span>
          </div>

          {/* CTA Button más compacto */}
          <div className="mt-auto pt-3 border-t border-gray-100">
            <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 px-3 rounded-lg font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center">
              <FontAwesomeIcon icon={faEye} className="mr-2 text-xs" />
              Ver Perfil
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
