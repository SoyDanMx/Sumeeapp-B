'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheckCircle, faExclamationTriangle, faEnvelope } from '@fortawesome/free-solid-svg-icons';

export default function ConfirmTestUserPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const confirmEmail = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/confirm-user-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: 'cliente@sumeeapp.com',
          userId: '90ce751d-8e90-47a3-abc1-36c1e033d48d'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al confirmar email');
      }

      setResult({
        success: true,
        message: data.message || 'Email confirmado exitosamente',
        user: data.user,
      });
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <FontAwesomeIcon 
              icon={faEnvelope} 
              className="text-blue-600 text-5xl mb-4"
            />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Confirmar Email de Usuario de Prueba
            </h1>
            <p className="text-gray-600">
              Confirma el email del usuario <code className="bg-gray-100 px-2 py-1 rounded">cliente@sumeeapp.com</code>
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Información del Usuario:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li><strong>Email:</strong> cliente@sumeeapp.com</li>
              <li><strong>User ID:</strong> 90ce751d-8e90-47a3-abc1-36c1e033d48d</li>
              <li><strong>Estado Actual:</strong> Email no confirmado</li>
            </ul>
          </div>

          <button
            onClick={confirmEmail}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mb-6"
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                <span>Confirmando...</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faEnvelope} />
                <span>Confirmar Email</span>
              </>
            )}
          </button>

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-xl mr-3 mt-1" />
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">{result.message}</h3>
                  {result.user && (
                    <div className="text-sm text-green-800 space-y-1">
                      <p><strong>Email:</strong> {result.user.email}</p>
                      <p><strong>Confirmado en:</strong> {result.user.email_confirmed_at ? new Date(result.user.email_confirmed_at).toLocaleString() : 'N/A'}</p>
                    </div>
                  )}
                  <p className="text-sm text-green-700 mt-3">
                    ✅ El usuario ahora puede iniciar sesión con las credenciales de prueba.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 text-xl mr-3 mt-1" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-2">Error</h3>
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Otras Opciones:</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>
                <strong>1. Dashboard de Supabase:</strong> Ve a Authentication &gt; Users &gt; Buscar cliente@sumeeapp.com &gt; Confirm email
              </li>
              <li>
                <strong>2. Script Node.js:</strong> Ejecuta <code className="bg-gray-100 px-2 py-1 rounded">node scripts/confirm-test-user-email.js</code>
              </li>
              <li>
                <strong>3. API Directa:</strong> POST <code className="bg-gray-100 px-2 py-1 rounded">/api/admin/confirm-user-email</code>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

