// src/components/TestimonialsSection.tsx
'use client';

import React from 'react';
// Ya no necesitamos 'next/image' ni 'Image' ya que no usaremos fotos.
// import Image from 'next/image'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

// --- NUEVA FUNCIÓN DE UTILIDAD ---
// Función para generar un color de fondo consistente basado en el nombre
const getColorFromName = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

// Datos de los testimonios.
const testimonials = [
  {
    name: "María González",
    service: "Plomería",
    rating: 5,
    comment: "El plomero llegó puntual y resolvió el problema rápidamente. Muy profesional y el precio fue justo. ¡Lo recomiendo totalmente!",
    // No necesitamos el campo 'image' aquí
  },
  {
    name: "Carlos Rodríguez",
    service: "Electricidad",
    rating: 5,
    comment: "Excelente servicio. El electricista identificó el problema que otros no pudieron encontrar. Trabajo limpio y eficiente.",
  },
  {
    name: "Ana Martínez",
    service: "Limpieza",
    rating: 4,
    comment: "El servicio de limpieza fue muy completo. Dejaron mi casa impecable y fueron muy respetuosos con mis pertenencias.",
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
          {testimonials.map((testimonial, index) => {
            const initial = testimonial.name.charAt(0).toUpperCase();
            const backgroundColor = getColorFromName(testimonial.name);

            return (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  {/* --- CAMBIO AQUÍ: Avatar con inicial --- */}
                  <div 
                    className="w-12 h-12 rounded-full mr-4 flex items-center justify-center text-white font-bold text-xl"
                    style={{ backgroundColor: backgroundColor }}
                  >
                    {initial}
                  </div>
                  {/* --- FIN CAMBIO --- */}
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
            );
          })}
        </div>
      </div>
    </section>
  );
};