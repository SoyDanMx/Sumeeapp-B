"use client";

import React from "react";
import Link from "next/link";
import { Lead } from "@/types/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faClock,
  faHistory,
} from "@fortawesome/free-solid-svg-icons";

interface RecentActivityWidgetProps {
  recentLeads: Lead[];
}

export default function RecentActivityWidget({
  recentLeads,
}: RecentActivityWidgetProps) {
  if (recentLeads.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <FontAwesomeIcon icon={faHistory} className="mr-2 text-blue-600" />
          Actividad Reciente
        </h3>
        <div className="text-center py-8">
          <FontAwesomeIcon
            icon={faClock}
            className="text-4xl text-gray-300 mb-3"
          />
          <p className="text-gray-500">No hay actividad reciente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <FontAwesomeIcon icon={faHistory} className="mr-2 text-blue-600" />
          Actividad Reciente
        </h3>
        <Link
          href="/dashboard/client/historial"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Ver Todo
        </Link>
      </div>

      <div className="space-y-3">
        {recentLeads.slice(0, 3).map((lead) => (
          <Link
            key={lead.id}
            href={`/solicitudes/${lead.id}`}
            className="block p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  {lead.estado === "completado" ? (
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="text-green-500 mr-2 text-sm"
                    />
                  ) : (
                    <FontAwesomeIcon
                      icon={faClock}
                      className="text-yellow-500 mr-2 text-sm"
                    />
                  )}
                  <span className="text-sm font-medium text-gray-900">
                    {lead.servicio_solicitado || "Servicio"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {lead.descripcion_proyecto?.substring(0, 50)}...
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(lead.fecha_creacion).toLocaleDateString("es-MX")}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  lead.estado === "completado"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {lead.estado || "Pendiente"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
