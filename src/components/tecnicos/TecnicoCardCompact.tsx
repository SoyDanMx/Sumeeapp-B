"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faStar,
  faMapMarkerAlt,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

interface TecnicoCardCompactProps {
  professional: {
    user_id: string;
    full_name: string;
    profession?: string;
    avatar_url?: string | null;
    whatsapp?: string;
    calificacion_promedio?: number;
    distance?: number;
    total_reviews?: number;
    verified?: boolean;
  };
  isSelected?: boolean;
  onClick?: () => void;
  onContactClick?: () => void;
}

export default function TecnicoCardCompact({
  professional,
  isSelected = false,
  onClick,
  onContactClick,
}: TecnicoCardCompactProps) {
  const {
    full_name,
    profession,
    avatar_url,
    whatsapp,
    calificacion_promedio,
    distance,
    total_reviews = 0,
    verified = true,
  } = professional;

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (whatsapp) {
      window.open(
        `https://wa.me/${whatsapp}?text=Hola%20${encodeURIComponent(
          full_name
        )}%2C%20te%20contacto%20desde%20Sumee%20App.`,
        "_blank"
      );
      onContactClick?.();
    }
  };

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white transition-all cursor-pointer border-l-4 ${
        isSelected
          ? "border-l-indigo-600 bg-indigo-50 shadow-md"
          : "border-l-transparent hover:border-l-indigo-200 hover:bg-gray-50 hover:shadow-sm"
      }`}
    >
      <div className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {avatar_url ? (
            <img
              src={avatar_url}
              alt={full_name}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border-2 border-gray-200">
              <FontAwesomeIcon
                icon={faUser}
                className="text-sm text-indigo-600"
              />
            </div>
          )}
          {verified && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="text-white text-[8px]"
              />
            </div>
          )}
        </div>

        {/* Info Principal */}
        <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            {/* Nombre y Profesión */}
            <div className="flex items-baseline gap-2">
              <h3 className="font-bold text-sm text-gray-900 truncate">
                {full_name}
              </h3>
              {profession && (
                <span className="text-xs text-gray-500 truncate hidden sm:inline">
                  {profession}
                </span>
              )}
            </div>

            {/* Móvil: Profesión en segunda línea */}
            {profession && (
              <p className="text-xs text-gray-500 truncate sm:hidden">
                {profession}
              </p>
            )}
          </div>

          {/* Rating y Distancia - Desktop */}
          <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
            {/* Rating */}
            {calificacion_promedio && calificacion_promedio > 0 ? (
              <div className="flex items-center gap-1">
                <FontAwesomeIcon
                  icon={faStar}
                  className="text-yellow-500 text-xs"
                />
                <span className="font-semibold text-sm text-gray-900">
                  {calificacion_promedio.toFixed(1)}
                </span>
                {total_reviews > 0 && (
                  <span className="text-xs text-gray-400">
                    ({total_reviews})
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs text-gray-400">Sin calif.</span>
            )}

            {/* Separator */}
            <span className="text-gray-300">•</span>

            {/* Distance */}
            {distance !== undefined && (
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[10px]" />
                <span className="font-medium">{distance.toFixed(1)} km</span>
              </div>
            )}

            {/* WhatsApp Button */}
            {whatsapp && (
              <button
                onClick={handleWhatsAppClick}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors shadow-sm hover:shadow-md active:scale-95"
                aria-label="Contactar por WhatsApp"
              >
                <FontAwesomeIcon icon={faWhatsapp} className="text-sm" />
              </button>
            )}
          </div>

          {/* Rating y Distancia - Mobile (Stacked) */}
          <div className="flex sm:hidden flex-col items-end gap-0.5 flex-shrink-0">
            {/* Rating */}
            {calificacion_promedio && calificacion_promedio > 0 ? (
              <div className="flex items-center gap-1">
                <FontAwesomeIcon
                  icon={faStar}
                  className="text-yellow-500 text-xs"
                />
                <span className="font-semibold text-xs text-gray-900">
                  {calificacion_promedio.toFixed(1)}
                </span>
              </div>
            ) : (
              <span className="text-xs text-gray-400">N/A</span>
            )}

            {/* Distance */}
            {distance !== undefined && (
              <span className="text-xs text-gray-500 font-medium">
                {distance.toFixed(1)} km
              </span>
            )}
          </div>

          {/* WhatsApp Button - Mobile */}
          {whatsapp && (
            <button
              onClick={handleWhatsAppClick}
              className="sm:hidden flex-shrink-0 w-9 h-9 flex items-center justify-center bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-full transition-colors shadow-sm active:scale-95"
              aria-label="Chat"
            >
              <FontAwesomeIcon icon={faWhatsapp} className="text-base" />
            </button>
          )}
        </div>
      </div>

      {/* Selected Indicator Bar */}
      {isSelected && (
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
      )}

      {/* Hover Effect Overlay */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity ${
          isSelected
            ? "opacity-0"
            : "opacity-0 group-hover:opacity-100 bg-gradient-to-r from-indigo-50/50 to-transparent"
        }`}
      ></div>
    </div>
  );
}

