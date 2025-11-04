import React from "react";
import Image from "next/image";
import { Profesional } from "@/types/supabase";

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

  return (
    <header className="bg-white shadow-md p-2 md:p-4 lg:p-6 border-t-4 border-indigo-600">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-2 md:space-y-4 lg:space-y-0">
        {/* Contenedor de la Tarjeta de Identidad Enriquecida */}
        <div className="flex flex-row items-center space-x-3 md:space-x-4 lg:space-x-6 flex-1">
          {/* Avatar con fallback a inicial */}
          <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-indigo-100 border-2 border-indigo-300 flex-shrink-0 shadow-lg">
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
            {/* 1. Nombre Completo con Badge Verificado */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 mb-1 md:mb-2">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-gray-900 leading-tight truncate">
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

            {/* 2. Calificación en estrellas mejorada (UX visual) */}
            <div className="flex items-center space-x-1.5 md:space-x-2 my-1 md:my-2">
              <div className="flex items-center space-x-0.5 md:space-x-1">
                {/* Renderiza las estrellas basadas en el rating */}
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className={`text-xs sm:text-sm md:text-base lg:text-lg ${
                      i < starCount ? "text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <span className="text-gray-600 text-xs md:text-sm font-medium whitespace-nowrap">
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

            {/* 4. Oficios y Biografía */}
            <p className="text-xs md:text-sm lg:text-base text-gray-600 mt-1 md:mt-2 line-clamp-1">
              Especialista en:{" "}
              <span className="font-semibold">
                {profesional.areas_servicio?.join(", ") || "Sin definir"}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-0.5 md:mt-1 italic hidden md:block line-clamp-1">
              {profesional.descripcion_perfil
                ? profesional.descripcion_perfil.substring(0, 50) + "..."
                : "Biografía pendiente"}
            </p>
          </div>
        </div>

        {/* Columna de Acciones y Contacto - Responsive */}
        <div className="hidden sm:flex flex-col lg:flex-col items-center lg:items-end space-y-3 lg:space-y-3 lg:ml-4 lg:w-auto">
          <button
            onClick={onEditClick} // Llama a la función para abrir el modal
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-indigo-200 text-sm sm:text-base touch-manipulation active:scale-95"
          >
            📝{" "}
            <span className="hidden sm:inline">Editar Perfil (Enriquecer)</span>
            <span className="sm:hidden">Editar Perfil</span>
          </button>

          {/* Datos de contacto clave para referencia rápida */}
          <div className="w-full sm:w-auto text-center lg:text-right text-xs sm:text-sm text-gray-700 p-2 sm:p-3 border rounded-lg bg-gray-50">
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
