// src/components/TestimonialsSection.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

// Datos de los testimonios.
const testimonials = [
  {
    name: "María González",
    service: "Plomería",
    rating: 5,
    comment: "El plomero llegó puntual y resolvió el problema rápidamente. Muy profesional y el precio fue justo. ¡Lo recomiendo totalmente!",
    image: "https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20a%20Latin%20American%20woman%20in%20her%2030s%20with%20a%20warm%20smile.%20Clean%2C%20neutral%20background.%20Professional%20appearance%2C%20business%20casual%20attire.%20Good%20lighting%20highlighting%20friendly%20expression&width=100&height=100&seq=testimonial1&orientation=squarish"
  },
  {
    name: "Carlos Rodríguez",
    service: "Electricidad",
    rating: 5,
    comment: "Excelente servicio. El electricista identificó el problema que otros no pudieron encontrar. Trabajo limpio y eficiente.",
    image: "https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20a%20Latin%20American%20man%20in%20his%2040s%20with%20a%20confident%20smile.%20Clean%2C%20neutral%20background.%20Professional%20appearance%2C%20business%20casual%20attire.%20Good%20lighting%20highlighting%20friendly%20expression&width=100&height=100&seq=testimonial2&orientation=squarish"
  },
  {
    name: "Ana Martínez",
    service: "Limpieza",
    rating: 4,
    comment: "El servicio de limpieza fue muy completo. Dejaron mi casa impecable y fueron muy respetuosos con mis pertenencias.",
    image: "https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20a%20Latin%20American%20woman%20in%20her%2050s%20with%20a%20gentle%20smile.%20Clean%2C%20neutral%20background.%20Professional%20appearance%2C%20casual%20elegant%20attire.%20Good%20lighting%20highlighting%20friendly%20expression&width=100&height=100&seq=testimonial3&orientation=squarish"
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Título de la sección */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Lo que dicen nuestros clientes</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Miles de personas han encontrado profesionales de confianza a través de Sumee</p>
        </div>

        {/* Grilla de Testimonios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.service}</p>
                </div>
              </div>
              
              {/* Lógica para mostrar las estrellas */}
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <FontAwesomeIcon
                    key={i}
                    icon={faStar}
                    className={i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}
                  />
                ))}
              </div>
              
              <p className="text-gray-700">{testimonial.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};