"use client";

import React from "react";
import { Profesional } from "@/types/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faTimes,
  faUser,
  faCamera,
  faEdit,
  faPhone,
  faMapMarkerAlt,
  faCertificate,
  faImage,
  faExclamationCircle,
  faExclamationTriangle,
  faRocket,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

interface ProfileChecklistProps {
  profesional: Profesional;
  onEditClick: (section?: string) => void;
}

interface ChecklistItem {
  id: string;
  label: string;
  icon: any;
  isCompleted: boolean;
  description: string;
  actionText: string;
  isCritical: boolean; // Nuevo: marca items críticos
}

export default function ProfileChecklist({
  profesional,
  onEditClick,
}: ProfileChecklistProps) {
  // Función para determinar si un campo está completo
  const isFieldComplete = (value: any): boolean => {
    if (Array.isArray(value)) {
      return value.length > 0 && value[0] !== "Sin definir";
    }
    return (
      value &&
      value !== "N/A" &&
      value !== "" &&
      value !== null &&
      value !== undefined
    );
  };

  // Verificar si tiene zonas de trabajo definidas
  const hasWorkZones = Boolean(
    isFieldComplete(profesional.work_zones) &&
      profesional.work_zones &&
      profesional.work_zones.length > 0
  );

  // Verificar si tiene certificaciones
  const hasCertifications = Boolean(
    isFieldComplete(profesional.certificaciones_urls) &&
      profesional.certificaciones_urls &&
      profesional.certificaciones_urls.length > 0
  );

  // Verificar si tiene fotos del portfolio
  const hasPortfolioPhotos = Boolean(
    isFieldComplete(profesional.work_photos_urls) ||
      (profesional.portfolio &&
        Array.isArray(profesional.portfolio) &&
        profesional.portfolio.length > 0)
  );

  // Definir los elementos del checklist con items críticos marcados
  const checklistItems: ChecklistItem[] = [
    {
      id: "avatar",
      label: "Foto de perfil",
      icon: faUser,
      isCompleted: isFieldComplete(profesional.avatar_url),
      description: "Una foto profesional aumenta tu credibilidad",
      actionText: "Agregar foto",
      isCritical: true,
    },
    {
      id: "specialties",
      label: "Especialidades",
      icon: faEdit,
      isCompleted: Boolean(
        profesional.areas_servicio &&
          profesional.areas_servicio.length > 0 &&
          profesional.areas_servicio[0] !== "Sin definir"
      ),
      description: "Define tus áreas de especialidad",
      actionText: "Definir especialidades",
      isCritical: true,
    },
    {
      id: "work_zones",
      label: "Zonas de trabajo",
      icon: faMapMarkerAlt,
      isCompleted: hasWorkZones,
      description: "¡CRÍTICO! Define dónde trabajas (alcaldías o polígonos)",
      actionText: "Definir zonas",
      isCritical: true, // MARCADO COMO CRÍTICO
    },
    {
      id: "whatsapp",
      label: "Número de WhatsApp",
      icon: faWhatsapp,
      isCompleted: isFieldComplete(profesional.whatsapp),
      description: "Los clientes te contactarán por WhatsApp",
      actionText: "Agregar WhatsApp",
      isCritical: true,
    },
    {
      id: "biography",
      label: "Descripción profesional",
      icon: faEdit,
      isCompleted:
        isFieldComplete(profesional.bio) ||
        isFieldComplete(profesional.descripcion_perfil),
      description: "Cuéntales a los clientes sobre ti",
      actionText: "Escribir descripción",
      isCritical: false,
    },
    {
      id: "certifications",
      label: "Certificaciones",
      icon: faCertificate,
      isCompleted: hasCertifications,
      description:
        "Genera confianza con certificaciones (DC-3, Red CONOCER, etc.)",
      actionText: "Subir certificaciones",
      isCritical: false,
    },
    {
      id: "portfolio",
      label: "Galería de trabajos",
      icon: faCamera,
      isCompleted: hasPortfolioPhotos,
      description: "Muestra tu trabajo anterior con fotos",
      actionText: "Subir fotos",
      isCritical: false,
    },
    {
      id: "phone",
      label: "Teléfono de contacto",
      icon: faPhone,
      isCompleted: isFieldComplete(profesional.phone),
      description: "Teléfono alternativo de contacto",
      actionText: "Agregar teléfono",
      isCritical: false,
    },
  ];

  // Calcular el progreso
  const completedItems = checklistItems.filter(
    (item) => item.isCompleted
  ).length;
  const totalItems = checklistItems.length;
  const criticalItems = checklistItems.filter((item) => item.isCritical);
  const completedCriticalItems = criticalItems.filter(
    (item) => item.isCompleted
  ).length;
  const progressPercentage = Math.round((completedItems / totalItems) * 100);

  // Determinar nivel de perfil basado en completitud
  const getProfileLevel = () => {
    if (
      progressPercentage === 100 &&
      completedCriticalItems === criticalItems.length
    ) {
      return {
        level: "Excelente",
        emoji: "🏆",
        color: "from-green-500 to-emerald-600",
        textColor: "text-green-700",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      };
    } else if (
      progressPercentage >= 80 &&
      completedCriticalItems === criticalItems.length
    ) {
      return {
        level: "Muy Bueno",
        emoji: "⭐",
        color: "from-blue-500 to-indigo-600",
        textColor: "text-blue-700",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
      };
    } else if (
      progressPercentage >= 60 &&
      completedCriticalItems >= Math.ceil(criticalItems.length * 0.75)
    ) {
      return {
        level: "Bueno",
        emoji: "👍",
        color: "from-purple-500 to-pink-600",
        textColor: "text-purple-700",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
      };
    } else if (progressPercentage >= 40) {
      return {
        level: "Regular",
        emoji: "📝",
        color: "from-yellow-500 to-orange-600",
        textColor: "text-yellow-700",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
      };
    } else {
      return {
        level: "Básico",
        emoji: "🚧",
        color: "from-gray-400 to-gray-600",
        textColor: "text-gray-700",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200",
      };
    }
  };

  const profileLevel = getProfileLevel();

  // Determinar el mensaje motivacional
  const getMotivationalMessage = () => {
    if (
      progressPercentage === 100 &&
      completedCriticalItems === criticalItems.length
    ) {
      return {
        title: "¡Perfil completo! 🎉",
        subtitle:
          "Tu perfil está optimizado para recibir más trabajos. ¡Excelente trabajo!",
        color: "text-green-600",
      };
    } else if (completedCriticalItems < criticalItems.length) {
      const missingCritical = criticalItems.filter(
        (item) => !item.isCompleted
      ).length;
      return {
        title: `Faltan ${missingCritical} items críticos ⚠️`,
        subtitle:
          "Completa los items marcados como críticos para recibir leads. Son esenciales para tu perfil.",
        color: "text-red-600",
      };
    } else if (progressPercentage >= 80) {
      return {
        title: "¡Casi listo! 🚀",
        subtitle:
          "Solo faltan algunos detalles opcionales para completar tu perfil al 100%",
        color: "text-blue-600",
      };
    } else if (progressPercentage >= 60) {
      return {
        title: "¡Buen progreso! 💪",
        subtitle: "Los perfiles completos reciben 3x más trabajos. ¡Sigue así!",
        color: "text-purple-600",
      };
    } else if (progressPercentage >= 40) {
      return {
        title: "¡Completa tu perfil! 📝",
        subtitle:
          "Los perfiles completos tienen 80% más probabilidades de ser contratados",
        color: "text-yellow-600",
      };
    } else {
      return {
        title: "¡Empieza a completar tu perfil! 🎯",
        subtitle:
          "Los profesionales con perfil completo reciben leads en su primera semana",
        color: "text-orange-600",
      };
    }
  };

  const motivationalMessage = getMotivationalMessage();

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
      {/* Header con nivel y progreso */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <h3 className="text-xl font-bold text-gray-900">
              Tu Perfil está al {progressPercentage}%
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${profileLevel.bgColor} ${profileLevel.textColor} ${profileLevel.borderColor} border`}
            >
              {profileLevel.emoji} {profileLevel.level}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-500">
            {completedItems}/{totalItems}
          </span>
        </div>

        {/* Barra de progreso con gradiente */}
        <div className="w-full bg-gray-200 rounded-full h-4 mb-3 relative overflow-hidden">
          <div
            className={`bg-gradient-to-r ${profileLevel.color} h-4 rounded-full transition-all duration-500 ease-out relative`}
            style={{ width: `${progressPercentage}%` }}
          >
            {progressPercentage > 0 && (
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            )}
          </div>
        </div>

        {/* Progreso de items críticos */}
        {completedCriticalItems < criticalItems.length && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <FontAwesomeIcon
                icon={faExclamationCircle}
                className="text-red-600"
              />
              <span className="text-sm font-semibold text-red-800">
                Items Críticos: {completedCriticalItems}/{criticalItems.length}
              </span>
            </div>
            <div className="w-full bg-red-100 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    (completedCriticalItems / criticalItems.length) * 100
                  }%`,
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Mensaje motivacional */}
        <div className="text-center mt-4">
          <h4 className={`font-semibold ${motivationalMessage.color}`}>
            {motivationalMessage.title}
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            {motivationalMessage.subtitle}
          </p>
        </div>
      </div>

      {/* Lista de tareas */}
      <div className="space-y-2">
        {checklistItems.map((item) => (
          <div
            key={item.id}
            className={`flex items-center p-3 rounded-lg border-2 transition-all duration-200 ${
              item.isCompleted
                ? "bg-green-50 border-green-300"
                : item.isCritical
                ? "bg-red-50 border-red-300 hover:bg-red-100"
                : "bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-200"
            }`}
          >
            {/* Icono de estado */}
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                item.isCompleted
                  ? "bg-green-500 text-white"
                  : item.isCritical
                  ? "bg-red-500 text-white"
                  : "bg-gray-300 text-gray-600"
              }`}
            >
              <FontAwesomeIcon
                icon={
                  item.isCompleted
                    ? faCheck
                    : item.isCritical
                    ? faExclamationCircle
                    : faTimes
                }
                className="text-sm"
              />
            </div>

            {/* Contenido */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon
                  icon={item.icon}
                  className={`text-sm ${
                    item.isCompleted
                      ? "text-green-600"
                      : item.isCritical
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                />
                <span
                  className={`font-semibold ${
                    item.isCompleted
                      ? "text-green-800"
                      : item.isCritical
                      ? "text-red-800"
                      : "text-gray-700"
                  }`}
                >
                  {item.label}
                  {item.isCritical && !item.isCompleted && (
                    <span className="ml-2 text-xs font-bold text-red-600">
                      CRÍTICO
                    </span>
                  )}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">{item.description}</p>
            </div>

            {/* Botón de acción */}
            {!item.isCompleted && (
              <button
                onClick={() => onEditClick(item.id)}
                className={`ml-3 px-4 py-2 text-xs font-semibold rounded-lg transition-colors duration-200 ${
                  item.isCritical
                    ? "text-white bg-red-600 hover:bg-red-700"
                    : "text-blue-600 bg-blue-50 hover:bg-blue-100"
                }`}
              >
                {item.actionText}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Botón principal de edición - Optimizar perfil */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        {(() => {
          const isIncomplete = progressPercentage < 100 || completedCriticalItems < criticalItems.length;
          const hasCriticalMissing = completedCriticalItems < criticalItems.length;
          return (
            <button
              onClick={() => onEditClick()}
              className={`w-full ${
                isIncomplete
                  ? "bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 hover:from-orange-600 hover:via-red-600 hover:to-pink-700 animate-pulse"
                  : `bg-gradient-to-r ${profileLevel.color} hover:opacity-90`
              } text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-2xl hover:shadow-3xl flex items-center justify-center gap-3 text-lg`}
            >
              {isIncomplete && (
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="text-2xl animate-bounce"
                />
              )}
              {!isIncomplete && (
                <FontAwesomeIcon icon={faRocket} className="text-xl" />
              )}
              <span>
                {isIncomplete && hasCriticalMissing
                  ? `Optimizar Perfil (${criticalItems.length - completedCriticalItems} críticos faltantes)`
                  : isIncomplete
                  ? "Optimizar Perfil"
                  : "Optimizar Perfil"}
              </span>
            </button>
          );
        })()}
      </div>
    </div>
  );
}
