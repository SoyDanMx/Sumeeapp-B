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

  // Obtener ubicación del cliente con TIMEOUT
  useEffect(() => {
    const fetchClientLocation = async () => {
      // OPTIMIZACIÓN 1: Usar ubicación por defecto INMEDIATAMENTE
      const defaultLocation = { lat: 19.4326, lng: -99.1332 };
      setClientLocation(defaultLocation);

      if (!user) {
        return;
      }

      try {
        // OPTIMIZACIÓN 2: Race entre DB y geolocalización (el que llegue primero)
        const locationPromises: Promise<{ lat: number; lng: number } | null>[] = [];

        // Promise 1: Obtener de DB (con timeout de 2s)
        const dbPromise = Promise.race([
          supabase
            .from("profiles")
            .select("ubicacion_lat, ubicacion_lng")
            .eq("user_id", user.id)
            .single()
            .then(({ data, error }) => {
              if (error || !data?.ubicacion_lat || !data?.ubicacion_lng) {
                return null;
              }
              return { lat: data.ubicacion_lat, lng: data.ubicacion_lng };
            }),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)), // Timeout 2s
        ]);

        locationPromises.push(dbPromise);

        // Promise 2: Geolocalización (con timeout de 3s)
        if ("geolocation" in navigator) {
          const geoPromise = new Promise<{ lat: number; lng: number } | null>(
            (resolve) => {
              const timeoutId = setTimeout(() => resolve(null), 3000); // Timeout 3s
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  clearTimeout(timeoutId);
                  resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                  });
                },
                () => {
                  clearTimeout(timeoutId);
                  resolve(null);
                },
                { timeout: 3000, maximumAge: 60000 } // Cache por 1 min
              );
            }
          );
          locationPromises.push(geoPromise);
        }

        // OPTIMIZACIÓN 3: Usar la primera ubicación que llegue
        const location = await Promise.race(locationPromises);
        
        if (location) {
          console.log("📍 Ubicación obtenida:", location);
          setClientLocation(location);
        }
      } catch (err) {
        console.error("Error fetching location:", err);
        // Ya tenemos defaultLocation seteado
      }
    };

    if (!authLoading) {
      fetchClientLocation();
    }
  }, [user, authLoading]);

  // OPTIMIZACIÓN: No bloquear, mostrar split view de inmediato
  return (
    <div className="pt-[calc(var(--header-offset,72px))]">
      {clientLocation ? (
        <TecnicosSplitView
          initialLat={clientLocation.lat}
          initialLng={clientLocation.lng}
        />
      ) : (
        <div className="flex items-center justify-center h-screen bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Obteniendo tu ubicación...</p>
          </div>
        </div>
      )}
    </div>
  );
}
