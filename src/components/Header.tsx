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
  const [isScrolled, setIsScrolled] = useState(false);

  const { location, setLocation } = useLocation();
  const { user, profile, isLoading, isAuthenticated } = useAuth();

  // Cerrar todos los modales
  const closeAllModals = () => {
    setIsMenuOpen(false);
    setIsLocationModalOpen(false);
  };

  // Detectar scroll para cambiar el estilo del header
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      // Cambiar estado cuando el scroll sea mayor a 50px
      setIsScrolled(scrollPosition > 50);
    };

    // Ejecutar una vez al montar para verificar posición inicial
    handleScroll();

    // Agregar listener de scroll
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Cerrar menú móvil al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".mobile-menu") && !target.closest(".menu-button")) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* Header Transparente - Diseño Moderno con Scroll Behavior */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 dark:bg-gray-900/95 shadow-lg"
            : "bg-transparent"
        }`}
        style={{
          background: isScrolled
            ? "rgba(255, 255, 255, 0.95)"
            : "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          className={`container mx-auto px-4 sm:px-6 transition-all duration-300 ${
            isScrolled ? "py-2 sm:py-2.5" : "py-3 sm:py-4"
          }`}
        >
          {/* Layout principal - Una sola línea */}
          <div className="flex items-center justify-between">
            {/* Logo - Versión Blanca */}
            <div className="flex-shrink-0 flex items-center space-x-2 sm:space-x-3 md:space-x-4">
              <Link
                href="/"
                onClick={closeAllModals}
                className="flex items-center"
              >
                <Image
                  src="/logo.png"
                  alt="Logo de Sumee"
                  width={90}
                  height={24}
                  className={`md:w-[120px] md:h-[32px] transition-all duration-300 ${
                    isScrolled ? "brightness-0 invert-0" : "brightness-0 invert"
                  }`}
                  priority
                  style={{
                    filter: isScrolled ? "none" : "brightness(0) invert(1)",
                  }}
                />
              </Link>

              {/* Badge "Tu Primera Revisión es Gratis" y Ubicación en la misma línea */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Badge "Tu Primera Revisión es Gratis" - Versión Blanca para Header Transparente */}
                {!isAuthenticated && !isLoading && (
                  <Link
                    href="/registro-cliente"
                    onClick={closeAllModals}
                    className={`hidden lg:flex items-center backdrop-blur-sm px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer group ${
                      isScrolled
                        ? "bg-blue-600 hover:bg-blue-700 border border-blue-700 text-white"
                        : "bg-white/20 hover:bg-white/30 border border-white/30 text-white"
                    }`}
                    title="Regístrate ahora y obtén tu primera revisión gratis"
                  >
                    <span className="whitespace-nowrap flex items-center">
                      <span className="mr-2 group-hover:animate-bounce">
                        ✨
                      </span>
                      Tu Primera Revisión es Gratis
                      <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        →
                      </span>
                    </span>
                  </Link>
                )}

                {/* Ubicación - Visible en desktop junto al badge, también en móvil */}
                <div
                  className={`flex items-center cursor-pointer transition-colors duration-200 group ${
                    isScrolled
                      ? "text-gray-700 hover:text-blue-600"
                      : "text-white/90 hover:text-white"
                  }`}
                  onClick={() => setIsLocationModalOpen(true)}
                >
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    className="mr-1.5 sm:mr-2 text-sm sm:text-base group-hover:scale-110 transition-transform"
                  />
                  <span className="font-medium text-xs sm:text-sm md:text-base whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px] sm:max-w-[120px] md:max-w-[180px] lg:max-w-[200px] drop-shadow-md">
                    {location
                      ? location.address.split(",")[0].trim()
                      : "Ubicación"}
                  </span>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className="ml-1 sm:ml-2 text-xs opacity-70 group-hover:opacity-100 group-hover:translate-y-0.5 transition-all hidden sm:inline"
                  />
                </div>
              </div>
            </div>

            {/* CTA Principal - Versión Blanca para Header Transparente */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {isLoading ? (
                // Estado de carga: mostrar skeleton con fondo transparente
                <div className="h-9 w-24 bg-white/20 rounded-lg animate-pulse"></div>
              ) : isAuthenticated && user ? (
                // Usuario logueado: mostrar dropdown "Mi Panel"
                <UserPanelMenu
                  onClose={closeAllModals}
                  isScrolled={isScrolled}
                />
              ) : (
                <>
                  {/* Botón "Iniciar Sesión" */}
                  <Link
                    href="/login"
                    className={`backdrop-blur-sm px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm md:text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 whitespace-nowrap ${
                      isScrolled
                        ? "bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-800"
                        : "bg-white/20 hover:bg-white/30 border border-white/30 text-white"
                    }`}
                  >
                    Iniciar Sesión
                  </Link>

                  {/* Botón "Únete como Profesional" - Solo visible en desktop, junto a Iniciar Sesión */}
                  <Link
                    href="/join-as-pro"
                    className={`hidden md:flex backdrop-blur-sm px-3 lg:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm lg:text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 whitespace-nowrap ${
                      isScrolled
                        ? "bg-blue-600 hover:bg-blue-700 border border-blue-700 text-white"
                        : "bg-white/20 hover:bg-white/30 border border-white/30 text-white"
                    }`}
                  >
                    Únete como Profesional
                  </Link>
                </>
              )}

              {/* Botón hamburguesa - Solo móvil - Icono Blanco */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Abrir menú"
                className={`md:hidden p-2 menu-button rounded-lg transition-all duration-300 ${
                  isScrolled
                    ? "text-gray-700 hover:bg-gray-100"
                    : "text-white hover:bg-white/20"
                }`}
              >
                <FontAwesomeIcon icon={faBars} className="text-lg sm:text-xl" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Menú móvil - Panel lateral con fondo sólido para contraste */}
      <div
        className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
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
                href={
                  profile?.role === "profesional"
                    ? "/professional-dashboard"
                    : "/dashboard/client"
                }
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
                    const { supabase } = await import("@/lib/supabase/client");
                    await supabase.auth.signOut();
                    closeAllModals();
                    window.location.href = "/";
                  } catch (error) {
                    console.error("Error al cerrar sesión:", error);
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
