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
  faArrowRight,
  faCamera,
  faMobile,
  faHistory,
  faHeadset,
  faConciergeBell,
  faTrophy,
  faInfinity
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import StripeBuyButton from '@/components/stripe/StripeBuyButton';

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
      period: 'MXN / anual',
      description: 'Perfecto para reparaciones y servicios ocasionales',
      features: [
        { icon: faUsers, text: 'Hasta 2 solicitudes de servicio por mes' },
        { icon: faCheck, text: 'Acceso a técnicos verificados' },
        { icon: faCamera, text: 'Diagnóstico inicial por Foto/Video' },
        { icon: faMobile, text: 'Seguimiento completo en la App' },
        { icon: faShieldAlt, text: 'Garantía Sumee de 30 días' },
        { icon: faHeadset, text: 'Soporte por chat' }
      ],
      popular: false,
      buyButtonId: 'buy_btn_1RmpzwE2shKTNR9M91kuSgKh'
    },
    {
      name: 'Plan Premium',
      price: '$499',
      period: 'MXN / anual',
      description: 'La tranquilidad total para tu hogar u oficina',
      subtitle: 'Recomendado para Administradores de Edificios, Contratistas, Arquitectos, Ingenieros y más',
      features: [
        { icon: faInfinity, text: 'Solicitudes de servicio ilimitadas' },
        { icon: faClock, text: 'Prioridad en asignación y respuesta' },
        { icon: faTrophy, text: 'Acceso exclusivo a técnicos "Sumee Pro"' },
        { icon: faShieldAlt, text: 'Garantía extendida Sumee de 90 días' },
        { icon: faConciergeBell, text: 'Servicio de Conserjería (Concierge)' },
        { icon: faUsers, text: 'Múltiples cotizaciones para proyectos grandes' },
        { icon: faHistory, text: 'Historial de Mantenimiento del Hogar' },
        { icon: faPhone, text: 'Soporte prioritario por teléfono y WhatsApp 24/7' }
      ],
      popular: true,
      buyButtonId: 'buy_btn_1SLwlqE2shKTNR9MmwebXHlB'
    }
  ];

  const publishableKey = 'pk_live_51P8c4AE2shKTNR9MVARQB4La2uYMMc2shlTCcpcg8EI6MqqPV1uN5uj6UbB5mpfReRKd4HL2OP1LoF17WXcYYeB000Ot1l847E';

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
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Elige el Plan Perfecto para Ti
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Accede a los mejores técnicos de CDMX con garantía total y respuesta en menos de 2 horas
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <div 
                  key={index} 
                  className={`bg-white rounded-2xl shadow-xl p-8 relative transition-all duration-300 hover:shadow-2xl ${
                    plan.popular 
                      ? 'ring-4 ring-blue-500 ring-opacity-50 transform scale-105 border-2 border-blue-200' 
                      : 'border-2 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg">
                        ⭐ Más Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        plan.popular ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-blue-100'
                      }`}>
                        <FontAwesomeIcon 
                          icon={plan.popular ? faCrown : faCheck} 
                          className={`text-2xl ${plan.popular ? 'text-white' : 'text-blue-600'}`} 
                        />
                      </div>
                    </div>
                    
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-2 text-lg">{plan.description}</p>
                    {plan.subtitle && (
                      <p className="text-sm text-blue-600 font-medium mb-4">{plan.subtitle}</p>
                    )}
                    
                    <div className="mb-6">
                      <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600 ml-2 text-lg">{plan.period}</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          plan.popular ? 'bg-blue-100' : 'bg-green-100'
                        }`}>
                          <FontAwesomeIcon 
                            icon={feature.icon} 
                            className={`text-sm ${
                              plan.popular ? 'text-blue-600' : 'text-green-600'
                            }`} 
                          />
                        </div>
                        <span className="text-gray-700 font-medium">{feature.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <StripeBuyButton
                      buyButtonId={plan.buyButtonId}
                      publishableKey={publishableKey}
                      className="w-full"
                    />
                    
                    <div className="text-center">
                      <p className="text-xs text-gray-500">
                        Pago seguro procesado por Stripe
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-16 text-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="flex items-center justify-center space-x-2 text-gray-600">
                  <FontAwesomeIcon icon={faShieldAlt} className="text-blue-600 text-xl" />
                  <span className="font-medium">Pago 100% Seguro</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-gray-600">
                  <FontAwesomeIcon icon={faClock} className="text-green-600 text-xl" />
                  <span className="font-medium">Cancelación en cualquier momento</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-gray-600">
                  <FontAwesomeIcon icon={faStar} className="text-yellow-600 text-xl" />
                  <span className="font-medium">Garantía de satisfacción</span>
                </div>
              </div>
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