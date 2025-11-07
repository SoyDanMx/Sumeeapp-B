"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Lead } from "@/types/supabase";
import LeadCard from "@/components/LeadCard";

// Dynamic import del mapa para evitar problemas con Turbopack
const ProfessionalMapView = dynamic(
  () => import("@/components/dashboard/ProfessionalMapView"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando mapa interactivo...</p>
        </div>
      </div>
    ),
  }
);
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBriefcase,
  faClock,
  faLightbulb,
  faCheckCircle,
  faExclamationTriangle,
  faMap,
  faList,
  faArrowRight,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";

interface WorkFeedProps {
  leads: Lead[];
  profesionalLat?: number;
  profesionalLng?: number;
  currentLat?: number;
  currentLng?: number;
  onLeadClick?: (leadId: string) => void;
  onLeadAccepted?: (lead: Lead) => void;
  selectedLeadId?: string | null;
  avatarUrl?: string | null; // URL del avatar del profesional
  onEditProfileClick?: () => void; // Función para abrir el modal de edición de perfil
  forcedViewType?: ViewType;
  onViewTypeChange?: (view: ViewType) => void;
  forcedTab?: TabType;
  onTabChange?: (tab: TabType) => void;
}

type TabType = "nuevos" | "en_progreso";
type ViewType = "mapa" | "lista";

export default function WorkFeed({
  leads,
  profesionalLat,
  profesionalLng,
  currentLat,
  currentLng,
  onLeadClick,
  onLeadAccepted,
  selectedLeadId,
  avatarUrl,
  onEditProfileClick,
  forcedViewType,
  onViewTypeChange,
  forcedTab,
  onTabChange,
}: WorkFeedProps) {
  const [activeTab, setActiveTabState] = useState<TabType>("nuevos");
  const [viewType, setViewTypeState] = useState<ViewType>("mapa");
  const [isMobile, setIsMobile] = useState(false);
  const [localLeads, setLocalLeads] = useState<Lead[]>(leads);

  useEffect(() => {
    setLocalLeads(leads);
  }, [leads]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateIsMobile = () => setIsMobile(window.innerWidth < 768);
    updateIsMobile();
    window.addEventListener("resize", updateIsMobile);
    return () => window.removeEventListener("resize", updateIsMobile);
  }, []);

  const handleChangeView = (view: ViewType) => {
    setViewTypeState(view);
    onViewTypeChange?.(view);
  };

  useEffect(() => {
    if (forcedViewType && forcedViewType !== viewType) {
      setViewTypeState(forcedViewType);
    }
  }, [forcedViewType, viewType]);

  useEffect(() => {
    if (forcedTab && forcedTab !== activeTab) {
      setActiveTabState(forcedTab);
    }
  }, [forcedTab, activeTab]);

  // Filtrar leads por estado
  const filteredLeads = useMemo(() => {
    if (activeTab === "nuevos") {
      return localLeads.filter((lead) => lead.estado === "nuevo");
    } else {
      return localLeads.filter(
        (lead) => lead.estado === "contactado" || lead.estado === "en_progreso"
      );
    }
  }, [localLeads, activeTab]);

  // Componente para estado vacío
  const EmptyState = ({ tabType }: { tabType: TabType }) => {
    const isNewLeads = tabType === "nuevos";

    return (
      <div className="text-center py-12 px-6">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FontAwesomeIcon
            icon={isNewLeads ? faBriefcase : faClock}
            className="text-3xl text-blue-500"
          />
        </div>

        <h3 className="text-xl font-semibold text-gray-800 mb-3">
          {isNewLeads
            ? "Todo tranquilo por ahora..."
            : "No hay trabajos en progreso"}
        </h3>

        <div className="space-y-4 text-left max-w-md mx-auto">
          {isNewLeads ? (
            <>
              <button
                onClick={onEditProfileClick}
                disabled={!onEditProfileClick}
                className={`w-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 hover:from-orange-600 hover:via-red-600 hover:to-pink-700 text-white border-2 border-transparent hover:border-white rounded-lg p-4 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl animate-pulse cursor-pointer group ${
                  !onEditProfileClick ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <div className="flex items-start text-left">
                  <FontAwesomeIcon
                    icon={faLightbulb}
                    className="text-yellow-300 mt-1 mr-3 flex-shrink-0 text-xl group-hover:animate-bounce"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-white mb-1 text-base flex items-center gap-2">
                      <span>¡Optimiza tu perfil!</span>
                      <FontAwesomeIcon
                        icon={faExclamationTriangle}
                        className="text-yellow-300 animate-bounce text-sm"
                      />
                    </h4>
                    <p className="text-sm text-white/90">
                      Los profesionales con perfiles completos tienen 3x más
                      probabilidades de recibir trabajos.
                    </p>
                    <div className="mt-2 text-xs text-white/80 font-medium">
                      👆 Haz clic para optimizar →
                    </div>
                  </div>
                </div>
              </button>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-green-500 mt-1 mr-3 flex-shrink-0"
                  />
                  <div>
                    <h4 className="font-medium text-green-900 mb-1">
                      Mantén tu disponibilidad activa
                    </h4>
                    <p className="text-sm text-green-700">
                      Asegúrate de que tu estado esté en &quot;Disponible&quot; para
                      recibir notificaciones.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start">
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="text-purple-500 mt-1 mr-3 flex-shrink-0"
                  />
                  <div>
                    <h4 className="font-medium text-purple-900 mb-1">
                      Actualiza tus áreas de servicio
                    </h4>
                    <p className="text-sm text-purple-700">
                      Revisa que tus especialidades estén actualizadas para
                      aparecer en más búsquedas.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start">
                <FontAwesomeIcon
                  icon={faClock}
                  className="text-gray-500 mt-1 mr-3 flex-shrink-0"
                />
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">
                    No hay trabajos activos
                  </h4>
                  <p className="text-sm text-gray-600">
                    Cuando aceptes un lead, aparecerá aquí para que puedas hacer
                    seguimiento.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Ordenar leads por distancia (solo para nuevos leads)
  const sortedLeads = useMemo(() => {
    if (activeTab !== "nuevos" || !profesionalLat || !profesionalLng) {
      return filteredLeads;
    }

    return [...filteredLeads].sort((a, b) => {
      const distA =
        a.ubicacion_lat && a.ubicacion_lng
          ? Math.sqrt(
              Math.pow((a.ubicacion_lat - profesionalLat) * 111, 2) +
                Math.pow((a.ubicacion_lng - profesionalLng) * 111, 2)
            )
          : Infinity;
      const distB =
        b.ubicacion_lat && b.ubicacion_lng
          ? Math.sqrt(
              Math.pow((b.ubicacion_lat - profesionalLat) * 111, 2) +
                Math.pow((b.ubicacion_lng - profesionalLng) * 111, 2)
            )
          : Infinity;
      return distA - distB;
    });
  }, [filteredLeads, activeTab, profesionalLat, profesionalLng]);

  const primaryLead = sortedLeads[0];

  const calculateDistance = (
    lat1?: number | null,
    lng1?: number | null,
    lat2?: number | null,
    lng2?: number | null
  ) => {
    const coordinates: Array<number | null | undefined> = [
      lat1,
      lng1,
      lat2,
      lng2,
    ];
    const isNumber = (value: number | null | undefined): value is number =>
      typeof value === "number";

    if (!coordinates.every(isNumber)) {
      return null;
    }
    const [safeLat1, safeLng1, safeLat2, safeLng2] = coordinates;
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(safeLat2 - safeLat1);
    const dLon = toRad(safeLng2 - safeLng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(safeLat1)) *
        Math.cos(toRad(safeLat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  const changeActiveTab = (tab: TabType) => {
    setActiveTabState(tab);
    onTabChange?.(tab);
  };

  const handleLeadAccepted = useCallback(
    (lead: Lead) => {
      setLocalLeads((prev) => {
        const next = [...prev];
        const index = next.findIndex((item) => item.id === lead.id);
        if (index >= 0) {
          next[index] = {
            ...next[index],
            ...lead,
          };
        } else {
          next.push(lead);
        }
        return next;
      });

      setActiveTabState("en_progreso");
      onTabChange?.("en_progreso");
      setViewTypeState("lista");
      onViewTypeChange?.("lista");
      onLeadAccepted?.(lead);
    },
    [onLeadAccepted, onTabChange, onViewTypeChange]
  );

  return (
    <div
      id="professional-leads-section"
      className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col"
    >
      {/* Header con pestañas y toggle de vista */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => changeActiveTab("nuevos")}
            className={`flex-1 px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium transition-colors duration-200 touch-manipulation active:scale-95 ${
              activeTab === "nuevos"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center space-x-1 md:space-x-2">
              <FontAwesomeIcon
                icon={faBriefcase}
                className="text-xs md:text-sm"
              />
              <span className="hidden sm:inline">Nuevos Leads</span>
              <span className="sm:hidden">Nuevos</span>
              {localLeads.filter((lead) => lead.estado === "nuevo").length > 0 && (
                <span className="bg-blue-100 text-blue-600 text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full font-semibold">
                  {localLeads.filter((lead) => lead.estado === "nuevo").length}
                </span>
              )}
            </div>
          </button>

          <button
            onClick={() => changeActiveTab("en_progreso")}
            className={`flex-1 px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium transition-colors duration-200 touch-manipulation active:scale-95 ${
              activeTab === "en_progreso"
                ? "text-green-600 border-b-2 border-green-600 bg-green-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center space-x-1 md:space-x-2">
              <FontAwesomeIcon icon={faClock} className="text-xs md:text-sm" />
              <span className="hidden sm:inline">En Progreso</span>
              <span className="sm:hidden">Progreso</span>
              {localLeads.filter(
                (lead) =>
                  lead.estado === "contactado" || lead.estado === "en_progreso"
              ).length > 0 && (
                <span className="bg-green-100 text-green-600 text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full font-semibold">
                  {
                    localLeads.filter(
                      (lead) =>
                        lead.estado === "contactado" ||
                        lead.estado === "en_progreso"
                    ).length
                  }
                </span>
              )}
            </div>
          </button>
        </div>
        {activeTab === "nuevos" && (
          <div className="flex justify-between items-center px-3 md:px-4 py-2.5 border-t border-gray-100 bg-white sticky top-0 z-20 md:static">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-semibold">
                <FontAwesomeIcon icon={faLocationDot} className="text-xs" />
                {sortedLeads.length} lead(s) cercanos
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleChangeView("mapa")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors active:scale-95 ${
                  viewType === "mapa"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <FontAwesomeIcon icon={faMap} className="mr-1" />
                Mapa
              </button>
              <button
                onClick={() => handleChangeView("lista")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors active:scale-95 ${
                  viewType === "lista"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <FontAwesomeIcon icon={faList} className="mr-1" />
                Lista
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Contenido: Mapa, Lista o Split según viewType */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "nuevos" && viewType === "mapa" ? (
          <div
            className={`relative ${
              isMobile ? "h-[calc(100vh-220px)]" : "h-full"
            }`}
          >
            <ProfessionalMapView
              leads={sortedLeads}
              profesionalLat={profesionalLat}
              profesionalLng={profesionalLng}
              currentLat={currentLat}
              currentLng={currentLng}
              selectedLeadId={selectedLeadId}
              onLeadClick={onLeadClick}
              avatarUrl={avatarUrl}
            />
            {primaryLead && (
              <div
                className={`absolute inset-x-0 ${
                  isMobile ? "bottom-0" : "bottom-4"
                } px-3 pb-4`}
              >
                <div
                  className={`bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden ${
                    isMobile ? "pb-2" : ""
                  }`}
                >
                  <div className="px-4 pt-4 pb-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                        Lead disponible
                      </span>
                      {(() => {
                        const refLat = currentLat ?? profesionalLat;
                        const refLng = currentLng ?? profesionalLng;
                        const distance = calculateDistance(
                          refLat,
                          refLng,
                          primaryLead.ubicacion_lat,
                          primaryLead.ubicacion_lng
                        );
                        if (distance === null) return null;
                        return (
                          <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-1 rounded-full">
                            {distance} km
                          </span>
                        );
                      })()}
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {primaryLead.servicio_solicitado ||
                            "Servicio profesional"}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {primaryLead.descripcion_proyecto ||
                            "¿Listo para apoyar a este cliente?"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          changeActiveTab("nuevos");
                          if (viewType !== "mapa") {
                            handleChangeView("mapa");
                          }
                          onLeadClick?.(primaryLead.id);
                        }}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm transition-all hover:text-blue-600 hover:border-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
                        aria-label="Ver ubicación del lead en el mapa"
                      >
                        <FontAwesomeIcon
                          icon={faArrowRight}
                          className="text-lg"
                        />
                      </button>
                    </div>
                    <div className="flex items-center mt-3 text-sm text-gray-600 gap-2">
                      <FontAwesomeIcon
                        icon={faLocationDot}
                        className="text-blue-500"
                      />
                      <span className="truncate">
                        {primaryLead.ubicacion_direccion || "Zona CDMX"}
                      </span>
                    </div>
                    <div className="flex items-center mt-2 text-xs text-gray-500 gap-1">
                      <FontAwesomeIcon icon={faClock} />
                      <span>
                        {new Date(primaryLead.fecha_creacion).toLocaleString(
                          "es-MX",
                          {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </div>
                    <div
                      className={`flex ${
                        isMobile
                          ? "flex-col"
                          : "flex-col sm:flex-row sm:items-center"
                      } sm:justify-between mt-4 gap-2`}
                    >
                      <button
                        onClick={() => {
                          changeActiveTab("nuevos");
                          handleChangeView("lista");
                          onLeadClick?.(primaryLead.id);
                        }}
                        className="w-full sm:w-auto bg-blue-600 text-white px-4 py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Ver detalles
                      </button>
                      <button
                        onClick={() => onLeadClick?.(primaryLead.id)}
                        className="w-full sm:w-auto bg-gray-100 text-gray-700 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
                      >
                        Centrar en el mapa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Vista Lista para "nuevos" en modo lista y para "en progreso"
          <div className={`flex-1 overflow-y-auto ${isMobile ? "pb-20" : ""}`}>
            {(activeTab === "nuevos" ? sortedLeads : filteredLeads).length >
            0 ? (
              <div className="p-2 md:p-4 space-y-3 md:space-y-4">
                {(activeTab === "nuevos" ? sortedLeads : filteredLeads).map(
                  (lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      profesionalLat={(currentLat || profesionalLat) ?? 19.4326}
                      profesionalLng={(currentLng || profesionalLng) ?? -99.1332}
                      isSelected={lead.id === selectedLeadId}
                      onSelect={() => onLeadClick?.(lead.id)}
                      onLeadAccepted={handleLeadAccepted}
                    />
                  )
                )}
              </div>
            ) : (
              <EmptyState tabType={activeTab} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
