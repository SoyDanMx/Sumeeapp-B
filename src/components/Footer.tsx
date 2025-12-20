// src/components/Footer.tsx
'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faLock, faFileAlt, faStar, faMapMarkerAlt, faPhoneAlt, faEnvelope, faInfoCircle, faPen, faCreditCard, faCheckCircle, faShoppingCart, faBriefcase, faDollarSign, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import { NewsletterForm } from './NewsletterForm';
import { FooterLinkColumn } from './FooterLinkColumn';

export const Footer = () => {
  // Usar useMemo para asegurar consistencia entre servidor y cliente
  const quickLinks = useMemo(() => [
    { href: "/about", icon: faInfoCircle, text: "Sobre Nosotros" },
    { href: "/servicios", icon: faShieldAlt, text: "Servicios" },
    { href: "/precios", icon: faDollarSign, text: "Guía de Precios" },
    { href: "/verificacion", icon: faCheckCircle, text: "Proceso de Verificación" },
    { href: "/#como-funciona", icon: faStar, text: "Cómo Funciona" },
    { href: "/pago-de-servicios", icon: faCreditCard, text: "Pago de Servicios" },
    { href: "/marketplace", icon: faShoppingCart, text: "Marketplace" },
    { href: "/blog", icon: faPen, text: "Blog" },
    { href: "/professionals", icon: faStar, text: "Profesionales" },
    { href: "/join-as-pro", icon: faStar, text: "Únete como Profesional" },
    { href: "/trabaja-con-nosotros", icon: faBriefcase, text: "Trabaja con Nosotros" },
  ], []);

  const legalLinks = useMemo(() => [
    { href: "/terminos", icon: faFileAlt, text: "Términos de Servicio" },
    { href: "/privacidad", icon: faLock, text: "Política de Privacidad" },
    { href: "/politica-devoluciones", icon: faFileAlt, text: "Política de Devoluciones" },
    { href: "/contact", icon: faEnvelope, text: "Contáctanos" },
  ], []);

  const citiesLinks = useMemo(() => [
    { href: "/all-cities", icon: faGlobe, text: "Ciudades Donde Operamos" },
  ], []);

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-12">

          <div className="space-y-6">
            <Link href="/">
              <Image src="/logo.png" alt="SUMEE Logo" width={140} height={35} />
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
          <FooterLinkColumn title="Legal y Soporte" links={legalLinks} />
          <FooterLinkColumn title="Ciudades" links={citiesLinks} />
          <NewsletterForm />

        </div>

        <div className="border-t border-gray-800 mt-16 pt-8 text-center">
          <p className="text-gray-400 text-sm">© 2025 Sumee App. Todos los derechos reservados.</p>
          <p className="text-gray-500 text-xs mt-2">Powered by NUO INTEGRACIONES</p>
        </div>
      </div>
    </footer>
  );
};