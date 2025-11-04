"use client";

import React, { useState, useMemo } from "react";
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
} from "@fortawesome/free-solid-svg-icons";

interface WorkFeedProps {
  leads: Lead[];
  profesionalLat?: number;
  profesionalLng?: number;
  currentLat?: number;
  currentLng?: number;
  onLeadClick?: (leadId: string) => void;
  onLeadAccepted?: () => void;
  selectedLeadId?: string | null;
  avatarUrl?: string | null; // URL del avatar del profesional
  onEditProfileClick?: () => void; // Función para abrir el modal de edición de perfil
}

type TabType = "nuevos" | "en_progreso";
type ViewType = "mapa" | "lista" | "split";

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
}: WorkFeedProps) {
  const [activeTab, setActiveTab] = useState<TabType>("nuevos");
  // Por defecto: split en desktop, lista en móvil
  const [viewType, setViewType] = useState<ViewType>("split");

  // Filtrar leads por estado
  const filteredLeads = useMemo(() => {
    if (activeTab === "nuevos") {
      return leads.filter((lead) => lead.estado === "nuevo");
    } else {
      return leads.filter(
        (lead) => lead.estado === "contactado" || lead.estado === "en_progreso"
      );
    }
  }, [leads, activeTab]);

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
                      Asegúrate de que tu estado esté en "Disponible" para
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
      {/* Header con pestañas y toggle de vista */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab("nuevos")}
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
              {leads.filter((lead) => lead.estado === "nuevo").length > 0 && (
                <span className="bg-blue-100 text-blue-600 text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full font-semibold">
                  {leads.filter((lead) => lead.estado === "nuevo").length}
                </span>
              )}
            </div>
          </button>

          <button
            onClick={() => setActiveTab("en_progreso")}
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
              {leads.filter(
                (lead) =>
                  lead.estado === "contactado" || lead.estado === "en_progreso"
              ).length > 0 && (
                <span className="bg-green-100 text-green-600 text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full font-semibold">
                  {
                    leads.filter(
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

        {/* Toggle de vista Mapa/Lista/Split */}
        {activeTab === "nuevos" && (
          <div className="flex justify-end px-3 md:px-4 py-2.5 md:py-2 border-t border-gray-100">
            <div className="flex gap-2 md:gap-2">
              <button
                onClick={() => setViewType("mapa")}
                className={`px-3 md:px-3 py-2 md:py-1.5 text-sm md:text-xs font-semibold md:font-medium rounded-lg transition-colors active:scale-95 touch-manipulation ${
                  viewType === "mapa"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300"
                }`}
                title="Vista Mapa"
                aria-label="Vista Mapa"
              >
                <FontAwesomeIcon icon={faMap} className="text-sm md:text-xs" />
                <span className="hidden sm:inline ml-1">Mapa</span>
              </button>
              <button
                onClick={() => setViewType("split")}
                className={`px-3 md:px-3 py-2 md:py-1.5 text-sm md:text-xs font-semibold md:font-medium rounded-lg transition-colors active:scale-95 touch-manipulation ${
                  viewType === "split"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300"
                }`}
                title="Vista Split (Mapa + Lista)"
                aria-label="Vista Split"
              >
                <FontAwesomeIcon
                  icon={faMap}
                  className="text-sm md:text-xs mr-1"
                />
                <FontAwesomeIcon
                  icon={faList}
                  className="text-sm md:text-xs mr-1"
                />
                <span className="hidden sm:inline">Split</span>
              </button>
              <button
                onClick={() => setViewType("lista")}
                className={`px-3 md:px-3 py-2 md:py-1.5 text-sm md:text-xs font-semibold md:font-medium rounded-lg transition-colors active:scale-95 touch-manipulation ${
                  viewType === "lista"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300"
                }`}
                title="Vista Lista"
                aria-label="Vista Lista"
              >
                <FontAwesomeIcon icon={faList} className="text-sm md:text-xs" />
                <span className="hidden sm:inline ml-1">Lista</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Contenido: Mapa, Lista o Split según viewType */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "nuevos" && viewType === "mapa" ? (
          // Vista solo Mapa
          <div className="h-full">
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
          </div>
        ) : activeTab === "nuevos" && viewType === "split" ? (
          // Vista Split (Mapa + Lista) - En móvil: lista arriba, mapa abajo; en desktop: lado a lado
          <div className="flex flex-col md:flex-row h-full">
            {/* Mapa: En móvil abajo, en desktop izquierda */}
            <div className="order-2 md:order-1 flex-1 min-h-[300px] md:min-h-0 border-t md:border-t-0 md:border-r border-gray-200">
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
            </div>
            {/* Lista: En móvil arriba, en desktop derecha */}
            <div className="order-1 md:order-2 w-full md:w-96 overflow-y-auto max-h-[50vh] md:max-h-none border-b md:border-b-0 border-gray-200 md:border-l">
              {sortedLeads.length > 0 ? (
                <div className="p-2 md:p-4 space-y-3 md:space-y-4">
                  {sortedLeads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      profesionalLat={(currentLat || profesionalLat) ?? 19.4326}
                      profesionalLng={
                        (currentLng || profesionalLng) ?? -99.1332
                      }
                      isSelected={lead.id === selectedLeadId}
                      onSelect={() => onLeadClick?.(lead.id)}
                      onLeadAccepted={onLeadAccepted}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState tabType={activeTab} />
              )}
            </div>
          </div>
        ) : (
          // Vista solo Lista
          <div className="flex-1 overflow-y-auto">
            {sortedLeads.length > 0 ? (
              <div className="p-2 md:p-4 space-y-3 md:space-y-4">
                {sortedLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    profesionalLat={(currentLat || profesionalLat) ?? 19.4326}
                    profesionalLng={(currentLng || profesionalLng) ?? -99.1332}
                    isSelected={lead.id === selectedLeadId}
                    onSelect={() => onLeadClick?.(lead.id)}
                    onLeadAccepted={onLeadAccepted}
                  />
                ))}
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
