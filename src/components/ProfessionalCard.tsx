// src/components/ProfessionalCard.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

interface ProfessionalCardProps {
  profile: any; // Usamos 'any' por ahora para flexibilidad
}

export const ProfessionalCard: React.FC<ProfessionalCardProps> = ({ profile }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-4 flex flex-col sm:flex-row items-center gap-4">
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0">
        <Image
          src={profile.avatar_url || '/images/default-avatar.png'} // Usamos un avatar por defecto si no hay foto
          alt={`Foto de perfil de ${profile.full_name}`}
          fill
          className="rounded-full object-cover"
        />
      </div>
      <div className="text-center sm:text-left">
        <h3 className="text-xl font-bold text-gray-800">{profile.full_name}</h3>
        <p className="text-blue-600 font-semibold">{profile.profession}</p>
        <div className="flex items-center justify-center sm:justify-start gap-1 mt-1 text-yellow-500">
          <FontAwesomeIcon icon={faStar} />
          <span className="text-gray-600 font-bold">4.8</span>
          <span className="text-gray-500 text-sm">(15 reseñas)</span>
        </div>
        <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 text-gray-500 text-sm">
          <FontAwesomeIcon icon={faMapMarkerAlt} />
          <span>{profile.work_area}</span>
        </div>
      </div>
      <div className="mt-4 sm:mt-0 sm:ml-auto">
        {/* Este enlace ahora apunta a la página de perfil dinámica usando el user_id del profesional */}
        <Link 
          href={`/profesional/${profile.user_id}`} 
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg transition"
        >
          Ver Perfil
        </Link>
      </div>
    </div>
  );
};