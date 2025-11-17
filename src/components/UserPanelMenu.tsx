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
  faUserEdit,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { Profile } from "@/types/supabase";
import UpdateProfileModal from "./dashboard/UpdateProfileModal";

interface UserPanelMenuProps {
  onClose?: () => void;
  isScrolled?: boolean;
}

export default function UserPanelMenu({
  onClose,
  isScrolled = false,
}: UserPanelMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [loadedProfile, setLoadedProfile] = useState<Profile | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, profile, isProfessional, isClient, isLoading: authLoading } = useAuth();

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
    <>
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
              
              {/* Botón Actualizar Perfil */}
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  setIsLoadingProfile(true);
                  setIsOpen(false);
                  
                  try {
                    // Si no hay perfil en el contexto, intentar cargarlo directamente
                    let currentProfile = profile;
                    
                    if (!currentProfile && user) {
                      console.log("🔍 Perfil no encontrado en contexto, cargando desde BD...");
                      const { data: profileData, error: profileError } = await supabase
                        .from("profiles")
                        .select("*")
                        .eq("user_id", user.id)
                        .single();
                      
                      if (profileError) {
                        console.error("❌ Error al cargar perfil:", profileError);
                        // Si el perfil no existe, crear uno básico
                        const { data: newProfile, error: createError } = await supabase
                          .from("profiles")
                          .insert({
                            user_id: user.id,
                            full_name: user.email?.split("@")[0] || "Usuario",
                            role: isProfessional ? "profesional" : "client",
                            email: user.email || "",
                          })
                          .select()
                          .single();
                        
                        if (createError) {
                          console.error("❌ Error al crear perfil:", createError);
                          alert("No se pudo cargar o crear tu perfil. Por favor, recarga la página.");
                          setIsLoadingProfile(false);
                          return;
                        }
                        
                        currentProfile = newProfile;
                      } else {
                        currentProfile = profileData;
                      }
                    }
                    
                    if (!currentProfile) {
                      console.error("❌ No se pudo obtener el perfil");
                      alert("No se pudo cargar tu perfil. Por favor, recarga la página.");
                      setIsLoadingProfile(false);
                      return;
                    }
                    
                    // Guardar el perfil cargado y abrir el modal
                    setLoadedProfile(currentProfile);
                    setTimeout(() => {
                      setShowProfileModal(true);
                      setIsLoadingProfile(false);
                    }, 100);
                  } catch (error) {
                    console.error("❌ Error al procesar perfil:", error);
                    alert("Ocurrió un error. Por favor, recarga la página.");
                    setIsLoadingProfile(false);
                  }
                }}
                disabled={isLoadingProfile}
                className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors ${
                  isLoadingProfile ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoadingProfile ? (
                  <>
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="mr-3 text-gray-400 w-4 animate-spin"
                    />
                    Cargando...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon
                      icon={faUserEdit}
                      className="mr-3 text-gray-400 w-4"
                    />
                    Actualizar Mi Perfil
                  </>
                )}
              </button>
              
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

    {/* Modal de Actualizar Perfil - FUERA del dropdown para evitar desmontaje */}
    {showProfileModal && (() => {
      const currentProfile = loadedProfile || profile;
      if (!currentProfile) return null;
      
      return (
        <UpdateProfileModal
          isOpen={showProfileModal}
          onClose={() => {
            console.log("🔴 Cerrando modal");
            setShowProfileModal(false);
            setLoadedProfile(null);
          }}
          userRole={isProfessional ? "professional" : "client"}
          currentProfile={currentProfile}
          onSuccess={() => {
            console.log("✅ Perfil actualizado exitosamente");
            setShowProfileModal(false);
            setLoadedProfile(null);
            // Recargar después de un pequeño delay para que el usuario vea el mensaje de éxito
            setTimeout(() => {
              window.location.reload();
            }, 500);
          }}
        />
      );
    })()}
    </>
  );
}
