"use client";

import React from "react";
import Link from "next/link";
import { Lead } from "@/types/supabase";
import StatusTracker from "@/components/client/StatusTracker";
import ChatBox from "@/components/client/ChatBox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

interface LeadStatusPageClientProps {
  initialLead: Lead;
  currentUserId: string | null; // Puede ser null para usuarios anónimos
}

export default function LeadStatusPageClient({
  initialLead,
  currentUserId,
}: LeadStatusPageClientProps) {
  const canChat =
    initialLead.estado === "aceptado" ||
    initialLead.estado === "en_camino" ||
    initialLead.estado === "completado";

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/client"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Volver al Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Seguimiento de Solicitud
          </h1>
          <p className="text-gray-600 mt-2">
            ID: {initialLead.id.substring(0, 8)}... | Servicio:{" "}
            {initialLead.servicio_solicitado || "Servicio General"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal - Status Tracker */}
          <div className="lg:col-span-2">
            <StatusTracker
              initialLead={initialLead}
              currentUserId={currentUserId}
            />

            {/* Información adicional del lead */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Detalles de la Solicitud
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Descripción
                  </h3>
                  <p className="text-gray-900">
                    {initialLead.descripcion_proyecto}
                  </p>
                </div>

                {initialLead.urgencia && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Urgencia
                    </h3>
                    <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                      {initialLead.urgencia}
                    </span>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Fecha de Creación
                  </h3>
                  <p className="text-gray-900">
                    {new Date(initialLead.fecha_creacion).toLocaleDateString(
                      "es-MX",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Columna lateral - Chat */}
          <div className="lg:col-span-1">
            {canChat ? (
              <ChatBox leadId={initialLead.id} currentUserId={currentUserId} />
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Chat de la Solicitud
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  El chat estará disponible una vez que un profesional acepte tu
                  solicitud.
                </p>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-900">
                    <strong>Estado actual:</strong>{" "}
                    {initialLead.estado || "Nuevo"}
                  </p>
                  <p className="text-xs text-blue-700 mt-2">
                    Te notificaremos cuando un profesional sea asignado.
                  </p>
                </div>
              </div>
            )}

            {/* Botón de WhatsApp (si hay profesional asignado) */}
            {initialLead.profesional_asignado?.whatsapp && (
              <div className="mt-4">
                <a
                  href={`https://wa.me/${initialLead.profesional_asignado.whatsapp}?text=Hola, tengo una consulta sobre mi solicitud de servicio en Sumee App.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  <FontAwesomeIcon icon={faWhatsapp} className="mr-2" />
                  Contactar por WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
