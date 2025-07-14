// src/components/ProfessionalCTA.tsx
'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faCalendarCheck, faStar, faHeadset } from '@fortawesome/free-solid-svg-icons';

// Datos para los beneficios de los profesionales.
const benefitsForPros = [
  {
    icon: faUsers,
    title: "Más clientes potenciales",
    description: "Accede a una amplia base de clientes que buscan activamente tus servicios en tu área."
  },
  {
    icon: faCalendarCheck,
    title: "Gestión simplificada",
    description: "Administra tus citas, presupuestos y pagos de forma centralizada y sencilla desde tu panel."
  },
  {
    icon: faStar,
    title: "Construye tu reputación",
    description: "Recibe reseñas y calificaciones verificadas por cada trabajo para destacar la calidad de tu servicio."
  },
  {
    icon: faHeadset,
    title: "Apoyo continuo",
    description: "Nuestro equipo de soporte está disponible para ayudarte a resolver dudas y a crecer tu negocio."
  }
];

export const ProfessionalCTA = () => {
  return (
    <section className="py-16 bg-blue-600" id="profesionales">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          
          {/* Columna Izquierda: Texto y Botón CTA */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-white mb-4">¿Eres un profesional? Únete a nuestra red</h2>
            <p className="text-xl text-blue-100 mb-6">Conecta con miles de clientes en tu área y haz crecer tu negocio con Sumee.</p>
            <button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-bold text-lg transition duration-200 shadow-lg">
              Registrarme como profesional
            </button>
          </div>
          
          {/* Columna Derecha: Tarjeta de Beneficios */}
          <div className="lg:w-1/2 bg-white p-8 rounded-xl shadow-lg w-full">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Beneficios para profesionales</h3>
            <div className="space-y-5">
              {benefitsForPros.map((benefit, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <FontAwesomeIcon icon={benefit.icon} className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{benefit.title}</h4>
                    <p className="text-gray-600 text-sm">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}