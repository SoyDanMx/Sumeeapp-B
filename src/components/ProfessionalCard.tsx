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
  faPhone,
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp as faWhatsappBrand } from '@fortawesome/free-brands-svg-icons';
import RatingDisplay from './RatingDisplay';

interface ProfessionalCardProps {
  professional: Profesional;
}

// Componente para mostrar estrellas (DEPRECATED - usar RatingDisplay)
// const StarRating = ({ rating, reviewCount }: { rating: number; reviewCount?: number }) => {
//   const fullStars = Math.floor(rating);
//   const hasHalfStar = rating % 1 !== 0;
//   const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

//   return (
//     <div className="flex items-center space-x-1">
//       <div className="flex">
//         {[...Array(fullStars)].map((_, i) => (
//           <FontAwesomeIcon key={i} icon={faStar} className="text-yellow-400 text-sm" />
//         ))}
//         {hasHalfStar && (
//           <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-sm opacity-50" />
//         )}
//         {[...Array(emptyStars)].map((_, i) => (
//           <FontAwesomeIcon key={i} icon={faStar} className="text-gray-300 text-sm" />
//         ))}
//       </div>
//       <span className="text-sm text-gray-600">
//         {rating.toFixed(1)} ({reviewCount || 0} reseñas)
//       </span>
//     </div>
//   );
// };

// Componente para mostrar especialidades
const SpecialtiesTags = ({ specialties }: { specialties: string[] }) => {
  const displaySpecialties = specialties.slice(0, 3);
  const hasMore = specialties.length > 3;

  return (
    <div className="flex flex-wrap gap-1">
      {displaySpecialties.map((specialty, index) => (
        <span
          key={index}
          className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
        >
          {specialty}
        </span>
      ))}
      {hasMore && (
        <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
          +{specialties.length - 3} más
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
    // review_count,
    areas_servicio,
    // is_verified,
    // codigo_postal,
    // telefono,
    // whatsapp
  } = professional;

  const rating = calificacion_promedio || 5;
  const specialties = areas_servicio || [];
  const hasContactInfo = false; // telefono || whatsapp;

  return (
    <Link href={`/tecnico/${user_id}`} className="group">
      <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 hover:border-blue-300 p-6 h-full flex flex-col">
        {/* Header con Avatar y Info Básica */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              {avatar_url ? (
                <Image
                  src={avatar_url}
                  alt={full_name || 'Profesional'}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xl">
                  {(full_name || 'P').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {/* {is_verified && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faCheckCircle} className="text-white text-xs" />
              </div>
            )} */}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
              {full_name || 'Profesional'}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {profession || 'Técnico Especializado'}
            </p>
            
            {/* Calificación */}
            <RatingDisplay 
              rating={professional.calificacion_promedio} 
              reviewCount={professional.review_count || null} 
              size="sm"
            />
          </div>
        </div>

        {/* Ubicación */}
        {/* {codigo_postal && (
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-gray-400" />
            <span>CP {codigo_postal}</span>
          </div>
        )} */}

        {/* Especialidades */}
        {specialties.length > 0 && (
          <div className="mb-4">
            <SpecialtiesTags specialties={specialties} />
          </div>
        )}

        {/* Información de Contacto */}
        {/* {hasContactInfo && (
          <div className="flex items-center space-x-3 mb-4">
            {telefono && (
              <div className="flex items-center text-sm text-gray-600">
                <FontAwesomeIcon icon={faPhone} className="mr-1 text-green-600" />
                <span>Llamada</span>
              </div>
            )}
            {whatsapp && (
              <div className="flex items-center text-sm text-gray-600">
                <FontAwesomeIcon icon={faWhatsappBrand} className="mr-1 text-green-600" />
                <span>WhatsApp</span>
              </div>
            )}
          </div>
        )} */}

        {/* Badge de Verificación */}
        {/* {is_verified && (
          <div className="flex items-center text-sm text-green-600 mb-4">
            <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
            <span className="font-medium">Verificado por Sumee</span>
          </div>
        )} */}

        {/* CTA Button */}
        <div className="mt-auto">
          <div className="flex items-center justify-between">
            <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm group-hover:bg-blue-700">
              <FontAwesomeIcon icon={faEye} className="mr-2" />
              Ver Perfil
            </button>
          </div>
        </div>

        {/* Indicador de Disponibilidad */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Disponible
          </span>
          <span>Respuesta rápida</span>
        </div>
      </div>
    </Link>
  );
}