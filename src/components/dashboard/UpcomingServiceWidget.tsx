"use client";

import React from "react";
import { Lead } from "@/types/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faCheckCircle,
  faChevronRight,
  faUser,
  faWrench,
  faPlus,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

interface UpcomingServiceWidgetProps {
  upcomingLead: Lead | null;
  onViewDetails?: (lead: Lead) => void;
  onRequestService?: () => void;
}

export default function UpcomingServiceWidget({
  upcomingLead,
  onViewDetails,
  onRequestService,
}: UpcomingServiceWidgetProps) {
  if (!upcomingLead) {
    return (
      <div className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 rounded-xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Efecto de brillo animado de fondo */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 animate-shimmer"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <FontAwesomeIcon icon={faClock} className="text-xl" />
                </div>
                <h3 className="text-xl font-bold">Próximo Servicio</h3>
              </div>
              <p className="text-blue-100 text-sm sm:text-base mb-4">
                No tienes servicios agendados. ¡Solicita uno ahora y te conectaremos con especialistas verificados!
              </p>
            </div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm flex-shrink-0">
              <FontAwesomeIcon icon={faWrench} className="text-2xl sm:text-3xl" />
            </div>
          </div>
          
          {/* Botón CTA Moderno */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onRequestService) {
                onRequestService();
              }
            }}
            className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white text-indigo-700 font-bold text-sm sm:text-base px-6 py-3.5 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 hover:bg-indigo-50 overflow-hidden"
          >
            {/* Efecto de brillo en hover */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></span>
            
            <FontAwesomeIcon 
              icon={faPlus} 
              className="text-lg group-hover:rotate-90 transition-transform duration-300" 
            />
            <span className="relative z-10">Solicitar Servicio Ahora</span>
            <FontAwesomeIcon 
              icon={faArrowRight} 
              className="text-sm group-hover:translate-x-1 transition-transform duration-300 relative z-10" 
            />
          </button>
        </div>
      </div>
    );
  }

  const getStatusInfo = (estado: string | null) => {
    switch (estado?.toLowerCase()) {
      case "aceptado":
        return {
          label: "Profesional Asignado",
          icon: faCheckCircle,
          color: "text-green-400",
        };
      case "en_camino":
        return {
          label: "En Camino",
          icon: faClock,
          color: "text-yellow-300",
        };
      default:
        return {
          label: "Pendiente",
          icon: faClock,
          color: "text-blue-200",
        };
    }
  };

  const statusInfo = getStatusInfo(upcomingLead.estado);

  const triggerView = () => {
    if (onViewDetails) {
      onViewDetails(upcomingLead);
    } else {
      void (async () => {
        // fallback navigation if no callback provided
        window.location.href = `/solicitudes/${upcomingLead.id}`;
      })();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(event) => {
        event.preventDefault();
        triggerView();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          triggerView();
        }
      }}
      className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white hover:from-blue-600 hover:to-purple-700 transition-all cursor-pointer shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <FontAwesomeIcon
              icon={statusInfo.icon}
              className={`${statusInfo.color} mr-2`}
            />
            <span className="text-sm font-medium">{statusInfo.label}</span>
          </div>
          <h3 className="text-xl font-bold mb-1">
            {upcomingLead.servicio_solicitado || "Servicio Profesional"}
          </h3>
          {upcomingLead.profesional_asignado && (
            <div className="flex items-center mt-2 text-blue-100">
              <FontAwesomeIcon icon={faUser} className="mr-2" />
              <span>
                {upcomingLead.profesional_asignado.full_name ||
                  "Profesional Asignado"}
              </span>
            </div>
          )}
        </div>
        <FontAwesomeIcon
          icon={faChevronRight}
          className="text-xl opacity-50"
        />
      </div>

      <div className="pt-4 border-t border-white/20">
        <div className="flex items-center justify-between">
          <span className="text-sm text-blue-100">
            {new Date(upcomingLead.fecha_creacion).toLocaleDateString("es-MX", {
              day: "numeric",
              month: "short",
            })}
          </span>
          <span className="text-sm font-medium">Ver Detalles →</span>
        </div>
      </div>
    </div>
  );
}
