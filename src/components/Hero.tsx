// src/components/Hero.tsx
'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

export const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  return (
    <section className="relative h-[500px] md:h-[600px] flex items-center bg-gray-800">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent z-10"></div>
        <img
          src="https://readdy.ai/api/search-image?query=Professional%20home%20service%20workers%20in%20Latin%20America%20working%20on%20house%20repairs%2C%20plumbing%2C%20and%20electrical%20work.%20A%20diverse%20team%20of%20skilled%20professionals%20with%20tools%2C%20helping%20homeowners.%20Clean%2C%20modern%20homes%20with%20warm%20lighting%20and%20natural%20elements.%20Professional%2C%20trustworthy%20appearance&width=1440&height=600&seq=hero1&orientation=landscape"
          alt="Profesionales de servicios para el hogar trabajando en CDMX"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-20">
        <div className="max-w-2xl text-white">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Técnicos y Servicios a Domicilio en CDMX</h1>
          <p className="text-lg sm:text-xl mb-8">Encuentra plomeros, electricistas y más profesionales verificados en tu alcaldía. Reparaciones para el hogar, rápido y seguro.</p>
          
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                  placeholder="¿Qué servicio a domicilio necesitas?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                  placeholder="Alcaldía o Colonia (ej. Coyoacán)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              
              {/* TEXTO DEL BOTÓN ACTUALIZADO */}
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition">
                Encontrar mi técnico
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}