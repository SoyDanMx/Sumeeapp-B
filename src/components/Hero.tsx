// src/components/Hero.tsx
'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

export const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  return (
    <section className="relative h-[600px] flex items-center bg-gray-800">
      {/* Capa de la Imagen de Fondo */}
      <div className="absolute inset-0 z-0">
        {/* Superposición de gradiente para oscurecer la imagen y que el texto sea legible */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent z-10"></div>
        <img
          src="https://readdy.ai/api/search-image?query=Professional%20home%20service%20workers%20in%20Latin%20America%20working%20on%20house%20repairs%2C%20plumbing%2C%20and%20electrical%20work.%20A%20diverse%20team%20of%20skilled%20professionals%20with%20tools%2C%20helping%20homeowners.%20Clean%2C%20modern%20homes%20with%20warm%20lighting%20and%20natural%20elements.%20Professional%2C%20trustworthy%20appearance&width=1440&height=600&seq=hero1&orientation=landscape"
          alt="Profesionales trabajando"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Contenido de la Sección */}
      <div className="container mx-auto px-4 relative z-20">
        <div className="max-w-2xl text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Encuentra tecnicos confiables en minutos</h2>
          <p className="text-xl mb-8">Conectamos expertos certificados con usuarios que necesitan servicios técnicos de calidad.</p>
          
          {/* Barra de Búsqueda */}
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Campo de Búsqueda de Servicio */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 text-sm"
                  placeholder="¿Qué servicio necesitas?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Campo de Ubicación */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 text-sm"
                  placeholder="Tu ubicación"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition duration-200 whitespace-nowrap">
                Buscar
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}