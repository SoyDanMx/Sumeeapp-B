'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShieldCheck,
  faQrcode,
  faSearch,
  faSpinner,
  faInfoCircle,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';

export const metadata = {
  title: 'Verificar Profesional | Sumee App',
  description:
    'Verifica la identidad y credenciales de profesionales en Sumee. Ingresa el ID del técnico o escanea su código QR para ver su perfil verificado.',
  keywords: 'verificar técnico, verificación profesional, QR code verificación, técnico verificado',
};

export default function VerifyPage() {
  const router = useRouter();
  const [professionalId, setProfessionalId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!professionalId.trim()) {
      setError('Por favor ingresa un ID de profesional');
      return;
    }

    setLoading(true);
    setError(null);

    // Redirect to verification page
    router.push(`/verify/${professionalId.trim()}`);
  };

  const handleQRScan = () => {
    // This would typically open a QR scanner
    // For now, we'll show instructions
    alert(
      'Para escanear el código QR:\n\n1. Usa la cámara de tu dispositivo\n2. Apunta al código QR del técnico\n3. Sigue el enlace que aparece\n\nO ingresa el ID del técnico manualmente en el campo de arriba.'
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full mb-6">
            <FontAwesomeIcon icon={faShieldCheck} className="text-white text-4xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Verificar Profesional
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Verifica la identidad y credenciales de cualquier técnico en Sumee. Ingresa su ID o
            escanea su código QR.
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
          {/* Search Form */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="professionalId" className="block text-sm font-medium text-gray-700 mb-2">
                  ID del Profesional
                </label>
                <div className="relative">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="professionalId"
                    type="text"
                    value={professionalId}
                    onChange={(e) => {
                      setProfessionalId(e.target.value);
                      setError(null);
                    }}
                    placeholder="Ingresa el ID del técnico (ej: abc123xyz)"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                </div>
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin />
                      <span>Verificando...</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faShieldCheck} />
                      <span>Verificar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">O</span>
            </div>
          </div>

          {/* QR Scanner Option */}
          <div className="text-center">
            <button
              onClick={handleQRScan}
              className="inline-flex items-center gap-3 px-6 py-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <FontAwesomeIcon icon={faQrcode} className="text-2xl text-purple-600" />
              <div className="text-left">
                <p className="font-semibold text-gray-900">Escanear Código QR</p>
                <p className="text-sm text-gray-600">Usa la cámara de tu dispositivo</p>
              </div>
            </button>
          </div>
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faShieldCheck} className="text-green-600 text-xl" />
              </div>
              <h3 className="font-semibold text-gray-900">Verificación Segura</h3>
            </div>
            <p className="text-sm text-gray-600">
              Todos los profesionales en Sumee pasan por un riguroso proceso de verificación de 4
              capas.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faQrcode} className="text-blue-600 text-xl" />
              </div>
              <h3 className="font-semibold text-gray-900">Verificación Rápida</h3>
            </div>
            <p className="text-sm text-gray-600">
              Escanea el código QR del técnico para verificar su identidad en segundos.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faInfoCircle} className="text-purple-600 text-xl" />
              </div>
              <h3 className="font-semibold text-gray-900">Información Completa</h3>
            </div>
            <p className="text-sm text-gray-600">
              Ve calificaciones, reseñas, certificaciones y más información del profesional.
            </p>
          </div>
        </div>

        {/* How it Works */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">¿Cómo Funciona?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Obtén el ID</h3>
              <p className="text-sm text-gray-600">
                Pide al técnico su ID de verificación o escanea su código QR
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Ingresa o Escanea</h3>
              <p className="text-sm text-gray-600">
                Ingresa el ID en el campo de arriba o usa la cámara para escanear
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Revisa la Verificación</h3>
              <p className="text-sm text-gray-600">
                Ve el perfil completo con todas las verificaciones y credenciales
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-2xl" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Confía y Contrata</h3>
              <p className="text-sm text-gray-600">
                Con la verificación confirmada, puedes contratar con confianza
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">¿Eres un profesional y quieres ser verificado?</p>
          <a
            href="/join-as-pro"
            className="inline-block px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl"
          >
            Únete como Profesional
          </a>
        </div>
      </div>
    </div>
  );
}
