'use client';

import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWrench, 
  faLightbulb, 
  faThermometerHalf, 
  faKey, 
  faPaintBrush, 
  faBroom, 
  faSeedling, 
  faHammer,
  faVideo,
  faWifi,
  faBug,
  faHardHat,
  faCubes
} from '@fortawesome/free-solid-svg-icons';

interface PopularService {
  name: string;
  icon: any;
  href: string;
  description: string;
  color: string;
  bgColor: string;
  hoverColor: string;
  isPopular?: boolean;
}

const popularServices: PopularService[] = [
  {
    name: 'Plomería',
    icon: faWrench,
    href: '/servicios/plomeria',
    description: 'Reparaciones y instalaciones',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    hoverColor: 'hover:bg-blue-100',
    isPopular: true
  },
  {
    name: 'Electricidad',
    icon: faLightbulb,
    href: '/servicios/electricidad',
    description: 'Instalaciones eléctricas',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    hoverColor: 'hover:bg-yellow-100',
    isPopular: true
  },
  {
    name: 'Aire Acondicionado',
    icon: faThermometerHalf,
    href: '/servicios/aire-acondicionado',
    description: 'Instalación y mantenimiento',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    hoverColor: 'hover:bg-cyan-100',
    isPopular: true
  },
  {
    name: 'Cerrajería',
    icon: faKey,
    href: '/servicios/cerrajeria',
    description: 'Cambio de cerraduras',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    hoverColor: 'hover:bg-gray-100'
  },
  {
    name: 'Pintura',
    icon: faPaintBrush,
    href: '/servicios/pintura',
    description: 'Pintura residencial',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    hoverColor: 'hover:bg-purple-100'
  },
  {
    name: 'Limpieza',
    icon: faBroom,
    href: '/servicios/limpieza',
    description: 'Servicios de limpieza',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    hoverColor: 'hover:bg-green-100'
  },
  {
    name: 'Jardinería',
    icon: faSeedling,
    href: '/servicios/jardineria',
    description: 'Mantenimiento de jardines',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    hoverColor: 'hover:bg-emerald-100'
  },
  {
    name: 'Carpintería',
    icon: faHammer,
    href: '/servicios/carpinteria',
    description: 'Trabajos en madera',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    hoverColor: 'hover:bg-amber-100'
  },
  {
    name: 'CCTV',
    icon: faVideo,
    href: '/servicios/cctv',
    description: 'Sistemas de seguridad',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    hoverColor: 'hover:bg-indigo-100'
  },
  {
    name: 'WiFi',
    icon: faWifi,
    href: '/servicios/wifi',
    description: 'Redes e internet',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    hoverColor: 'hover:bg-pink-100'
  },
  {
    name: 'Fumigación',
    icon: faBug,
    href: '/servicios/fumigacion',
    description: 'Control de plagas',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    hoverColor: 'hover:bg-red-100'
  },
  {
    name: 'Arquitectos & Ingenieros',
    icon: faHardHat,
    href: '/servicios/construccion',
    description: 'Especialistas en construcción',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    hoverColor: 'hover:bg-indigo-100'
  },
  {
    name: 'Tablaroca',
    icon: faCubes,
    href: '/servicios/tablaroca',
    description: 'Construcción en seco',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    hoverColor: 'hover:bg-orange-100'
  }
];

export default function PopularServices() {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nuestros Servicios Más Populares
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Los servicios más solicitados en Ciudad de México. 
            <span className="font-semibold text-blue-600"> Selecciona el que necesitas</span> y recibe cotización en minutos.
          </p>
          <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-500">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>+50,000 servicios completados</span>
            <span className="text-gray-300">•</span>
            <span>4.8/5 estrellas promedio</span>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
          {popularServices.map((service, index) => (
            <Link
              key={service.name}
              href={service.href}
              className={`
                group relative bg-white rounded-xl p-4 md:p-6 
                border-2 border-gray-200 hover:border-blue-300 
                shadow-md hover:shadow-xl 
                transition-all duration-300 ease-in-out
                transform hover:-translate-y-1
                ${service.bgColor} ${service.hoverColor}
                ${service.isPopular ? 'ring-2 ring-blue-200' : ''}
              `}
            >
              {/* Popular Badge */}
              {service.isPopular && (
                <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                  Popular
                </div>
              )}

              {/* Service Icon */}
              <div className="text-center mb-3">
                <div className={`
                  w-12 h-12 md:w-16 md:h-16 mx-auto rounded-full 
                  flex items-center justify-center mb-3
                  ${service.bgColor} group-hover:scale-110 transition-transform duration-300
                `}>
                  <FontAwesomeIcon 
                    icon={service.icon} 
                    className={`text-2xl md:text-3xl ${service.color}`} 
                  />
                </div>
              </div>

              {/* Service Name */}
              <h3 className={`
                font-bold text-sm md:text-base text-center mb-1
                group-hover:text-blue-700 transition-colors duration-300
                ${service.color}
              `}>
                {service.name}
              </h3>

              {/* Service Description */}
              <p className="text-xs text-gray-500 text-center leading-tight">
                {service.description}
              </p>

              {/* Hover Arrow */}
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            ¿No encuentras tu servicio? No te preocupes
          </p>
          <Link 
            href="/servicios"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300 shadow-lg hover:shadow-xl"
          >
            Ver Todos los Servicios
            <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <FontAwesomeIcon icon={faWrench} className="text-blue-600" />
            <span className="text-sm">Técnicos verificados</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <FontAwesomeIcon icon={faLightbulb} className="text-yellow-600" />
            <span className="text-sm">Cotización gratuita</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <FontAwesomeIcon icon={faThermometerHalf} className="text-cyan-600" />
            <span className="text-sm">Respuesta en 2 horas</span>
          </div>
        </div>
      </div>
    </section>
  );
}
