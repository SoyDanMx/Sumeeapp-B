'use client';

import React from 'react';
import { PageLayout } from '@/components/PageLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle, faCrown, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default function MembresiaCancelPage() {
  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center py-20">
        <div className="max-w-2xl mx-auto text-center px-4">
          {/* Cancel Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-2xl">
              <FontAwesomeIcon icon={faTimesCircle} className="text-4xl text-white" />
            </div>
          </div>

          {/* Cancel Message */}
          <div className="bg-white rounded-3xl shadow-2xl p-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Pago Cancelado
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              No se completó el pago de tu membresía. No se ha cargado nada a tu tarjeta.
            </p>

            {/* Reassurance */}
            <div className="bg-blue-50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">¿Cambiaste de opinión?</h3>
              <p className="text-blue-800">
                No hay problema. Puedes volver a intentar cuando estés listo, o contactarnos si tienes alguna pregunta sobre nuestros servicios.
              </p>
            </div>

            {/* Benefits Reminder */}
            <div className="text-left mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recuerda los beneficios de Sumee PRO:</h3>
              <ul className="space-y-2 text-gray-700 text-left">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                  <span>Acceso directo a profesionales verificados</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                  <span>Contacto inmediato sin intermediarios</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                  <span>Solicitudes ilimitadas y soporte prioritario</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/membresia"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <FontAwesomeIcon icon={faCrown} />
                <span>Intentar de Nuevo</span>
              </a>
              <a
                href="/"
                className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50 px-8 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                <span>Volver al Inicio</span>
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              ¿Tienes dudas? Contáctanos en{' '}
              <a href="mailto:contacto@sumeeapp.com" className="text-indigo-600 hover:underline">
                contacto@sumeeapp.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
