"use client";

import React from "react";
import { useServiceStatistics, formatLargeNumber } from "@/hooks/useServiceStatistics";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

interface ServiceStatisticsProps {
  discipline?: string; // Si se proporciona, solo muestra stats de esa disciplina
  showTitle?: boolean;
  className?: string;
}

// Mapeo de disciplinas a nombres amigables
const disciplineNames: Record<string, string> = {
  electricidad: "Instalaciones Eléctricas",
  plomeria: "Reparaciones de Plomería",
  "montaje-armado": "Montajes y Armados",
  limpieza: "Servicios de Limpieza",
  "aire-acondicionado": "Aire Acondicionado",
  cctv: "Sistemas CCTV",
  pintura: "Servicios de Pintura",
  carpinteria: "Trabajos de Carpintería",
  construccion: "Obras y Construcción",
  jardineria: "Servicios de Jardinería",
  cerrajeria: "Servicios de Cerrajería",
  fumigacion: "Servicios de Fumigación",
  wifi: "Instalación de Redes",
  tablaroca: "Trabajos en Tablaroca",
};

export default function ServiceStatistics({
  discipline,
  showTitle = true,
  className = "",
}: ServiceStatisticsProps) {
  const { stats, loading, error } = useServiceStatistics();

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-4 ${className}`}>
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando estadísticas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-600 text-sm py-2 ${className}`}>
        Error al cargar estadísticas: {error}
      </div>
    );
  }

  // Filtrar por disciplina si se especifica
  const displayStats = discipline
    ? stats.filter((s) => s.discipline === discipline)
    : stats.slice(0, 6); // Mostrar top 6 si no se especifica disciplina

  if (displayStats.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {showTitle && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Estadísticas por Servicio
        </h3>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {displayStats.map((stat) => {
          const displayName =
            disciplineNames[stat.discipline] ||
            stat.discipline.charAt(0).toUpperCase() + stat.discipline.slice(1);

          return (
            <div
              key={stat.discipline}
              className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {formatLargeNumber(stat.total_completed)}
              </div>
              <div className="text-sm text-gray-600 mb-2">{displayName}</div>
              <div className="text-xs text-gray-500">
                {stat.total_professionals} {stat.total_professionals === 1 ? "técnico" : "técnicos"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


