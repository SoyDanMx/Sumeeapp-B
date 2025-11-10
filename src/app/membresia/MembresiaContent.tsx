'use client';

import React from 'react';
import Script from 'next/script';
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
import { useAuth } from '@/context/AuthContext';

export default function MembresiaContent() {
  const { user, profile, isAuthenticated, isLoading } = useAuth();
  
  const benefits = [
    {
      icon: faCheck,
      title: 'Acceso a Técnicos Verificados',
      description: 'Solo profesionales con licencia y experiencia comprobada'
    },
    {
      icon: faShieldAlt,
      title: 'Garantía Total',
      description: 'Cobertura completa en todos los trabajos realizados'
    },
    {
      icon: faClock,
      title: 'Respuesta en 2 Horas',
      description: 'Técnicos disponibles las 24 horas del día'
    },
    {
      icon: faUsers,
      title: 'Red de Profesionales',
      description: 'Más de 500 técnicos verificados en CDMX'
    },
    {
      icon: faPhone,
      title: 'Soporte Prioritario',
      description: 'Atención personalizada por WhatsApp y teléfono'
    },
    {
      icon: faCrown,
      title: 'Servicio Premium',
      description: 'Experiencia de lujo para tu hogar'
    }
  ];

  const pricingPlans = [
    {
      name: 'Sumee Express',
      price: 'GRATIS',
      period: 'siempre',
      description: 'La solución más rápida para tus emergencias de Plomería y Electricidad.',
      features: [
        { icon: faInfinity, text: 'Solicitudes ILIMITADAS (para servicios Express)' },
        { icon: faCheck, text: 'Acceso a técnicos verificados' },
        { icon: faCamera, text: 'Diagnóstico inicial por Foto/Video' },
        { icon: faMobile, text: 'Seguimiento completo en la App (Dashboard)' },
        { icon: faShieldAlt, text: 'Garantía Sumee de 30 días' },
        { icon: faHeadset, text: 'Soporte por chat' }
      ],
      popular: false,
      isFree: true,
      ctaText: isAuthenticated ? 'Ya tienes acceso' : 'Regístrate Gratis',
      ctaLink: '/registro-cliente'
    },
    {
      name: 'Sumee Pro',
      price: '$499',
      period: 'Anual',
      description: 'La tranquilidad total para tu hogar, oficina o edificio. Recomendado para administradores y proyectos.',
      features: [
        { icon: faCheck, text: 'Todo lo de Express, y además:' },
        { icon: faInfinity, text: 'Solicitudes de servicio ilimitadas (Express y Pro)' },
        { icon: faClock, text: 'Prioridad en asignación y respuesta' },
        { icon: faTrophy, text: 'Acceso exclusivo a técnicos "Sumee Pro" (Elite)' },
        { icon: faShieldAlt, text: 'Garantía extendida Sumee de 90 días' },
        { icon: faConciergeBell, text: 'Servicio de Conserjería (Concierge) para proyectos' },
        { icon: faUsers, text: 'Múltiples cotizaciones para proyectos grandes' },
        { icon: faHistory, text: 'Historial de Mantenimiento del Hogar' },
        { icon: faPhone, text: 'Soporte prioritario 24/7 (Teléfono y WhatsApp)' }
      ],
      popular: true,
      buyButtonId: 'buy_btn_1SLwlqE2shKTNR9MmwebXHlB'
    }
  ];

  const publishableKey = "pk_live_51P8c4AE2shKTNR9MVARQB4La2uYMMc2shlTCcpcg8EI6MqqPV1uN5uj6UbB5mpfReRKd4HL2OP1LoF17WXcYYeB000Ot1l847E";

  return (
    <>
      {/* Script de Stripe solo para esta página */}
      <Script
        src="https://js.stripe.com/v3/buy-button.js"
        strategy="lazyOnload"
        onLoad={() => {
          console.log("Stripe script cargado");
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Sumee <span className="text-yellow-300">Express</span> y <span className="text-purple-300">Pro</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Soluciones Express para emergencias y Pro para tus proyectos. Elige el plan perfecto para ti.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="#planes" 
                className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-colors"
              >
                Ver Planes
              </Link>
              <Link 
                href="#beneficios" 
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                Conocer Beneficios
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div id="beneficios" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir Sumee?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Respuesta rápida para emergencias y soluciones completas para tus proyectos
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon icon={benefit.icon} className="text-2xl" />
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

      {/* Pricing Section */}
      <div id="planes" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Elige tu Plan
            </h2>
            <p className="text-xl text-gray-600">
              Planes flexibles para cada necesidad
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
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Más Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {plan.price}
                  </div>
                  <p className="text-gray-600 mb-4">
                    {plan.period}
                  </p>
                  <p className="text-sm text-gray-500">
                    {plan.description}
                  </p>
                </div>
                
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-3">
                      <FontAwesomeIcon 
                        icon={feature.icon} 
                        className="text-green-500 mt-1 flex-shrink-0" 
                      />
                      <span className="text-gray-700">
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4">
                  {plan.isFree ? (
                    <Link
                      href={plan.ctaLink}
                      className={`w-full font-bold py-4 px-6 rounded-lg transition-colors text-center block ${
                        isAuthenticated 
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {plan.ctaText}
                    </Link>
                  ) : (
                    <StripeBuyButton
                      buyButtonId={plan.buyButtonId || ''}
                      publishableKey={publishableKey}
                      className="w-full"
                    />
                  )}
                  
                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      {plan.isFree ? 'Registro gratuito sin compromiso' : 'Pago seguro procesado por Stripe'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            ¿Listo para transformar tu hogar?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Únete a miles de familias que confían en Sumee para el cuidado de su hogar
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="#planes" 
              className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-colors"
            >
              Ver Planes
            </Link>
            <Link 
              href="/contact" 
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-600 transition-colors"
            >
              Contactar
            </Link>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
