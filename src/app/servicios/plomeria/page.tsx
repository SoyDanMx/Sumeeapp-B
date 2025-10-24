import React from 'react';
import { Metadata } from 'next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWrench, faCheckCircle, faClock, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Plomería en CDMX - Reparaciones y Instalaciones | Sumee App',
  description: 'Servicios de plomería profesionales en Ciudad de México. Reparaciones urgentes, instalaciones y mantenimiento. Técnicos verificados con garantía.',
  keywords: ['plomería CDMX', 'reparaciones plomería', 'instalaciones plomería', 'plomero urgente', 'servicios plomería Ciudad de México'],
};

export default function PlomeriaPage() {
  const services = [
    'Reparación de fugas',
    'Instalación de tinacos',
    'Desazolve de drenajes',
    'Cambio de válvulas',
    'Instalación de calentadores',
    'Reparación de llaves',
    'Instalación de sanitarios',
    'Mantenimiento preventivo'
  ];

  const benefits = [
    {
      icon: faCheckCircle,
      title: 'Respuesta Rápida',
      description: 'Técnicos disponibles 24/7 para emergencias'
    },
    {
      icon: faShieldAlt,
      title: 'Garantía Total',
      description: 'Todos nuestros trabajos tienen garantía'
    },
    {
      icon: faClock,
      title: 'Cotización Gratuita',
      description: 'Sin compromiso, precio justo y transparente'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FontAwesomeIcon icon={faWrench} className="text-3xl" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Servicios de Plomería en CDMX
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Reparaciones, instalaciones y mantenimiento de plomería con técnicos verificados. 
              Respuesta en menos de 2 horas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/join-as-pro"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Solicitar Servicio
              </Link>
              <Link 
                href="/professionals"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Ver Técnicos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Nuestros Servicios de Plomería
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {services.map((service, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FontAwesomeIcon icon={faWrench} className="text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{service}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              ¿Por qué elegir Sumee App?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FontAwesomeIcon icon={benefit.icon} className="text-2xl text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Necesitas un Plomero Ahora?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Solicita tu servicio y recibe respuesta en menos de 2 horas
          </p>
          <Link 
            href="/join-as-pro"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors inline-block"
          >
            Solicitar Servicio Gratis
          </Link>
        </div>
      </section>
    </div>
  );
}
