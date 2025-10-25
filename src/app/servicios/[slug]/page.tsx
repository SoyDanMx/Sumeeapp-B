import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faClock, faShieldAlt, faWrench, faStar } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { getServiceBySlug } from '@/lib/servicesData';

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  
  if (!service) {
    return {
      title: 'Servicio no encontrado | Sumee App',
      description: 'El servicio solicitado no está disponible.'
    };
  }

  return {
    title: `${service.name} en CDMX - Servicios Profesionales | Sumee App`,
    description: service.description,
    keywords: [
      `${service.name.toLowerCase()} CDMX`,
      `servicios ${service.name.toLowerCase()}`,
      `técnicos ${service.name.toLowerCase()}`,
      `profesionales ${service.name.toLowerCase()}`,
      'Ciudad de México'
    ],
  };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  
  if (!service) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
              {service.icon}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Servicios de {service.name} en CDMX
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              {service.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/membresia"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Solicitar Servicio
              </Link>
              <Link 
                href={`/tecnicos?servicio=${service.slug}`}
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
              Nuestros Servicios de {service.name}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {service.services.map((serviceItem, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-center">
                    <div className={`w-12 h-12 ${service.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <FontAwesomeIcon icon={faWrench} className={`${service.color}`} />
                    </div>
                    <h3 className="font-semibold text-gray-900">{serviceItem}</h3>
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
              {service.benefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className={`w-16 h-16 ${service.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <FontAwesomeIcon icon={faCheckCircle} className={`text-2xl ${service.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {benefit.split(' - ')[0]}
                  </h3>
                  <p className="text-gray-600">
                    {benefit.split(' - ')[1]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Confianza y Calidad Garantizada
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <FontAwesomeIcon icon={faShieldAlt} className="text-blue-600" />
                <span className="text-sm">Técnicos verificados</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <FontAwesomeIcon icon={faClock} className="text-green-600" />
                <span className="text-sm">Respuesta en 2 horas</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <FontAwesomeIcon icon={faStar} className="text-yellow-600" />
                <span className="text-sm">4.8/5 estrellas promedio</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Necesitas un {service.name} Ahora?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Solicita tu servicio y recibe respuesta en menos de 2 horas
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/membresia"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors inline-block"
            >
              Solicitar Servicio Gratis
            </Link>
            <Link 
              href={`/tecnicos?servicio=${service.slug}`}
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors inline-block"
            >
              Ver Técnicos Disponibles
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
