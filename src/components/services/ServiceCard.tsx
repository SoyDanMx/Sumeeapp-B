'use client';

import React from 'react';
import Link from 'next/link';
import { Service } from '@/types/supabase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar,
  faCheckCircle,
  faUsers,
  faClock
} from '@fortawesome/free-solid-svg-icons';

interface ServiceCardProps {
  service: Service;
  showBadge?: boolean;
  className?: string;
}

// Mapeo de iconos de FontAwesome
const iconMap: { [key: string]: any } = {
  faWrench: '🔧',
  faBolt: '⚡',
  faSnowflake: '❄️',
  faKey: '🔑',
  faTint: '💧',
  faExclamationTriangle: '⚠️',
  faClock: '🕐',
  faWater: '💧',
  faPaintBrush: '🎨',
  faUmbrella: '☂️',
  faSeedling: '🌱',
  faSprayCan: '🧽',
  faHammer: '🔨',
  faVideo: '📹',
  faWifi: '📶',
  faBug: '🐛',
  faBuilding: '🏢',
  faSquare: '⬜'
};

// Datos simulados para prueba social (en producción vendrían de la DB)
const getServiceStats = (serviceSlug: string) => {
  const stats: { [key: string]: { rating: number; completed: number; responseTime: string } } = {
    'plomeria': { rating: 4.8, completed: 250, responseTime: '2 horas' },
    'electricidad': { rating: 4.9, completed: 180, responseTime: '1.5 horas' },
    'aire-acondicionado': { rating: 4.7, completed: 120, responseTime: '3 horas' },
    'cerrajeria': { rating: 4.9, completed: 95, responseTime: '30 min' },
    'fugas-agua': { rating: 4.8, completed: 200, responseTime: '1 hora' },
    'cortos-circuitos': { rating: 4.7, completed: 150, responseTime: '2 horas' },
    'pintura': { rating: 4.6, completed: 300, responseTime: '4 horas' },
    'jardineria': { rating: 4.5, completed: 80, responseTime: '6 horas' },
    'limpieza': { rating: 4.4, completed: 400, responseTime: '2 horas' },
    'carpinteria': { rating: 4.7, completed: 90, responseTime: '5 horas' },
    'cctv': { rating: 4.8, completed: 60, responseTime: '3 horas' },
    'wifi': { rating: 4.6, completed: 120, responseTime: '2 horas' },
    'fumigacion': { rating: 4.5, completed: 70, responseTime: '4 horas' },
    'arquitectos-ingenieros': { rating: 4.9, completed: 45, responseTime: '8 horas' },
    'tablaroca': { rating: 4.7, completed: 110, responseTime: '6 horas' }
  };
  
  return stats[serviceSlug] || { rating: 4.5, completed: 50, responseTime: '4 horas' };
};

export default function ServiceCard({ service, showBadge = true, className = '' }: ServiceCardProps) {
  const stats = getServiceStats(service.slug);
  const icon = iconMap[service.icon_name] || '🔧';

  return (
    <Link href={`/servicios/${service.slug}`} className={`group block ${className}`}>
      <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 hover:border-blue-300 p-6 h-full flex flex-col group-hover:scale-105 transform transition-transform">
        {/* Header con Icono y Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl">
              {icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {service.name}
              </h3>
              {service.is_popular && showBadge && (
                <div className="flex items-center space-x-1 mt-1">
                  <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xs" />
                  <span className="text-xs text-yellow-600 font-medium">Popular</span>
                </div>
              )}
            </div>
          </div>
          
          {service.is_popular && showBadge && (
            <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
              Más Solicitado
            </div>
          )}
        </div>

        {/* Descripción */}
        <p className="text-gray-600 text-sm mb-4 flex-1">
          {service.description}
        </p>

        {/* Prueba Social */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1">
              <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xs" />
              <span className="text-gray-700 font-medium">{stats.rating}</span>
              <span className="text-gray-500">({stats.completed} servicios)</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-500">
              <FontAwesomeIcon icon={faClock} className="text-xs" />
              <span className="text-xs">{stats.responseTime}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <FontAwesomeIcon icon={faUsers} className="text-xs" />
              <span>+{stats.completed} completados</span>
            </div>
            <div className="flex items-center space-x-1">
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-xs" />
              <span>Verificados</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Solicitar servicio</span>
            <div className="text-blue-600 group-hover:text-blue-700 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
