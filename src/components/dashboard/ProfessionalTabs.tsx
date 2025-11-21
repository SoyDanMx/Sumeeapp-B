"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faBriefcase,
  faQuestionCircle,
  faSignOutAlt,
  faMapLocationDot,
  faIdCard,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import { supabase } from "@/lib/supabase/client";
import Image from "next/image";
import { Profesional } from "@/types/supabase";

interface ProfessionalTabsProps {
  profesional: Profesional;
  onClose?: () => void;
  onShowLeadsList?: () => void;
  onShowLeadsMap?: () => void;
  onShowCredential?: () => void;
  onShowAcceptedLeads?: () => void;
  onNavigate?: (tab: TabType) => void;
  isMobile?: boolean;
}

type TabType = "profile" | "leads" | "help" | "logout";

export default function ProfessionalTabs({
  profesional,
  onClose,
  onShowLeadsList,
  onShowLeadsMap,
  onShowCredential,
  onShowAcceptedLeads,
  onNavigate,
  isMobile,
}: ProfessionalTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      if (onClose) onClose();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navigateToAcceptedLeads = () => {
    if (onShowAcceptedLeads) {
      onShowAcceptedLeads();
    } else if (onShowLeadsList) {
      onShowLeadsList();
    }
  };

  const tabs = [
    {
      id: "profile" as TabType,
      label: "Perfil Profesional",
      icon: faUser,
      href: "/professional-dashboard",
      description: "Gestiona tu información profesional",
    },
    {
      id: "leads" as TabType,
      label: "Mis Leads",
      icon: faBriefcase,
      action: navigateToAcceptedLeads,
      description: "Gestiona tus oportunidades de trabajo",
    },
    {
      id: "help" as TabType,
      label: "Centro de Ayuda",
      icon: faQuestionCircle,
      href: "/help",
      description: "Soporte y documentación",
    },
    {
      id: "logout" as TabType,
      label: "Cerrar Sesión",
      icon: faSignOutAlt,
      action: handleSignOut,
      description: "Salir de tu cuenta",
    },
  ];

  const avatarUrl = profesional.avatar_url;
  const rating = profesional.calificacion_promedio;
  const reviewCount = 
    typeof profesional.review_count === "number"
      ? profesional.review_count
      : null;
  // Ya no hay membership - todos son profesionales Sumee Pro
  const membershipLabel = "Sumee Pro";
  const specialties =
    profesional.areas_servicio ||
    (profesional.profession ? [profesional.profession] : []);
  const specialtiesList = specialties
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
  const specialtiesSummary = specialtiesList.length
    ? specialtiesList.slice(0, 3).join(", ") +
      (specialtiesList.length > 3
        ? ` +${specialtiesList.length - 3} especialidades más`
        : "")
    : "";
  const ratingValue = typeof rating === "number" && rating > 0 ? rating : null;
  const formattedRating = ratingValue ? ratingValue.toFixed(1) : "5.0";
  const totalStars = 5;
  const filledStars = ratingValue
    ? Math.min(totalStars, Math.round(ratingValue))
    : totalStars;
  const starString =
    "⭐".repeat(filledStars) + "☆".repeat(totalStars - filledStars);

  const handleTabPress = (tab: (typeof tabs)[number]) => {
    setActiveTab(tab.id);
    tab.action?.();
    if (onNavigate) {
      onNavigate(tab.id);
    }
  };

  const headerButtons = useMemo(
    () => [
      {
        label: "Trabajos disponibles",
        icon: faBriefcase,
        action: onShowLeadsList,
        styles:
          "bg-white text-indigo-600 shadow-md hover:shadow-lg border border-white/40",
      },
      {
        label: "Mapa interactivo",
        icon: faMapLocationDot,
        action: onShowLeadsMap,
        styles:
          "bg-white/20 text-white border border-white/40 backdrop-blur hover:bg-white/25",
      },
      {
        label: "Identificación Sumee Pro",
        icon: faIdCard,
        action: onShowCredential,
        styles: "bg-amber-400 text-indigo-900 shadow-md hover:bg-amber-300",
      },
    ],
    [onShowLeadsList, onShowLeadsMap, onShowCredential]
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header del Profesional - Compactado */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-500 p-2 sm:p-2.5 text-white">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.6),transparent_65%)]" />
        <div className="relative flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row sm:items-start gap-2">
            <div className="relative">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={profesional.full_name ?? "Profesional Sumee"}
                  width={48}
                  height={48}
                  className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-xl border-2 border-white/40 shadow-lg"
                />
              ) : (
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/25 border-2 border-white/40 flex items-center justify-center shadow-lg">
                  <FontAwesomeIcon icon={faUser} className="text-base sm:text-lg" />
                </div>
              )}
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-0.5 bg-emerald-500 text-white text-[8px] font-semibold px-1.5 py-0.5 rounded-full shadow">
                <FontAwesomeIcon icon={faShieldHalved} className="text-[9px]" />
                <span className="hidden sm:inline">{membershipLabel}</span>
                <span className="sm:hidden">Pro</span>
              </span>
            </div>
            <div className="flex-1 min-w-0 space-y-0.5">
              <h3 className="text-sm sm:text-base font-bold leading-tight break-words">
                {profesional.full_name || "Profesional Sumee"}
              </h3>
              <p className="text-blue-100 text-[10px] sm:text-xs capitalize line-clamp-1">
                {profesional.profession || "Especialista verificado"}
              </p>
              <p className="text-blue-200 text-[9px] sm:text-[10px] break-all line-clamp-1">
                {profesional.email}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs text-white/90">
                <span className="inline-flex items-center gap-1 bg-white/15 px-2 py-1 rounded-full backdrop-blur">
                  <span className="text-xs leading-none tracking-tight">
                    {starString}
                  </span>
                  <span className="font-semibold text-white">
                    {formattedRating}/5.0
                  </span>
                  {ratingValue && reviewCount && (
                    <span className="text-white/70 text-[9px] font-normal">
                      · {reviewCount}
                    </span>
                  )}
                </span>
                <span className="inline-flex items-center gap-1 bg-white/20 px-1.5 py-0.5 rounded-full">
                  <FontAwesomeIcon icon={faIdCard} className="text-[9px]" />
                  <span className="text-[9px]">ID: {profesional.user_id?.slice(0, 6) ?? "—"}</span>
                </span>
              </div>
              {specialtiesSummary && (
                <p className="text-[10px] sm:text-xs text-white/90 font-medium line-clamp-1">
                  <span className="text-white">Especialista:</span>{" "}
                  {specialtiesSummary}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            {headerButtons.map((button) => (
              <button
                key={button.label}
                onClick={() => button.action?.()}
                className={`w-full inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg font-medium text-[10px] sm:text-xs transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/60 ${button.styles}`}
                aria-label={button.label}
              >
                <FontAwesomeIcon icon={button.icon} className="text-[10px] sm:text-xs" />
                <span className="text-[10px] sm:text-xs text-center line-clamp-1">{button.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pestañas de Navegación - Compactado */}
      <div className="p-2 sm:p-2.5">
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          {tabs.map((tab) => (
            <div key={tab.id}>
              {tab.href && !isMobile ? (
                <Link
                  href={tab.href}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm"
                      : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <FontAwesomeIcon
                    icon={tab.icon}
                    className={`text-lg sm:text-xl mb-1 ${
                      activeTab === tab.id ? "text-indigo-600" : "text-gray-500"
                    }`}
                  />
                  <span className="text-xs sm:text-sm font-medium text-center line-clamp-1">
                    {tab.label}
                  </span>
                </Link>
              ) : (
                <button
                  onClick={() =>
                    tab.action ? tab.action() : handleTabPress(tab)
                  }
                  disabled={isLoggingOut && tab.id === "logout"}
                  className={`w-full flex flex-col items-center p-2 sm:p-2.5 rounded-lg border-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? tab.id === "logout"
                        ? "border-red-500 bg-red-50 text-red-700 shadow-md"
                        : "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md"
                      : tab.id === "logout"
                      ? "border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-700"
                      : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50 text-gray-700"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <FontAwesomeIcon
                    icon={tab.icon}
                    className={`text-lg sm:text-xl mb-1 ${
                      activeTab === tab.id && tab.id === "logout" ? "text-red-600" : activeTab === tab.id ? "text-indigo-600" : "text-gray-500"
                    }`}
                  />
                  <span className="text-xs sm:text-sm font-medium text-center line-clamp-1">
                    {isLoggingOut ? "Cerrando..." : tab.label}
                  </span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Información Adicional - Compactado */}
      <div className="px-2 sm:px-3 pb-2 sm:pb-3">
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Estado:</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                profesional.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {profesional.status === "active" ? "Activo" : "Inactivo"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1.5">
            <span className="text-gray-600">Miembro desde:</span>
            <span className="text-gray-800 font-medium text-[10px]">
              {new Date(profesional.created_at).toLocaleDateString("es-MX", { month: "short", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
