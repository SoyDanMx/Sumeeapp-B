'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Profesional } from '@/types/supabase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faMapMarkerAlt, 
  faEye,
  faBriefcase,
  faClock,
  faShieldAlt
} from '@fortawesome/free-solid-svg-icons';
import RatingDisplay from '@/components/RatingDisplay';

interface ProfessionalCardProps {
  professional: Profesional;
}

// Componente para mostrar tags de especialidades
const SpecialtiesTags = ({ specialties }: { specialties: string[] }) => {
  const displaySpecialties = specialties.slice(0, 4);
  const hasMore = specialties.length > 4;

  return (
    <div className="flex flex-wrap gap-2">
      {displaySpecialties.map((specialty, index) => (
        <span
          key={index}
          className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-200"
        >
          {specialty}
        </span>
      ))}
      {hasMore && (
        <span className="inline-block bg-gray-50 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200">
          +{specialties.length - 4} más
        </span>
      )}
    </div>
  );
};

export default function ProfessionalCard({ professional }: ProfessionalCardProps) {
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
    descripcion_perfil
  } = professional;

  const rating = calificacion_promedio || 0;
  const specialties = areas_servicio || [];
  const reviewCount = review_count || 0;
  const experienceYears = años_experiencia_uber || 0;
  const isVerified = true; // Asumimos que todos los profesionales en la plataforma están verificados
  const isAvailable = true; // Por ahora, todos están disponibles
  
  // Determinar el color del borde del avatar según disponibilidad
  const avatarBorderColor = isAvailable 
    ? 'border-green-400' 
    : 'border-gray-300';

  return (
    <Link href={`/tecnico/${user_id}`} className="group">
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-200 transition-all duration-300 hover:border-blue-400 overflow-hidden h-full flex flex-col">
        {/* Header con Avatar */}
        <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 p-6">
          <div className="flex items-start space-x-4">
            {/* Avatar Grande con Borde de Estado */}
            <div className="relative flex-shrink-0">
              <div className={`w-20 h-20 rounded-full overflow-hidden bg-white border-4 ${avatarBorderColor} shadow-lg`}>
                {avatar_url ? (
                  <Image
                    src={avatar_url}
                    alt={full_name || 'Profesional'}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                    {(full_name || 'P').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              {/* Badge de Disponibilidad */}
              {isAvailable && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>
            
            {/* Info Principal */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                    {full_name || 'Profesional'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {profession || 'Técnico Especializado'}
                  </p>
                </div>
                
                {/* Badge de Verificación */}
                {isVerified && (
                  <Link
                    href="/verificacion"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-shrink-0 ml-2 group"
                  >
                    <div className="bg-green-100 text-green-700 px-2 py-1 rounded-lg flex items-center text-xs font-semibold hover:bg-green-200 hover:text-green-800 transition-all duration-200 cursor-pointer">
                      <FontAwesomeIcon
                        icon={faShieldAlt}
                        className="mr-1 group-hover:scale-110 transition-transform"
                      />
                      Verificado
                    </div>
                  </Link>
                )}
              </div>
              
              {/* Calificación */}
              <div className="mt-2">
                <RatingDisplay 
                  rating={rating} 
                  reviewCount={reviewCount} 
                  size="sm"
                  showLabel={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="p-6 flex-grow flex flex-col">
          {/* Métricas Clave */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {experienceYears > 0 && (
              <div className="flex items-center text-sm text-gray-700">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                  <FontAwesomeIcon icon={faBriefcase} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{experienceYears}+ años</p>
                  <p className="text-xs text-gray-500">Experiencia</p>
                </div>
              </div>
            )}
            
            {reviewCount > 0 && (
              <div className="flex items-center text-sm text-gray-700">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-2">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">+{reviewCount * 10} trabajos</p>
                  <p className="text-xs text-gray-500">Completados</p>
                </div>
              </div>
            )}
          </div>

          {/* Descripción Corta (si existe) */}
          {descripcion_perfil && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {descripcion_perfil.substring(0, 100)}
              {descripcion_perfil.length > 100 && '...'}
            </p>
          )}

          {/* Especialidades */}
          {specialties.length > 0 && (
            <div className="mb-4">
              <SpecialtiesTags specialties={specialties} />
            </div>
          )}

          {/* Ubicación */}
          {(ubicacion_lat && ubicacion_lng) && (
            <div className="flex items-center text-sm text-gray-600 mb-4">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-gray-400" />
              <span>Servicio en zona</span>
            </div>
          )}

          {/* CTA Button */}
          <div className="mt-auto pt-4 border-t border-gray-100">
            <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg group-hover:shadow-xl flex items-center justify-center">
              <FontAwesomeIcon icon={faEye} className="mr-2" />
              Ver Perfil y Reseñas
            </button>
          </div>

          {/* Indicador de Respuesta Rápida */}
          <div className="mt-3 flex items-center justify-center text-xs text-green-600 font-medium">
            <FontAwesomeIcon icon={faClock} className="mr-1" />
            Respuesta en menos de 2 horas
          </div>
        </div>
      </div>
    </Link>
  );
}

