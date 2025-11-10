"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faMapMarkerAlt,
  faEdit,
  faCheckCircle,
  faExclamationTriangle,
  faCrown,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { Profile } from "@/types/supabase";
import UpdateProfileModal from "./UpdateProfileModal";

interface ClientProfileWidgetCompactProps {
  profile: Profile;
  onProfileUpdate?: () => void;
}

export default function ClientProfileWidgetCompact({
  profile,
  onProfileUpdate,
}: ClientProfileWidgetCompactProps) {
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Calcular completitud del perfil
  const calculateCompleteness = () => {
    const fields = [
      profile.full_name,
      profile.email,
      profile.whatsapp,
      profile.ubicacion_lat,
      profile.ubicacion_lng,
    ];
    const completed = fields.filter((f) => f !== null && f !== undefined && f !== "").length;
    return Math.round((completed / fields.length) * 100);
  };

  const completeness = calculateCompleteness();
  const isIncomplete = completeness < 100;
  const missingWhatsApp = !profile.whatsapp;
  const missingLocation = !profile.ubicacion_lat || !profile.ubicacion_lng;

  // Determinar plan del cliente
  const planName = profile.membership_status === "premium"
    ? "Sumee Pro"
    : "Sumee Express";

  const planColor = profile.membership_status === "premium"
    ? "from-purple-600 to-indigo-600"
    : "from-blue-500 to-cyan-500";

  const handleSuccess = () => {
    console.log("✅ Perfil actualizado exitosamente");
    setShowUpdateModal(false);
    if (onProfileUpdate) {
      onProfileUpdate();
    }
    // Refrescar página para actualizar datos
    window.location.reload();
  };

  return (
    <>
      {/* Widget de Perfil COMPACTO - RESPONSIVE */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
        {/* Header con plan - RESPONSIVE */}
        <div className={`bg-gradient-to-r ${planColor} px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between`}>
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold border border-white/30 flex-shrink-0">
              {(profile.full_name || "C")[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-bold text-xs sm:text-sm truncate">
                {profile.full_name || "Cliente"}
              </h3>
              <div className="flex items-center space-x-1">
                <FontAwesomeIcon icon={faCrown} className="text-yellow-300 text-[9px] sm:text-[10px]" />
                <span className="text-white/90 text-[10px] sm:text-xs font-medium truncate">{planName}</span>
              </div>
            </div>
          </div>
          {isIncomplete && (
            <div className="bg-yellow-400 text-yellow-900 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold whitespace-nowrap flex-shrink-0">
              {completeness}%
            </div>
          )}
        </div>

        {/* Información del perfil - RESPONSIVE */}
        <div className="p-2.5 sm:p-3 space-y-1.5 sm:space-y-2">
          {/* Email */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 text-gray-700">
            <div className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faEnvelope} className="text-blue-600 text-[10px] sm:text-xs" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] sm:text-[10px] text-gray-500 font-medium">Email</p>
              <p className="text-[11px] sm:text-xs font-semibold truncate">{profile.email}</p>
            </div>
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-xs sm:text-sm flex-shrink-0" />
          </div>

          {/* WhatsApp */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 text-gray-700">
            <div className={`w-6 h-6 sm:w-7 sm:h-7 ${missingWhatsApp ? "bg-red-100" : "bg-green-100"} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <FontAwesomeIcon
                icon={faWhatsapp}
                className={`${missingWhatsApp ? "text-red-600" : "text-green-600"} text-[10px] sm:text-xs`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] sm:text-[10px] text-gray-500 font-medium">WhatsApp</p>
              <p className={`text-[11px] sm:text-xs font-semibold truncate ${missingWhatsApp ? "text-red-600" : ""}`}>
                {profile.whatsapp || "No configurado"}
              </p>
            </div>
            {missingWhatsApp ? (
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="text-red-500 text-xs sm:text-sm flex-shrink-0"
              />
            ) : (
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-xs sm:text-sm flex-shrink-0" />
            )}
          </div>

          {/* Ubicación */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 text-gray-700">
            <div className={`w-6 h-6 sm:w-7 sm:h-7 ${missingLocation ? "bg-red-100" : "bg-blue-100"} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <FontAwesomeIcon
                icon={faMapMarkerAlt}
                className={`${missingLocation ? "text-red-600" : "text-blue-600"} text-[10px] sm:text-xs`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] sm:text-[10px] text-gray-500 font-medium">Ubicación</p>
              <p className={`text-[11px] sm:text-xs font-semibold truncate ${missingLocation ? "text-red-600" : ""}`}>
                {profile.ubicacion_lat && profile.ubicacion_lng
                  ? "Configurada"
                  : "No configurada"}
              </p>
            </div>
            {missingLocation ? (
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="text-red-500 text-xs sm:text-sm flex-shrink-0"
              />
            ) : (
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-xs sm:text-sm flex-shrink-0" />
            )}
          </div>

          {/* Botón de acción - RESPONSIVE */}
          <button
            onClick={() => {
              console.log("🔵 Abriendo modal de actualizar perfil (cliente compacto)");
              setShowUpdateModal(true);
            }}
            className={`w-full ${
              isIncomplete
                ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 active:from-orange-700 active:to-red-700"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 active:from-blue-800 active:to-purple-800"
            } text-white font-bold py-2.5 sm:py-2 px-3 sm:px-4 rounded-lg transition-all duration-200 active:scale-95 flex items-center justify-center space-x-1.5 sm:space-x-2 text-xs sm:text-xs shadow-lg mt-2 touch-manipulation`}
          >
            <FontAwesomeIcon icon={faEdit} className="text-xs sm:text-sm" />
            <span className="truncate">
              {isIncomplete ? "Completar Perfil" : "Actualizar Perfil"}
            </span>
          </button>
        </div>
      </div>

      {/* Modal de actualización */}
      {showUpdateModal && (
        <UpdateProfileModal
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          userRole="client"
          currentProfile={profile}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}

