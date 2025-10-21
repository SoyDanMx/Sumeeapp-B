'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faCrown, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useSearchParams } from 'next/navigation';

function MembresiaSuccessContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const session = searchParams.get('session_id');
    setSessionId(session);
    
    // Simular carga de verificación de sesión
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchParams]);

  if (isLoading) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Verificando tu membresía</h2>
              <p className="text-gray-600">Estamos confirmando tu pago...</p>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-20">
        <div className="max-w-2xl mx-auto text-center px-4">
          {/* Success Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl">
              <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-white" />
            </div>
          </div>

          {/* Success Message */}
          <div className="bg-white rounded-3xl shadow-2xl p-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              ¡Membresía Activada!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Bienvenido a Sumee Premium. Ya tienes acceso completo a nuestra red de profesionales verificados.
            </p>

            {/* Session Info */}
            {sessionId && (
              <div className="bg-gray-50 rounded-xl p-4 mb-8">
                <p className="text-sm text-gray-500 mb-2">ID de Sesión:</p>
                <code className="text-xs text-gray-700 bg-white px-3 py-2 rounded border">
                  {sessionId}
                </code>
              </div>
            )}

            {/* Benefits List */}
            <div className="text-left mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ya puedes disfrutar de:</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mr-3" />
                  <span>Acceso directo a profesionales verificados</span>
                </li>
                <li className="flex items-center">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mr-3" />
                  <span>Contacto inmediato por WhatsApp</span>
                </li>
                <li className="flex items-center">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mr-3" />
                  <span>Solicitudes ilimitadas</span>
                </li>
                <li className="flex items-center">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mr-3" />
                  <span>Soporte prioritario</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/dashboard"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <FontAwesomeIcon icon={faCrown} />
                <span>Ir a Mi Dashboard</span>
              </a>
              <a
                href="/servicios"
                className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white px-8 py-3 rounded-xl font-semibold transition-colors duration-200"
              >
                Explorar Servicios
              </a>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Si tienes alguna pregunta, contacta a nuestro soporte en{' '}
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

export default function MembresiaSuccessPage() {
  return (
    <Suspense fallback={
      <PageLayout>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Cargando...</h2>
              <p className="text-gray-600">Preparando tu página de éxito...</p>
            </div>
          </div>
        </div>
      </PageLayout>
    }>
      <MembresiaSuccessContent />
    </Suspense>
  );
}
