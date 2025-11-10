"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import TecnicosSplitView from "@/components/tecnicos/TecnicosSplitView";

export default function TecnicosPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [clientLocation, setClientLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Obtener ubicación del cliente
  useEffect(() => {
    const fetchClientLocation = async () => {
      if (!user) {
        // Si no hay usuario, usar ubicación por defecto
        setClientLocation({ lat: 19.4326, lng: -99.1332 });
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("ubicacion_lat, ubicacion_lng")
          .eq("user_id", user.id)
          .single();

        if (error || !data?.ubicacion_lat || !data?.ubicacion_lng) {
          // Fallback a geolocalización del navegador
          if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                setClientLocation({
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                });
              },
              () => {
                // Fallback a Centro CDMX
                setClientLocation({ lat: 19.4326, lng: -99.1332 });
              }
            );
          } else {
            setClientLocation({ lat: 19.4326, lng: -99.1332 });
          }
        } else {
          setClientLocation({
            lat: data.ubicacion_lat,
            lng: data.ubicacion_lng,
          });
        }
      } catch (err) {
        console.error("Error fetching location:", err);
        setClientLocation({ lat: 19.4326, lng: -99.1332 });
      }
    };

    if (!authLoading) {
      fetchClientLocation();
    }
  }, [user, authLoading]);

  if (authLoading || !clientLocation) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando mapa interactivo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[calc(var(--header-offset,72px))]">
      <TecnicosSplitView
        initialLat={clientLocation.lat}
        initialLng={clientLocation.lng}
      />
    </div>
  );
}
