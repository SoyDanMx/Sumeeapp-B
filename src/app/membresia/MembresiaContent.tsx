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
  faInfinity,
  faCreditCard,
  faBolt,
  faAward,
  faChartLine,
  faRocket
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import StripeBuyButton from '@/components/stripe/StripeBuyButton';
import { useAuth } from '@/context/AuthContext';

export default function MembresiaContent() {
  const { user, profile, isAuthenticated, isLoading } = useAuth();
  
  const benefits = [
    {
      icon: faTrophy,
      title: 'Los Mejores Técnicos para Ti',
      description: 'Acceso exclusivo a técnicos "Sumee Pro Elite" con las mejores calificaciones y desempeño comprobado'
    },
    {
      icon: faBolt,
      title: 'Respuesta Prioritaria',
      description: 'Tus solicitudes se procesan primero. Asignación inmediata y atención 24/7 sin esperas'
    },
    {
      icon: faCreditCard,
      title: 'Múltiples Medios de Pago',
      description: 'Paga con tarjeta, transferencia, efectivo o métodos electrónicos. Flexibilidad total'
    },
    {
      icon: faChartLine,
      title: 'Técnicos con Mejor Desempeño',
      description: 'Solo profesionales con calificación superior a 4.8 estrellas y más de 50 trabajos completados'
    },
    {
      icon: faShieldAlt,
      title: 'Garantía Extendida de 90 Días',
      description: 'Cobertura completa en todos los trabajos. Protección total para tu tranquilidad'
    },
    {
      icon: faRocket,
      title: 'Asignación Inteligente',
      description: 'Sistema de matching avanzado que conecta tu proyecto con el técnico perfecto en minutos'
    },
    {
      icon: faUsers,
      title: 'Red de 500+ Profesionales',
      description: 'La mayor red de técnicos verificados en CDMX. Siempre hay alguien cerca de ti'
    },
    {
      icon: faPhone,
      title: 'Soporte VIP 24/7',
      description: 'Línea directa de atención prioritaria. WhatsApp y teléfono con respuesta inmediata'
    },
    {
      icon: faAward,
      title: 'Experiencia PRO Completa',
      description: 'Servicio de conserjería, múltiples cotizaciones y supervisor InSite para proyectos grandes'
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
        { icon: faPhone, text: 'Soporte prioritario 24/7 (Teléfono y WhatsApp)' },
        { icon: faStar, text: 'Supervisor InSite' }
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

      {/* Benefits Section - Mejorado como CTA */}
      <div id="beneficios" className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                Plan PRO
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir Sumee PRO?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Respuesta prioritaria, los mejores técnicos y experiencia premium para tu hogar
            </p>
            <Link 
              href="#planes"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Ver Planes PRO
              <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-300 transform hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-bl-2xl rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    <FontAwesomeIcon icon={benefit.icon} className="text-xl" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA destacado después de beneficios */}
          <div className="mt-16 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faCrown} className="text-4xl text-yellow-300 mr-3" />
                <h3 className="text-2xl md:text-3xl font-bold">
                  Experiencia PRO para tu Hogar
                </h3>
              </div>
              <p className="text-lg md:text-xl text-blue-100 mb-6 max-w-2xl mx-auto">
                Únete a miles de familias que confían en Sumee PRO. Acceso inmediato a los mejores técnicos, respuesta prioritaria y garantía extendida.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="#planes"
                  className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center justify-center gap-2"
                >
                  <span>Elegir Plan PRO</span>
                  <FontAwesomeIcon icon={faArrowRight} />
                </Link>
                <Link 
                  href="/dashboard/client"
                  className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-all inline-flex items-center justify-center gap-2"
                >
                  <span>Ver Dashboard</span>
                  <FontAwesomeIcon icon={faRocket} />
                </Link>
              </div>
            </div>
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
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      ⭐ Más Popular
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
