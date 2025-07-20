// src/app/professionals/page.tsx
'use client';

import React, { useEffect } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faComments, faCheckCircle, faCrown } from '@fortawesome/free-solid-svg-icons';

export default function ProfessionalsPage() {
  // Este useEffect carga el script de Stripe necesario para que el botón funcione.
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/buy-button.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Limpia el script cuando el componente se desmonta para evitar duplicados.
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-16">
        {/* Sección Principal */}
        <div className="max-w-4xl mx-auto text-center">
          <FontAwesomeIcon icon={faCrown} className="text-5xl text-yellow-500 mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Accede a Nuestra Red Exclusiva de Profesionales Verificados
          </h1>
          <p className="text-lg text-gray-600 mb-12">
            Tu membresía Sumee te da acceso directo a los mejores técnicos de tu zona. Olvídate de la incertidumbre y contrata con total confianza.
          </p>
        </div>

        {/* Sección de Beneficios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <FontAwesomeIcon icon={faShieldAlt} className="text-3xl text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Verificación de Confianza</h3>
            <p className="text-gray-600">Cada profesional pasa por un riguroso proceso de validación de identidad y referencias.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <FontAwesomeIcon icon={faComments} className="text-3xl text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Contacto Directo</h3>
            <p className="text-gray-600">Comunícate directamente con los profesionales para explicar tus necesidades y acordar precios justos.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <FontAwesomeIcon icon={faCheckCircle} className="text-3xl text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Garantía de Satisfacción</h3>
            <p className="text-gray-600">Contamos con un sistema de reseñas y soporte para asegurar la calidad de cada trabajo.</p>
          </div>
        </div>

        {/* Sección del Call to Action (CTA) con el botón de Stripe */}
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">¿Listo para Empezar?</h2>
          <p className="text-gray-600 mb-6">Obtén tu membresía básica ahora y encuentra la solución perfecta para tu hogar.</p>
          
          {/* SOLUCIÓN DEFINITIVA: Ignoramos el error de TypeScript en la siguiente línea */}
          {/* @ts-ignore */}
          <stripe-buy-button
            buy-button-id="buy_btn_1RmpzwE2shKTNR9M91kuSgKh"
            publishable-key="pk_live_51P8c4AE2shKTNR9MVARQB4La2uYMMc2shlTCcpcg8EI6MqqPV1uN5uj6UbB5mpfReRKd4HL2OP1LoF17WXcYYeB000Ot1l847E"
          >
          </stripe-buy-button>
        </div>
      </div>
    </PageLayout>
  );
}