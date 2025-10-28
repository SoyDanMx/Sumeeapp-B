// src/components/Header.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import UserPanelMenu from "./UserPanelMenu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faTimes,
  faMapMarkerAlt,
  faChevronDown,
  faWrench,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

import dynamic from "next/dynamic";
import { useLocation } from "@/context/LocationContext";

const DynamicLocationSelectorModal = dynamic(
  () =>
    import("./LocationSelectorModal").then((mod) => mod.LocationSelectorModal),
  { ssr: false }
);

// Componente Skeleton para los botones durante la carga
const ButtonSkeleton = () => (
  <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
);

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const { location, setLocation } = useLocation();
  const { user, profile, isLoading, isAuthenticated } = useAuth();

  // Cerrar todos los modales
  const closeAllModals = () => {
    setIsMenuOpen(false);
    setIsLocationModalOpen(false);
  };

  // Cerrar menú móvil al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.mobile-menu') && !target.closest('.menu-button')) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* Header Compacto - Mobile First */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="container mx-auto px-4 py-2">
          {/* Layout principal - Una sola línea */}
          <div className="flex items-center justify-between">
            {/* Logo - Compacto */}
            <div className="flex-shrink-0">
              <Link href="/" onClick={closeAllModals}>
                <Image
                  src="/logo.png"
                  alt="Logo de Sumee"
                  width={80}
                  height={20}
                  className="md:w-[100px] md:h-[25px]"
                  priority
                />
              </Link>
            </div>

            {/* Ubicación - Solo visible en móvil */}
            <div
              className="flex items-center cursor-pointer text-gray-700 hover:text-blue-600 transition-colors duration-200 md:hidden"
              onClick={() => setIsLocationModalOpen(true)}
            >
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1 text-xs" />
              <span className="font-medium text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[60px]">
                {location ? location.address.split(",")[0].trim() : "Ubicación"}
              </span>
            </div>

            {/* CTA Principal - Con skeleton durante carga */}
            <div className="flex items-center space-x-2">
              {isLoading ? (
                // Estado de carga: mostrar skeleton
                <ButtonSkeleton />
              ) : isAuthenticated && user ? (
                // Usuario logueado: mostrar dropdown "Mi Panel"
                <UserPanelMenu onClose={closeAllModals} />
              ) : (
                // Visitante anónimo: mostrar botón "Iniciar Sesión"
                <Link
                  href="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs font-medium transition md:px-3 md:py-1.5 md:text-sm"
                >
                  Iniciar Sesión
                </Link>
              )}

              {/* Botón hamburguesa - Solo móvil */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Abrir menú"
                className="md:hidden p-1 menu-button"
              >
                <FontAwesomeIcon
                  icon={faBars}
                  className="text-sm text-gray-800"
                />
              </button>
            </div>
          </div>

          {/* Ubicación y navegación desktop - En una sola línea */}
          <div className="hidden md:flex items-center justify-between mt-1">
            {/* Ubicación desktop */}
            <div
              className="flex items-center cursor-pointer text-gray-700 hover:text-blue-600 transition-colors duration-200"
              onClick={() => setIsLocationModalOpen(true)}
            >
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1 text-sm" />
              <span className="font-medium text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px]">
                {location
                  ? location.address.split(",")[0].trim()
                  : "Seleccionar Ubicación"}
              </span>
              <FontAwesomeIcon icon={faChevronDown} className="ml-1 text-xs" />
            </div>

            {/* Navegación desktop - Siempre visible */}
            <nav className="flex items-center space-x-3">
              <Link
                href="/join-as-pro"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-sm font-medium transition-colors"
              >
                Únete como Profesional
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Menú móvil - Panel lateral */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        } md:hidden mobile-menu`}
      >
        {/* Header del menú */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Menú</h2>
          <button
            onClick={() => setIsMenuOpen(false)}
            aria-label="Cerrar menú"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl text-gray-600" />
          </button>
        </div>

        {/* Contenido del menú */}
        <nav className="flex flex-col p-4 space-y-4 overflow-y-auto h-[calc(100vh-64px)]">
          {/* Ubicación */}
          <div
            className="flex items-center cursor-pointer text-gray-700 hover:text-blue-600 transition-colors p-3 rounded-lg hover:bg-gray-50"
            onClick={() => {
              setIsLocationModalOpen(true);
              setIsMenuOpen(false);
            }}
          >
            <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-3 text-lg" />
            <div className="flex-1">
              <div className="text-sm text-gray-500">Ubicación actual</div>
              <div className="font-semibold text-base">
                {location
                  ? location.address.split(",")[0].trim()
                  : "Seleccionar Ubicación"}
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Enlaces de navegación - Siempre visibles */}
          <Link
            href="/join-as-pro"
            onClick={closeAllModals}
            className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-gray-50 p-3 rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon={faWrench} className="mr-3 text-lg" />
            <span className="font-medium">Únete como Profesional</span>
          </Link>

          <Link
            href="/servicios"
            onClick={closeAllModals}
            className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-gray-50 p-3 rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-3 text-lg" />
            <span className="font-medium">Nuestros Servicios</span>
          </Link>

          <Link
            href="/tecnicos"
            onClick={closeAllModals}
            className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-gray-50 p-3 rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon={faUser} className="mr-3 text-lg" />
            <span className="font-medium">Encontrar Técnicos</span>
          </Link>

          <hr className="border-gray-200" />

          {/* CTA Principal - Con skeleton durante carga */}
          <div className="pt-2">
            {isLoading ? (
              // Estado de carga: mostrar skeleton
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            ) : isAuthenticated && user ? (
              // Usuario logueado: mostrar botón "Mi Panel" con enlace al dashboard
              <Link
                href={profile?.role === 'profesional' ? '/professional-dashboard' : '/dashboard/client'}
                onClick={closeAllModals}
                className="block bg-blue-600 hover:bg-blue-700 text-white text-center px-4 py-3 rounded-lg font-medium transition-colors"
              >
                Mi Panel
              </Link>
            ) : (
              // Visitante anónimo: mostrar botón "Iniciar Sesión"
              <Link
                href="/login"
                onClick={closeAllModals}
                className="block bg-blue-600 hover:bg-blue-700 text-white text-center px-4 py-3 rounded-lg font-medium transition-colors"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>

          {/* Si está logueado, mostrar opción de cerrar sesión */}
          {isAuthenticated && user && (
            <>
              <hr className="border-gray-200" />
              <button
                onClick={async () => {
                  try {
                    const { supabase } = await import('@/lib/supabase/client');
                    await supabase.auth.signOut();
                    closeAllModals();
                    window.location.href = '/';
                  } catch (error) {
                    console.error('Error al cerrar sesión:', error);
                  }
                }}
                className="flex items-center w-full text-red-600 hover:bg-red-50 p-3 rounded-lg transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} className="mr-3 text-lg" />
                <span className="font-medium">Cerrar Sesión</span>
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Overlay del menú móvil */}
      {isMenuOpen && (
        <div
          onClick={() => setIsMenuOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        />
      )}

      <DynamicLocationSelectorModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onLocationSelect={setLocation}
        currentLocation={location}
      />
    </>
  );
};
