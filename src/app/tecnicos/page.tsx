"use client";

import { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import TecnicosSplitView from "@/components/tecnicos/TecnicosSplitView";
import LoginPromptModal from "@/components/auth/LoginPromptModal";

function TecnicosPageContent() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showLoginModal, setShowLoginModal] = useState(false);
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
              const locationData = data as any;
              if (error || !locationData?.ubicacion_lat || !locationData?.ubicacion_lng) {
                return null;
              }
              return { lat: locationData.ubicacion_lat, lng: locationData.ubicacion_lng };
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

  // Verificar autenticación cuando termine de cargar
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        // Mostrar modal de login en lugar de redirigir inmediatamente
        setShowLoginModal(true);
      }
    }
  }, [user, authLoading]);

  // Si no está autenticado, mostrar modal de login
  if (!authLoading && !user) {
    return (
      <>
        <LoginPromptModal
          isOpen={showLoginModal}
          onClose={() => {
            setShowLoginModal(false);
            // Redirigir a la página anterior o a inicio
            const referer = searchParams.get("from") || "/";
            router.push(referer);
          }}
          redirectTo="/tecnicos"
          title="Acceso al Directorio de Profesionales"
          message="Para acceder al directorio completo de técnicos verificados y contactarlos directamente, necesitas iniciar sesión o crear una cuenta gratuita."
        />
        {/* Mostrar contenido con overlay mientras se muestra el modal */}
        <div className="pt-[calc(var(--header-offset,72px))] opacity-30 pointer-events-none">
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
      </>
    );
  }

  // Si está autenticado, mostrar contenido normal
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

export default function TecnicosPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      }
    >
      <TecnicosPageContent />
    </Suspense>
  );
}
