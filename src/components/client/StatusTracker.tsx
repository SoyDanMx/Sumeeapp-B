"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Lead } from "@/types/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faClock,
  faSpinner,
  faUser,
  faMapMarkerAlt,
  faWrench,
} from "@fortawesome/free-solid-svg-icons";

interface StatusTrackerProps {
  initialLead: Lead;
  currentUserId: string | null;
}

const STATUS_STEPS = [
  { key: "nuevo", label: "Solicitud Enviada", icon: faCheckCircle },
  { key: "contactado", label: "Buscando Profesional", icon: faSpinner },
  { key: "aceptado", label: "Profesional Asignado", icon: faUser },
  { key: "en_camino", label: "Técnico en Camino", icon: faMapMarkerAlt },
  { key: "completado", label: "Trabajo Completado", icon: faWrench },
];

export default function StatusTracker({
  initialLead,
  currentUserId,
}: StatusTrackerProps) {
  const [currentLead, setCurrentLead] = useState<Lead>(initialLead);
  const [isLoading, setIsLoading] = useState(false);

  // Suscribirse a cambios en tiempo real del lead
  useEffect(() => {
    if (!initialLead?.id) return;

    let subscription: any = null;

    const subscribeToLeadUpdates = async () => {
      try {
        subscription = supabase
          .channel(`lead:${initialLead.id}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "leads",
              filter: `id=eq.${initialLead.id}`,
            },
            (payload) => {
              const updatedLead = payload.new as Lead;
              setCurrentLead(updatedLead);
              setIsLoading(false);
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
  }, [initialLead?.id]);

  // Obtener el índice del paso actual
  const getCurrentStepIndex = () => {
    const currentStatus = currentLead?.estado?.toLowerCase() || "nuevo";
    const stepIndex = STATUS_STEPS.findIndex(
      (step) => step.key === currentStatus
    );
    return stepIndex >= 0 ? stepIndex : 0;
  };

  const currentStepIndex = getCurrentStepIndex();

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
                  {isCurrent &&
                    index === 2 &&
                    currentLead?.profesional_asignado_id && (
                      <p className="text-sm text-gray-600">
                        Profesional asignado a tu solicitud
                      </p>
                    )}
                  {isCurrent && index === 3 && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">
                        El técnico está en camino a tu ubicación
                      </p>
                      {/* Placeholder para mapa */}
                      <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center border-2 border-dashed border-gray-300">
                        <div className="text-center text-gray-500">
                          <FontAwesomeIcon
                            icon={faMapMarkerAlt}
                            className="text-3xl mb-2"
                          />
                          <p className="text-sm">Mapa en tiempo real</p>
                          <p className="text-xs mt-1">
                            {/* TODO: Integrar Mapbox/Google Maps aquí */}
                            Integrar Mapa aquí
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {isCurrent && index === 4 && (
                    <p className="text-sm text-green-600 font-medium">
                      ¡Servicio completado exitosamente!
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
