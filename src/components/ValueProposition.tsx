// src/components/ValueProposition.tsx
'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCheck, faShieldAlt, faThumbsUp } from '@fortawesome/free-solid-svg-icons';

// Datos para las tarjetas de beneficios. Así mantenemos el código JSX limpio.
const benefits = [
  {
    icon: faUserCheck,
    title: "Profesionales Verificados",
    description: "Todos nuestros profesionales pasan por un riguroso proceso de verificación de antecedentes y credenciales."
  },
  {
    icon: faShieldAlt,
    title: "Pagos Seguros",
    description: "Nuestra plataforma garantiza transacciones seguras y protegidas para todos los servicios contratados."
  },
  {
    icon: faThumbsUp,
    title: "Garantía de Satisfacción",
    description: "Si no estás satisfecho con el servicio, trabajaremos contigo para resolver cualquier problema que surja."
  }
];

export const ValueProposition = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Título de la sección */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Por qué elegir Sumee?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Ofrecemos la mejor experiencia para encontrar profesionales de confianza</p>
        </div>
        
        {/* Grilla de Beneficios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FontAwesomeIcon icon={benefit.icon} className="text-2xl text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}