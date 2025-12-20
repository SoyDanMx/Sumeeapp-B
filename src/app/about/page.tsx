'use client';

import React from 'react';
import { PageLayout } from '@/components/PageLayout';
import { PageHeader } from '@/components/PageHeader';
import HeroStatistics from '@/components/HeroStatistics';
import { faHeart, faShieldAlt, faUsers, faRocket, faCheckCircle, faHandshake } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <PageLayout>
      <div className="bg-white">
        {/* Hero Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
          <PageHeader 
            icon={faHeart}
              title="Sobre Nosotros"
              subtitle="Conectando hogares con manos expertas y de confianza en toda Latinoamérica."
            />
          </div>

          {/* Estadísticas destacadas */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <HeroStatistics />
          </div>
        </div>

        {/* Imagen principal */}
        <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 md:mb-16">
          <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-xl">
            <Image 
                src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=80" 
                alt="Equipo de Sumee trabajando en colaboración" 
                fill
                className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>
        </div>

        {/* Contenido principal */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-16 lg:pb-20">
          <div className="max-w-4xl mx-auto">
            {/* Sección: Nuestra Historia */}
            <section className="mb-12 md:mb-16">
              <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 md:p-10 lg:p-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6">
                  Nuestra Historia
                </h2>
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                  <p className="text-base sm:text-lg md:text-xl mb-4">
                    Nacimos de la necesidad de encontrar ayuda de calidad de forma rápida y segura. Cada profesional en nuestra plataforma pasa por un riguroso proceso de verificación para garantizar tu tranquilidad.
                  </p>
                  <p className="text-base sm:text-lg mb-4">
                    No somos solo una app, somos una comunidad construida sobre la confianza y el trabajo bien hecho, pensada específicamente para las necesidades de Latinoamérica.
                  </p>
                  <p className="text-base sm:text-lg">
                    Desde nuestros inicios, hemos conectado a miles de hogares con técnicos verificados, transformando la forma en que las personas encuentran y contratan servicios para el hogar.
                  </p>
                </div>
              </div>
            </section>

            {/* Sección: Nuestros Valores */}
            <section className="mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 md:mb-8 text-center">
                Nuestros Valores
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[
                  {
                    icon: faShieldAlt,
                    title: "Confianza",
                    description: "Cada profesional pasa por un proceso riguroso de verificación para garantizar tu seguridad.",
                    color: "from-blue-500 to-blue-600"
                  },
                  {
                    icon: faUsers,
                    title: "Comunidad",
                    description: "Construimos relaciones duraderas basadas en el respeto y el trabajo bien hecho.",
                    color: "from-purple-500 to-purple-600"
                  },
                  {
                    icon: faRocket,
                    title: "Innovación",
                    description: "Utilizamos tecnología de vanguardia para simplificar tu experiencia.",
                    color: "from-orange-500 to-orange-600"
                  },
                  {
                    icon: faCheckCircle,
                    title: "Calidad",
                    description: "Nos comprometemos con la excelencia en cada servicio que facilitamos.",
                    color: "from-green-500 to-green-600"
                  },
                  {
                    icon: faHandshake,
                    title: "Transparencia",
                    description: "Precios claros, sin sorpresas. Sabes exactamente qué pagarás antes de contratar.",
                    color: "from-indigo-500 to-indigo-600"
                  },
                  {
                    icon: faHeart,
                    title: "Compromiso",
                    description: "Estamos aquí para ayudarte a encontrar la solución perfecta para tu hogar.",
                    color: "from-pink-500 to-pink-600"
                  }
                ].map((value, index) => (
                  <div 
                    key={index}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100"
                  >
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${value.color} mb-4`}>
                      <FontAwesomeIcon icon={value.icon} className="text-white text-xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{value.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Sección: ¿Por Qué Elegirnos? */}
            <section className="mb-12 md:mb-16">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-lg p-6 sm:p-8 md:p-10 lg:p-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 md:mb-8 text-center">
                  ¿Por Qué Elegirnos?
                </h2>
                <div className="space-y-4 sm:space-y-6">
                  {[
                    {
                      title: "Técnicos Verificados",
                      description: "Todos nuestros profesionales pasan por un proceso de verificación que incluye verificación de identidad, referencias y experiencia."
                    },
                    {
                      title: "Respuesta Rápida",
                      description: "Conectamos con técnicos disponibles en tu zona en tiempo récord. Tiempo promedio de respuesta: menos de 2 horas."
                    },
                    {
                      title: "Precios Transparentes",
                      description: "Sabes exactamente cuánto pagarás antes de contratar. Sin sorpresas ni costos ocultos."
                    },
                    {
                      title: "Garantía de Satisfacción",
                      description: "Trabajamos contigo hasta que estés completamente satisfecho con el servicio recibido."
                    }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center mt-1">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-white text-sm" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{feature.title}</h3>
                        <p className="text-gray-700 text-sm sm:text-base">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="text-center">
              <div className="bg-white rounded-xl shadow-lg p-8 sm:p-10 md:p-12 border-2 border-indigo-100">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6">
                  ¿Listo para Empezar?
                </h2>
                <p className="text-gray-600 text-base sm:text-lg mb-6 md:mb-8 max-w-2xl mx-auto">
                  Únete a miles de personas que ya confían en Sumee para encontrar el técnico perfecto para su hogar.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/dashboard/client"
                    className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                  >
                    Solicitar un Servicio
                  </Link>
                  <Link
                    href="/dashboard/professional"
                    className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-indigo-600 font-semibold rounded-lg border-2 border-indigo-600 hover:bg-indigo-50 transition-colors duration-200"
                  >
                    Únete como Técnico
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
