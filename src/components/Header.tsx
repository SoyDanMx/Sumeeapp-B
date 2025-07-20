// src/components/Header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

export const Header = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para el menú móvil

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="Logo de Sumee"
                width={120} // Ligeramente más pequeño en base para mejor ajuste
                height={30}
                priority
              />
            </Link>
          </div>
          
          {/* Navegación de Escritorio */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/servicios" className="text-gray-700 hover:text-blue-600">Servicios</Link>
            <Link href="/#profesionales" className="text-gray-700 hover:text-blue-600">Profesionales</Link>
            <Link href="/#como-funciona" className="text-gray-700 hover:text-blue-600">Cómo Funciona</Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            {/* Botón de Login/Dashboard para Escritorio */}
            <div className="hidden md:block">
              {!loading && (
                <>
                  {user ? (
                    <Link href="/dashboard" className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition">Mi Panel</Link>
                  ) : (
                    <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">Iniciar Sesión</Link>
                  )}
                </>
              )}
            </div>

            {/* Botón de Menú de Hamburguesa para Móvil */}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Abrir menú">
                <FontAwesomeIcon icon={faBars} className="text-2xl text-gray-800" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Menú Deslizable Móvil */}
      <div className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-5 flex justify-end">
          <button onClick={() => setIsMenuOpen(false)} aria-label="Cerrar menú">
            <FontAwesomeIcon icon={faTimes} className="text-2xl text-gray-800" />
          </button>
        </div>
        <nav className="flex flex-col p-5 space-y-4">
          <Link href="/servicios" onClick={() => setIsMenuOpen(false)} className="text-gray-800 text-lg font-semibold">Servicios</Link>
          <Link href="/#profesionales" onClick={() => setIsMenuOpen(false)} className="text-gray-800 text-lg font-semibold">Profesionales</Link>
          <Link href="/#como-funciona" onClick={() => setIsMenuOpen(false)} className="text-gray-800 text-lg font-semibold">Cómo Funciona</Link>
          <hr/>
          {!loading && (
            <>
              {user ? (
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="bg-blue-600 text-white text-center px-4 py-2 rounded-lg font-medium transition">Mi Panel</Link>
              ) : (
                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="bg-blue-600 text-white text-center px-4 py-2 rounded-lg font-medium transition">Iniciar Sesión</Link>
              )}
            </>
          )}
        </nav>
      </div>
      {/* Overlay oscuro cuando el menú está abierto */}
      {isMenuOpen && <div onClick={() => setIsMenuOpen(false)} className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"></div>}
    </>
  );
}