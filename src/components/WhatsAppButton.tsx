// src/components/WhatsAppButton.tsx
'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

export const WhatsAppButton = () => {
  return (
    <a
      href="https://wa.me/525636741156?text=Hola,%20necesito%20ayuda%20para%20contratar%20un%20servicio."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group"
      aria-label="Contactar por WhatsApp"
    >
      {/* Tooltip que aparece en hover en escritorio */}
      <div className="absolute bottom-1/2 right-full mr-4 transform translate-y-1/2 px-3 py-1.5 bg-gray-800 text-white text-sm font-semibold rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap hidden md:block">
        Contáctanos
      </div>

      {/* El botón circular */}
      <div className="w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:bg-[#20C35A] transition-all duration-300 transform hover:scale-110 animate-bounce">
        <FontAwesomeIcon icon={faWhatsapp} className="text-white text-4xl" />
      </div>
    </a>
  );
};