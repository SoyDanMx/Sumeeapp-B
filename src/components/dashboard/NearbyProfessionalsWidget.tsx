"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMap,
  faList,
  faFilter,
  faUser,
  faStar,
  faWhatsapp,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";

// Importar el mapa dinámicamente para evitar SSR issues
const ClientProfessionalsMapView = dynamic(
  () => import("./ClientProfessionalsMapView"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    ),
  }
);

interface Professional {
  user_id: string;
  full_name: string;
  email: string;
  avatar_url?: string | null;
  profession?: string;
  whatsapp?: string;
  calificacion_promedio?: number;
  ubicacion_lat?: number;
  ubicacion_lng?: number;
  areas_servicio?: string[];
  distance?: number;
}

interface NearbyProfessionalsWidgetProps {
  clientLat: number;
  clientLng: number;
  searchRadius?: number;
}

const professionOptions = [
  "Todos",
  "Electricista",
  "Plomero",
  "Técnico en Aire Acondicionado",
  "Especialista en CCTV y Seguridad",
  "Carpintero",
  "Pintor",
  "Especialista en Limpieza",
  "Jardinero",
];

export default function NearbyProfessionalsWidget({
  clientLat,
  clientLng,
  searchRadius = 15,
}: NearbyProfessionalsWidgetProps) {
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [selectedProfession, setSelectedProfession] = useState<string | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);

  const handleProfessionalClick = (professional: Professional) => {
    setSelectedProfessional(professional);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-3" />
              Profesionales Cercanos
            </h2>
            <p className="text-blue-100">
              Encuentra técnicos verificados en tu zona (hasta {searchRadius} km)
            </p>
          </div>
          
          {/* Toggle View Mode */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("map")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                viewMode === "map"
                  ? "bg-white text-indigo-600 shadow-lg"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <FontAwesomeIcon icon={faMap} className="mr-2" />
              Mapa
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                viewMode === "list"
                  ? "bg-white text-indigo-600 shadow-lg"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <FontAwesomeIcon icon={faList} className="mr-2" />
              Lista
            </button>
          </div>
        </div>

        {/* Filter by Profession */}
        <div className="mt-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <FontAwesomeIcon icon={faFilter} className="text-white text-sm" />
            {professionOptions.map((profession) => (
              <button
                key={profession}
                onClick={() =>
                  setSelectedProfession(profession === "Todos" ? null : profession)
                }
                className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  (profession === "Todos" && !selectedProfession) ||
                  selectedProfession === profession
                    ? "bg-white text-indigo-600 shadow-md"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                {profession}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative">
        {viewMode === "map" ? (
          <div className="h-[600px]">
            <ClientProfessionalsMapView
              clientLat={clientLat}
              clientLng={clientLng}
              searchRadius={searchRadius}
              professionFilter={selectedProfession}
              onProfessionalClick={handleProfessionalClick}
            />
          </div>
        ) : (
          <div className="p-6">
            <p className="text-gray-600 text-center py-12">
              Vista de lista en desarrollo. Por ahora, usa la vista de mapa.
            </p>
          </div>
        )}
      </div>

      {/* Selected Professional Info */}
      {selectedProfessional && (
        <div className="border-t bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {selectedProfessional.avatar_url ? (
                <img
                  src={selectedProfessional.avatar_url}
                  alt={selectedProfessional.full_name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-300"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-indigo-200 flex items-center justify-center">
                  <FontAwesomeIcon icon={faUser} className="text-indigo-600" />
                </div>
              )}
              <div>
                <h4 className="font-bold text-gray-900">
                  {selectedProfessional.full_name}
                </h4>
                <p className="text-sm text-gray-600">
                  {selectedProfessional.profession} •{" "}
                  {selectedProfessional.distance?.toFixed(1)} km
                </p>
              </div>
            </div>
            
            {selectedProfessional.whatsapp && (
              <a
                href={`https://wa.me/${selectedProfessional.whatsapp}?text=Hola%20${encodeURIComponent(
                  selectedProfessional.full_name
                )}%2C%20te%20contacto%20desde%20Sumee%20App.`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors"
              >
                <FontAwesomeIcon icon={faWhatsapp} className="mr-2" />
                Contactar
              </a>
            )}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="border-t bg-gray-50 p-4">
        <p className="text-sm text-gray-600 text-center">
          💡 <strong>Tip:</strong> Haz clic en los marcadores del mapa para ver más
          información de cada profesional y contactarlos directamente.
        </p>
      </div>
    </div>
  );
}

