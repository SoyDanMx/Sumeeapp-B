// src/components/HeroVisual.tsx
// Componente Hero mejorado con imagen de fondo de alta calidad

'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faStar, faUsers, faClock } from '@fortawesome/free-solid-svg-icons';

export default function HeroVisual() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Fondo con gradiente como fallback */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800">
        {/* Imagen de fondo hero principal */}
        <div className="absolute inset-0">
          <Image
            src="/images/services/plomeria-hero.svg"
            alt="Técnico profesional de Sumee trabajando en hogar mexicano"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>
        {/* Overlay con gradiente para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge de confianza */}
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-8">
            <FontAwesomeIcon icon={faStar} className="text-yellow-400 mr-2" />
            <span>+50,000 servicios completados</span>
            <span className="mx-2">•</span>
            <span>4.8/5 estrellas</span>
          </div>

          {/* Título principal */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Técnicos
            <span className="block text-blue-400">Verificados</span>
            <span className="block">Para Tu Hogar</span>
          </h1>

          {/* Subtítulo */}
          <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed">
            Conectamos hogares mexicanos con los mejores profesionales. 
            <span className="text-blue-300 font-semibold"> Respuesta en menos de 2 horas.</span>
          </p>

          {/* Estadísticas de confianza */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <FontAwesomeIcon icon={faUsers} className="text-blue-400 text-2xl mr-2" />
                <span className="text-3xl font-bold text-white">2,500+</span>
              </div>
              <p className="text-gray-300">Profesionales Verificados</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <FontAwesomeIcon icon={faClock} className="text-green-400 text-2xl mr-2" />
                <span className="text-3xl font-bold text-white">2h</span>
              </div>
              <p className="text-gray-300">Tiempo Promedio de Respuesta</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-2xl mr-2" />
                <span className="text-3xl font-bold text-white">4.8</span>
              </div>
              <p className="text-gray-300">Calificación Promedio</p>
            </div>
          </div>

          {/* CTAs principales */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/servicios"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center"
            >
              <span>Ver Servicios</span>
              <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
            </Link>
            
            <Link
              href="/join-as-pro"
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-2 border-white/30 hover:border-white/50 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105"
            >
              Únete como Profesional
            </Link>
          </div>

          {/* Texto de confianza adicional */}
          <p className="text-sm text-gray-300 mt-8 max-w-2xl mx-auto">
            🔒 Verificación de identidad • 💳 Pago seguro • ⭐ Garantía de calidad
          </p>
        </div>
      </div>

      {/* Elementos decorativos */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-green-500/20 rounded-full blur-xl animate-pulse delay-1000" />
    </section>
  );
}
