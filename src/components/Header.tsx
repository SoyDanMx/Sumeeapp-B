// src/components/Header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import { useUser } from '@/hooks/useUser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faMapMarkerAlt, faChevronDown, faPen, faCrown, faUser, faSignOutAlt, faChartBar, faCog, faBell, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

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
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const { location, setLocation } = useLocation();
  const user = useUser();

  useEffect(() => {
    setLoading(!user && user === undefined);
  }, [user]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isProfileDropdownOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('.profile-dropdown')) {
          setIsProfileDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileDropdownOpen]);

  const closeAllModals = () => {
    setIsMenuOpen(false);
    setIsLocationModalOpen(false);
    setIsProfileDropdownOpen(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsProfileDropdownOpen(false);
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

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/servicios" className="text-gray-700 hover:text-blue-600">Servicios</Link>
            <Link href="/#profesionales" className="text-gray-700 hover:text-blue-600">Profesionales</Link>
            <Link href="/#como-funciona" className="text-gray-700 hover:text-blue-600">Cómo Funciona</Link>
            <Link href="/blog" className="text-gray-700 hover:text-blue-600 flex items-center">
              <FontAwesomeIcon icon={faPen} className="mr-1 text-sm" />
              Blog
            </Link>
            <Link href="/membresia" className="text-gray-700 hover:text-yellow-600 flex items-center font-semibold">
              <FontAwesomeIcon icon={faCrown} className="mr-1 text-sm text-yellow-500" />
              Membresía
            </Link>
            <Link href="/join-as-pro" className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
              Únete como Profesional
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              {!loading && (
                <>
                  {user ? (
                    <div className="relative profile-dropdown">
                      <button 
                        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition flex items-center space-x-2"
                      >
                        <FontAwesomeIcon icon={faUser} />
                        <span>Mi Panel</span>
                        <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {isProfileDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                            <p className="text-xs text-gray-500">
                              {user?.role === 'profesional' ? 'Panel de Profesional' : 'Panel de Cliente'}
                            </p>
                          </div>
                          
                          <div className="py-1">
                            {user?.role === 'profesional' ? (
                              <>
                                <Link 
                                  href="/professional-dashboard" 
                                  onClick={closeAllModals}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <FontAwesomeIcon icon={faChartBar} className="mr-3 text-gray-400" />
                                  Dashboard Profesional
                                </Link>
                                <Link 
                                  href="/dashboard" 
                                  onClick={closeAllModals}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <FontAwesomeIcon icon={faUser} className="mr-3 text-gray-400" />
                                  Mis Leads
                                </Link>
                              </>
                            ) : (
                              <>
                                <Link 
                                  href="/client-dashboard" 
                                  onClick={closeAllModals}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <FontAwesomeIcon icon={faChartBar} className="mr-3 text-gray-400" />
                                  Dashboard Cliente
                                </Link>
                                <Link 
                                  href="/client-dashboard?tab=favorites" 
                                  onClick={closeAllModals}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <FontAwesomeIcon icon={faUser} className="mr-3 text-gray-400" />
                                  Favoritos
                                </Link>
                              </>
                            )}
                            <Link 
                              href="/dashboard?tab=leads" 
                              onClick={closeAllModals}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <FontAwesomeIcon icon={faBell} className="mr-3 text-gray-400" />
                              Notificaciones
                            </Link>
                            <Link 
                              href="/dashboard?tab=settings" 
                              onClick={closeAllModals}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <FontAwesomeIcon icon={faCog} className="mr-3 text-gray-400" />
                              Configuración
                            </Link>
                            <Link 
                              href="/help" 
                              onClick={closeAllModals}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <FontAwesomeIcon icon={faQuestionCircle} className="mr-3 text-gray-400" />
                              Soporte
                            </Link>
                          </div>
                          
                          <div className="border-t border-gray-100 py-1">
                            <button 
                              onClick={handleLogout}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <FontAwesomeIcon icon={faSignOutAlt} className="mr-3" />
                              Cerrar Sesión
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">Iniciar Sesión</Link>
                  )}
                </>
              )}
            </div>

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
          <Link href="/servicios" onClick={closeAllModals} className="text-gray-800 text-lg font-semibold">Servicios</Link>
          <Link href="/#profesionales" onClick={closeAllModals} className="text-gray-800 text-lg font-semibold">Profesionales</Link>
          <Link href="/#como-funciona" onClick={closeAllModals} className="text-gray-800 text-lg font-semibold">Cómo Funciona</Link>
          <Link href="/blog" onClick={closeAllModals} className="text-gray-800 text-lg font-semibold flex items-center">
            <FontAwesomeIcon icon={faPen} className="mr-2" />
            Blog
          </Link>
          <Link href="/membresia" onClick={closeAllModals} className="text-gray-800 text-lg font-semibold flex items-center">
            <FontAwesomeIcon icon={faCrown} className="mr-2 text-yellow-500" />
            Membresía
          </Link>
          <Link href="/join-as-pro" onClick={closeAllModals} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium text-center">
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