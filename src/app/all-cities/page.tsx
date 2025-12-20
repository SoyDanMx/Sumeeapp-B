'use client';

import React from 'react';
import { PageLayout } from '@/components/PageLayout';
import { PageHeader } from '@/components/PageHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faCheckCircle, faUsers, faStar, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import Image from 'next/image';
import './map-styles.css';

interface City {
  name: string;
  slug: string;
  state: string;
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  services: string[];
  professionals: number;
  completedJobs: number;
}

const CITIES: City[] = [
  {
    name: 'Ciudad de México',
    slug: 'ciudad-de-mexico',
    state: 'CDMX',
    description: 'Capital de México y área metropolitana más grande del país. Servicios disponibles en todas las alcaldías.',
    coordinates: {
      lat: 19.4326,
      lng: -99.1332,
    },
    services: ['Electricidad', 'Plomería', 'Montaje y Armado', 'Aire Acondicionado', 'Pintura', 'Limpieza', 'Jardinería', 'Carpintería', 'CCTV', 'Redes y WiFi'],
    professionals: 250,
    completedJobs: 15000,
  },
  {
    name: 'Monterrey',
    slug: 'monterrey',
    state: 'Nuevo León',
    description: 'Ciudad industrial del norte de México. Servicios profesionales disponibles en toda el área metropolitana.',
    coordinates: {
      lat: 25.6866,
      lng: -100.3161,
    },
    services: ['Electricidad', 'Plomería', 'Montaje y Armado', 'Aire Acondicionado', 'Pintura', 'Construcción', 'CCTV'],
    professionals: 120,
    completedJobs: 8000,
  },
  {
    name: 'Guadalajara',
    slug: 'guadalajara',
    state: 'Jalisco',
    description: 'Segunda ciudad más grande de México. Cobertura en toda el área metropolitana de Guadalajara.',
    coordinates: {
      lat: 20.6597,
      lng: -103.3496,
    },
    services: ['Electricidad', 'Plomería', 'Montaje y Armado', 'Aire Acondicionado', 'Pintura', 'Limpieza', 'Jardinería'],
    professionals: 95,
    completedJobs: 6000,
  },
  {
    name: 'Puebla',
    slug: 'puebla',
    state: 'Puebla',
    description: 'Ciudad histórica del centro de México. Servicios disponibles en Puebla capital y zona metropolitana.',
    coordinates: {
      lat: 19.0414,
      lng: -98.2063,
    },
    services: ['Electricidad', 'Plomería', 'Montaje y Armado', 'Pintura', 'Limpieza', 'Jardinería'],
    professionals: 65,
    completedJobs: 3500,
  },
  {
    name: 'Pachuca',
    slug: 'pachuca',
    state: 'Hidalgo',
    description: 'Capital de Hidalgo. Servicios profesionales disponibles en Pachuca y zona metropolitana.',
    coordinates: {
      lat: 20.1239,
      lng: -98.7369,
    },
    services: ['Electricidad', 'Plomería', 'Montaje y Armado', 'Pintura', 'Limpieza'],
    professionals: 45,
    completedJobs: 2500,
  },
];

export default function AllCitiesPage() {
  return (
    <PageLayout>
      <div className="bg-gray-50 min-h-screen">
        {/* Hero Section - Extendido hacia arriba para cubrir el header */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white -mt-24 md:-mt-28 pt-24 md:pt-28 pb-12 md:pb-16 lg:pb-20 overflow-hidden">
          {/* Background Pattern - Grid tecnológico */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}></div>
          </div>
          
          {/* Map Image Container - Diseño tecnológico innovador */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full max-w-5xl mx-auto h-full opacity-15 md:opacity-20">
              {/* Mapa de México con efectos */}
              <div className="relative w-full h-full">
                <Image
                  src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1200&q=80"
                  alt="Mapa de México"
                  fill
                  className="object-contain"
                  priority
                  style={{ 
                    filter: 'brightness(0.9) contrast(1.3) saturate(1.2)',
                    mixBlendMode: 'screen'
                  }}
                />
                
                {/* Overlay con gradiente tecnológico */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 via-transparent to-purple-500/30"></div>
                
                {/* Animated dots for cities - Efecto tecnológico */}
                <div className="absolute inset-0">
                  {CITIES.map((city, index) => {
                    // Posiciones aproximadas en el mapa de México
                    const positions: Record<string, { top: string; left: string }> = {
                      'ciudad-de-mexico': { top: '48%', left: '38%' },
                      'monterrey': { top: '22%', left: '48%' },
                      'guadalajara': { top: '42%', left: '32%' },
                      'puebla': { top: '52%', left: '40%' },
                      'pachuca': { top: '50%', left: '37%' },
                    };
                    const pos = positions[city.slug] || { top: '50%', left: '50%' };
                    
                    return (
                      <div
                        key={city.slug}
                        className="absolute"
                        style={{
                          top: pos.top,
                          left: pos.left,
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        {/* Punto animado con efecto tecnológico */}
                        <div className="relative">
                          {/* Anillo exterior pulsante */}
                          <div 
                            className="absolute inset-0 bg-indigo-400 rounded-full animate-ping opacity-60"
                            style={{ 
                              width: '24px', 
                              height: '24px',
                              animationDelay: `${index * 0.3}s`,
                              animationDuration: '2s'
                            }}
                          ></div>
                          {/* Anillo medio */}
                          <div 
                            className="absolute inset-0 bg-purple-400 rounded-full animate-pulse opacity-40"
                            style={{ 
                              width: '18px', 
                              height: '18px',
                              top: '3px',
                              left: '3px',
                              animationDelay: `${index * 0.3 + 0.5}s`,
                            }}
                          ></div>
                          {/* Punto central brillante */}
                          <div 
                            className="relative bg-white rounded-full shadow-lg"
                            style={{ 
                              width: '10px', 
                              height: '10px',
                              boxShadow: '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(147, 51, 234, 0.6)'
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Líneas de conexión entre ciudades (efecto tecnológico) */}
                <svg className="absolute inset-0 w-full h-full opacity-20" style={{ pointerEvents: 'none' }}>
                  {CITIES.map((city, index) => {
                    if (index === 0) return null; // No conectar desde la primera ciudad
                    const positions: Record<string, { top: number; left: number }> = {
                      'ciudad-de-mexico': { top: 48, left: 38 },
                      'monterrey': { top: 22, left: 48 },
                      'guadalajara': { top: 42, left: 32 },
                      'puebla': { top: 52, left: 40 },
                      'pachuca': { top: 50, left: 37 },
                    };
                    const currentPos = positions[city.slug] || { top: 50, left: 50 };
                    const cdmxPos = positions['ciudad-de-mexico'] || { top: 48, left: 38 };
                    
                    return (
                      <line
                        key={`line-${city.slug}`}
                        x1={`${cdmxPos.left}%`}
                        y1={`${cdmxPos.top}%`}
                        x2={`${currentPos.left}%`}
                        y2={`${currentPos.top}%`}
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="1"
                        strokeDasharray="4,4"
                        className="map-line"
                        style={{
                          animationDelay: `${index * 0.2}s`
                        }}
                      />
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>

          {/* Content - Base más ancha para el texto */}
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="max-w-7xl mx-auto text-center">
              <PageHeader 
                icon={faMapMarkerAlt}
                title="Ciudades Donde Operamos"
                subtitle="Encuentra técnicos verificados en las principales ciudades de México"
              />
              
              {/* Mensaje sobre expansión - Base más ancha */}
              <div className="mt-8 md:mt-10 bg-white/10 backdrop-blur-sm rounded-lg p-5 md:p-7 lg:p-8 border border-white/20 max-w-6xl mx-auto">
                <p className="text-white text-base md:text-lg lg:text-xl leading-relaxed">
                  Por el momento operamos en las siguientes ciudades, pero <strong className="font-semibold">pronto estaremos apoyándote en tu ciudad</strong>. 
                  <span className="block mt-3">Haz saber tu interés <Link href="/registro" className="underline font-semibold hover:text-blue-200 transition-colors">registrándote</Link>.</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cities Grid */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {CITIES.map((city) => (
                <div
                  key={city.slug}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
                >
                  {/* City Header */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                          {city.name}
                        </h2>
                        <p className="text-sm text-gray-600">{city.state}</p>
                      </div>
                      <div className="bg-indigo-600 text-white rounded-full p-2">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-sm" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{city.description}</p>
                  </div>

                  {/* City Stats */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <FontAwesomeIcon icon={faUsers} className="text-indigo-600 text-xs" />
                          <span className="text-xs text-gray-600">Técnicos</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">{city.professionals}+</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-xs" />
                          <span className="text-xs text-gray-600">Servicios</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">{city.completedJobs.toLocaleString('es-MX')}+</p>
                      </div>
                    </div>

                    {/* Services Available */}
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Servicios Disponibles:</h3>
                      <div className="flex flex-wrap gap-2">
                        {city.services.slice(0, 6).map((service, index) => (
                          <span
                            key={index}
                            className="inline-block bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-md font-medium"
                          >
                            {service}
                          </span>
                        ))}
                        {city.services.length > 6 && (
                          <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">
                            +{city.services.length - 6} más
                          </span>
                        )}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Link
                      href={`/servicios?city=${city.slug}`}
                      className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 group-hover:shadow-md"
                    >
                      Ver Servicios en {city.name}
                      <FontAwesomeIcon icon={faArrowRight} className="ml-2 text-xs" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-white border-t border-gray-200 py-12 md:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 md:p-8 border border-indigo-100">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-center">
                  ¿No encuentras tu ciudad?
                </h2>
                <p className="text-gray-700 text-center mb-2 text-lg">
                  Estamos expandiendo nuestros servicios a más ciudades de México. <strong>Pronto estaremos apoyándote en tu ciudad</strong>.
                </p>
                <p className="text-gray-600 text-center mb-6 text-base">
                  Haz saber tu interés registrándote y te notificaremos cuando lleguemos a tu área.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/registro"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
                  >
                    Registrarme para Expresar Interés
                    <FontAwesomeIcon icon={faArrowRight} />
                  </Link>
                  <Link
                    href="/dashboard/client"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg border-2 border-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    Solicitar Servicio
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

