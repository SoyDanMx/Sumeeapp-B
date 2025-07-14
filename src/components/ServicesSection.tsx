// src/components/ServicesSection.tsx
'use client';

import React from 'react';
import { ServiceCard } from './ServiceCard'; // Importamos el componente de la tarjeta

// Aquí definimos los datos de nuestros servicios. En una app real, esto vendría de una base de datos.
const servicesData = [
  {
    name: "Plomería",
    rating: 4.8,
    image: "https://readdy.ai/api/search-image?query=Professional%20plumber%20fixing%20sink%20in%20a%20modern%20Latin%20American%20home.%20Clean%2C%20well-lit%20kitchen%20with%20minimal%20water%20visible.%20Tools%20organized%20neatly.%20Professional%20appearance%20with%20uniform.%20Warm%20lighting%20and%20neutral%20background&width=400&height=300&seq=plumbing&orientation=landscape"
  },
  {
    name: "Electricidad",
    rating: 4.7,
    image: "https://readdy.ai/api/search-image?query=Professional%20electrician%20installing%20or%20fixing%20electrical%20components%20in%20a%20modern%20Latin%20American%20home.%20Clean%20workspace%2C%20organized%20tools%2C%20wearing%20safety%20equipment.%20Warm%20lighting%2C%20neutral%20background%2C%20professional%20appearance&width=400&height=300&seq=electrical&orientation=landscape"
  },
  {
    name: "Limpieza",
    rating: 4.9,
    image: "https://readdy.ai/api/search-image?query=Professional%20cleaning%20service%20in%20a%20bright%2C%20modern%20Latin%20American%20home.%20Person%20wearing%20uniform%20using%20cleaning%20equipment%20on%20spotless%20surfaces.%20Organized%20cleaning%20supplies.%20Warm%20lighting%2C%20neutral%20background%2C%20professional%20appearance&width=400&height=300&seq=cleaning&orientation=landscape"
  },
   {
    name: "Pintura",
    rating: 4.8,
    image: "https://readdy.ai/api/search-image?query=Professional%20painter%20working%20in%20a%20modern%20Latin%20American%20home%20interior.%20Person%20in%20work%20clothes%20carefully%20painting%20walls.%20Clean%20workspace%2C%20organized%20painting%20supplies.%20Bright%20natural%20lighting%2C%20minimal%20mess%2C%20professional%20appearance&width=400&height=300&seq=painting&orientation=landscape"
  },
  {
    name: "Carpintería",
    rating: 4.7,
    image: "https://readdy.ai/api/search-image?query=Professional%20carpenter%20working%20on%20wooden%20furniture%20or%20fixtures%20in%20a%20Latin%20American%20home%20workshop.%20Person%20wearing%20work%20clothes%20using%20carpentry%20tools.%20Clean%20organized%20workspace%20with%20wood%20materials.%20Good%20lighting%2C%20professional%20appearance&width=400&height=300&seq=carpentry&orientation=landscape"
  },
  {
    name: "Jardinería",
    rating: 4.6,
    image: "https://readdy.ai/api/search-image?query=Professional%20gardener%20working%20in%20a%20beautiful%20Latin%20American%20garden%20or%20yard.%20Person%20wearing%20work%20clothes%2C%20using%20gardening%20tools.%20Well-maintained%20plants%20and%20flowers.%20Bright%20natural%20lighting%2C%20organized%20workspace%2C%20professional%20appearance&width=400&height=300&seq=gardening&orientation=landscape"
  },
];


export const ServicesSection = () => {
  return (
    <section className="py-16 bg-white" id="servicios">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Servicios Destacados</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Encuentra expertos calificados para cualquier proyecto en tu hogar</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesData.map((service) => (
            <ServiceCard 
              key={service.name}
              name={service.name}
              rating={service.rating}
              image={service.image}
            />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium transition duration-200">
            Ver más servicios
          </button>
        </div>
      </div>
    </section>
  );
}