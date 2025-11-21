import React from "react";
import Image from "next/image";
import { Profesional } from "@/types/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faRocket,
} from "@fortawesome/free-solid-svg-icons";

interface Props {
  profesional: Profesional;
  onEditClick: () => void; // Prop para abrir el modal de edición
}

export default function ProfesionalHeader({ profesional, onEditClick }: Props) {
  const isUberPro = profesional.experiencia_uber;
  // Aseguramos que la calificación sea un número válido entre 0 y 5, con 5 como default
  const rating = Math.min(
    Math.max(profesional.calificacion_promedio || 5, 0),
    5
  );
  const starCount = Math.round(rating); // Redondeo para mostrar estrellas

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

  // Verificar campos críticos
  const hasAvatar = isFieldComplete(profesional.avatar_url);
  const hasSpecialties = Boolean(
    profesional.areas_servicio &&
      profesional.areas_servicio.length > 0 &&
      profesional.areas_servicio[0] !== "Sin definir"
  );
  const hasWorkZones = Boolean(
    isFieldComplete(profesional.work_zones) &&
      profesional.work_zones &&
      profesional.work_zones.length > 0
  );
  const hasWhatsApp = isFieldComplete(profesional.whatsapp);

  // Calcular si el perfil está incompleto (al menos un campo crítico faltante)
  const isIncomplete = !hasAvatar || !hasSpecialties || !hasWorkZones || !hasWhatsApp;
  const criticalMissingCount = [
    !hasAvatar,
    !hasSpecialties,
    !hasWorkZones,
    !hasWhatsApp,
  ].filter(Boolean).length;

  return (
    <header className="bg-white shadow-sm p-2 md:p-3 border-t-2 border-indigo-600">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-2 md:space-y-2 lg:space-y-0">
        {/* Contenedor de la Tarjeta de Identidad Enriquecida */}
        <div className="flex flex-row items-center space-x-2 md:space-x-3 flex-1">
          {/* Avatar con fallback a inicial - Compactado */}
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full overflow-hidden bg-indigo-100 border-2 border-indigo-300 flex-shrink-0 shadow-md">
            {profesional.avatar_url ? (
              <Image
                src={profesional.avatar_url}
                alt={`Avatar de ${profesional.full_name || "Profesional"}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 64px, 80px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-indigo-600 font-bold text-xl sm:text-2xl">
                {profesional.full_name
                  ? profesional.full_name[0].toUpperCase()
                  : "P"}
              </div>
            )}
          </div>

          <div className="flex-1 text-left min-w-0">
            {/* 1. Nombre Completo con Badge Verificado - Compactado */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-0.5 sm:space-y-0 sm:space-x-2 mb-0.5">
              <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 leading-tight truncate">
                {profesional.full_name}
              </h1>
              {/* Badge Verificado - Trust Signal */}
              <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 shadow-sm mx-auto sm:mx-0 w-fit">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Verificado
              </span>
            </div>

            {/* 2. Calificación en estrellas - Compactado */}
            <div className="flex items-center space-x-1 my-0.5">
              <div className="flex items-center space-x-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className={`text-xs sm:text-sm ${
                      i < starCount ? "text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <span className="text-gray-600 text-xs font-medium whitespace-nowrap">
                ({rating.toFixed(1)}/5.0)
              </span>
            </div>

            {/* 3. Experiencia Uber Pro (UX Badge) */}
            {isUberPro && (
              <div className="flex justify-center sm:justify-start mt-2">
                <span className="inline-flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full text-green-700 bg-green-100 border border-green-300 shadow-sm">
                  ✅ PRO | {profesional.años_experiencia_uber} años de
                  Experiencia en Plataforma
                </span>
              </div>
            )}

            {/* 4. Oficios y Biografía - Compactado */}
            <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">
              Especialista en:{" "}
              <span className="font-semibold">
                {profesional.areas_servicio?.join(", ") || "Sin definir"}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-0.5 italic hidden md:block line-clamp-1">
              {profesional.descripcion_perfil
                ? profesional.descripcion_perfil.substring(0, 40) + "..."
                : "Biografía pendiente"}
            </p>
          </div>
        </div>

        {/* Columna de Acciones y Contacto - Compactado */}
        <div className="hidden sm:flex flex-col lg:flex-col items-center lg:items-end space-y-2 lg:space-y-2 lg:ml-3 lg:w-auto">
          <button
            onClick={onEditClick}
            className={`w-full sm:w-auto ${
              isIncomplete
                ? "bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 hover:from-orange-600 hover:via-red-600 hover:to-pink-700 animate-pulse shadow-lg"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md"
            } text-white px-3 py-1.5 rounded-lg transition-all duration-200 text-xs sm:text-sm font-semibold touch-manipulation active:scale-95 flex items-center justify-center gap-1.5`}
          >
            {isIncomplete && (
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="text-lg sm:text-xl animate-bounce"
              />
            )}
            {!isIncomplete && (
              <FontAwesomeIcon icon={faRocket} className="text-base sm:text-lg" />
            )}
            <span className="hidden sm:inline">
              {isIncomplete && criticalMissingCount > 0
                ? `Optimizar Perfil (${criticalMissingCount} faltantes)`
                : "Optimizar Perfil"}
            </span>
            <span className="sm:hidden">Optimizar</span>
          </button>

          {/* Datos de contacto - Compactado */}
          <div className="w-full sm:w-auto text-center lg:text-right text-xs text-gray-700 p-1.5 sm:p-2 border rounded-md bg-gray-50">
            <p className="break-all sm:break-normal">
              WhatsApp:{" "}
              <span className="font-medium">
                {profesional.whatsapp || "N/A"}
              </span>
            </p>
            <p>
              IMSS:{" "}
              <span className="font-medium">
                {profesional.numero_imss || "N/A"}
              </span>
            </p>
          </div>

          {/* Toggle de Disponibilidad (UX Feedback) */}
          <div className="flex items-center text-xs sm:text-sm">
            <span className="mr-2">Disponibilidad:</span>
            <span className="bg-green-500 w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-inner"></span>
          </div>
        </div>
      </div>
    </header>
  );
}
