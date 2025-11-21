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
    <header className="bg-white shadow-sm p-1.5 md:p-2.5 border-t-2 border-indigo-600">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-1.5 md:space-y-2 lg:space-y-0">
        {/* Contenedor de la Tarjeta de Identidad Enriquecida */}
        <div className="flex flex-row items-center space-x-2 md:space-x-2.5 flex-1 min-w-0">
          {/* Avatar con fallback a inicial - Compactado */}
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full overflow-hidden bg-indigo-100 border-2 border-indigo-300 flex-shrink-0 shadow-md">
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
            <div className="flex flex-col sm:flex-row sm:items-center space-y-0.5 sm:space-y-0 sm:space-x-1.5 mb-0.5">
              <h1 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 leading-tight truncate">
                {profesional.full_name}
              </h1>
              {/* Badge Verificado - Trust Signal */}
              <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-green-100 text-green-800 border border-green-200 shadow-sm mx-auto sm:mx-0 w-fit">
                <svg
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="hidden sm:inline">Verificado</span>
                <span className="sm:hidden">✓</span>
              </span>
            </div>

            {/* 2. Calificación en estrellas - Compactado */}
            <div className="flex items-center space-x-0.5 my-0.5">
              <div className="flex items-center space-x-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className={`text-[10px] sm:text-xs ${
                      i < starCount ? "text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <span className="text-gray-600 text-[10px] sm:text-xs font-medium whitespace-nowrap">
                ({rating.toFixed(1)}/5.0)
              </span>
            </div>

            {/* 3. Experiencia Uber Pro (UX Badge) - Oculto en móvil muy pequeño */}
            {isUberPro && (
              <div className="hidden sm:flex justify-start mt-1">
                <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full text-green-700 bg-green-100 border border-green-300 shadow-sm">
                  ✅ PRO | {profesional.años_experiencia_uber} años
                </span>
              </div>
            )}

            {/* 4. Oficios y Biografía - Compactado */}
            <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 line-clamp-1">
              <span className="font-semibold">
                {profesional.areas_servicio?.slice(0, 2).join(", ") || "Sin definir"}
                {profesional.areas_servicio && profesional.areas_servicio.length > 2 && "..."}
              </span>
            </p>
          </div>
        </div>

        {/* Columna de Acciones y Contacto - Compactado */}
        <div className="hidden sm:flex flex-col lg:flex-col items-center lg:items-end space-y-1 lg:space-y-1.5 lg:ml-2 lg:w-auto">
          <button
            onClick={onEditClick}
            className={`w-full sm:w-auto ${
              isIncomplete
                ? "bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 hover:from-orange-600 hover:via-red-600 hover:to-pink-700 animate-pulse shadow-lg"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md"
            } text-white px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg transition-all duration-200 text-[10px] sm:text-xs font-semibold touch-manipulation active:scale-95 flex items-center justify-center gap-1`}
          >
            {isIncomplete && (
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="text-xs sm:text-sm animate-bounce"
              />
            )}
            {!isIncomplete && (
              <FontAwesomeIcon icon={faRocket} className="text-xs sm:text-sm" />
            )}
            <span className="hidden sm:inline">
              {isIncomplete && criticalMissingCount > 0
                ? `Optimizar (${criticalMissingCount})`
                : "Optimizar"}
            </span>
            <span className="sm:hidden">Opt.</span>
          </button>

          {/* Datos de contacto - Compactado y oculto en móvil pequeño */}
          <div className="hidden md:block w-full sm:w-auto text-center lg:text-right text-[10px] sm:text-xs text-gray-700 p-1 sm:p-1.5 border rounded-md bg-gray-50">
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

          {/* Toggle de Disponibilidad (UX Feedback) - Oculto en móvil */}
          <div className="hidden lg:flex items-center text-[10px] sm:text-xs">
            <span className="mr-1">Disponible</span>
            <span className="bg-green-500 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shadow-inner"></span>
          </div>
        </div>
      </div>
    </header>
  );
}
