"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faArrowLeft,
  faArrowRight,
  faCamera,
  faMapMarkerAlt,
  faCheck,
  faSpinner,
  faWrench,
  faLightbulb,
  faThermometerHalf,
  faKey,
  faPaintBrush,
  faBroom,
  faSeedling,
  faHammer,
  faVideo,
  faWifi,
  faBug,
  faHardHat,
  faCubes,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useMembership } from "@/context/MembershipContext";
import StripeBuyButton from "@/components/stripe/StripeBuyButton";
import Link from "next/link";

interface RequestServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadCreated?: () => void;
}

const serviceCategories = [
  {
    id: "plomeria",
    name: "Plomería",
    icon: faWrench,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    id: "electricidad",
    name: "Electricidad",
    icon: faLightbulb,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
  {
    id: "aire-acondicionado",
    name: "Aire Acondicionado",
    icon: faThermometerHalf,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
  },
  {
    id: "cerrajeria",
    name: "Cerrajería",
    icon: faKey,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
  },
  {
    id: "pintura",
    name: "Pintura",
    icon: faPaintBrush,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    id: "limpieza",
    name: "Limpieza",
    icon: faBroom,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    id: "jardineria",
    name: "Jardinería",
    icon: faSeedling,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    id: "carpinteria",
    name: "Carpintería",
    icon: faHammer,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    id: "construccion",
    name: "Construcción",
    icon: faHardHat,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  {
    id: "tablaroca",
    name: "Tablaroca",
    icon: faCubes,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    id: "cctv",
    name: "CCTV",
    icon: faVideo,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  {
    id: "wifi",
    name: "WiFi",
    icon: faWifi,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
  },
  {
    id: "fumigacion",
    name: "Fumigación",
    icon: faBug,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
];

export default function RequestServiceModal({
  isOpen,
  onClose,
  onLeadCreated,
}: RequestServiceModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    servicio: "",
    descripcion: "",
    imagen: null as File | null,
    ubicacion: "",
    urgencia: "normal",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmittingFreeRequest, setIsSubmittingFreeRequest] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user, profile, isAuthenticated, isLoading, hasActiveMembership } =
    useAuth();
  const { isFreeUser, isBasicUser, isPremiumUser, requestsRemaining } =
    useMembership();

  const totalSteps = 4;

  const handleServiceSelect = (serviceId: string) => {
    setFormData((prev) => ({ ...prev, servicio: serviceId }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, imagen: file }));
    }
  };

  const handleUseMyLocation = async () => {
    console.log("🔍 Iniciando geolocalización...");

    if (!navigator.geolocation) {
      console.error("❌ Geolocalización no disponible");
      setError("La geolocalización no está disponible en tu navegador");
      return;
    }

    setIsGettingLocation(true);
    setError(null);

    try {
      console.log("📍 Solicitando ubicación...");
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              console.log("✅ Ubicación obtenida:", pos.coords);
              resolve(pos);
            },
            (err) => {
              console.error("❌ Error de geolocalización:", err);
              reject(err);
            },
            {
              enableHighAccuracy: true,
              timeout: 20000,
              maximumAge: 300000,
            }
          );
        }
      );

      const { latitude, longitude } = position.coords;
      console.log(`📍 Coordenadas: ${latitude}, ${longitude}`);

      // Verificar si tenemos API key de Google Maps
      const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      console.log(
        "🔑 Google Maps API Key:",
        googleMapsApiKey ? "Configurada" : "No configurada"
      );

      if (!googleMapsApiKey) {
        // Fallback: usar OpenStreetMap Nominatim (gratuito)
        console.log("🗺️ Usando OpenStreetMap Nominatim...");
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=es&zoom=18`
        );

        console.log("📡 Respuesta OpenStreetMap:", response.status);
        const data = await response.json();
        console.log("📋 Datos OpenStreetMap:", data);

        if (data && data.display_name) {
          const address = data.display_name;
          console.log("✅ Dirección obtenida:", address);
          setFormData((prev) => ({ ...prev, ubicacion: address }));
        } else {
          console.error("❌ No se pudo obtener dirección de OpenStreetMap");
          setError(
            "No se pudo obtener la dirección. Por favor, ingrésala manualmente."
          );
        }
      } else {
        // Usar Google Maps Geocoding API
        console.log("🗺️ Usando Google Maps API...");
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleMapsApiKey}&language=es&region=mx`
        );

        console.log("📡 Respuesta Google Maps:", response.status);
        const data = await response.json();
        console.log("📋 Datos Google Maps:", data);

        if (data.status === "OK" && data.results && data.results.length > 0) {
          const address = data.results[0].formatted_address;
          console.log("✅ Dirección obtenida:", address);
          setFormData((prev) => ({ ...prev, ubicacion: address }));
        } else if (data.status === "ZERO_RESULTS") {
          console.error("❌ ZERO_RESULTS de Google Maps");
          setError(
            "No se encontró dirección para esta ubicación. Por favor, ingrésala manualmente."
          );
        } else if (data.status === "OVER_QUERY_LIMIT") {
          console.error("❌ OVER_QUERY_LIMIT de Google Maps");
          setError(
            "Límite de consultas excedido. Por favor, ingresa la dirección manualmente."
          );
        } else {
          console.error("❌ Error de Google Maps:", data.status);
          setError(
            "Error en el servicio de geocodificación. Por favor, ingresa la dirección manualmente."
          );
        }
      }
    } catch (err) {
      console.error("❌ Error en geolocalización:", err);
      // GeolocationPositionError no es accesible directamente en TypeScript
      // Verificamos por propiedades específicas
      if (err && typeof err === "object" && "code" in err) {
        const geoError = err as { code: number; message?: string };
        if (geoError.code === 1) {
          setError(
            "Permiso de ubicación denegado. Por favor, ingresa la dirección manualmente."
          );
        } else if (geoError.code === 2) {
          setError(
            "Ubicación no disponible. Por favor, ingresa la dirección manualmente."
          );
        } else if (geoError.code === 3) {
          setError(
            "Tiempo de espera agotado. Por favor, ingresa la dirección manualmente."
          );
        } else {
          setError(
            "Error al obtener la ubicación. Por favor, ingresa la dirección manualmente."
          );
        }
      } else if (err instanceof Error && err.name === "NetworkError") {
        setError(
          "Error de conexión. Por favor, verifica tu internet e intenta de nuevo."
        );
      } else {
        setError(
          "Error al obtener la ubicación. Por favor, ingresa la dirección manualmente."
        );
      }
    } finally {
      console.log("🏁 Finalizando geolocalización...");
      setIsGettingLocation(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setError("Debes estar logueado para solicitar un servicio");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Subir imagen si existe
      let imagenUrl = null;
      if (formData.imagen) {
        const fileExt = formData.imagen.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("lead-images")
          .upload(fileName, formData.imagen);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("lead-images").getPublicUrl(fileName);

        imagenUrl = publicUrl;
      }

      // Crear el lead
      const { data: leadData, error: leadError } = await supabase
        .from("leads")
        .insert({
          nombre_cliente: user.user_metadata?.full_name || "Cliente",
          whatsapp: user.user_metadata?.phone || null,
          descripcion_proyecto: formData.descripcion || "Sin descripción",
          ubicacion_lat: 19.4326, // CDMX por defecto - se puede mejorar con geocoding
          ubicacion_lng: -99.1332,
          estado: "nuevo", // Usar 'nuevo' según el schema
          servicio: formData.servicio, // Campo correcto según schema
          ubicacion_direccion: formData.ubicacion || null,
          cliente_id: user.id,
        })
        .select()
        .maybeSingle();

      if (leadError) {
        console.error(
          "Error creating lead:",
          JSON.stringify(leadError, null, 2)
        );

        // Traducir errores técnicos a mensajes amigables
        let errorMessage = "Error desconocido al crear la solicitud";

        if (
          leadError.message?.includes("row-level security") ||
          leadError.message?.includes("RLS") ||
          leadError.code === "42501"
        ) {
          errorMessage =
            "No tienes permisos para crear solicitudes. Por favor, verifica tu sesión o contacta a soporte.";
        } else if (
          leadError.message?.includes("violates") ||
          leadError.message?.includes("constraint")
        ) {
          errorMessage =
            "Error en los datos proporcionados. Por favor, verifica que todos los campos sean correctos.";
        } else if (
          leadError.message?.includes("network") ||
          leadError.message?.includes("fetch")
        ) {
          errorMessage =
            "Problema de conexión. Verifica tu internet e intenta de nuevo.";
        } else if (leadError.message) {
          // Usar el mensaje original si es entendible
          errorMessage = leadError.message;
        } else if (leadError.details) {
          errorMessage = leadError.details;
        }

        throw new Error(errorMessage);
      }

      if (!leadData) {
        throw new Error("No se pudo crear la solicitud. Intenta de nuevo.");
      }

      // Redirigir a WhatsApp con número de soporte
      const whatsappPhone = "525636741156"; // Número de soporte de Sumee App
      const message = encodeURIComponent(
        `Hola, necesito ayuda con el servicio de ${formData.servicio}. ` +
          `Ubicación: ${formData.ubicacion || "No especificada"}. ` +
          `Mi solicitud ID: ${leadData.id.substring(0, 8)}`
      );
      const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${message}`;
      window.open(whatsappUrl, "_blank");
      onClose();
    } catch (err) {
      console.error("Error creating lead:", err);

      // Asegurar que el error sea amigable
      let errorMessage =
        "Error al crear la solicitud. Por favor, intenta de nuevo.";

      if (err instanceof Error) {
        // Si el mensaje ya es amigable (de nuestro código), usarlo
        errorMessage = err.message;
        if (err.message.includes("row-level security")) {
          errorMessage =
            "Problema de permisos. Por favor, contacta a soporte si el problema persiste.";
        }
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Función específica para manejar la solicitud gratuita
  const handleFreeRequestSubmit = async () => {
    console.log("🔍 handleFreeRequestSubmit - Iniciando solicitud gratuita");
    console.log(
      "🔍 handleFreeRequestSubmit - user:",
      user?.id || "No hay usuario"
    );
    console.log(
      "🔍 handleFreeRequestSubmit - isAuthenticated:",
      isAuthenticated
    );
    console.log("🔍 handleFreeRequestSubmit - profile:", profile);
    console.log("🔍 handleFreeRequestSubmit - formData:", formData);

    if (!user || !isAuthenticated) {
      console.log(
        "🔍 handleFreeRequestSubmit - Error: No hay usuario autenticado"
      );
      setError(
        "Debes estar logueado para solicitar un servicio. Por favor, inicia sesión e intenta de nuevo."
      );
      return;
    }

    // Verificar que el usuario tenga un ID válido
    if (!user.id) {
      console.log("🔍 handleFreeRequestSubmit - Error: Usuario sin ID");
      setError(
        "Error de autenticación: Usuario sin ID válido. Por favor, cierra sesión y vuelve a iniciar sesión."
      );
      return;
    }

    // Verificar la sesión de Supabase antes de intentar crear el lead
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      console.log("🔍 handleFreeRequestSubmit - Sesión de Supabase:", {
        hasSession: !!session,
        userId: session?.user?.id,
        contextUserId: user.id,
        match: session?.user?.id === user.id,
        sessionError: sessionError
          ? JSON.stringify(sessionError, null, 2)
          : null,
      });

      if (sessionError || !session) {
        console.error("❌ Error al obtener sesión de Supabase:", sessionError);
        setError(
          "Error de autenticación. Por favor, cierra sesión y vuelve a iniciar sesión."
        );
        return;
      }

      if (session.user.id !== user.id) {
        console.error("❌ ID de usuario no coincide con la sesión", {
          sessionUserId: session.user.id,
          contextUserId: user.id,
        });
        setError(
          "Error de autenticación: ID de usuario no coincide. Por favor, cierra sesión y vuelve a iniciar sesión."
        );
        return;
      }

      // Usar el user.id de la sesión para asegurar consistencia
      const currentUserId = session.user.id;
      console.log("🔍 handleFreeRequestSubmit - Usando userId:", currentUserId);
    } catch (sessionCheckError) {
      console.error("❌ Error al verificar sesión:", sessionCheckError);
      setError(
        "Error al verificar tu sesión. Por favor, intenta de nuevo o contacta a soporte."
      );
      return;
    }

    // Verificar si ya usó su solicitud gratuita este mes
    // TODO: Implementar lógica de verificación de límite mensual
    // Por ahora, permitimos la solicitud
    // En el futuro: verificar last_free_request_date en el perfil

    setIsSubmittingFreeRequest(true);
    setError(null);

    try {
      // Subir imagen si existe
      let imagenUrl = null;
      if (formData.imagen) {
        const fileExt = formData.imagen.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("lead-images")
          .upload(fileName, formData.imagen);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("lead-images").getPublicUrl(fileName);

        imagenUrl = publicUrl;
      }

      // Obtener la sesión actual de Supabase para usar el user.id correcto
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!currentSession?.user?.id) {
        throw new Error("No se pudo obtener la sesión de autenticación");
      }

      const currentUserId = currentSession.user.id;

      // Verificar el token de acceso para debugging
      const accessToken = currentSession.access_token;
      console.log("🔍 handleFreeRequestSubmit - Token de acceso:", {
        hasToken: !!accessToken,
        tokenLength: accessToken?.length,
        userId: currentUserId,
        userIdString: String(currentUserId),
        tokenType: typeof currentUserId,
      });

      // INTENTAR PRIMERO: Usar función RPC si existe (bypass de RLS)
      console.log(
        "🔍 handleFreeRequestSubmit - Intentando crear lead via RPC..."
      );
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "create_lead",
        {
          nombre_cliente_in: user.user_metadata?.full_name || "Cliente",
          whatsapp_in: user.user_metadata?.phone || null,
          descripcion_proyecto_in: formData.descripcion || "Sin descripción",
          servicio_in: formData.servicio,
          ubicacion_lat_in: 19.4326,
          ubicacion_lng_in: -99.1332,
          ubicacion_direccion_in: formData.ubicacion || null,
        }
      );

      let leadData = null;
      let leadError = null;

      if (rpcError) {
        console.warn(
          "⚠️ handleFreeRequestSubmit - RPC falló, intentando INSERT directo:",
          rpcError.message
        );

        // FALLBACK: Intentar INSERT directo
        console.log(
          "🔍 handleFreeRequestSubmit - Creando lead con INSERT directo:",
          {
            nombre_cliente: user.user_metadata?.full_name || "Cliente",
            whatsapp: user.user_metadata?.phone || null,
            descripcion_proyecto: formData.descripcion,
            ubicacion_lat: 19.4326,
            ubicacion_lng: -99.1332,
            estado: "nuevo",
            servicio: formData.servicio,
            cliente_id: currentUserId,
            cliente_id_type: typeof currentUserId,
            cliente_id_string: String(currentUserId),
            auth_uid_check:
              "Usando currentSession.user.id para coincidir con auth.uid()",
          }
        );

        const insertResult = await supabase
          .from("leads")
          .insert({
            nombre_cliente: user.user_metadata?.full_name || "Cliente",
            whatsapp: user.user_metadata?.phone || null,
            descripcion_proyecto: formData.descripcion || "Sin descripción",
            ubicacion_lat: 19.4326,
            ubicacion_lng: -99.1332,
            estado: "nuevo",
            servicio: formData.servicio,
            ubicacion_direccion: formData.ubicacion || null,
            cliente_id: currentUserId,
          })
          .select()
          .maybeSingle();

        leadData = insertResult.data;
        leadError = insertResult.error;
        if (!leadError && !leadData) {
          leadError = {
            message:
              "No se pudo recuperar la solicitud creada. Intenta nuevamente.",
            code: "NO_DATA",
            details: null,
            hint: null,
            name: "PostgrestError",
          } as any;
        }
      } else {
        // RPC exitoso, obtener el lead creado
        console.log(
          "✅ handleFreeRequestSubmit - Lead creado via RPC, ID:",
          rpcData
        );
        const { data: fetchedLead, error: fetchError } = await supabase
          .from("leads")
          .select("*")
          .eq("id", rpcData)
          .maybeSingle();

        leadData = fetchedLead;
        leadError = fetchError;
        if (!leadError && !leadData) {
          leadError = {
            message:
              "No se pudo recuperar la solicitud creada. Intenta nuevamente.",
            code: "NO_DATA",
            details: null,
            hint: null,
            name: "PostgrestError",
          } as any;
        }
      }

      if (leadError) {
        console.error(
          "🔍 handleFreeRequestSubmit - Error al crear lead:",
          JSON.stringify(leadError, null, 2)
        );
        console.error("🔍 handleFreeRequestSubmit - Error details:", {
          code: leadError.code,
          message: leadError.message,
          details: leadError.details,
          hint: leadError.hint,
          errorContext: {
            userId: currentUserId,
            hasSession: !!currentSession,
            hasAccessToken: !!accessToken,
          },
        });

        // Traducir errores técnicos a mensajes amigables
        let errorMessage = "Error desconocido al crear la solicitud";

        if (
          leadError.message?.includes("row-level security") ||
          leadError.message?.includes("RLS") ||
          leadError.code === "42501"
        ) {
          errorMessage =
            "No tienes permisos para crear solicitudes. Por favor, verifica tu sesión o contacta a soporte.";
          console.error(
            "🔍 handleFreeRequestSubmit - RLS Error detected. Verificando políticas...",
            {
              policyCheck:
                "Verifica que las políticas 'authenticated_users_can_create_leads_v3' y 'anonymous_users_can_create_leads_v3' existan en Supabase.",
              currentUserId: currentUserId,
              suggestion:
                "Si el problema persiste, ejecuta el script: fix-leads-rls-simplified-v3.sql en Supabase SQL Editor.",
            }
          );
        } else if (
          leadError.message?.includes("violates") ||
          leadError.message?.includes("constraint")
        ) {
          errorMessage =
            "Error en los datos proporcionados. Por favor, verifica que todos los campos sean correctos.";
        } else if (
          leadError.message?.includes("network") ||
          leadError.message?.includes("fetch")
        ) {
          errorMessage =
            "Problema de conexión. Verifica tu internet e intenta de nuevo.";
        } else if (leadError.message) {
          errorMessage = leadError.message;
        } else if (leadError.details) {
          errorMessage = leadError.details;
        }

        throw new Error(errorMessage);
      }

      if (!leadData) {
        console.error(
          "🔍 handleFreeRequestSubmit - No se recibieron datos del lead"
        );
        throw new Error("No se pudo crear la solicitud. Intenta de nuevo.");
      }

      console.log(
        "🔍 handleFreeRequestSubmit - Lead creado exitosamente:",
        leadData
      );

      // Actualizar el contador de solicitudes usadas en el perfil
      try {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            requests_used: (profile?.requests_used || 0) + 1,
            last_free_request_date: new Date().toISOString(),
          })
          .eq("user_id", user.id);

        if (updateError) {
          console.error("Error updating requests_used:", updateError);
        } else {
          console.log(
            "🔍 handleFreeRequestSubmit - Contador de solicitudes actualizado"
          );
          // Refrescar el perfil para actualizar el contexto
          try {
            const { data: updatedProfile } = await supabase
              .from("profiles")
              .select("*")
              .eq("user_id", user.id)
              .single();

            if (updatedProfile) {
              console.log(
                "🔍 handleFreeRequestSubmit - Perfil actualizado:",
                updatedProfile
              );
              // Forzar re-render del contexto
              window.location.reload();
            }
          } catch (refreshError) {
            console.error("Error refreshing profile:", refreshError);
          }
        }
      } catch (updateError) {
        console.error("Error updating profile:", updateError);
      }

      // Refrescar los leads en el dashboard
      if (onLeadCreated) {
        console.log(
          "🔍 handleFreeRequestSubmit - Refrescando leads en dashboard..."
        );
        onLeadCreated();
      }

      // Redirigir a la página de estado del lead
      console.log(
        "🔍 handleFreeRequestSubmit - Redirigiendo a:",
        `/solicitudes/${leadData.id}`
      );
      router.push(`/solicitudes/${leadData.id}`);
      onClose();
    } catch (err) {
      console.error("Error creating free lead:", err);
      console.error(
        "Error details:",
        err instanceof Error
          ? JSON.stringify(err, Object.getOwnPropertyNames(err))
          : String(err)
      );

      // Mejorar el mensaje de error para el usuario
      let errorMessage =
        "Error al crear la solicitud. Por favor, intenta de nuevo.";

      if (err instanceof Error) {
        // Si el mensaje ya es amigable (de nuestro código anterior), usarlo
        errorMessage = err.message;
        if (err.message.includes("row-level security")) {
          errorMessage =
            "Problema de permisos. Por favor, contacta a soporte si el problema persiste.";
        }
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      setError(errorMessage);
    } finally {
      setIsSubmittingFreeRequest(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetModal = () => {
    setCurrentStep(1);
    setFormData({
      servicio: "",
      descripcion: "",
      imagen: null,
      ubicacion: "",
      urgencia: "normal",
    });
    setError(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center p-2 md:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[98vh] md:max-h-[95vh] overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-3 md:p-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
              <div className="w-7 h-7 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <FontAwesomeIcon
                  icon={faWrench}
                  className="text-base md:text-2xl"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base md:text-2xl font-bold truncate">
                  Solicitar Servicio
                </h2>
                <p className="text-blue-100 text-xs md:text-base">
                  Paso {currentStep} de {totalSteps}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white transition-colors flex-shrink-0 ml-2"
              aria-label="Cerrar"
            >
              <FontAwesomeIcon icon={faTimes} className="text-lg md:text-2xl" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-2 md:mt-4">
            <div className="w-full bg-white/20 rounded-full h-1 md:h-2">
              <div
                className="bg-white h-1 md:h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 md:p-8 flex-1 overflow-y-auto">
          {currentStep === 1 && (
            <div className="space-y-3 md:space-y-6">
              <div className="text-center">
                <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">
                  ¿Qué servicio necesitas?
                </h3>
                <p className="text-xs md:text-base text-gray-600">
                  Selecciona la categoría que mejor describa tu problema
                </p>
              </div>

              {/* Grid de servicios optimizado para móvil */}
              <div className="max-h-[55vh] md:max-h-none overflow-y-auto pr-1 md:pr-2">
                <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-1.5 md:gap-3">
                  {serviceCategories.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => handleServiceSelect(service.id)}
                      className={`p-1.5 md:p-3 rounded-md md:rounded-lg border-2 transition-all duration-200 ${
                        formData.servicio === service.id
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="text-center">
                        <div
                          className={`w-6 h-6 md:w-12 md:h-12 ${service.bgColor} rounded-full flex items-center justify-center mx-auto mb-1 md:mb-2`}
                        >
                          <FontAwesomeIcon
                            icon={service.icon}
                            className={`text-xs md:text-xl ${service.color}`}
                          />
                        </div>
                        <span className="text-[10px] md:text-sm font-medium text-gray-900 leading-tight block px-0.5">
                          {service.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Indicador visual de selección */}
              {formData.servicio && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon
                          icon={
                            serviceCategories.find(
                              (s) => s.id === formData.servicio
                            )?.icon || faCheck
                          }
                          className="text-white text-lg"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Servicio seleccionado:
                        </p>
                        <p className="text-base font-semibold text-blue-700">
                          {
                            serviceCategories.find(
                              (s) => s.id === formData.servicio
                            )?.name
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4 md:space-y-6">
              <div className="text-center">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  Describe el problema
                </h3>
                <p className="text-sm md:text-base text-gray-600">
                  Sé lo más detallado posible. ¿Puedes subir una foto o video
                  corto? ¡Ayuda mucho al técnico!
                </p>
              </div>

              <div className="space-y-3 md:space-y-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                    Descripción detallada
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        descripcion: e.target.value,
                      }))
                    }
                    className="w-full p-3 md:p-4 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={5}
                    placeholder="Describe el problema en detalle. Incluye síntomas, cuándo empezó, qué has intentado, etc."
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                    Foto o Video (Opcional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 md:p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center space-y-2 text-gray-600 hover:text-blue-600"
                    >
                      <FontAwesomeIcon
                        icon={faCamera}
                        className="text-2xl md:text-3xl"
                      />
                      <span className="text-sm md:text-base font-medium">
                        {formData.imagen
                          ? formData.imagen.name
                          : "Subir foto o video"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4 md:space-y-6">
              <div className="text-center">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  ¿Dónde es el servicio?
                </h3>
                <p className="text-sm md:text-base text-gray-600">
                  Confirma la dirección donde necesitas el servicio
                </p>
              </div>

              <div className="space-y-3 md:space-y-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <div className="flex flex-col md:flex-row gap-2">
                    <input
                      type="text"
                      value={formData.ubicacion}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          ubicacion: e.target.value,
                        }))
                      }
                      className="flex-1 p-3 md:p-4 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Calle, número, colonia, delegación"
                    />
                    <button
                      type="button"
                      onClick={handleUseMyLocation}
                      disabled={isGettingLocation}
                      className="px-3 md:px-4 py-2.5 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-sm md:text-base whitespace-nowrap"
                      title="Permite al navegador acceder a tu ubicación para llenar automáticamente la dirección"
                    >
                      {isGettingLocation ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} spin />
                          <span className="md:inline">Detectando...</span>
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faMapMarkerAlt} />
                          <span className="md:inline">Usar mi Ubicación</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Tip: Permite el acceso a tu ubicación para llenar
                    automáticamente la dirección
                  </p>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                    Urgencia
                  </label>
                  <select
                    value={formData.urgencia}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        urgencia: e.target.value,
                      }))
                    }
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="normal">Normal (1-2 días)</option>
                    <option value="urgente">Urgente (mismo día)</option>
                    <option value="emergencia">Emergencia (inmediato)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {hasActiveMembership
                    ? "Confirma y Envía"
                    : "¡Activa tu Membresía!"}
                </h3>
                <p className="text-gray-600">
                  {hasActiveMembership
                    ? "Revisa los detalles de tu solicitud"
                    : "Tu solicitud está lista. Activa tu membresía para conectar con profesionales."}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <FontAwesomeIcon icon={faWrench} className="text-blue-600" />
                  <span>
                    <strong>Servicio:</strong>{" "}
                    {
                      serviceCategories.find((s) => s.id === formData.servicio)
                        ?.name
                    }
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <FontAwesomeIcon
                    icon={faCheck}
                    className="text-green-600 mt-1"
                  />
                  <span>
                    <strong>Descripción:</strong> {formData.descripcion}
                  </span>
                </div>
                {formData.imagen && (
                  <div className="flex items-center space-x-3">
                    <FontAwesomeIcon
                      icon={faCamera}
                      className="text-purple-600"
                    />
                    <span>
                      <strong>Imagen:</strong> {formData.imagen.name}
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    className="text-red-600"
                  />
                  <span>
                    <strong>Ubicación:</strong> {formData.ubicacion || "CDMX"}
                  </span>
                </div>
              </div>

              {/* Lógica de Membresía */}
              {!hasActiveMembership && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-blue-900 mb-3">
                    ¡Estás a un paso de conectar con profesionales!
                  </h4>
                  <p className="text-blue-800 mb-4">
                    Tu solicitud ha sido preparada. Para que los profesionales
                    puedan verla y contactarte, necesitas una membresía activa.
                  </p>

                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Plan Gratuito */}
                    <div className="bg-white border border-green-200 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-900 mb-2">
                        Plan Gratuito
                      </h5>
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        $0 MXN
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Siempre gratis
                      </p>
                      <ul className="text-sm text-gray-700 space-y-1 mb-4">
                        <li>• 1 solicitud por mes</li>
                        <li>• Acceso básico a técnicos</li>
                        <li>• Seguimiento básico en la app</li>
                        <li>• Soporte por chat</li>
                      </ul>

                      {/* LÓGICA CONDICIONAL INTELIGENTE CON AUTHCONTEXT */}
                      {/* DEBUG: Mostrar información del usuario */}
                      {process.env.NODE_ENV === "development" && (
                        <div className="text-xs text-gray-500 mb-2 p-2 bg-gray-100 rounded">
                          DEBUG: isAuthenticated=
                          {isAuthenticated ? "YES" : "NO"}, user=
                          {user ? "YES" : "NO"}, profile=
                          {profile ? "YES" : "NO"}, membership=
                          {profile?.membership_status || "none"},
                          requestsRemaining={requestsRemaining || 1}
                        </div>
                      )}
                      {isLoading ? (
                        // Estado de carga
                        <div className="space-y-2">
                          <button
                            disabled
                            className="w-full bg-gray-400 text-white font-bold py-3 px-4 rounded-lg cursor-not-allowed flex items-center justify-center space-x-2"
                          >
                            <FontAwesomeIcon
                              icon={faSpinner}
                              className="animate-spin"
                            />
                            <span>Cargando...</span>
                          </button>
                        </div>
                      ) : isAuthenticated && user ? (
                        // Usuario logueado - mostrar botón de acción
                        <div className="space-y-2">
                          <button
                            onClick={handleFreeRequestSubmit}
                            disabled={
                              isSubmittingFreeRequest || requestsRemaining <= 0
                            }
                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                          >
                            {isSubmittingFreeRequest ? (
                              <>
                                <FontAwesomeIcon
                                  icon={faSpinner}
                                  className="animate-spin"
                                />
                                <span>Publicando...</span>
                              </>
                            ) : requestsRemaining <= 0 ? (
                              <>
                                <FontAwesomeIcon icon={faExclamationTriangle} />
                                <span>Solicitud Usada</span>
                              </>
                            ) : (
                              <>
                                <FontAwesomeIcon icon={faCheck} />
                                <span>Publicar mi Solicitud Gratis</span>
                              </>
                            )}
                          </button>
                          <p className="text-xs text-green-600 text-center">
                            {requestsRemaining <= 0
                              ? "Ya usaste tu solicitud gratuita de este mes"
                              : "Tienes 1 solicitud gratuita disponible este mes"}
                          </p>
                        </div>
                      ) : (
                        // Usuario no logueado - mostrar registro
                        <Link
                          href="/registro-cliente"
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-center block"
                        >
                          Regístrate Gratis
                        </Link>
                      )}
                    </div>

                    {/* Plan Básico */}
                    <div className="bg-white border border-blue-200 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-900 mb-2">
                        Plan Básico
                      </h5>
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        $299 MXN
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Suscripción anual
                      </p>
                      <ul className="text-sm text-gray-700 space-y-1 mb-4">
                        <li>• Hasta 5 solicitudes por mes</li>
                        <li>• Acceso a técnicos verificados</li>
                        <li>• Diagnóstico por foto/video</li>
                        <li>• Seguimiento completo en la app</li>
                      </ul>
                      <StripeBuyButton
                        buyButtonId="buy_btn_1SLx83E2shKTNR9MwlSZog2K"
                        publishableKey="pk_live_51P8c4AE2shKTNR9MVARQB4La2uYMMc2shlTCcpcg8EI6MqqPV1uN5uj6UbB5mpfReRKd4HL2OP1LoF17WXcYYeB000Ot1l847E"
                      />
                    </div>

                    {/* Plan Premium */}
                    <div className="bg-white border-2 border-purple-300 rounded-lg p-4 relative">
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <span className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full">
                          Más Popular
                        </span>
                      </div>
                      <h5 className="font-semibold text-gray-900 mb-2">
                        Plan Premium
                      </h5>
                      <div className="text-2xl font-bold text-purple-600 mb-2">
                        $499 MXN
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Suscripción anual
                      </p>
                      <ul className="text-sm text-gray-700 space-y-1 mb-4">
                        <li>• Solicitudes ilimitadas</li>
                        <li>• Prioridad en asignación</li>
                        <li>• Diagnóstico por foto/video</li>
                        <li>• Servicio de conserjería</li>
                        <li>• Historial de mantenimiento</li>
                      </ul>
                      <StripeBuyButton
                        buyButtonId="buy_btn_1SLwlqE2shKTNR9MmwebXHlB"
                        publishableKey="pk_live_51P8c4AE2shKTNR9MVARQB4La2uYMMc2shlTCcpcg8EI6MqqPV1uN5uj6UbB5mpfReRKd4HL2OP1LoF17WXcYYeB000Ot1l847E"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex flex-col-reverse md:flex-row justify-between gap-3 md:gap-0 mt-6 md:mt-8 pt-4 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>Anterior</span>
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                disabled={
                  !formData.servicio ||
                  (currentStep === 2 && !formData.descripcion)
                }
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg text-sm md:text-base"
              >
                <span>Siguiente</span>
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            ) : hasActiveMembership ? (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center space-x-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCheck} />
                    <span>Enviar Solicitud</span>
                  </>
                )}
              </button>
            ) : (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Selecciona un plan arriba para continuar
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
