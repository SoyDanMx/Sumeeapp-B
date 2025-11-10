"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
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

interface ClientProfileWidgetProps {
  profile: Profile;
  onProfileUpdate?: () => void;
}

export default function ClientProfileWidget({
  profile,
  onProfileUpdate,
}: ClientProfileWidgetProps) {
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
      {/* Widget de Perfil */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
        {/* Header con plan */}
        <div className={`bg-gradient-to-r ${planColor} px-6 py-4 flex items-center justify-between`}>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl font-bold border-2 border-white/30">
              {(profile.full_name || "C")[0].toUpperCase()}
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">
                {profile.full_name || "Cliente"}
              </h3>
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faCrown} className="text-yellow-300 text-xs" />
                <span className="text-white/90 text-sm font-medium">{planName}</span>
              </div>
            </div>
          </div>
          {isIncomplete && (
            <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
              {completeness}% completo
            </div>
          )}
        </div>

        {/* Información del perfil */}
        <div className="p-6 space-y-4">
          {/* Email */}
          <div className="flex items-center space-x-3 text-gray-700">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faEnvelope} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-medium">Email</p>
              <p className="text-sm font-semibold truncate">{profile.email}</p>
            </div>
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-lg" />
          </div>

          {/* WhatsApp */}
          <div className="flex items-center space-x-3 text-gray-700">
            <div className={`w-10 h-10 ${missingWhatsApp ? "bg-red-100" : "bg-green-100"} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <FontAwesomeIcon
                icon={faWhatsapp}
                className={missingWhatsApp ? "text-red-600" : "text-green-600"}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-medium">WhatsApp</p>
              <p className={`text-sm font-semibold ${missingWhatsApp ? "text-red-600" : ""}`}>
                {profile.whatsapp || "No configurado"}
              </p>
            </div>
            {missingWhatsApp ? (
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="text-red-500 text-lg animate-pulse"
              />
            ) : (
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-lg" />
            )}
          </div>

          {/* Ubicación */}
          <div className="flex items-center space-x-3 text-gray-700">
            <div className={`w-10 h-10 ${missingLocation ? "bg-red-100" : "bg-blue-100"} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <FontAwesomeIcon
                icon={faMapMarkerAlt}
                className={missingLocation ? "text-red-600" : "text-blue-600"}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-medium">Ubicación</p>
              <p className={`text-sm font-semibold ${missingLocation ? "text-red-600" : ""}`}>
                {profile.ubicacion_lat && profile.ubicacion_lng
                  ? "Configurada"
                  : "No configurada"}
              </p>
            </div>
            {missingLocation ? (
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="text-red-500 text-lg animate-pulse"
              />
            ) : (
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-lg" />
            )}
          </div>

          {/* Alerta si falta información */}
          {isIncomplete && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-4 mt-4">
              <div className="flex items-start space-x-3">
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="text-orange-500 text-xl mt-1 animate-pulse"
                />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-orange-900 mb-1">
                    ¡Completa tu perfil!
                  </h4>
                  <p className="text-xs text-orange-700 leading-relaxed">
                    {missingWhatsApp && missingLocation
                      ? "Añade tu WhatsApp y ubicación para recibir respuestas más rápidas de los profesionales."
                      : missingWhatsApp
                      ? "Añade tu WhatsApp para que los profesionales te contacten directamente."
                      : "Añade tu ubicación para encontrar profesionales cerca de ti."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Botón de acción */}
          <button
            onClick={() => {
              console.log("🔵 Abriendo modal de actualizar perfil (cliente)");
              setShowUpdateModal(true);
            }}
            className={`w-full ${
              isIncomplete
                ? "bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 hover:from-orange-600 hover:via-red-600 hover:to-pink-700 animate-pulse shadow-2xl"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
            } text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-3 text-base`}
          >
            {isIncomplete && (
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="text-xl animate-bounce"
              />
            )}
            <FontAwesomeIcon icon={faEdit} className="text-lg" />
            <span>
              {isIncomplete ? "Completar Mi Perfil" : "Actualizar Mi Perfil"}
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

