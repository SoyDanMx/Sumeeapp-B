// src/components/ProfessionalVerificationID.tsx
'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faIdCard, 
  faPhone, 
  faMapMarkerAlt, 
  faBriefcase, 
  faCertificate, 
  faShieldAlt,
  faStar,
  faClock,
  faUserShield
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { Profesional } from '@/types/supabase';

interface ProfessionalVerificationIDProps {
  profesional: Profesional;
  realTimeLocation?: {
    lat: number;
    lng: number;
    lastUpdate: string;
  } | null;
}

export default function ProfessionalVerificationID({ 
  profesional, 
  realTimeLocation 
}: ProfessionalVerificationIDProps) {
  // 🎯 UX/UI PRINCIPLE: Consistent Data Formatting
  const generateWhatsAppLink = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappPhone = cleanPhone.startsWith('52') ? cleanPhone : `52${cleanPhone}`;
    return `https://wa.me/${whatsappPhone}?text=Hola%2C+te+contacto+desde+Sumee+App+sobre+el+servicio.`;
  };

  const formatPhone = (phone: string | null) => {
    if (!phone) return 'No disponible';
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      return `(${cleanPhone.slice(0,3)}) ${cleanPhone.slice(3,6)}-${cleanPhone.slice(6)}`;
    }
    return phone;
  };

  const formatLastUpdate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Recién actualizado';
    if (diffMinutes < 60) return `${diffMinutes} min atrás`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;
    return date.toLocaleDateString('es-MX');
  };

  // 🎯 UX/UI PRINCIPLE: Visual Hierarchy & Status Indicators
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-400';
      default: return 'bg-blue-500';
    }
  };

  const getMembershipBadge = (membership: string) => {
    switch (membership) {
      case 'basic': return { text: 'Premium', color: 'bg-purple-100 text-purple-800' };
      case 'free': return { text: 'Básica', color: 'bg-gray-100 text-gray-800' };
      default: return { text: 'Verificado', color: 'bg-green-100 text-green-800' };
    }
  };

  // 🎯 UX/UI PRINCIPLE: Accessibility & Semantic HTML
  return (
    <article className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2">
      {/* 🎯 UX/UI PRINCIPLE: Clear Visual Hierarchy */}
      <header className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 px-6 py-5 text-white relative">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <FontAwesomeIcon icon={faIdCard} className="text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">ID de Verificación</h2>
              <p className="text-blue-100 text-sm opacity-90">Técnico Certificado</p>
            </div>
          </div>
          <div className="animate-pulse">
            <div className="flex items-center space-x-2 bg-green-500/90 backdrop-blur-sm px-4 py-2 rounded-full border border-green-400/50">
              <FontAwesomeIcon icon={faShieldAlt} className="text-sm" />
              <span className="text-xs font-semibold tracking-wide">VERIFICADO</span>
            </div>
          </div>
        </div>
      </header>

      {/* 🎯 UX/UI PRINCIPLE: Content First, Progressive Disclosure */}
      <main className="p-6 space-y-6">
        {/* 🎯 UX/UI PRINCIPLE: Trust Building - Professional Identity */}
        <section className="flex items-start space-x-4">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl ring-4 ring-indigo-100">
              {profesional.avatar_url ? (
                <img 
                  src={profesional.avatar_url} 
                  alt={`${profesional.full_name || 'Técnico'} - Foto de perfil`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <FontAwesomeIcon icon={faUserShield} className="text-white text-3xl" />
              )}
            </div>
            {/* 🎯 UX/UI PRINCIPLE: Status Indicators */}
            <div className={`absolute -bottom-1 -right-1 w-7 h-7 ${getStatusColor(profesional.status || 'active')} rounded-full border-3 border-white flex items-center justify-center shadow-lg`}>
              <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-bold text-gray-900 mb-1 truncate">
              {profesional.full_name || 'Técnico Verificado'}
            </h3>
            <p className="text-gray-600 mb-3 font-medium">{profesional.profession || 'Profesional Especializado'}</p>
            
            {/* 🎯 UX/UI PRINCIPLE: Social Proof - Ratings */}
            {profesional.calificacion_promedio ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <FontAwesomeIcon 
                      key={i}
                      icon={faStar} 
                      className={`text-sm transition-colors duration-200 ${
                        i < Math.floor(profesional.calificacion_promedio || 0) 
                          ? 'text-yellow-400 drop-shadow-sm' 
                          : 'text-gray-200'
                      }`} 
                    />
                  ))}
                </div>
                <div className="text-sm">
                  <span className="font-semibold text-gray-700">{profesional.calificacion_promedio?.toFixed(1)}</span>
                  <span className="text-gray-500 ml-1">/5.0</span>
                  <span className="text-gray-400 ml-2">• Excelente</span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Técnico verificado sin calificaciones previas</div>
            )}
          </div>
        </section>

        {/* 🎯 UX/UI PRINCIPLE: Action-Oriented CTAs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 🎯 UX/UI PRINCIPLE: Primary Action - Contact */}
          {profesional.whatsapp && (
            <div className="group bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FontAwesomeIcon icon={faWhatsapp} className="text-white text-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 mb-1">Contacto Directo</p>
                  <p className="font-semibold text-gray-900 mb-2">{formatPhone(profesional.whatsapp)}</p>
                  <a 
                    href={generateWhatsAppLink(profesional.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                    aria-label={`Contactar a ${profesional.full_name} por WhatsApp`}
                  >
                    <FontAwesomeIcon icon={faWhatsapp} className="text-sm" />
                    <span>Enviar Mensaje</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* 🎯 UX/UI PRINCIPLE: Real-time Information */}
          {realTimeLocation && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-5 border border-blue-200">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-white text-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 mb-1">Ubicación</p>
                  <p className="font-semibold text-gray-900 mb-2">En tiempo real</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <FontAwesomeIcon icon={faClock} className="text-xs" />
                    <span>{formatLastUpdate(realTimeLocation.lastUpdate)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 🎯 UX/UI PRINCIPLE: Information Hierarchy - Skills */}
        {profesional.areas_servicio && profesional.areas_servicio.length > 0 && (
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faBriefcase} className="text-blue-600 text-sm" />
              </div>
              <h4 className="font-semibold text-gray-900">Especialidades</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {profesional.areas_servicio.map((area, index) => (
                <span 
                  key={index}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 px-4 py-2 rounded-full text-sm font-medium border border-blue-200 hover:border-blue-300 transition-colors duration-200"
                >
                  {area}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* 🎯 UX/UI PRINCIPLE: Trust Signals - Certifications */}
        <section className="border-t border-gray-200 pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Número IMSS */}
            {profesional.numero_imss && (
              <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faCertificate} className="text-white text-sm" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-700 mb-1">Certificación IMSS</p>
                  <p className="font-semibold text-gray-900 text-sm">{profesional.numero_imss}</p>
                  <p className="text-xs text-green-600 mt-1">✓ Verificado</p>
                </div>
              </div>
            )}

            {/* Estado de membresía */}
            {profesional.membership_status && (
              <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faShieldAlt} className="text-white text-sm" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-700 mb-1">Membresía</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getMembershipBadge(profesional.membership_status).color}`}>
                    {getMembershipBadge(profesional.membership_status).text}
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 🎯 UX/UI PRINCIPLE: Personal Connection - Bio */}
        {profesional.descripcion_perfil && (
          <section className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-5 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faUserShield} className="text-indigo-600 text-xs" />
              </div>
              <span>Acerca del técnico</span>
            </h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              {profesional.descripcion_perfil}
            </p>
          </section>
        )}

        {/* 🎯 UX/UI PRINCIPLE: Trust Footer */}
        <footer className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-center space-x-3 text-xs text-gray-600 bg-gray-50 rounded-lg p-4">
            <FontAwesomeIcon icon={faShieldAlt} className="text-green-500 text-sm" />
            <span className="font-medium">Técnico verificado y validado por Sumee App</span>
            <FontAwesomeIcon icon={faShieldAlt} className="text-green-500 text-sm" />
          </div>
        </footer>
      </main>
    </article>
  );
}
