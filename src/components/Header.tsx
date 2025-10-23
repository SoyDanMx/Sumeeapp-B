// src/components/Header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import { useUser } from '@/hooks/useUser';
import UserPanelMenu from './UserPanelMenu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faMapMarkerAlt, faChevronDown } from '@fortawesome/free-solid-svg-icons';

import dynamic from 'next/dynamic';
import { useLocation } from '@/context/LocationContext';

const DynamicLocationSelectorModal = dynamic(
  () => import('./LocationSelectorModal').then((mod) => mod.LocationSelectorModal),
  { ssr: false }
);


export const Header = () => {
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const { location, setLocation } = useLocation();
  const user = useUser();

  useEffect(() => {
    setLoading(!user && user === undefined);
  }, [user]);

  // Cerrar dropdown al hacer click fuera

  const closeAllModals = () => {
    setIsMenuOpen(false);
    setIsLocationModalOpen(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // Redirigir a la página principal
      window.location.href = '/';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <>
      {/* MODIFICACIÓN: Cambiado de 'z-50' a 'shadow-sm z-50' para reintroducir una sombra ligera */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50"> 
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          
          <div className="flex items-center">
            <Link href="/" onClick={closeAllModals}>
              <Image
                src="/logo.png"
                alt="Logo de Sumee"
                width={120}
                height={30}
                priority
              />
            </Link>
          </div>
          
          <div 
            className="flex items-center cursor-pointer text-gray-700 hover:text-blue-600 transition-colors duration-200 mx-4"
            onClick={() => setIsLocationModalOpen(true)}
          >
            <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-xl" />
            <span className="font-semibold text-base md:text-lg whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] md:max-w-[200px]">
              {location ? location.address.split(',')[0].trim() : 'Seleccionar Ubicación'}
            </span>
            <FontAwesomeIcon icon={faChevronDown} className="ml-2 text-sm" />
          </div>

          {/* CTA Dual: Supply y Demanda */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/join-as-pro" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Únete como Profesional
            </Link>
            
            <div className="hidden md:block">
              {!loading && (
                <>
                  {user ? (
                    <UserPanelMenu user={user} onClose={closeAllModals} />
                  ) : (
                    <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">Iniciar Sesión</Link>
                  )}
                </>
              )}
            </div>
          </nav>
          
          <div className="flex items-center space-x-4">

            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Abrir menú">
                <FontAwesomeIcon icon={faBars} className="text-2xl text-gray-800" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-5 flex justify-end">
          <button onClick={() => setIsMenuOpen(false)} aria-label="Cerrar menú">
            <FontAwesomeIcon icon={faTimes} className="text-2xl text-gray-800" />
          </button>
        </div>
        <nav className="flex flex-col p-5 space-y-4">
          <Link href="/join-as-pro" onClick={closeAllModals} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium text-center">
            Únete como Profesional
          </Link>
          <hr/>
          {!loading && (
            <>
              {user ? (
                <Link href="/dashboard" onClick={closeAllModals} className="bg-blue-600 text-white text-center px-4 py-2 rounded-lg font-medium transition">Mi Panel</Link>
              ) : (
                <Link href="/login" onClick={closeAllModals} className="bg-blue-600 text-white text-center px-4 py-2 rounded-lg font-medium transition">Iniciar Sesión</Link>
              )}
            </>
          )}
           <div 
            className="flex items-center cursor-pointer text-gray-800 text-lg font-semibold py-2"
            onClick={() => { setIsLocationModalOpen(true); setIsMenuOpen(false); }}
           >
             <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-3" />
             <span>{location ? location.address.split(',')[0].trim() : 'Seleccionar Ubicación'}</span>
           </div>
        </nav>
      </div>
      {isMenuOpen && <div onClick={() => setIsMenuOpen(false)} className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"></div>}

      <DynamicLocationSelectorModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onLocationSelect={setLocation}
        currentLocation={location}
      />
    </>
  );
};