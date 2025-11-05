// src/components/HowItWorks.tsx
'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUserCheck, faCalendarAlt, faSmile } from '@fortawesome/free-solid-svg-icons';
import { ScrollReveal } from './ScrollReveal';

// Datos para los pasos del proceso - Simplificado a 3 pasos enfocados en confianza.
const steps = [
  {
    step: 1,
    icon: faSearch,
    title: "Confirma",
    description: "Servicio y Ubicación - Selecciona el servicio que necesitas y confirma tu ubicación para encontrar técnicos cercanos."
  },
  {
    step: 2,
    icon: faUserCheck,
    title: "Agenda",
    description: "Con profesional verificado - Revisa perfiles, calificaciones y agenda directamente con el técnico de tu elección."
  },
  {
    step: 3,
    icon: faCalendarAlt,
    title: "Paga",
    description: "Con Garantía Sumee - Disfruta del servicio con la tranquilidad de nuestra garantía de satisfacción completa."
  }
];

export const HowItWorks = () => {
  return (
    <ScrollReveal variant="slide-up">
      <section className="py-16 bg-white" id="como-funciona">
        <div className="container mx-auto px-4">
          {/* Título de la sección */}
          <ScrollReveal variant="fade" delay={0}>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Cómo Funciona</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Encontrar un profesional confiable nunca ha sido tan fácil</p>
            </div>
          </ScrollReveal>
          
          {/* Grilla de Pasos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
            {steps.map((step, index) => (
              <ScrollReveal 
                key={index} 
                variant="slide-up" 
                delay={index * 150}
              >
                <div className="text-center relative">
              {/* Línea punteada de conexión (solo en escritorio) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[55%] w-[90%] border-t-2 border-dashed border-blue-300"></div>
              )}

              {/* Círculo con el ícono */}
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <FontAwesomeIcon icon={step.icon} className="text-3xl text-blue-600" />
              </div>
              
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}