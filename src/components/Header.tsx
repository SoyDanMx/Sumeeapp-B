// src/components/Header.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
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

export const Header = () => {
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const { location, setLocation } = useLocation();
  const { user, isLoading: userLoading } = useAuth();

  useEffect(() => {
    setLoading(userLoading);
  }, [userLoading]);

  // Cerrar dropdown al hacer click fuera

  const closeAllModals = () => {
    setIsMenuOpen(false);
    setIsLocationModalOpen(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // Redirigir a la página principal
      window.location.href = "/";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

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

            {/* Ubicación - Solo visible en móvil, más compacta */}
            <div
              className="flex items-center cursor-pointer text-gray-700 hover:text-blue-600 transition-colors duration-200 md:hidden"
              onClick={() => setIsLocationModalOpen(true)}
            >
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1 text-xs" />
              <span className="font-medium text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[60px]">
                {location ? location.address.split(",")[0].trim() : "Ubicación"}
              </span>
            </div>

            {/* CTA Principal - Compacto */}
            <div className="flex items-center space-x-2">
              {!loading && (
                <>
                  {user ? (
                    <UserPanelMenu user={user} onClose={closeAllModals} />
                  ) : (
                    <Link
                      href="/login"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs font-medium transition md:px-3 md:py-1.5 md:text-sm"
                    >
                      Iniciar Sesión
                    </Link>
                  )}
                </>
              )}

              {/* Botón hamburguesa - Solo móvil */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Abrir menú"
                className="md:hidden p-1"
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

            {/* Navegación desktop */}
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
        } md:hidden`}
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
        <nav className="flex flex-col p-4 space-y-4">
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

          {/* Enlaces de navegación */}
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
            href="/professionals"
            onClick={closeAllModals}
            className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-gray-50 p-3 rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon={faUser} className="mr-3 text-lg" />
            <span className="font-medium">Encontrar Técnicos</span>
          </Link>

          <hr className="border-gray-200" />

          {/* CTA Principal */}
          {!loading && (
            <div className="pt-2">
              {user ? (
                <Link
                  href="/dashboard"
                  onClick={closeAllModals}
                  className="block bg-blue-600 hover:bg-blue-700 text-white text-center px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  Mi Panel
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={closeAllModals}
                  className="block bg-blue-600 hover:bg-blue-700 text-white text-center px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>
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
