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
  priceRange?: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ name, rating, image, priceRange }) => {
  // Función para generar CTA dinámico basado en el servicio
  const getCtaText = (serviceName: string) => {
    const service = serviceName.toLowerCase();
    if (service.includes('electricista')) return 'Cotizar Electricista';
    if (service.includes('plomero')) return 'Cotizar Plomero';
    if (service.includes('pintor')) return 'Cotizar Pintor';
    if (service.includes('aire acondicionado')) return 'Cotizar HVAC';
    return `Cotizar ${serviceName}`;
  };

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
          <div className="flex items-center text-sm font-medium text-gray-700">
            <FontAwesomeIcon icon={faStar} className="text-yellow-400 mr-1" />
            {rating}
            {priceRange && (
              <>
                <span className="mx-2 text-gray-400">|</span>
                <span className="text-gray-500 text-xs">{priceRange}</span>
              </>
            )}
          </div>
        </div>
        <p className="text-gray-600 mb-4">Profesionales verificados listos para ayudarte</p>
        
        <Link 
          href="/professionals"
          className="text-blue-600 hover:text-blue-800 font-medium flex items-center cursor-pointer group-hover:translate-x-1 transition-transform" 
        >
          {getCtaText(name)}
          <FontAwesomeIcon icon={faArrowRight} className="ml-2 text-sm" />
        </Link>
      </div>
    </div>
  );
};