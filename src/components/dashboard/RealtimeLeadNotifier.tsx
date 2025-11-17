"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Lead, Profesional } from "@/types/supabase";
import { playLeadNotificationSound, vibrateDevice } from "@/lib/notifications/sound";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface RealtimeLeadNotifierProps {
  profesional: Profesional | null;
  onNewLead: (lead: Lead) => void;
  isOnline?: boolean;
}

/**
 * Componente que muestra un badge de notificación cuando hay leads nuevos
 * y reproduce sonido/vibración para alertar al profesional
 */
export default function RealtimeLeadNotifier({
  profesional,
  onNewLead,
  isOnline = true,
}: RealtimeLeadNotifierProps) {
  const [notificationCount, setNotificationCount] = useState(0);
  const [lastLead, setLastLead] = useState<Lead | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isOnline || !profesional) {
      setIsVisible(false);
      setNotificationCount(0);
      return;
    }

    // Importar dinámicamente para evitar problemas de SSR
    const { supabase } = require("@/lib/supabase/client");
    const { matchesProfessionalProfile } = require("@/lib/utils/leadMatching");

    console.log("🔔 RealtimeLeadNotifier: Suscribiéndose a leads nuevos...");

    const channel = supabase
      .channel(`realtime-lead-notifier-${profesional.user_id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "leads",
        },
        async (payload: RealtimePostgresChangesPayload<Lead>) => {
          try {
            const newLead = payload.new as Lead;
            console.log("📨 RealtimeLeadNotifier: Lead nuevo recibido:", newLead);

            // Verificar si el lead coincide con el perfil del profesional
            const matches = matchesProfessionalProfile(
              newLead,
              profesional,
              profesional.ubicacion_lat,
              profesional.ubicacion_lng
            );

            if (matches) {
              console.log("✅ RealtimeLeadNotifier: Lead coincide. Mostrando notificación...");
              
              // Reproducir sonido y vibrar
              playLeadNotificationSound();
              vibrateDevice();

              // Actualizar estado
              setLastLead(newLead);
              setNotificationCount((prev) => prev + 1);
              setIsVisible(true);

              // Notificar al componente padre
              onNewLead(newLead);

              // Auto-ocultar después de 10 segundos si no se interactúa
              setTimeout(() => {
                setIsVisible(false);
              }, 10000);
            } else {
              console.log("❌ RealtimeLeadNotifier: Lead NO coincide. Ignorando...");
            }
          } catch (error) {
            console.error("❌ RealtimeLeadNotifier: Error procesando lead:", error);
          }
        }
      )
      .subscribe((status: string) => {
        console.log("🔔 RealtimeLeadNotifier: Estado de suscripción:", status);
      });

    return () => {
      console.log("🔕 RealtimeLeadNotifier: Desuscribiéndose...");
      supabase.removeChannel(channel);
      setIsVisible(false);
      setNotificationCount(0);
    };
  }, [isOnline, profesional, onNewLead]);

  const handleDismiss = () => {
    setIsVisible(false);
    setNotificationCount(0);
  };

  const handleClick = () => {
    if (lastLead) {
      onNewLead(lastLead);
      setIsVisible(false);
      setNotificationCount(0);
    }
  };

  if (!isVisible || !lastLead) {
    return null;
  }

  return (
    <>
      {/* Badge flotante de notificación */}
      <div
        className="fixed top-20 right-4 z-[9999] animate-in slide-in-from-right duration-300"
        onClick={handleClick}
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-2xl p-4 max-w-sm cursor-pointer hover:scale-105 transition-transform">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <FontAwesomeIcon icon={faBell} className="text-2xl animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg">¡Nuevo Lead Disponible!</h3>
                  {notificationCount > 1 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {notificationCount}
                    </span>
                  )}
                </div>
                <p className="text-sm text-white/90 truncate">
                  {lastLead.servicio_solicitado || lastLead.servicio || "Servicio General"}
                </p>
                {lastLead.ubicacion_direccion && (
                  <p className="text-xs text-white/70 mt-1 truncate">
                    📍 {lastLead.ubicacion_direccion}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss();
              }}
              className="text-white/80 hover:text-white transition-colors flex-shrink-0"
              aria-label="Cerrar notificación"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>
      </div>

      {/* Indicador de notificación en el header (opcional) */}
      {notificationCount > 0 && (
        <div className="fixed top-4 right-4 z-[9998]">
          <div className="relative">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
            <div className="absolute inset-0 w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          </div>
        </div>
      )}
    </>
  );
}

