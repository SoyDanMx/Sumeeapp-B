"use client";

import { useState, useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Lead } from "@/types/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faUser,
  faBriefcase,
} from "@fortawesome/free-solid-svg-icons";
import { calculateDistance } from "@/lib/calculateDistance";

// Fix para los iconos de Leaflet en Next.js
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

// Componente para centrar el mapa cuando cambia la ubicación
function MapCenter({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  return null;
}

// Crear icono personalizado para el profesional usando su avatar
const createProfessionalIcon = (avatarUrl: string | null | undefined) => {
  if (avatarUrl) {
    // Escapar la URL del avatar para evitar problemas con caracteres especiales en el HTML
    const escapedAvatarUrl = avatarUrl
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "&#39;")
      .replace(/"/g, "&quot;")
      .replace(/`/g, "&#96;");
    
    return L.divIcon({
      html: `
        <div style="
          width: 48px;
          height: 48px;
          border: 4px solid white;
          border-radius: 50%;
          overflow: hidden;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          background: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        ">
          <img 
            src="${escapedAvatarUrl}" 
            alt="Tu ubicación"
            style="
              width: 100%;
              height: 100%;
              object-fit: cover;
              border-radius: 50%;
            "
            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
            loading="lazy"
          />
          <div style="
            display: none;
            width: 100%;
            height: 100%;
            align-items: center;
            justify-content: center;
          ">
            <svg width="24" height="24" fill="white" viewBox="0 0 20 20">
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
            </svg>
          </div>
        </div>
      `,
      className: "custom-professional-icon",
      iconSize: [48, 48],
      iconAnchor: [24, 24],
      popupAnchor: [0, -24],
    });
  }

  // Fallback: icono genérico si no hay avatar
  return L.divIcon({
    html: `
      <div style="
        width: 40px;
        height: 40px;
        background: #2563eb;
        border: 4px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      ">
        <svg width="20" height="20" fill="white" viewBox="0 0 20 20">
          <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
        </svg>
      </div>
    `,
    className: "custom-professional-icon",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

// Crear icono personalizado para los leads
const createLeadIcon = (isSelected: boolean, distance: number) => {
  return L.divIcon({
    html: `
      <div style="
        width: ${isSelected ? "36px" : "32px"};
        height: ${isSelected ? "36px" : "32px"};
        background: ${isSelected ? "#16a34a" : "#eab308"};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        transition: all 0.3s;
      ">
        <svg width="${isSelected ? "18" : "16"}" height="${
      isSelected ? "18" : "16"
    }" fill="white" viewBox="0 0 20 20">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
          <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
        </svg>
      </div>
      ${
        isSelected
          ? `<div style="
        position: absolute;
        top: -24px;
        left: 50%;
        transform: translateX(-50%);
        white-space: nowrap;
        background: #16a34a;
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      ">${distance.toFixed(1)} km</div>`
          : ""
      }
    `,
    className: "custom-lead-icon",
    iconSize: isSelected ? [36, 50] : [32, 32],
    iconAnchor: isSelected ? [18, 50] : [16, 16],
    popupAnchor: [0, -20],
  });
};

interface ProfessionalMapViewProps {
  leads: Lead[];
  profesionalLat?: number;
  profesionalLng?: number;
  currentLat?: number;
  currentLng?: number;
  selectedLeadId?: string | null;
  onLeadClick?: (leadId: string) => void;
  searchRadius?: number; // Radio de búsqueda en km (por defecto 10km)
  avatarUrl?: string | null; // URL del avatar del profesional
}

export default function ProfessionalMapView({
  leads,
  profesionalLat,
  profesionalLng,
  currentLat,
  currentLng,
  selectedLeadId,
  onLeadClick,
  searchRadius = 10,
  avatarUrl,
}: ProfessionalMapViewProps) {
  const [popupInfo, setPopupInfo] = useState<Lead | null>(null);

  // Usar ubicación actual si está disponible, sino usar la del perfil
  const displayLat = currentLat || profesionalLat || 19.4326;
  const displayLng = currentLng || profesionalLng || -99.1332;
  const center: [number, number] = [displayLat, displayLng];

  // Filtrar leads con coordenadas válidas y calcular distancias
  const leadsWithDistance = useMemo(() => {
    return leads
      .filter(
        (lead) =>
          lead.ubicacion_lat != null &&
          lead.ubicacion_lng != null &&
          lead.estado === "nuevo"
      )
      .map((lead) => ({
        ...lead,
        distance: calculateDistance(
          displayLat,
          displayLng,
          lead.ubicacion_lat!,
          lead.ubicacion_lng!
        ),
      }))
      .filter((lead) => lead.distance <= searchRadius * 2) // Mostrar leads hasta 2x el radio de búsqueda
      .sort((a, b) => a.distance - b.distance);
  }, [leads, displayLat, displayLng, searchRadius]);

  // Convertir km a metros para el círculo de radio
  const radiusInMeters = searchRadius * 1000;

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        scrollWheelZoom={true}
      >
        <MapCenter center={center} zoom={12} />

        {/* Tile Layer de OpenStreetMap (gratuito) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Círculo de radio de búsqueda */}
        <Circle
          center={center}
          radius={radiusInMeters}
          pathOptions={{
            color: "#3B82F6",
            fillColor: "#3B82F6",
            fillOpacity: 0.1,
            weight: 2,
            opacity: 0.3,
          }}
        />

        {/* Marcador del profesional */}
        <Marker position={center} icon={createProfessionalIcon(avatarUrl)}>
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-gray-900 mb-1">Tu ubicación</h3>
              <p className="text-sm text-gray-600">
                {displayLat.toFixed(4)}, {displayLng.toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Marcadores de Leads */}
        {leadsWithDistance.map((lead) => {
          const isSelected = lead.id === selectedLeadId;
          const leadPosition: [number, number] = [
            lead.ubicacion_lat!,
            lead.ubicacion_lng!,
          ];

          return (
            <Marker
              key={lead.id}
              position={leadPosition}
              icon={createLeadIcon(isSelected, lead.distance)}
              eventHandlers={{
                click: () => {
                  setPopupInfo(lead);
                  onLeadClick?.(lead.id);
                },
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-bold text-gray-900 mb-1">
                    {lead.nombre_cliente || "Cliente Anónimo"}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {lead.descripcion_proyecto || "Sin descripción"}
                  </p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>📍 {lead.distance.toFixed(1)} km de distancia</div>
                    <div>
                      🕐{" "}
                      {new Date(lead.fecha_creacion).toLocaleDateString(
                        "es-MX",
                        {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </div>
                    {lead.servicio_solicitado && (
                      <div className="mt-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {lead.servicio_solicitado}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Leyenda del mapa */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000] text-xs">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
            <span>Tú</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span>Lead disponible</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-600 rounded-full"></div>
            <span>Lead seleccionado</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 border-2 border-blue-500 rounded-full bg-blue-100"></div>
            <span>Radio de búsqueda ({searchRadius} km)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
