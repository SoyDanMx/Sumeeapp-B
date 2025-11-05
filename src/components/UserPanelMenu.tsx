"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faUser,
  faChartBar,
  faCog,
  faSignOutAlt,
  faBell,
  faQuestionCircle,
  faCrown,
  faListAlt,
  faWrench,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";

interface UserPanelMenuProps {
  onClose?: () => void;
  isScrolled?: boolean;
}

export default function UserPanelMenu({
  onClose,
  isScrolled = false,
}: UserPanelMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, profile, isProfessional, isClient } = useAuth();

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setIsOpen(false);
      if (onClose) onClose();
      // Redirigir a la página principal
      window.location.href = "/";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const closeMenu = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!user) {
    return null; // No debería renderizarse si no hay usuario
  }

  const userEmail = user.email || "Usuario";
  const displayName = profile?.full_name || userEmail.split("@")[0];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón del menú - Estilo blanco para header transparente */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`backdrop-blur-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center space-x-2 ${
          isScrolled
            ? "bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-800"
            : "bg-white/20 hover:bg-white/30 border border-white/30 text-white"
        }`}
        aria-label="Abrir menú de usuario"
        aria-expanded={isOpen}
      >
        <FontAwesomeIcon icon={faUser} className="text-sm sm:text-base" />
        <span className="hidden sm:inline">Mi Panel</span>
        <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Overlay para cerrar el menú */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
            {/* Información del usuario */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {displayName}
              </p>
              <p className="text-xs text-gray-600 truncate">{userEmail}</p>
              <p className="text-xs text-blue-600 font-medium mt-1">
                {isProfessional
                  ? "⭐ Panel de Profesional"
                  : "👤 Panel de Cliente"}
              </p>
            </div>

            {/* Opciones de navegación */}
            <div className="py-1">
              {isProfessional ? (
                <>
                  <Link
                    href="/professional-dashboard"
                    onClick={closeMenu}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    <FontAwesomeIcon
                      icon={faChartBar}
                      className="mr-3 text-gray-400 w-4"
                    />
                    Dashboard Profesional
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={closeMenu}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    <FontAwesomeIcon
                      icon={faListAlt}
                      className="mr-3 text-gray-400 w-4"
                    />
                    Mis Leads
                  </Link>
                  <Link
                    href="/join-as-pro"
                    onClick={closeMenu}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    <FontAwesomeIcon
                      icon={faWrench}
                      className="mr-3 text-gray-400 w-4"
                    />
                    Referir Profesional
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/dashboard/client"
                    onClick={closeMenu}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    <FontAwesomeIcon
                      icon={faChartBar}
                      className="mr-3 text-gray-400 w-4"
                    />
                    Mis Solicitudes
                  </Link>
                  <Link
                    href="/tecnicos"
                    onClick={closeMenu}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    <FontAwesomeIcon
                      icon={faUser}
                      className="mr-3 text-gray-400 w-4"
                    />
                    Buscar Profesionales
                  </Link>
                  <Link
                    href="/membresia"
                    onClick={closeMenu}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    <FontAwesomeIcon
                      icon={faCrown}
                      className="mr-3 text-gray-400 w-4"
                    />
                    Membresía
                  </Link>
                </>
              )}

              {/* Opciones generales para todos */}
              <div className="border-t border-gray-100 my-1"></div>
              <Link
                href="/help"
                onClick={closeMenu}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                <FontAwesomeIcon
                  icon={faQuestionCircle}
                  className="mr-3 text-gray-400 w-4"
                />
                Centro de Ayuda
              </Link>
            </div>

            {/* Opción de cerrar sesión */}
            <div className="py-1 border-t border-gray-100">
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="mr-3 w-4" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
