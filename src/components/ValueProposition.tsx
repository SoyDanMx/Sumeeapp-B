// src/components/ValueProposition.tsx
'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCheck, faShieldAlt, faThumbsUp, faCheckCircle, faIdCard, faAward, faCertificate } from '@fortawesome/free-solid-svg-icons';

// Datos para las tarjetas de beneficios. Así mantenemos el código JSX limpio.
const benefits = [
  {
    icon: faUserCheck,
    title: "Profesionales Verificados",
    description: "Todos nuestros profesionales pasan por un riguroso proceso de verificación de antecedentes y credenciales.",
    verificationBadges: [
      { icon: faIdCard, text: "ID y Datos Legales Validados" },
      { icon: faShieldAlt, text: "Verificación de Antecedentes No Penales" },
      { icon: faCertificate, text: "Certificaciones Técnicas Validadas (CONOCER/DC3)" },
      { icon: faAward, text: "Mínimo 2 Años de Experiencia Comprobada" },
      { icon: faCheckCircle, text: "El Servicio está Cubierto por Garantía Sumee" }
    ]
  },
  {
    icon: faShieldAlt,
    title: "Pagos Seguros",
    description: "Nuestra plataforma garantiza transacciones seguras y protegidas para todos los servicios contratados."
  },
  {
    icon: faThumbsUp,
    title: "Garantía de Satisfacción",
    description: "Si el servicio falla en los primeros 30 días, lo reparamos sin costo adicional."
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
              <p className="text-gray-600 mb-4">{benefit.description}</p>
              
              {/* Badges de verificación para Profesionales Verificados */}
              {benefit.verificationBadges && (
                <div className="mt-4 grid grid-cols-1 gap-3">
                  {benefit.verificationBadges.map((badge, badgeIndex) => (
                    <div key={badgeIndex} className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <FontAwesomeIcon icon={badge.icon} className="text-green-600 mr-3 text-sm flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-800 text-left">{badge.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}