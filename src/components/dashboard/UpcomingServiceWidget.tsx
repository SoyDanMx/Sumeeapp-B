"use client";

import React from "react";
import Link from "next/link";
import { Lead } from "@/types/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faCheckCircle,
  faChevronRight,
  faUser,
  faWrench,
} from "@fortawesome/free-solid-svg-icons";

interface UpcomingServiceWidgetProps {
  upcomingLead: Lead | null;
}

export default function UpcomingServiceWidget({
  upcomingLead,
}: UpcomingServiceWidgetProps) {
  if (!upcomingLead) {
    return (
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Próximo Servicio</h3>
            <p className="text-blue-100">
              No tienes servicios agendados. ¡Solicita uno ahora!
            </p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <FontAwesomeIcon icon={faClock} className="text-2xl" />
          </div>
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

  return (
    <Link href={`/solicitudes/${upcomingLead.id}`}>
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white hover:from-blue-600 hover:to-purple-700 transition-all cursor-pointer shadow-lg">
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
              {new Date(upcomingLead.fecha_creacion).toLocaleDateString(
                "es-MX",
                {
                  day: "numeric",
                  month: "short",
                }
              )}
            </span>
            <span className="text-sm font-medium">Ver Detalles →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
