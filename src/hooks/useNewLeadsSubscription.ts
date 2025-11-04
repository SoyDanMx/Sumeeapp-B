import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
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
    // No suscribirse si el profesional no está online o no hay datos del profesional
    if (!isOnline || !profesional) {
      setIsSubscribed(false);
      return;
    }

    console.log("🔔 Suscribiéndose a leads nuevos en tiempo real...");

    // Crear canal de suscripción
    const channel = supabase
      .channel("new-leads-for-professional")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "leads",
          // Filtrar solo leads nuevos (se puede hacer más específico con RLS)
        },
        async (payload) => {
          try {
            const newLead = payload.new as Lead;
            console.log("📨 Lead nuevo recibido:", newLead);

            // Verificar si el lead coincide con el perfil del profesional
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

              // Reproducir sonido de notificación
              playLeadNotificationSound();

              // Vibrar dispositivo (si está disponible)
              vibrateDevice();

              // Llamar callback para mostrar el modal
              onNewLead(newLead);
            } else {
              console.log("❌ Lead NO coincide con el perfil. Ignorando...");
            }
          } catch (error) {
            console.error("❌ Error procesando lead nuevo:", error);
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Suscrito a leads nuevos en tiempo real");
          setIsSubscribed(true);
        } else if (status === "CHANNEL_ERROR") {
          console.error("❌ Error en suscripción a leads nuevos");
          setIsSubscribed(false);
        }
      });

    // Cleanup: Desuscribirse cuando el componente se desmonte o cambien las dependencias
    return () => {
      console.log("🔕 Desuscribiéndose de leads nuevos...");
      supabase.removeChannel(channel);
      setIsSubscribed(false);
    };
  }, [isOnline, profesional, profesionalLat, profesionalLng, onNewLead]);

  return { isSubscribed };
}
