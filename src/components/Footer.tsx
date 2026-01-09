// src/components/Footer.tsx
'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShieldAlt, 
  faLock, 
  faFileAlt, 
  faStar, 
  faMapMarkerAlt, 
  faPhoneAlt, 
  faEnvelope, 
  faInfoCircle, 
  faPen, 
  faCreditCard, 
  faCheckCircle, 
  faShoppingCart, 
  faBriefcase, 
  faDollarSign, 
  faGlobe,
  faUser,
  faBuilding
} from '@fortawesome/free-solid-svg-icons';
import { 
  faFacebookF, 
  faLinkedinIn, 
  faInstagram, 
  faTiktok, 
  faYoutube,
  faWhatsapp
} from '@fortawesome/free-brands-svg-icons';
import { NewsletterForm } from './NewsletterForm';
import { FooterLinkColumn } from './FooterLinkColumn';

export const Footer = () => {
  // Links de SUMEE (información general)
  const sumeeLinks = useMemo(() => [
    { href: "/about", icon: faInfoCircle, text: "Sobre Nosotros" },
    { href: "/blog", icon: faPen, text: "Blog" },
    { href: "/trabaja-con-nosotros", icon: faBriefcase, text: "Trabaja con Nosotros" },
    { href: "/terminos", icon: faFileAlt, text: "Términos de Servicio" },
    { href: "/privacidad", icon: faLock, text: "Aviso de Privacidad" },
    { href: "/politica-devoluciones", icon: faFileAlt, text: "Política de Devoluciones" },
    { href: "/contact", icon: faEnvelope, text: "Contáctanos" },
  ], []);

  // Soluciones para personas
  const personasLinks = useMemo(() => [
    { href: "/servicios", icon: faShieldAlt, text: "Servicios para el Hogar" },
    { href: "/professionals", icon: faStar, text: "Profesionales Verificados" },
    { href: "/verify", icon: faShieldAlt, text: "Verificar Profesional" },
    { href: "/marketplace", icon: faShoppingCart, text: "Marketplace" },
    { href: "/precios", icon: faDollarSign, text: "Guía de Precios" },
    { href: "/#como-funciona", icon: faInfoCircle, text: "Cómo Funciona" },
    { href: "/all-cities", icon: faGlobe, text: "Ciudades Donde Operamos" },
  ], []);

  // Soluciones para empresas
  const empresasLinks = useMemo(() => [
    { href: "/join-as-pro", icon: faUser, text: "Únete como Profesional" },
    { href: "/verificacion", icon: faCheckCircle, text: "Proceso de Verificación" },
    { href: "/pago-de-servicios", icon: faCreditCard, text: "Pago de Servicios" },
    { href: "/trabaja-con-nosotros", icon: faBuilding, text: "Trabaja con Nosotros" },
  ], []);


  return (
    <footer className="bg-white text-gray-900">
      {/* Contenido principal del footer - Layout dividido: izquierda (contacto) y derecha (navegación) */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Sección izquierda - Contacto completo */}
          <div className="lg:w-2/5 space-y-6">
            {/* Título y subtítulo */}
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                ¿Quieres saber más de nosotros?
              </h2>
              <p className="text-2xl md:text-3xl font-bold text-green-600 mb-6">Contáctanos</p>
            </div>
            
            {/* Botones de contacto - Verdes como en la imagen */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="mailto:sumeeapp.com@gmail.com" 
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-base whitespace-nowrap"
              >
                <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4" />
                <span>e-mail</span>
              </a>
              <a 
                href="https://wa.me/5255636741156?text=Hola%2C%20Deseo%20Saber%20mas%20de%20la%20plataforma%20Sumee." 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-base whitespace-nowrap"
              >
                <FontAwesomeIcon icon={faWhatsapp} className="w-4 h-4" />
                <span>55 6367 41156</span>
              </a>
            </div>

            {/* Redes sociales - En gris claro como en la imagen */}
            <div className="flex gap-4">
              <a 
                href="https://www.facebook.com/profile.php?id=61576223335013" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-[#1877F2] transition-colors"
                aria-label="Facebook de Sumee"
              >
                <FontAwesomeIcon icon={faFacebookF} className="w-6 h-6" />
              </a>
              <a 
                href="https://www.linkedin.com/company/sumee-app" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-[#0077B5] transition-colors"
                aria-label="LinkedIn de Sumee"
              >
                <FontAwesomeIcon icon={faLinkedinIn} className="w-6 h-6" />
              </a>
              <a 
                href="#" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-[#E4405F] transition-colors"
                aria-label="Instagram de Sumee"
              >
                <FontAwesomeIcon icon={faInstagram} className="w-6 h-6" />
              </a>
              <a 
                href="#" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-black transition-colors"
                aria-label="TikTok de Sumee"
              >
                <FontAwesomeIcon icon={faTiktok} className="w-6 h-6" />
              </a>
              <a 
                href="#" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-[#FF0000] transition-colors"
                aria-label="YouTube de Sumee"
              >
                <FontAwesomeIcon icon={faYoutube} className="w-6 h-6" />
              </a>
            </div>

            {/* Copyright */}
            <p className="text-gray-500 text-sm">© 2025 Sumee App</p>
          </div>

          {/* Sección derecha - Columnas de navegación */}
          <div className="lg:w-3/5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {/* Columna SUMEE */}
              <FooterLinkColumn title="SUMEE" links={sumeeLinks} />

              {/* Columna Soluciones para Personas */}
              <FooterLinkColumn title="Soluciones para Personas" links={personasLinks} />

              {/* Columna sin título - Links de empresas */}
              <FooterLinkColumn title="" links={empresasLinks} />
            </div>
          </div>
        </div>

        {/* Newsletter - Opcional, puede mantenerse o removerse según diseño */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <NewsletterForm />
        </div>

        {/* Copyright adicional */}
        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm">© 2025 Sumee App. Todos los derechos reservados.</p>
          <p className="text-gray-400 text-xs mt-2">Powered by NUO INTEGRACIONES</p>
        </div>
      </div>
    </footer>
  );
};