"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faStar,
  faMapMarkerAlt,
  faCheckCircle,
  faPhone,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

interface TecnicoCardProps {
  professional: {
    user_id: string;
    full_name: string;
    profession?: string;
    avatar_url?: string | null;
    whatsapp?: string;
    calificacion_promedio?: number;
    ubicacion_lat?: number;
    ubicacion_lng?: number;
    areas_servicio?: string[];
    distance?: number;
    total_reviews?: number;
    verified?: boolean;
  };
  isSelected?: boolean;
  onClick?: () => void;
  onContactClick?: () => void;
}

export default function TecnicoCard({
  professional,
  isSelected = false,
  onClick,
  onContactClick,
}: TecnicoCardProps) {
  const {
    full_name,
    profession,
    avatar_url,
    whatsapp,
    calificacion_promedio,
    areas_servicio,
    distance,
    total_reviews = 0,
    verified = true,
  } = professional;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer border-2 ${
        isSelected
          ? "border-indigo-500 ring-4 ring-indigo-100"
          : "border-transparent hover:border-indigo-200"
      }`}
    >
      <div className="p-4 sm:p-5">
        {/* Header: Avatar + Info */}
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {avatar_url ? (
              <img
                src={avatar_url}
                alt={full_name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-gray-100"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border-4 border-gray-100">
                <FontAwesomeIcon
                  icon={faUser}
                  className="text-2xl sm:text-3xl text-indigo-600"
                />
              </div>
            )}
            {verified && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="text-white text-sm"
                />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">
              {full_name}
            </h3>
            {profession && (
              <p className="text-sm text-gray-600 mb-2">{profession}</p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-2">
              {calificacion_promedio && calificacion_promedio > 0 ? (
                <>
                  <div className="flex items-center gap-1">
                    <FontAwesomeIcon
                      icon={faStar}
                      className="text-yellow-500 text-sm"
                    />
                    <span className="font-semibold text-gray-900">
                      {calificacion_promedio.toFixed(1)}
                    </span>
                  </div>
                  {total_reviews > 0 && (
                    <span className="text-xs text-gray-500">
                      ({total_reviews} reseñas)
                    </span>
                  )}
                </>
              ) : (
                <span className="text-xs text-gray-500">Sin calificaciones</span>
              )}
            </div>
          </div>
        </div>

        {/* Distance Badge */}
        {distance !== undefined && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium mb-3">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-xs" />
            <span>{distance.toFixed(1)} km de ti</span>
          </div>
        )}

        {/* Specialties */}
        {areas_servicio && areas_servicio.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {areas_servicio.slice(0, 3).map((area, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs"
              >
                {area}
              </span>
            ))}
            {areas_servicio.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                +{areas_servicio.length - 3} más
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp}?text=Hola%20${encodeURIComponent(
                full_name
              )}%2C%20te%20contacto%20desde%20Sumee%20App.`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                onContactClick?.();
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              <FontAwesomeIcon icon={faWhatsapp} />
              <span className="hidden sm:inline">WhatsApp</span>
              <span className="sm:hidden">Chat</span>
            </a>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implementar llamada telefónica
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <FontAwesomeIcon icon={faPhone} />
            <span className="hidden sm:inline">Llamar</span>
            <span className="sm:hidden">Tel</span>
          </button>
        </div>
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <div className="bg-indigo-50 px-4 py-2 border-t border-indigo-100">
          <p className="text-xs text-indigo-700 text-center font-medium">
            📍 Seleccionado en el mapa
          </p>
        </div>
      )}
    </div>
  );
}

