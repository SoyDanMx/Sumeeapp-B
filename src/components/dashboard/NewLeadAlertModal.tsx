"use client";

import React, { useState, useEffect } from "react";
import { Lead } from "@/types/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faCheck,
  faMapMarkerAlt,
  faBriefcase,
  faUser,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { acceptLead } from "@/lib/supabase/data";
import { supabase } from "@/lib/supabase/client";
import { getLeadDistanceText } from "@/lib/utils/leadMatching";
import {
  sendCredentialToClient,
  openWhatsAppLink,
} from "@/lib/supabase/credential-sender";

interface NewLeadAlertModalProps {
  lead: Lead;
  profesionalLat?: number;
  profesionalLng?: number;
  isOpen: boolean;
  onAccept: (leadId: string) => Promise<void>;
  onReject: () => void;
  onClose: () => void;
}

const COUNTDOWN_SECONDS = 30;

export default function NewLeadAlertModal({
  lead,
  profesionalLat,
  profesionalLng,
  isOpen,
  onAccept,
  onReject,
  onClose,
}: NewLeadAlertModalProps) {
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Contador regresivo
  useEffect(() => {
    if (!isOpen) {
      setCountdown(COUNTDOWN_SECONDS);
      return;
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Si llega a 0, rechazar automáticamente
          clearInterval(interval);
          // Usar onReject directamente en lugar de handleReject para evitar dependencia circular
          onReject();
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onReject, onClose]);

  const handleAccept = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Obtener el ID del usuario actual
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      // Aceptar el lead
      await acceptLead(lead.id, user.id);

      // Enviar credencial automáticamente al cliente
      try {
        const credentialResult = await sendCredentialToClient(lead.id, user.id);
        if (credentialResult.success && credentialResult.whatsappLink) {
          // Abrir WhatsApp con el mensaje pre-cargado
          openWhatsAppLink(credentialResult.whatsappLink);
          console.log("✅ Credencial enviada automáticamente al cliente");
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

      // Llamar callback
      await onAccept(lead.id);
      onClose();
    } catch (error: any) {
      console.error("Error al aceptar el lead:", error);
      setError("Error al aceptar el proyecto. Por favor, inténtalo de nuevo.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = () => {
    if (isProcessing) return;
    onReject();
    onClose();
  };

  if (!isOpen) return null;

  const distanciaText = getLeadDistanceText(
    lead,
    profesionalLat,
    profesionalLng
  );

  // Determinar el color del contador según el tiempo restante
  const getCountdownColor = () => {
    if (countdown > 15) return "text-green-600";
    if (countdown > 5) return "text-yellow-600";
    return "text-red-600 animate-pulse";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
        {/* Header con contador */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FontAwesomeIcon
                icon={faExclamationCircle}
                className="text-yellow-300"
              />
              ¡Nuevo Lead Disponible!
            </h2>
            <button
              onClick={handleReject}
              disabled={isProcessing}
              className="text-white/80 hover:text-white transition-colors disabled:opacity-50"
              aria-label="Cerrar"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </button>
          </div>

          {/* Contador regresivo */}
          <div className="flex items-center justify-center gap-2">
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <span className={`text-3xl font-bold ${getCountdownColor()}`}>
                {countdown}
              </span>
              <span className="text-white/80 ml-2">segundos</span>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4">
          {/* Tipo de Servicio */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <FontAwesomeIcon icon={faBriefcase} className="text-blue-600" />
              <span className="font-semibold text-gray-700">Servicio:</span>
            </div>
            <p className="text-lg font-bold text-blue-900">
              {lead.servicio_solicitado || lead.servicio || "Servicio General"}
            </p>
          </div>

          {/* Ubicación */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <FontAwesomeIcon
                icon={faMapMarkerAlt}
                className="text-green-600"
              />
              <span className="font-semibold text-gray-700">Ubicación:</span>
            </div>
            <p className="text-gray-800">
              {lead.ubicacion_direccion || "Ubicación no especificada"}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              A {distanciaText} de tu ubicación
            </p>
          </div>

          {/* Descripción */}
          {lead.descripcion_proyecto && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <FontAwesomeIcon icon={faUser} className="text-gray-600" />
                <span className="font-semibold text-gray-700">
                  Descripción:
                </span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                {lead.descripcion_proyecto}
              </p>
            </div>
          )}

          {/* Cliente */}
          {lead.nombre_cliente && (
            <div className="text-center py-2">
              <p className="text-sm text-gray-600">
                Cliente:{" "}
                <span className="font-semibold">{lead.nombre_cliente}</span>
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Mensaje de urgencia */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800 text-center">
              ⚡ Este lead también está disponible para otros profesionales.
              ¡Responde rápido!
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl border-t border-gray-200 space-y-3">
          <button
            onClick={handleAccept}
            disabled={isProcessing || countdown === 0}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-lg touch-manipulation"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faCheck} />
                <span>Aceptar Lead</span>
              </>
            )}
          </button>

          <button
            onClick={handleReject}
            disabled={isProcessing}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            Rechazar
          </button>
        </div>
      </div>
    </div>
  );
}
