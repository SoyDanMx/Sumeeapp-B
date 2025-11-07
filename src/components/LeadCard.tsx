"use client";

import { Lead } from "@/types/supabase";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faSpinner,
  faUser,
  faQuestion,
  faRoute,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp as faWhatsappBrand } from "@fortawesome/free-brands-svg-icons";
import { acceptLead } from "@/lib/supabase/data";
import { supabase } from "@/lib/supabase/client";
import { calculateDistance } from "@/lib/calculateDistance";
import {
  sendCredentialToClient,
  openWhatsAppLink,
} from "@/lib/supabase/credential-sender";

interface LeadCardProps {
  lead: Lead;
  profesionalLat: number;
  profesionalLng: number;
  isSelected: boolean;
  onSelect: () => void;
  onLeadAccepted?: () => void; // Callback para refrescar datos cuando se acepta un lead
}

export default function LeadCard({
  lead,
  profesionalLat,
  profesionalLng,
  isSelected,
  onSelect,
  onLeadAccepted,
}: LeadCardProps) {
  const [isAccepting, setIsAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const normalizedClientWhatsapp = React.useMemo(() => {
    if (!lead.whatsapp) return null;
    const cleanPhone = lead.whatsapp.replace(/\D/g, "");
    if (!cleanPhone) return null;
    return cleanPhone.startsWith("52") ? cleanPhone : `52${cleanPhone}`;
  }, [lead.whatsapp]);

  const whatsappIntroMessage = React.useMemo(() => {
    const clientName = lead.nombre_cliente?.trim() || "hola";
    return encodeURIComponent(
      `Hola ${clientName}, soy un profesional verificado de Sumee. Vi tu solicitud sobre "${
        lead.descripcion_proyecto || "tu proyecto"
      }" y me gustaría coordinar los detalles contigo. ¿Te parece si conversamos?`
    );
  }, [lead.nombre_cliente, lead.descripcion_proyecto]);

  const contactClientWhatsappLink = normalizedClientWhatsapp
    ? `https://wa.me/${normalizedClientWhatsapp}?text=${whatsappIntroMessage}`
    : null;

  // Calcular distancia real usando la función de calculateDistance
  const hasLeadLocation =
    lead.ubicacion_lat !== null &&
    lead.ubicacion_lat !== undefined &&
    lead.ubicacion_lng !== null &&
    lead.ubicacion_lng !== undefined;

  const distanciaKm = hasLeadLocation
    ? calculateDistance(
        profesionalLat,
        profesionalLng,
        lead.ubicacion_lat,
        lead.ubicacion_lng
      ).toFixed(1)
    : "0.0";

  const handleAcceptLead = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se ejecute onSelect
    setIsAccepting(true);

    try {
      // Obtener el ID del usuario actual
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      // Aceptar el lead
      const result = await acceptLead(lead.id, user.id);

      if (result.success) {
        setAccepted(true);

        // Enviar credencial automáticamente al cliente
        try {
          const credentialResult = await sendCredentialToClient(
            lead.id,
            user.id
          );
          if (credentialResult.success && credentialResult.whatsappLink) {
            // Abrir WhatsApp con el mensaje pre-cargado
            openWhatsAppLink(credentialResult.whatsappLink);
          } else {
            console.warn(
              "⚠️ No se pudo enviar la credencial:",
              credentialResult.error
            );
            // No bloqueamos el flujo si falla el envío de la credencial
          }
        } catch (credentialError) {
          console.error(
            "Error al enviar credencial (no crítico):",
            credentialError
          );
          // No bloqueamos el flujo si falla el envío de la credencial
        }

        // Llamar callback para refrescar datos
        if (onLeadAccepted) {
          onLeadAccepted();
        }
      }
    } catch (error) {
      console.error("Error al aceptar el lead:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al aceptar el proyecto. Por favor, inténtalo de nuevo.";
      alert(errorMessage);
    } finally {
      setIsAccepting(false);
    }
  };

  const getStatusBadge = () => {
    switch (lead.estado?.toLowerCase()) {
      case "nuevo":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
            Nuevo
          </span>
        );
      case "contactado":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            Contactado
          </span>
        );
      case "en_progreso":
        return (
          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
            En Progreso
          </span>
        );
      case "completado":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            Completado
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
            {lead.estado || "Nuevo"}
          </span>
        );
    }
  };

  return (
    <div
      className={`p-3 md:p-4 border rounded-lg transition-all duration-200 touch-manipulation ${
        isSelected
          ? "bg-indigo-100 border-indigo-500 shadow-md"
          : "bg-white hover:border-gray-400 active:scale-[0.98]"
      }`}
    >
      <div onClick={onSelect} className="cursor-pointer">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="font-bold text-gray-800 flex items-center text-base md:text-lg flex-1 min-w-0">
            <FontAwesomeIcon
              icon={faUser}
              className="mr-2 text-gray-500 flex-shrink-0"
            />
            <span className="truncate">
              {lead.nombre_cliente || "Cliente Anónimo"}
            </span>
          </h3>
          <div className="flex-shrink-0">{getStatusBadge()}</div>
        </div>

        <p className="text-sm md:text-base text-gray-600 line-clamp-2 mb-2">
          {lead.descripcion_proyecto}
        </p>

        <div className="text-xs text-gray-500">
          {distanciaKm > "0.0"
            ? `Aprox. a ${distanciaKm} km de tu ubicación`
            : "Ubicación no especificada por el cliente"}
        </div>

        <div className="text-xs text-gray-400 mt-1">
          {new Date(lead.fecha_creacion).toLocaleDateString("es-MX", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>

      {/* Botones de Acción - Solo si está en estado 'buscando' o 'nuevo' */}
      {(lead.estado?.toLowerCase() === "buscando" ||
        lead.estado?.toLowerCase() === "nuevo") &&
        !accepted && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={handleAcceptLead}
                disabled={isAccepting}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 md:py-2 px-4 rounded-lg text-base md:text-sm font-semibold md:font-medium transition-colors flex items-center justify-center space-x-2 touch-manipulation active:scale-95"
              >
                {isAccepting ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    <span>Aceptando...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCheck} />
                    <span>Aceptar Trabajo</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-3 gap-2 md:gap-2">
                {hasLeadLocation && (
                  <a
                    href={`https://www.google.com/maps/dir/${profesionalLat},${profesionalLng}/${lead.ubicacion_lat},${lead.ubicacion_lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-3 md:py-2 px-2 md:px-3 rounded-lg text-sm md:text-xs font-semibold md:font-medium transition-colors flex items-center justify-center space-x-1 touch-manipulation active:scale-95"
                  >
                    <FontAwesomeIcon icon={faRoute} className="text-sm" />
                    <span className="hidden sm:inline">Ruta</span>
                    <span className="sm:hidden">🗺️</span>
                  </a>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!contactClientWhatsappLink) {
                      alert(
                        "El cliente no compartió un número de WhatsApp. Puedes intentar llamarlo desde la sección de detalles."
                      );
                      return;
                    }
                    openWhatsAppLink(contactClientWhatsappLink);
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white py-3 md:py-2 px-2 md:px-3 rounded-lg text-sm md:text-xs font-semibold md:font-medium transition-colors flex items-center justify-center space-x-1 touch-manipulation active:scale-95"
                >
                  <FontAwesomeIcon icon={faWhatsappBrand} className="text-sm" />
                  <span className="hidden sm:inline">WhatsApp cliente</span>
                  <span className="sm:hidden">💬</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    alert(
                      "Para llamadas directas, usa el botón de WhatsApp o revisa el detalle del lead en tu panel."
                    );
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white py-3 md:py-2 px-2 md:px-3 rounded-lg text-sm md:text-xs font-semibold md:font-medium transition-colors flex items-center justify-center space-x-1 touch-manipulation active:scale-95"
                >
                  <FontAwesomeIcon icon={faQuestion} className="text-sm" />
                  <span className="hidden sm:inline">Notas</span>
                  <span className="sm:hidden">ℹ️</span>
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Estado de aceptado */}
      {accepted && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-2 text-green-600 text-sm font-medium">
            <FontAwesomeIcon icon={faCheck} />
            <span>¡Proyecto Aceptado!</span>
          </div>
        </div>
      )}
    </div>
  );
}
