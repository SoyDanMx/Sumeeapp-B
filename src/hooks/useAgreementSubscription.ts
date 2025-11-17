"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Lead } from "@/types/supabase";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface UseAgreementSubscriptionProps {
  clientId: string;
  onAgreementConfirmed: (lead: Lead) => void;
  enabled?: boolean;
}

/**
 * Hook para suscribirse a cambios en negotiation_status de leads del cliente
 * Notifica cuando un profesional confirma un acuerdo (negotiation_status = 'acuerdo_confirmado')
 */
export function useAgreementSubscription({
  clientId,
  onAgreementConfirmed,
  enabled = true,
}: UseAgreementSubscriptionProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!enabled || !clientId) {
      setIsSubscribed(false);
      return;
    }

    console.log("🔔 useAgreementSubscription: Suscribiéndose a cambios de acuerdo...");

    const channel = supabase
      .channel(`agreement-subscription-${clientId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "leads",
          filter: `cliente_id=eq.${clientId}`,
        },
        async (payload: RealtimePostgresChangesPayload<Lead>) => {
          try {
            const updatedLead = payload.new as Lead;
            const oldLead = payload.old as Lead;

            console.log("📨 useAgreementSubscription: Lead actualizado:", {
              id: updatedLead.id,
              old_status: oldLead?.negotiation_status,
              new_status: updatedLead.negotiation_status,
            });

            // Solo notificar si negotiation_status cambió a 'acuerdo_confirmado'
            if (
              updatedLead.negotiation_status === "acuerdo_confirmado" &&
              oldLead?.negotiation_status !== "acuerdo_confirmado"
            ) {
              console.log("✅ useAgreementSubscription: Acuerdo confirmado! Notificando...");
              
              // Reproducir sonido de notificación (opcional)
              if (typeof window !== "undefined" && "Audio" in window) {
                try {
                  const audio = new Audio("/sounds/notification.mp3");
                  audio.volume = 0.5;
                  audio.play().catch(() => {
                    // Ignorar errores de reproducción
                  });
                } catch (e) {
                  // Ignorar errores
                }
              }

              // Vibrar dispositivo (si está disponible)
              if (typeof window !== "undefined" && "vibrate" in navigator) {
                try {
                  navigator.vibrate([200, 100, 200]);
                } catch (e) {
                  // Ignorar errores
                }
              }

              // Notificar al componente padre
              onAgreementConfirmed(updatedLead);
            }
          } catch (error) {
            console.error("❌ useAgreementSubscription: Error procesando actualización:", error);
          }
        }
      )
      .subscribe((status: string) => {
        console.log("🔔 useAgreementSubscription: Estado de suscripción:", status);
        setIsSubscribed(status === "SUBSCRIBED");
      });

    return () => {
      console.log("🔕 useAgreementSubscription: Desuscribiéndose...");
      supabase.removeChannel(channel);
      setIsSubscribed(false);
    };
  }, [clientId, enabled, onAgreementConfirmed]);

  return { isSubscribed };
}

