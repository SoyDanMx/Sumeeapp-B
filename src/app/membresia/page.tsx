import React from 'react';
import { Metadata } from 'next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheck, 
  faStar, 
  faShieldAlt, 
  faClock, 
  faUsers, 
  faPhone,
  faCrown,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Membresía Premium - Accede a los Mejores Técnicos de CDMX | Sumee App',
  description: 'Convierte en miembro premium y accede a los mejores técnicos de Ciudad de México. Servicios verificados, garantía total y respuesta en 2 horas.',
  keywords: ['membresía premium', 'técnicos CDMX', 'servicios hogar', 'garantía', 'Ciudad de México'],
};

export default function MembresiaPage() {
  const benefits = [
    {
      icon: faCheck,
      title: 'Acceso a Técnicos Verificados',
      description: 'Solo profesionales con licencia y experiencia comprobada'
    },
    {
      icon: faShieldAlt,
      title: 'Garantía Total',
      description: 'Todos nuestros trabajos tienen garantía de satisfacción'
    },
    {
      icon: faClock,
      title: 'Respuesta en 2 Horas',
      description: 'Técnicos disponibles para emergencias y servicios urgentes'
    },
    {
      icon: faUsers,
      title: 'Múltiples Cotizaciones',
      description: 'Recibe hasta 3 cotizaciones de diferentes técnicos'
    },
    {
      icon: faPhone,
      title: 'Soporte 24/7',
      description: 'Línea de atención disponible las 24 horas del día'
    },
    {
      icon: faStar,
      title: 'Calificación y Reseñas',
      description: 'Accede a reseñas reales de otros clientes'
    }
  ];

  const pricingPlans = [
    {
      name: 'Plan Básico',
      price: '$299',
      period: 'por mes',
      description: 'Perfecto para servicios ocasionales',
      features: [
        'Hasta 2 solicitudes por mes',
        'Acceso a técnicos verificados',
        'Garantía de 30 días',
        'Soporte por chat'
      ],
      popular: false
    },
    {
      name: 'Plan Premium',
      price: '$499',
      period: 'por mes',
      description: 'Ideal para hogares activos',
      features: [
        'Solicitudes ilimitadas',
        'Prioridad en respuesta',
        'Garantía extendida de 90 días',
        'Soporte telefónico 24/7',
        'Múltiples cotizaciones',
        'Descuentos exclusivos'
      ],
      popular: true
    },
    {
      name: 'Plan Anual',
      price: '$4,999',
      period: 'por año',
      description: 'Ahorra 2 meses con el plan anual',
      features: [
        'Todo del Plan Premium',
        '2 meses gratis',
        'Descuentos adicionales',
        'Soporte prioritario'
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FontAwesomeIcon icon={faCrown} className="text-3xl" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Accede a los Mejores Técnicos de CDMX
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Convierte en miembro premium y disfruta de servicios de calidad con técnicos verificados, 
              garantía total y respuesta en menos de 2 horas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="#planes"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors inline-flex items-center"
              >
                Ver Planes
                <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
              </Link>
              <Link 
                href="/registro-cliente"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors"
              >
                ¿Ya tienes cuenta? Inicia Sesión
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              ¿Por qué ser miembro premium?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FontAwesomeIcon icon={benefit.icon} className="text-2xl text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planes" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Elige tu Plan Premium
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, index) => (
                <div 
                  key={index} 
                  className={`bg-white rounded-xl shadow-lg p-8 relative ${
                    plan.popular ? 'ring-2 ring-blue-500 transform scale-105' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                        Más Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600 ml-2">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <FontAwesomeIcon icon={faCheck} className="text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link 
                    href="/registro-cliente"
                    className={`w-full py-3 px-6 rounded-lg font-semibold text-center block transition-colors ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    {plan.name === 'Plan Anual' ? 'Ahorrar 2 Meses' : 'Comenzar Ahora'}
                  </Link>
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
            ¿Listo para acceder a los mejores técnicos?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Únete a miles de clientes satisfechos en Ciudad de México
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/registro-cliente"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors inline-block"
            >
              Registrarse Ahora
            </Link>
            <Link 
              href="/login"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors inline-block"
            >
              ¿Ya tienes cuenta? Inicia Sesión
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}