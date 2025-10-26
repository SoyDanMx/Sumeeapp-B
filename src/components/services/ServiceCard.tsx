import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';

interface ServiceCardProps {
  service: any;
}

const getIcon = (iconName: string): IconDefinition | null => {
  const icon = (solidIcons as any)[iconName];
  return icon || null;
};

export default function ServiceCard({ service }: ServiceCardProps) {
  const icon = getIcon(service.icon_name);
  const backgroundImage = service.thumbnail_image_url || `/images/services/${service.slug}-thumb.jpg`;
  const backgroundColor = service.background_color || '#3B82F6';

  return (
    <Link href={`/servicios/${service.slug}`} className="group">
      <div className="relative rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 h-full">
        {/* Imagen de fondo con overlay */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={backgroundImage}
            alt={`${service.name} - Servicio profesional`}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Overlay con gradiente */}
          <div 
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
            style={{ backgroundColor: `${backgroundColor}40` }}
          />
          
          {/* Badge de Popular */}
          {service.is_popular && (
            <span className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
              ⭐ POPULAR
            </span>
          )}

          {/* Icono del Servicio */}
          {icon && (
            <div className="absolute bottom-4 left-4 text-white text-4xl group-hover:scale-110 transform duration-300">
              <FontAwesomeIcon icon={icon} />
            </div>
          )}
        </div>

        {/* Contenido de la tarjeta */}
        <div className="p-6 bg-white">
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
      </div>
    </Link>
  );
}