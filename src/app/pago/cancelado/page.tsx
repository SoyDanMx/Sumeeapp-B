import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle, faArrowLeft, faCreditCard } from '@fortawesome/free-solid-svg-icons';

export const metadata: Metadata = {
  title: 'Pago Cancelado | Sumee App',
  description: 'El pago fue cancelado. Puedes intentar nuevamente o contactar a soporte si necesitas ayuda.',
};

export default function PagoCanceladoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Cancel Icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FontAwesomeIcon icon={faTimesCircle} className="text-4xl text-red-600" />
        </div>

        {/* Cancel Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Pago Cancelado
        </h1>
        
        <p className="text-gray-600 mb-6">
          El proceso de pago fue cancelado. No se ha realizado ningún cargo a tu cuenta.
        </p>

        {/* Information */}
        <div className="bg-yellow-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-900 mb-3">¿Qué pasó?</h3>
          <ul className="text-sm text-yellow-800 space-y-2 text-left">
            <li>• El pago fue cancelado antes de completarse</li>
            <li>• No se ha realizado ningún cargo</li>
            <li>• Tu solicitud de servicio sigue pendiente</li>
            <li>• Puedes intentar el pago nuevamente</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/pago-de-servicios"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <FontAwesomeIcon icon={faCreditCard} />
            <span>Ver Sistema de Pago</span>
          </Link>
          
          <Link
            href="/dashboard/client"
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Volver al Dashboard</span>
          </Link>
        </div>

        {/* Help Section */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">¿Necesitas ayuda?</h3>
          <p className="text-sm text-gray-600 mb-3">
            Si tienes problemas con el pago o necesitas asistencia, nuestro equipo está aquí para ayudarte.
          </p>
          <div className="space-y-2">
            <Link
              href="/contact"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Contactar Soporte
            </Link>
            <span className="text-gray-400">•</span>
            <Link
              href="/help"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Centro de Ayuda
            </Link>
          </div>
        </div>

        {/* Common Issues */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Problemas comunes:</h4>
          <ul className="text-xs text-blue-800 space-y-1 text-left">
            <li>• Verifica que tu tarjeta tenga fondos suficientes</li>
            <li>• Asegúrate de que los datos sean correctos</li>
            <li>• Intenta con una tarjeta diferente</li>
            <li>• Contacta a tu banco si el problema persiste</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
