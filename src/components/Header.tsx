// src/components/Header.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // 1. Añadimos esta importación

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* 2. Reemplazamos el texto por el logo */}
        <div className="flex items-center">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Logo de Sumee"
              width={160}
              height={45}
              priority
            />
          </Link>
        </div>
        
        {/* Navegación Principal */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="#servicios" className="text-gray-700 hover:text-blue-600 whitespace-nowrap">Servicios</Link>
          <Link href="#profesionales" className="text-gray-700 hover:text-blue-600 whitespace-nowrap">Profesionales</Link>
          <Link href="#como-funciona" className="text-gray-700 hover:text-blue-600 whitespace-nowrap">Cómo Funciona</Link>
        </nav>
        
        {/* Botones de Acción */}
        <div className="flex items-center space-x-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200 whitespace-nowrap">
            Iniciar Sesión
          </button>
        </div>
      </div>
    </header>
  );
}