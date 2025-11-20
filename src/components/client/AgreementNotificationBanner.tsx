"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimes,
  faDollarSign,
  faArrowRight,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { Lead } from "@/types/supabase";
import { supabase } from "@/lib/supabase/client";

interface AgreementNotificationBannerProps {
  lead: Lead;
  onDismiss?: () => void;
  onViewDetails?: () => void;
}

export default function AgreementNotificationBanner({
  lead,
  onDismiss,
  onViewDetails,
}: AgreementNotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [professionalName, setProfessionalName] = useState<string>("el técnico");

  useEffect(() => {
    // Obtener nombre del profesional si está disponible
    if (lead.profesional_asignado_id) {
      supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", lead.profesional_asignado_id)
        .single()
        .then(({ data }) => {
          const profileData = data as any;
          if (profileData?.full_name) {
            setProfessionalName(profileData.full_name);
          }
        });
    }
  }, [lead.profesional_asignado_id]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible || lead.negotiation_status !== "acuerdo_confirmado") {
    return null;
  }

  // Calcular diferencia de precio para alerta
  const aiPriceMin = lead.ai_suggested_price_min;
  const agreedPrice = lead.agreed_price;
  let priceDifference = 0;
  let isLowPrice = false;
  let isVeryLowPrice = false;

  if (aiPriceMin && agreedPrice) {
    priceDifference = ((aiPriceMin - agreedPrice) / aiPriceMin) * 100;
    isLowPrice = priceDifference >= 20; // 20% o más bajo
    isVeryLowPrice = priceDifference >= 40; // 40% o más bajo
  }

  return (
    <div className="mb-4 p-4 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-2 border-green-400 rounded-xl shadow-lg animate-in slide-in-from-top duration-500">
      <div className="flex items-start justify-between">
        <div className="flex items-start flex-1">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text-white text-xl"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-green-900 text-lg mb-1">
              ¡Acuerdo Confirmado!
            </h3>
            <p className="text-sm text-green-800 mb-2">
              <strong>{professionalName}</strong> ha finalizado el acuerdo del trabajo.
            </p>
            
            {lead.agreed_price && (
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <FontAwesomeIcon
                    icon={faDollarSign}
                    className="text-green-700"
                  />
                  <span className="text-base font-semibold text-green-900">
                    Precio Final Acordado:{" "}
                    <span className="text-green-700">
                      ${lead.agreed_price.toLocaleString("es-MX", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} MXN
                    </span>
                  </span>
                </div>
                
                {/* Alerta de precio bajo */}
                {isVeryLowPrice && (
                  <div className="mt-2 p-3 bg-red-50 border-2 border-red-400 rounded-lg">
                    <div className="flex items-start gap-2">
                      <FontAwesomeIcon
                        icon={faExclamationTriangle}
                        className="text-red-600 text-lg mt-0.5 flex-shrink-0"
                      />
                      <div>
                        <p className="text-sm font-semibold text-red-900 mb-1">
                          ⚠️ Precio Significativamente Bajo
                        </p>
                        <p className="text-xs text-red-700">
                          Este precio es {priceDifference.toFixed(0)}% menor que el rango sugerido por IA (${aiPriceMin?.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN mínimo). 
                          Considera verificar la calidad de los materiales o el alcance completo del servicio antes de proceder.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {isLowPrice && !isVeryLowPrice && (
                  <div className="mt-2 p-3 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
                    <div className="flex items-start gap-2">
                      <FontAwesomeIcon
                        icon={faExclamationTriangle}
                        className="text-yellow-600 text-lg mt-0.5 flex-shrink-0"
                      />
                      <div>
                        <p className="text-sm font-semibold text-yellow-900 mb-1">
                          ⚠️ Precio Bajo
                        </p>
                        <p className="text-xs text-yellow-700">
                          Este precio es {priceDifference.toFixed(0)}% menor que el mínimo sugerido. Asegúrate de que el alcance del trabajo y la calidad de materiales estén claramente definidos.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {lead.agreed_scope && (
              <p className="text-xs text-green-700 mb-3 line-clamp-2">
                <strong>Alcance:</strong> {lead.agreed_scope.substring(0, 150)}
                {lead.agreed_scope.length > 150 && "..."}
              </p>
            )}

            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={onViewDetails}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                Ver Detalles
                <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
              </button>
              <button
                onClick={handleDismiss}
                className="bg-white hover:bg-green-50 text-green-700 border-2 border-green-300 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
              >
                Cerrar
              </button>
            </div>

            {/* Nota sobre pago futuro */}
            <p className="text-xs text-green-600 mt-3 italic">
              💡 Podrás proceder al pago una vez que el trabajo esté completado.
            </p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-green-600 hover:text-green-800 hover:bg-green-100 rounded-full p-2 transition-colors ml-2 flex-shrink-0"
          aria-label="Cerrar notificación"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    </div>
  );
}

