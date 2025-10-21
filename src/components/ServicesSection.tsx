// src/components/ServicesSection.tsx
'use client';

import React from 'react';
import Link from 'next/link'; // 1. Importamos Link para la navegación
import { ServiceCard } from './ServiceCard';
import { servicesData } from '@/lib/servicesData'; // 2. Importamos los datos desde el archivo central

export const ServicesSection = () => {
  return (
    <section className="py-16 bg-white" id="servicios">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Servicios Populares</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Encuentra expertos calificados para cualquier proyecto en tu hogar</p>
        </div>
        
        {/* Mostramos solo los primeros 6 servicios para una UI limpia en la página de inicio. */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesData.slice(0, 6).map((service) => (
            <ServiceCard 
              key={service.name}
              name={service.name}
              rating={service.rating}
              image={service.image}
              priceRange={service.priceRange}
            />
          ))}
        </div>
        
        <div className="text-center mt-12">
          {/* 3. Reemplazamos el <button> por un <Link> con los mismos estilos */}
          <Link 
            href="/servicios" 
            className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium transition duration-200 inline-block"
          >
            Ver todos los servicios
          </Link>
        </div>
      </div>
    </section>
  );
}