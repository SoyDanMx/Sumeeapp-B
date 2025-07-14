// src/components/NewsletterForm.tsx
'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

export const NewsletterForm = () => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4 tracking-wider">Únete al boletín</h3>
      <p className="text-gray-300 text-sm mb-4">Recibe ofertas exclusivas y consejos para el hogar directamente en tu correo.</p>
      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          placeholder="Tu correo electrónico"
          className="flex-grow bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Correo electrónico para el boletín"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md transition-colors duration-200 flex items-center justify-center"
          aria-label="Suscribirse al boletín"
        >
          <FontAwesomeIcon icon={faPaperPlane} className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};