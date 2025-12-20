"use client";

import React, { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWrench,
  faCalendarAlt,
  faClock,
  faCheckCircle,
  faExclamationTriangle,
  faInfoCircle,
  faHistory,
  faLightbulb,
} from "@fortawesome/free-solid-svg-icons";
import { Lead } from "@/types/supabase";
import {
  calculateMaintenanceSuggestions,
  formatRelativeDate,
  MaintenanceSuggestion,
} from "@/lib/utils/maintenanceSuggestions";
import Link from "next/link";

interface MaintenanceLogWidgetProps {
  completedLeads: Lead[];
  onRequestService?: (service?: string) => void;
}

export default function MaintenanceLogWidget({
  completedLeads,
  onRequestService,
}: MaintenanceLogWidgetProps) {
  // Convertir leads completados a formato de mantenimiento
  const maintenanceRecords = useMemo(() => {
    return completedLeads
      .filter((lead) => lead.estado === "completado")
      .map((lead) => {
        // Determinar disciplina: usar disciplina_ia si está disponible, sino servicio (que es la disciplina)
        const disciplinaRaw = lead.disciplina_ia || lead.servicio || "";
        const servicioNombre = lead.servicio_solicitado || lead.servicio || "";
        
        // Normalizar disciplina
        let disciplina = "general";
        const disciplinaLower = disciplinaRaw.toLowerCase();
        if (disciplinaLower.includes("plom") || disciplinaLower === "plomeria") {
          disciplina = "plomeria";
        } else if (disciplinaLower.includes("electric") || disciplinaLower === "electricidad") {
          disciplina = "electricidad";
        } else if (disciplinaLower.includes("limpieza") || disciplinaLower === "limpieza") {
          disciplina = "limpieza";
        } else if (disciplinaLower.includes("carpinter") || disciplinaLower === "carpinteria") {
          disciplina = "carpinteria";
        } else if (disciplinaLower.includes("pintura") || disciplinaLower === "pintura") {
          disciplina = "pintura";
        } else if (disciplinaLower.includes("jardin") || disciplinaLower === "jardineria") {
          disciplina = "jardineria";
        } else if (disciplinaLower.includes("albanil") || disciplinaLower === "albanileria") {
          disciplina = "albanileria";
        } else if (disciplinaLower && disciplinaLower !== "general") {
          // Si hay una disciplina pero no coincide con ninguna conocida, usarla tal cual
          disciplina = disciplinaLower;
        }

        return {
          id: lead.id,
          servicio: servicioNombre,
          servicio_solicitado: lead.servicio_solicitado || undefined,
          disciplina: disciplina,
          fecha_completado: lead.work_completed_at || lead.fecha_creacion || new Date().toISOString(),
          descripcion: lead.descripcion_proyecto || undefined,
        };
      });
  }, [completedLeads]);

  // Calcular sugerencias de mantenimiento
  const suggestions = useMemo(() => {
    return calculateMaintenanceSuggestions(maintenanceRecords);
  }, [maintenanceRecords]);

  // Obtener historial reciente (últimos 5 servicios completados)
  const recentHistory = useMemo(() => {
    return completedLeads
      .filter((lead) => lead.estado === "completado")
      .sort((a, b) => {
        const dateA = new Date(a.work_completed_at || a.fecha_creacion).getTime();
        const dateB = new Date(b.work_completed_at || b.fecha_creacion).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [completedLeads]);

  const hasHistory = recentHistory.length > 0;
  const hasSuggestions = suggestions.length > 0;

  if (!hasHistory && !hasSuggestions) {
    return null; // No mostrar el widget si no hay historial ni sugerencias
  }

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case "alta":
        return "bg-red-100 text-red-700 border-red-200";
      case "media":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "baja":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getPriorityIcon = (prioridad: string) => {
    switch (prioridad) {
      case "alta":
        return faExclamationTriangle;
      case "media":
        return faClock;
      case "baja":
        return faInfoCircle;
      default:
        return faInfoCircle;
    }
  };

  const getDisciplineColor = (disciplina: string) => {
    const colors: Record<string, string> = {
      plomeria: "bg-blue-100 text-blue-700",
      electricidad: "bg-yellow-100 text-yellow-700",
      limpieza: "bg-green-100 text-green-700",
      carpinteria: "bg-amber-100 text-amber-700",
      pintura: "bg-purple-100 text-purple-700",
    };
    return colors[disciplina.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-full p-2">
            <FontAwesomeIcon icon={faWrench} className="text-white text-xl" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Log de Mantenimiento</h3>
            <p className="text-white/80 text-sm">Historial y sugerencias de mantenimiento</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Sugerencias de Mantenimiento */}
        {hasSuggestions && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FontAwesomeIcon
                icon={faLightbulb}
                className="text-yellow-500 text-lg"
              />
              <h4 className="font-semibold text-gray-900 text-lg">
                Próximos Mantenimientos Sugeridos
              </h4>
            </div>
            <div className="space-y-3">
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 transition-all hover:shadow-md ${getPriorityColor(
                    suggestion.prioridad
                  )}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FontAwesomeIcon
                          icon={getPriorityIcon(suggestion.prioridad)}
                          className={`text-sm ${
                            suggestion.prioridad === "alta"
                              ? "text-red-600"
                              : suggestion.prioridad === "media"
                              ? "text-yellow-600"
                              : "text-blue-600"
                          }`}
                        />
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getDisciplineColor(
                            suggestion.disciplina
                          )}`}
                        >
                          {suggestion.disciplina}
                        </span>
                      </div>
                      <h5 className="font-semibold text-gray-900 mb-1">
                        {suggestion.servicio}
                      </h5>
                      <p className="text-sm text-gray-600 mb-2">
                        {suggestion.descripcion}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faCalendarAlt} />
                          <span>
                            Último:{" "}
                            {suggestion.ultimoMantenimiento.toLocaleDateString(
                              "es-MX",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faClock} />
                          <span>
                            {suggestion.diasRestantes <= 0
                              ? "Vencido"
                              : formatRelativeDate(suggestion.proximoMantenimiento)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {onRequestService && (
                      <button
                        onClick={() => onRequestService(suggestion.servicio)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium whitespace-nowrap"
                      >
                        Programar
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {suggestions.length > 3 && (
                <p className="text-sm text-gray-500 text-center pt-2">
                  +{suggestions.length - 3} sugerencia{suggestions.length - 3 !== 1 ? "s" : ""} más
                </p>
              )}
            </div>
          </div>
        )}

        {/* Historial Reciente */}
        {hasHistory && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faHistory}
                  className="text-indigo-500 text-lg"
                />
                <h4 className="font-semibold text-gray-900 text-lg">
                  Historial Reciente
                </h4>
              </div>
              {recentHistory.length > 0 && (
                <span className="text-sm text-gray-500">
                  {recentHistory.length} servicio{recentHistory.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="space-y-2">
              {recentHistory.map((lead) => {
                const fechaCompletado = lead.work_completed_at
                  ? new Date(lead.work_completed_at)
                  : lead.fecha_creacion
                  ? new Date(lead.fecha_creacion)
                  : new Date();

                return (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="text-green-600 text-sm"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {lead.servicio_solicitado || lead.servicio || "Servicio"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {fechaCompletado.toLocaleDateString("es-MX", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Mensaje si no hay sugerencias pero sí historial */}
        {!hasSuggestions && hasHistory && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FontAwesomeIcon
                icon={faInfoCircle}
                className="text-blue-500 mt-0.5"
              />
              <div>
                <p className="text-sm text-blue-900 font-medium">
                  Mantenimientos al día
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Tus servicios están al día. Te notificaremos cuando sea momento de realizar un mantenimiento preventivo.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

