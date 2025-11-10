import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { Lead, Profesional } from "@/types/supabase";
import { matchesProfessionalProfile } from "@/lib/utils/leadMatching";
import {
  playLeadNotificationSound,
  vibrateDevice,
} from "@/lib/notifications/sound";

interface UseNewLeadsSubscriptionProps {
  isOnline: boolean;
  profesional: Profesional | null;
  profesionalLat?: number;
  profesionalLng?: number;
  onNewLead: (lead: Lead) => void;
}

/**
 * Hook para suscribirse a leads nuevos en tiempo real
 * Solo muestra alertas cuando el lead coincide con el perfil del profesional
 */
export function useNewLeadsSubscription({
  isOnline,
  profesional,
  profesionalLat,
  profesionalLng,
  onNewLead,
}: UseNewLeadsSubscriptionProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!isOnline || !profesional) {
      setIsSubscribed(false);
      return;
    }

    console.log("🔔 Suscribiéndose a leads nuevos en tiempo real...");

    let isMounted = true;
    let retryTimeout: NodeJS.Timeout | null = null;
    let channel: RealtimeChannel | null = null;

    const clearRetry = () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout);
        retryTimeout = null;
      }
    };

    const cleanupChannel = () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
      channel = null;
    };

    const subscribe = () => {
      cleanupChannel();
      channel = supabase.channel(
        `new-leads-for-professional-${profesional.user_id || "anon"}`
      );

      channel
        ?.on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "leads",
          },
          async (payload) => {
            try {
              const newLead = payload.new as Lead;
              console.log("📨 Lead nuevo recibido:", newLead);

              const matches = matchesProfessionalProfile(
                newLead,
                profesional,
                profesionalLat,
                profesionalLng
              );

              if (matches) {
                console.log(
                  "✅ Lead coincide con el perfil. Mostrando alerta..."
                );
                playLeadNotificationSound();
                vibrateDevice();
                onNewLead(newLead);
              } else {
                console.log("❌ Lead NO coincide con el perfil. Ignorando...");
              }
            } catch (error) {
              console.error("❌ Error procesando lead nuevo:", error);
            }
          }
        )
        ?.subscribe((status, err) => {
          if (!isMounted) {
            return;
          }

          switch (status) {
            case "SUBSCRIBED":
              console.log("✅ Suscrito a leads nuevos en tiempo real");
              clearRetry();
              setIsSubscribed(true);
              break;
            case "CHANNEL_ERROR":
              console.warn(
                "⚠️ No se pudo suscribir a los leads nuevos:",
                err?.message || err
              );
              setIsSubscribed(false);
              clearRetry();
              retryTimeout = setTimeout(() => {
                if (isMounted) {
                  console.log("⟳ Reintentando suscripción a leads nuevos...");
                  subscribe();
                }
              }, 5000);
              break;
            case "TIMED_OUT":
              console.warn("⚠️ La conexión en tiempo real se agotó. Reintentando…");
              setIsSubscribed(false);
              clearRetry();
              retryTimeout = setTimeout(() => {
                if (isMounted) {
                  subscribe();
                }
              }, 3000);
              break;
            default:
              break;
          }
        });
    };

    subscribe();

    return () => {
      console.log("🔕 Desuscribiéndose de leads nuevos...");
      isMounted = false;
      clearRetry();
      cleanupChannel();
      setIsSubscribed(false);
    };
  }, [
    isOnline,
    profesional,
    profesionalLat,
    profesionalLng,
    onNewLead,
  ]);

  return { isSubscribed };
}
