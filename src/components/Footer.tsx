// src/components/Footer.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faLock, faFileAlt, faStar, faMapMarkerAlt, faPhoneAlt, faEnvelope, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import { NewsletterForm } from './NewsletterForm';
import { FooterLinkColumn } from './FooterLinkColumn';

// Datos para las columnas de enlaces
const quickLinks = [
  { href: "/about", icon: faInfoCircle, text: "Sobre Nosotros" },
  { href: "/services", icon: faShieldAlt, text: "Servicios" },
  { href: "/professionals", icon: faStar, text: "Profesionales" },
  { href: "/join-as-pro", icon: faStar, text: "Únete como Profesional" },
];

const legalLinks = [
  { href: "/terms", icon: faFileAlt, text: "Términos de Servicio" },
  { href: "/privacy", icon: faLock, text: "Política de Privacidad" },
  { href: "/contact", icon: faEnvelope, text: "Contáctanos" },
];

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Columna de Información */}
          <div className="space-y-6">
            {/* Logo - Cambia esto por tu componente Image cuando tengas el archivo */}
            <Link href="/" className="inline-block text-3xl font-bold text-white">
              Sumee
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed">Conectamos usuarios con técnicos certificados para soluciones confiables en tu hogar.</p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-400 mt-1" />
                <span className="text-gray-300 text-sm">Ciudad de México, México</span>
              </div>
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faPhoneAlt} className="text-blue-400" />
                <a href="tel:+525636741156" className="text-gray-300 text-sm hover:text-blue-400 transition-colors">+52 56 3674 1156</a>
              </div>
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faEnvelope} className="text-blue-400" />
                <a href="mailto:contacto@sumeeapp.com" className="text-gray-300 text-sm hover:text-blue-400 transition-colors">contacto@sumeeapp.com</a>
              </div>
            </div>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/profile.php?id=61576223335013" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-[#1877F2] text-white w-10 h-10 rounded-full transition-colors flex items-center justify-center" aria-label="Facebook de Sumee">
                <FontAwesomeIcon icon={faFacebookF} className="w-4 h-4" />
              </a>
              <a href="https://www.linkedin.com/company/sumee-app" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-[#0077B5] text-white w-10 h-10 rounded-full transition-colors flex items-center justify-center" aria-label="LinkedIn de Sumee">
                <FontAwesomeIcon icon={faLinkedinIn} className="w-4 h-4" />
              </a>
            </div>
          </div>

          <FooterLinkColumn title="Enlaces Rápidos" links={quickLinks} />
          <FooterLinkColumn title="Legal" links={legalLinks} />
          <NewsletterForm />

        </div>

        <div className="border-t border-gray-800 mt-16 pt-8 text-center">
          <p className="text-gray-400 text-sm">© {new Date().getFullYear()} Sumee. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};