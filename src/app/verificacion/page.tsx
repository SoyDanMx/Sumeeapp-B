'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faIdCard,
  faCertificate,
  faShieldAlt,
  faStar,
  faCheckCircle,
  faCrown,
  faUserTie,
  faClock,
  faShield,
  faQrcode,
  faSearch,
  faSpinner,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default function VerificacionPage() {
  const router = useRouter();
  const [professionalId, setProfessionalId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!professionalId.trim()) {
      setError('Por favor ingresa un ID de profesional');
      return;
    }

    setLoading(true);
    setError(null);
    router.push(`/verify/${professionalId.trim()}`);
  };

  const handleQRScan = () => {
    alert(
      'Para escanear el código QR:\n\n1. Usa la cámara de tu dispositivo\n2. Apunta al código QR del técnico\n3. Sigue el enlace que aparece\n\nO ingresa el ID del técnico manualmente en el campo de arriba.'
    );
  };
  return (
    <>
      {/* Schema.org JSON-LD - Organization & WebPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            '@id': 'https://www.sumeeapp.com/verificacion',
            name: 'Proceso de Verificación - Sumee App',
            description:
              'Conoce nuestro riguroso proceso de 4 capas para garantizar que solo los mejores profesionales entren a tu hogar.',
            url: 'https://www.sumeeapp.com/verificacion',
            inLanguage: 'es-MX',
            isPartOf: {
              '@type': 'WebSite',
              name: 'Sumee App',
              url: 'https://www.sumeeapp.com',
            },
            about: {
              '@type': 'Thing',
              name: 'Verificación de Profesionales',
              description: 'Sistema de verificación de 4 capas para técnicos y profesionales de servicios',
            },
            mainEntity: {
              '@type': 'Organization',
              name: 'Sumee App',
              url: 'https://www.sumeeapp.com',
              logo: 'https://www.sumeeapp.com/logo.png',
              description: 'Plataforma de servicios profesionales verificados',
              sameAs: [
                // Agregar redes sociales si están disponibles
              ],
            },
          }),
        }}
      />
      
      {/* FAQPage Schema (si aplica) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: '¿Cómo funciona el proceso de verificación de Sumee?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Nuestro proceso de verificación consta de 4 pilares: Identidad Verificada (reconocimiento facial y validación de documentos), Certificaciones Validadas (DC-3 y Red Conocer), Background Check Completo (verificación de antecedentes), y Evaluación Continua (monitoreo de calificaciones y reseñas).',
                },
              },
              {
                '@type': 'Question',
                name: '¿Cómo puedo verificar a un técnico?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Puedes verificar a un técnico ingresando su ID en nuestra página de verificación o escaneando su código QR. Esto te mostrará su perfil completo con todas sus verificaciones, calificaciones y certificaciones.',
                },
              },
            ],
          }),
        }}
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/30">
              <FontAwesomeIcon
                icon={faShieldAlt}
                className="text-green-300 mr-2 text-lg"
              />
              <span className="font-semibold">Proceso de Verificación Sumee</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Tu Tranquilidad es Nuestra Prioridad
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Conoce nuestro riguroso proceso de 4 capas para garantizar que solo
              los mejores profesionales entren a tu hogar.
            </p>
          </div>
        </div>
      </section>

      {/* Sección del Proceso - Los 4 Pilares */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              El Escudo Sumee: Nuestros 4 Pilares de Verificación
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Cada técnico en nuestra plataforma pasa por un proceso exhaustivo
              que garantiza tu seguridad y tranquilidad.
            </p>
          </div>

          {/* Grid de los 4 pilares */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Pilar 1: Identidad Verificada */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 md:p-10 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6 mx-auto">
                <FontAwesomeIcon
                  icon={faIdCard}
                  className="text-white text-3xl"
                />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-center">
                Identidad Verificada
              </h3>
              <p className="text-gray-700 leading-relaxed text-center">
                Usamos tecnología de reconocimiento facial para comparar la
                selfie del técnico con su INE. Verificamos que sea una persona
                real, que sus documentos sean auténticos y que la información
                coincida en múltiples bases de datos gubernamentales.
              </p>
              <div className="mt-6 flex items-center justify-center">
                <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-md">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-green-500 mr-2"
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    Verificación biométrica
                  </span>
                </div>
              </div>
            </div>

            {/* Pilar 2: Certificaciones Validadas */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-100 rounded-2xl p-8 md:p-10 border border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-center w-20 h-20 bg-yellow-600 rounded-full mb-6 mx-auto">
                <FontAwesomeIcon
                  icon={faCertificate}
                  className="text-white text-3xl"
                />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-center">
                Certificaciones Validadas
              </h3>
              <p className="text-gray-700 leading-relaxed text-center">
                Validamos que cada técnico tenga las certificaciones
                profesionales necesarias. Trabajamos directamente con{" "}
                <span className="font-semibold">DC-3</span> y{" "}
                <span className="font-semibold">Red Conocer</span> para
                verificar que sus diplomas y certificados sean auténticos y
                estén vigentes.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-md">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-green-500 mr-2"
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    DC-3 Verificado
                  </span>
                </div>
                <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-md">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-green-500 mr-2"
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    Red Conocer
                  </span>
                </div>
              </div>
            </div>

            {/* Pilar 3: Background Check Completo */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8 md:p-10 border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-center w-20 h-20 bg-green-600 rounded-full mb-6 mx-auto">
                <FontAwesomeIcon
                  icon={faShieldAlt}
                  className="text-white text-3xl"
                />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-center">
                Background Check Completo
              </h3>
              <p className="text-gray-700 leading-relaxed text-center">
                Realizamos una verificación exhaustiva de antecedentes que
                incluye verificación de historial criminal, validación de
                referencias laborales previas y revisión de quejas o reportes
                en otras plataformas. Solo aceptamos técnicos con historial
                impecable.
              </p>
              <div className="mt-6 flex items-center justify-center">
                <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-md">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-green-500 mr-2"
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    Sin antecedentes penales
                  </span>
                </div>
              </div>
            </div>

            {/* Pilar 4: Evaluación Continua */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl p-8 md:p-10 border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-center w-20 h-20 bg-purple-600 rounded-full mb-6 mx-auto">
                <FontAwesomeIcon
                  icon={faStar}
                  className="text-white text-3xl"
                />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-center">
                Evaluación Continua
              </h3>
              <p className="text-gray-700 leading-relaxed text-center">
                La verificación no termina cuando el técnico se une. Monitoreamos
                constantemente sus calificaciones, reseñas de clientes y
                cumplimiento de estándares de calidad. Los técnicos con
                calificaciones bajas o reportes son suspendidos automáticamente
                hasta resolver los problemas.
              </p>
              <div className="mt-6 flex items-center justify-center">
                <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-md">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-green-500 mr-2"
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    Monitoreo 24/7
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas de Confianza */}
          <div className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                100%
              </div>
              <div className="text-sm md:text-base text-gray-600 font-medium">
                Técnicos Verificados
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">
                4.8/5
              </div>
              <div className="text-sm md:text-base text-gray-600 font-medium">
                Calificación Promedio
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">
                50K+
              </div>
              <div className="text-sm md:text-base text-gray-600 font-medium">
                Servicios Completados
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">
                99.9%
              </div>
              <div className="text-sm md:text-base text-gray-600 font-medium">
                Satisfacción Cliente
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Verificación de Profesional - NUEVA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full mb-6">
              <FontAwesomeIcon icon={faShieldAlt} className="text-white text-4xl" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Verifica un Profesional Ahora
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              ¿Tienes el ID o código QR de un técnico? Verifica su identidad y credenciales aquí.
            </p>
          </div>

          {/* Card de Búsqueda */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
            <form onSubmit={handleVerifySubmit} className="mb-6">
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
                        <FontAwesomeIcon icon={faShieldAlt} />
                        <span>Verificar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-6">
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

          {/* Información Rápida */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FontAwesomeIcon icon={faShieldAlt} className="text-green-600 text-xl" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Verificación Segura</h3>
              <p className="text-sm text-gray-600">
                Todos los profesionales pasan por nuestro proceso de 4 capas
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FontAwesomeIcon icon={faQrcode} className="text-blue-600 text-xl" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Verificación Rápida</h3>
              <p className="text-sm text-gray-600">
                Escanea el QR o ingresa el ID para verificar en segundos
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FontAwesomeIcon icon={faInfoCircle} className="text-purple-600 text-xl" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Información Completa</h3>
              <p className="text-sm text-gray-600">
                Ve calificaciones, reseñas y certificaciones del profesional
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de la Garantía Sumee */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-200">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-6">
                <FontAwesomeIcon
                  icon={faShield}
                  className="text-white text-4xl"
                />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Respaldamos cada trabajo: La Garantía Sumee
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                No solo verificamos a nuestros técnicos, también garantizamos la
                calidad de su trabajo con nuestro respaldo financiero.
              </p>
            </div>

            {/* Grid de Garantías */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-10">
              {/* Garantía Básica - 30 días */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border-2 border-blue-300">
                <div className="flex items-center mb-4">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-blue-600 text-2xl mr-3"
                  />
                  <h3 className="text-2xl font-bold text-gray-900">
                    Garantía Estándar
                  </h3>
                </div>
                <div className="mb-4">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    30 Días
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Todos los servicios en Sumee App están respaldados por una
                    garantía de 30 días. Si algo sale mal o no estás
                    completamente satisfecho, nosotros nos hacemos cargo.
                  </p>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="text-green-500 mr-2 mt-1 flex-shrink-0"
                    />
                    <span>Cubre materiales y mano de obra</span>
                  </li>
                  <li className="flex items-start">
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="text-green-500 mr-2 mt-1 flex-shrink-0"
                    />
                    <span>Sin preguntas ni complicaciones</span>
                  </li>
                  <li className="flex items-start">
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="text-green-500 mr-2 mt-1 flex-shrink-0"
                    />
                    <span>Reparación o reembolso garantizado</span>
                  </li>
                </ul>
              </div>

              {/* Garantía Premium - 90 días */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-100 rounded-2xl p-8 border-2 border-yellow-400 relative overflow-hidden">
                {/* Badge Premium */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center">
                  <FontAwesomeIcon icon={faCrown} className="mr-2" />
                  PREMIUM
                </div>
                <div className="flex items-center mb-4">
                  <FontAwesomeIcon
                    icon={faCrown}
                    className="text-yellow-600 text-2xl mr-3"
                  />
                  <h3 className="text-2xl font-bold text-gray-900">
                    Garantía Premium
                  </h3>
                </div>
                <div className="mb-4">
                  <div className="text-4xl font-bold text-yellow-600 mb-2">
                    90 Días
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Los miembros de nuestro Plan Premium disfrutan de una
                    garantía extendida de 90 días, dándote aún más tranquilidad
                    y tiempo para verificar que todo esté perfecto.
                  </p>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="text-green-500 mr-2 mt-1 flex-shrink-0"
                    />
                    <span>Garantía extendida 3 veces más larga</span>
                  </li>
                  <li className="flex items-start">
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="text-green-500 mr-2 mt-1 flex-shrink-0"
                    />
                    <span>Prioridad en atención de garantías</span>
                  </li>
                  <li className="flex items-start">
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="text-green-500 mr-2 mt-1 flex-shrink-0"
                    />
                    <span>Incluye revisión post-servicio</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <Link
                href="/pago-de-servicios"
                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <FontAwesomeIcon icon={faCrown} className="mr-2" />
                Conoce nuestro Sistema de Pago
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Supervisión Premium */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-8 md:p-12 border-2 border-purple-200">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full mb-6">
                <FontAwesomeIcon
                  icon={faUserTie}
                  className="text-white text-3xl"
                />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                ¿Necesitas extra tranquilidad?
              </h3>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Los miembros de nuestro Plan Premium pueden solicitar la
                presencia de un supervisor de Sumee en servicios clave. Nuestro
                experto supervisará el trabajo en tiempo real, asegurándose de
                que se cumplan todos los estándares de calidad y seguridad.
              </p>
            </div>

            {/* Beneficios de Supervisión */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-10">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-md">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="text-green-500 text-2xl mb-3"
                />
                <h4 className="font-bold text-gray-900 mb-2">
                  Supervisión en Vivo
                </h4>
                <p className="text-gray-600 text-sm">
                  Un supervisor certificado presente durante el servicio,
                  verificando cada paso del proceso.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-md">
                <FontAwesomeIcon
                  icon={faShieldAlt}
                  className="text-blue-500 text-2xl mb-3"
                />
                <h4 className="font-bold text-gray-900 mb-2">
                  Garantía Extra
                </h4>
                <p className="text-gray-600 text-sm">
                  Servicios supervisados tienen una garantía extendida adicional
                  y prioridad en resolución de problemas.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-md">
                <FontAwesomeIcon
                  icon={faClock}
                  className="text-purple-500 text-2xl mb-3"
                />
                <h4 className="font-bold text-gray-900 mb-2">
                  Reporte Detallado
                </h4>
                <p className="text-gray-600 text-sm">
                  Recibe un informe completo del servicio con fotos, checklist
                  de calidad y recomendaciones.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <Link
                href="/pago-de-servicios"
                className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <FontAwesomeIcon icon={faCrown} className="mr-2" />
                Configura tu Método de Pago
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para trabajar con técnicos verificados?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Únete a miles de hogares que confían en Sumee App para sus
            servicios.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard/client"
              className="bg-white text-blue-600 font-bold px-8 py-4 rounded-lg shadow-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center"
            >
              Solicitar Servicio Ahora
            </Link>
            <Link
              href="/professionals"
              className="bg-transparent border-2 border-white text-white font-bold px-8 py-4 rounded-lg hover:bg-white hover:text-blue-600 transition-all duration-300 inline-flex items-center justify-center"
            >
              Ver Técnicos Verificados
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}

