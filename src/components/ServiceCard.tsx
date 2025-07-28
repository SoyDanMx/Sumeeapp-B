// src/components/ServiceCard.tsx
'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import Link from 'next/link'; // Asegúrate de que esta línea esté presente

interface ServiceCardProps {
  name: string;
  rating: number;
  image: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ name, rating, image }) => {
  return (
    <div className="bg-gray-50 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition duration-300 cursor-pointer group">
      <div className="h-48 overflow-hidden relative">
        <Image
          src={image}
          alt={name}
          fill
          className="transition duration-300 group-hover:scale-105 object-cover"
          onError={(e) => { e.currentTarget.src = `https://placehold.co/400x300/E2E8F0/4A5568?text=${name}`; }}
        />
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
          <span className="flex items-center text-sm font-medium text-gray-700">
            <FontAwesomeIcon icon={faStar} className="text-yellow-400 mr-1" />
            {rating}
          </span>
        </div>
        <p className="text-gray-600 mb-4">Profesionales verificados listos para ayudarte</p>
        
        {/* --- MODIFICACIÓN CLAVE AQUÍ: CAMBIAR <button> POR <Link> Y AÑADIR href --- */}
        <Link 
          href="/professionals" // Establece la URL de destino
          // Mantiene las clases del botón original para conservar el estilo
          className="text-blue-600 hover:text-blue-800 font-medium flex items-center cursor-pointer" 
        >
          Ver profesionales
          <FontAwesomeIcon icon={faArrowRight} className="ml-2 text-sm" />
        </Link>
        {/* --- FIN DE LA MODIFICACIÓN CLAVE --- */}
      </div>
    </div>
  );
};