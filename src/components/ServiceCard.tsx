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
    if (service.includes('electricista')) return 'Cotizar Ahora';
    if (service.includes('plomero')) return 'Cotizar Ahora';
    if (service.includes('pintor')) return 'Solicitar Pintor Hoy';
    if (service.includes('aire acondicionado')) return 'Cotizar HVAC';
    if (service.includes('cctv')) return 'Solicitar CCTV Hoy';
    if (service.includes('wifi')) return 'Solicitar WiFi Hoy';
    if (service.includes('limpieza')) return 'Solicitar Limpieza Hoy';
    if (service.includes('jardinería')) return 'Solicitar Jardinería Hoy';
    if (service.includes('carpintería')) return 'Solicitar Carpintería Hoy';
    if (service.includes('construcción')) return 'Cotizar Construcción';
    if (service.includes('tablaroca')) return 'Solicitar Tablaroca Hoy';
    if (service.includes('fumigación')) return 'Solicitar Fumigación Hoy';
    return `Cotizar Ahora`;
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
            <span>{rating}</span>
          </div>
        </div>
        
        {/* Rango de Precio Base Mockup */}
        {priceRange && (
          <div className="mb-3">
            <span className="text-gray-500 text-sm">{priceRange}</span>
          </div>
        )}
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