import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';
import { Service } from '@/types/supabase';

interface ServiceCardProps {
  service: Service;
}

const getIcon = (iconName: string): IconDefinition | null => {
  const icon = (solidIcons as any)[iconName];
  return icon || null;
};

export default function ServiceCard({ service }: ServiceCardProps) {
  const icon = getIcon(service.icon_name);

  return (
    <Link href={`/servicios/${service.slug}`} className="group">
      <div className="relative bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col text-center hover:shadow-lg transition-all duration-300 hover:border-blue-300 hover:-translate-y-1 h-full">
        {/* Badge de Popular */}
        {service.is_popular && (
          <span className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
            ⭐ POPULAR
          </span>
        )}
        
        {/* Icono del Servicio */}
        {icon && (
          <div className="text-blue-600 text-6xl mb-6 group-hover:text-blue-700 transition-colors group-hover:scale-110 transform duration-300">
            <FontAwesomeIcon icon={icon} />
          </div>
        )}
        
        {/* Nombre del Servicio */}
        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
          {service.name}
        </h3>
        
        {/* Descripción */}
        <p className="text-gray-600 text-base flex-grow mb-6 leading-relaxed">
          {service.description || 'Servicio profesional de alta calidad.'}
        </p>
        
        {/* Categoría */}
        <div className="mb-6">
          <span className="inline-block bg-blue-50 text-blue-700 text-sm font-medium px-3 py-2 rounded-full border border-blue-200">
            {service.category}
          </span>
        </div>
        
        {/* Prueba Social Sutil */}
        <div className="mb-4 text-sm text-gray-500">
          <span className="font-medium">+500 servicios completados</span>
        </div>
        
        {/* Botón de Acción */}
        <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm font-semibold shadow-md group-hover:shadow-lg transform group-hover:scale-105">
          Ver Detalles →
        </button>
      </div>
    </Link>
  );
}