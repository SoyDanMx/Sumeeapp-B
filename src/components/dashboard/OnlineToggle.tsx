"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPowerOff, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "@/lib/supabase/client";
import { updateUserProfileRPC } from "@/lib/supabase/actions-alternative-rpc";

interface OnlineToggleProps {
  initialStatus?: boolean;
  onStatusChange?: (isOnline: boolean) => void;
  onLocationUpdate?: (lat: number, lng: number) => void;
}

export default function OnlineToggle({
  initialStatus = false,
  onStatusChange,
  onLocationUpdate,
}: OnlineToggleProps) {
  const [isOnline, setIsOnline] = useState(initialStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [locationPermission, setLocationPermission] = useState<
    "granted" | "denied" | "prompt" | null
  >(null);
  const [isManualChange, setIsManualChange] = useState(false);

  // Sincronizar el estado interno con initialStatus cuando cambie
  // PERO solo si NO es un cambio manual (para evitar revertir mientras se actualiza)
  useEffect(() => {
    // Si no estamos actualizando y no fue un cambio manual reciente, sincronizar
    if (!isUpdating && !isManualChange) {
      setIsOnline(initialStatus);
    }
  }, [initialStatus, isUpdating, isManualChange]);

  useEffect(() => {
    // Verificar permisos de geolocalización
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        setLocationPermission(result.state);
        result.onchange = () => {
          setLocationPermission(result.state);
        };
      });
    }
  }, []);

  const handleToggle = async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    setIsManualChange(true); // Marcar que es un cambio manual
    const newStatus = !isOnline;

    // Actualizar el estado visual inmediatamente para mejor UX
    setIsOnline(newStatus);
    onStatusChange?.(newStatus);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      if (newStatus) {
        // Activar modo Online: obtener ubicación y actualizar perfil
        if (!navigator.geolocation) {
          alert("Tu navegador no soporta geolocalización");
          // Revertir el estado si falla
          setIsOnline(false);
          onStatusChange?.(false);
          setIsUpdating(false);
          return;
        }

        // Solicitar permiso de geolocalización
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0,
            });
          }
        );

        const { latitude, longitude } = position.coords;

        // Actualizar ubicación en el perfil
        // Usar RPC para actualizar ubicación (más robusto)
        console.log("🔄 Actualizando perfil a ONLINE con ubicación...");
        const updatedProfile = await updateUserProfileRPC(user.id, {
          ubicacion_lat: latitude,
          ubicacion_lng: longitude,
          disponibilidad: "disponible",
        });

        console.log("✅ Perfil actualizado a ONLINE:", updatedProfile);

        // Llamar callback de actualización de ubicación
        onLocationUpdate?.(latitude, longitude);

        // IMPORTANTE: Llamar onStatusChange para refrescar el estado del padre
        onStatusChange?.(true);
      } else {
        // Desactivar modo Online: actualizar disponibilidad
        console.log("🔄 Actualizando perfil a OFFLINE...");
        const updatedProfile = await updateUserProfileRPC(user.id, {
          disponibilidad: "no_disponible",
        });

        console.log("✅ Perfil actualizado a OFFLINE:", updatedProfile);

        // IMPORTANTE: Llamar onStatusChange para refrescar el estado del padre
        onStatusChange?.(false);
      }

      // Si llegamos aquí, todo fue exitoso
      console.log("✅ Estado de disponibilidad actualizado exitosamente");

      // IMPORTANTE: No revertir isManualChange inmediatamente
      // Permitir que el padre refresque los datos primero
      // El useEffect se encargará de sincronizar cuando initialStatus cambie
      
      // Dar tiempo suficiente para que el padre refresque los datos
      setTimeout(() => {
        setIsManualChange(false);
        console.log("🔄 Permitir sincronización de estado después de actualización");
      }, 2000); // Aumentado a 2 segundos para dar más tiempo
    } catch (error: any) {
      console.error("❌ Error al cambiar estado:", error);

      // Revertir el estado si hay un error (volver al estado anterior)
      const previousStatus = !newStatus;
      setIsOnline(previousStatus);
      onStatusChange?.(previousStatus);
      setIsManualChange(false); // Permitir sincronización de nuevo

      let errorMessage = "Error al cambiar tu estado. Inténtalo de nuevo.";

      if (error.code === 1 || error.code === "PERMISSION_DENIED") {
        errorMessage =
          "Permiso de geolocalización denegado. Activa la ubicación en la configuración de tu navegador.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3 md:space-y-4">
      <button
        onClick={handleToggle}
        disabled={isUpdating}
        className={`relative w-40 h-20 md:w-32 md:h-16 rounded-full transition-all duration-300 shadow-xl transform ${
          isOnline
            ? "bg-green-500 hover:bg-green-600 active:scale-95"
            : "bg-gray-400 hover:bg-gray-500 active:scale-95"
        } ${
          isUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        } touch-manipulation`}
        aria-label={
          isOnline ? "Desactivar disponibilidad" : "Activar disponibilidad"
        }
      >
        <div
          className={`absolute top-1 left-1 w-[72px] h-[72px] md:w-14 md:h-14 bg-white rounded-full shadow-lg transform transition-transform duration-300 flex items-center justify-center ${
            isOnline ? "translate-x-[84px] md:translate-x-16" : "translate-x-0"
          }`}
        >
          {isUpdating ? (
            <FontAwesomeIcon icon={faSpinner} spin className="text-gray-600" />
          ) : (
            <FontAwesomeIcon
              icon={faPowerOff}
              className={`${isOnline ? "text-green-500" : "text-gray-400"}`}
            />
          )}
        </div>
      </button>
      <div className="text-center">
        <p
          className={`text-base md:text-sm font-bold md:font-semibold ${
            isOnline ? "text-green-600" : "text-gray-500"
          }`}
        >
          {isOnline ? "ONLINE" : "OFFLINE"}
        </p>
        <p className="text-sm md:text-xs text-gray-500 mt-1 px-2">
          {isOnline ? "Recibiendo leads cercanos" : "No recibirás nuevos leads"}
        </p>
        {locationPermission === "denied" && isOnline && (
          <p className="text-xs text-red-500 mt-1 px-2">
            ⚠️ Permiso de ubicación denegado
          </p>
        )}
      </div>
    </div>
  );
}
