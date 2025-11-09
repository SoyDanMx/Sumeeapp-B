"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Lead, Profile } from "@/types/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faSpinner,
  faUser,
  faMapMarkerAlt,
  faWrench,
} from "@fortawesome/free-solid-svg-icons";

type TrackerLead = Lead & {
  appointment_at?: string | null;
  appointment_status?: string | null;
  profesional_asignado?: Partial<Profile> | null;
};

interface StatusTrackerProps {
  lead: TrackerLead;
  currentUserId: string | null;
  onLeadChange?: (lead: Lead) => void;
}

const STATUS_STEPS = [
  {
    key: "nuevo",
    label: "Solicitud enviada",
    icon: faCheckCircle,
  },
  {
    key: "aceptado",
    label: "Profesional asignado",
    icon: faUser,
  },
  {
    key: "contactado",
    label: "Contacto en seguimiento",
    icon: faSpinner,
  },
  {
    key: "en_progreso",
    label: "Cita programada",
    icon: faMapMarkerAlt,
  },
  {
    key: "completado",
    label: "Trabajo completado",
    icon: faWrench,
  },
];

function mapStatus(lead: TrackerLead) {
  const estado = (lead.estado || "").toLowerCase();
  if (estado === "completado") return "completado";
  if (estado === "en_progreso") return "en_progreso";
  if (estado === "contactado") return "contactado";
  if (estado === "aceptado") return "aceptado";
  return "nuevo";
}

export default function StatusTracker({
  lead,
  currentUserId,
  onLeadChange,
}: StatusTrackerProps) {
  const [currentLead, setCurrentLead] = useState<TrackerLead>(lead);
  const [isLoading, setIsLoading] = useState(false);

  // Suscribirse a cambios en tiempo real del lead
  useEffect(() => {
    if (!lead?.id) return;

    let subscription: any = null;

    const subscribeToLeadUpdates = async () => {
      try {
        subscription = supabase
          .channel(`lead:${lead.id}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "leads",
              filter: `id=eq.${lead.id}`,
            },
            (payload) => {
              const updatedLead = payload.new as TrackerLead;
              setCurrentLead(updatedLead);
              setIsLoading(false);
              onLeadChange?.(updatedLead);
            }
          )
          .subscribe();
      } catch (error) {
        console.error("Error subscribing to lead updates:", error);
      }
    };

    subscribeToLeadUpdates();

    // Cleanup
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [lead?.id, onLeadChange]);

  useEffect(() => {
    setCurrentLead(lead);
  }, [lead]);

  // Obtener el índice del paso actual
  const getCurrentStepIndex = () => {
    const mappedStatus = mapStatus(currentLead);
    const stepIndex = STATUS_STEPS.findIndex((step) => step.key === mappedStatus);
    return stepIndex >= 0 ? stepIndex : 0;
  };

  const currentStepIndex = getCurrentStepIndex();
  const appointmentInfo = currentLead.appointment_at
    ? new Date(currentLead.appointment_at).toLocaleString("es-MX", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Estado de tu Solicitud
      </h2>

      {/* Stepper Visual */}
      <div className="relative">
        {/* Línea de progreso */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        <div
          className="absolute left-4 top-0 w-0.5 bg-blue-600 transition-all duration-500"
          style={{
            height: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%`,
          }}
        ></div>

        {/* Pasos */}
        <div className="space-y-6">
          {STATUS_STEPS.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isPending = index > currentStepIndex;

            return (
              <div key={step.key} className="relative flex items-start">
                {/* Ícono del paso */}
                <div
                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isCurrent
                      ? "bg-blue-600 text-white animate-pulse"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <FontAwesomeIcon icon={faCheckCircle} className="text-sm" />
                  ) : (
                    <FontAwesomeIcon
                      icon={step.icon}
                      spin={isCurrent && step.icon === faSpinner}
                      className="text-sm"
                    />
                  )}
                </div>

                {/* Contenido del paso */}
                <div className="ml-4 flex-1 pb-6">
                  <h3
                    className={`font-semibold mb-1 ${
                      isCurrent
                        ? "text-blue-600 text-lg"
                        : isCompleted
                        ? "text-gray-900"
                        : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </h3>

                  {/* Información adicional según el paso */}
                  {isCurrent && step.key === "aceptado" && (
                    <p className="text-sm text-gray-600">
                      Tu profesional ya fue asignado y está por contactarte.
                    </p>
                  )}
                  {isCurrent && step.key === "contactado" && (
                    <p className="text-sm text-gray-600">
                      El profesional está coordinando los detalles contigo.
                    </p>
                  )}
                  {isCurrent && step.key === "en_progreso" && (
                    <div className="mt-2 space-y-2">
                      {appointmentInfo ? (
                        <p className="text-sm text-gray-600">
                          Cita programada para <strong>{appointmentInfo}</strong>.{" "}
                          Recibirás recordatorios antes del horario acordado.
                        </p>
                      ) : (
                        <p className="text-sm text-gray-600">
                          Aún no se ha definido la fecha del servicio. Puedes usar los botones de la página para confirmarla.
                        </p>
                      )}
                      {currentLead.appointment_status === "pendiente_confirmacion" && (
                        <p className="text-xs text-amber-600">
                          Falta tu confirmación para cerrar la cita.
                        </p>
                      )}
                    </div>
                  )}
                  {isCurrent && step.key === "completado" && (
                    <p className="text-sm text-green-600 font-medium">
                      ¡Servicio completado! No olvides dejar tu reseña.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Información del profesional (si está asignado) */}
      {currentStepIndex >= 2 && currentLead?.profesional_asignado && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-2">
            Profesional Asignado
          </h3>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {currentLead.profesional_asignado.full_name
                ?.charAt(0)
                .toUpperCase() || "P"}
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {currentLead.profesional_asignado.full_name || "Profesional"}
              </p>
              <p className="text-sm text-gray-600">
                {currentLead.profesional_asignado.profession ||
                  "Técnico Verificado"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
