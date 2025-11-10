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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faUser,
  faStar,
  faWhatsapp,
} from "@fortawesome/free-solid-svg-icons";
import { calculateDistance } from "@/lib/calculateDistance";
import { supabase } from "@/lib/supabase/client";

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

// Interfaz para profesionales
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

// Componente para centrar el mapa
function MapCenter({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (map) {
      map.setView(center, zoom, { animate: true });
    }
  }, [map, center, zoom]);

  return null;
}

// Crear icono para el cliente
const createClientIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        width: 48px;
        height: 48px;
        background: #10b981;
        border: 4px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        position: relative;
      ">
        <svg width="24" height="24" fill="white" viewBox="0 0 20 20">
          <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L11 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c-.25.78-.072 1.637.486 2.29A3.989 3.989 0 007 16a3.989 3.989 0 002.332.884 1 1 0 00.852-.687l.818-2.552a1 1 0 00-.285-1.05A3.989 3.989 0 0010 11a3.989 3.989 0 00-2.667 1.019 1 1 0 00-.285 1.05l.82 2.553a1 1 0 001.737.687l.818-2.552c.25-.78.072-1.637-.486-2.29A3.989 3.989 0 007 10a3.989 3.989 0 00-2.332-.884 1 1 0 00-.852.687L3 12.355a1 1 0 00.285 1.05A3.989 3.989 0 005 14c.995 0 1.907-.365 2.667-1.019.56-.545.736-1.512.486-2.29l-.818-2.552a1 1 0 00-1.737-.687z"/>
        </svg>
        <div style="
          position: absolute;
          bottom: -6px;
          right: -6px;
          width: 16px;
          height: 16px;
          background: white;
          border: 2px solid #10b981;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%;"></div>
        </div>
      </div>
    `,
    className: "custom-client-icon",
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48],
  });
};

// Crear icono para profesionales
const createProfessionalIcon = (avatarUrl: string | null | undefined, isSelected: boolean) => {
  const size = isSelected ? 56 : 48;
  const borderWidth = isSelected ? 4 : 3;
  
  if (avatarUrl) {
    const escapedAvatarUrl = avatarUrl
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "&#39;")
      .replace(/"/g, "&quot;")
      .replace(/`/g, "&#96;");

    return L.divIcon({
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          border: ${borderWidth}px solid ${isSelected ? '#3b82f6' : 'white'};
          border-radius: 50%;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,${isSelected ? '0.5' : '0.3'});
          background: #6366f1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transform: ${isSelected ? 'scale(1.1)' : 'scale(1)'};
          transition: transform 0.2s;
        ">
          <img 
            src="${escapedAvatarUrl}" 
            alt="Profesional"
            style="
              width: 100%;
              height: 100%;
              object-fit: cover;
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
            <svg width="28" height="28" fill="white" viewBox="0 0 20 20">
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
            </svg>
          </div>
        </div>
      `,
      className: "custom-professional-icon",
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -(size / 2)],
    });
  }

  // Fallback: icono genérico
  return L.divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: #6366f1;
        border: ${borderWidth}px solid ${isSelected ? '#3b82f6' : 'white'};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,${isSelected ? '0.5' : '0.3'});
        transform: ${isSelected ? 'scale(1.1)' : 'scale(1)'};
        transition: transform 0.2s;
      ">
        <svg width="24" height="24" fill="white" viewBox="0 0 20 20">
          <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
        </svg>
      </div>
    `,
    className: "custom-professional-icon",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2)],
  });
};

interface ClientProfessionalsMapViewProps {
  clientLat: number;
  clientLng: number;
  searchRadius?: number; // Radio de búsqueda en km (por defecto 15km)
  professionFilter?: string | null; // Filtrar por profesión específica
  onProfessionalClick?: (professional: Professional) => void;
}

export default function ClientProfessionalsMapView({
  clientLat,
  clientLng,
  searchRadius = 15,
  professionFilter = null,
  onProfessionalClick,
}: ClientProfessionalsMapViewProps) {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null);
  const center: [number, number] = [clientLat, clientLng];

  // Obtener profesionales cercanos
  useEffect(() => {
    const fetchProfessionals = async () => {
      setLoading(true);
      try {
        // Query para obtener profesionales con ubicación
        let query = supabase
          .from('profiles')
          .select('user_id, full_name, email, avatar_url, profession, whatsapp, calificacion_promedio, ubicacion_lat, ubicacion_lng, areas_servicio')
          .eq('role', 'profesional')
          .not('ubicacion_lat', 'is', null)
          .not('ubicacion_lng', 'is', null);

        // Filtrar por profesión si está especificado
        if (professionFilter) {
          query = query.eq('profession', professionFilter);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching professionals:', error);
          return;
        }

        // Calcular distancias y filtrar por radio
        const professionalsWithDistance = (data || [])
          .map((prof) => ({
            ...prof,
            distance: calculateDistance(
              clientLat,
              clientLng,
              prof.ubicacion_lat!,
              prof.ubicacion_lng!
            ),
          }))
          .filter((prof) => prof.distance <= searchRadius)
          .sort((a, b) => a.distance - b.distance);

        setProfessionals(professionalsWithDistance);
      } catch (error) {
        console.error('Error fetching professionals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessionals();
  }, [clientLat, clientLng, searchRadius, professionFilter]);

  const radiusInMeters = searchRadius * 1000;

  const handleProfessionalClick = (prof: Professional) => {
    setSelectedProfessional(prof.user_id);
    onProfessionalClick?.(prof);
  };

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        scrollWheelZoom={true}
      >
        <MapCenter center={center} zoom={13} />

        {/* Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Círculo de radio de búsqueda */}
        <Circle
          center={center}
          radius={radiusInMeters}
          pathOptions={{
            color: "#10b981",
            fillColor: "#10b981",
            fillOpacity: 0.1,
            weight: 2,
            opacity: 0.4,
          }}
        />

        {/* Marcador del cliente */}
        <Marker position={center} icon={createClientIcon()}>
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-gray-900 mb-1">📍 Tu ubicación</h3>
              <p className="text-sm text-gray-600">
                {clientLat.toFixed(4)}, {clientLng.toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Marcadores de Profesionales */}
        {professionals.map((prof) => {
          if (!prof.ubicacion_lat || !prof.ubicacion_lng) return null;
          
          const isSelected = prof.user_id === selectedProfessional;
          const position: [number, number] = [prof.ubicacion_lat, prof.ubicacion_lng];

          return (
            <Marker
              key={prof.user_id}
              position={position}
              icon={createProfessionalIcon(prof.avatar_url, isSelected)}
              eventHandlers={{
                click: () => handleProfessionalClick(prof),
              }}
            >
              <Popup>
                <div className="p-3 min-w-[250px]">
                  {/* Avatar y Nombre */}
                  <div className="flex items-start gap-3 mb-3">
                    {prof.avatar_url ? (
                      <img
                        src={prof.avatar_url}
                        alt={prof.full_name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                        <FontAwesomeIcon icon={faUser} className="text-indigo-600 text-2xl" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">
                        {prof.full_name}
                      </h3>
                      {prof.profession && (
                        <p className="text-sm text-gray-600 mb-1">{prof.profession}</p>
                      )}
                      {prof.calificacion_promedio && prof.calificacion_promedio > 0 && (
                        <div className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faStar} className="text-yellow-500 text-xs" />
                          <span className="text-sm font-semibold text-gray-700">
                            {prof.calificacion_promedio.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Distancia */}
                  <div className="mb-3 px-3 py-2 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Distancia:</span>
                      <span className="text-sm font-bold text-blue-600">
                        {prof.distance?.toFixed(1)} km
                      </span>
                    </div>
                  </div>

                  {/* Áreas de Servicio */}
                  {prof.areas_servicio && prof.areas_servicio.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Especialidades:</p>
                      <div className="flex flex-wrap gap-1">
                        {prof.areas_servicio.slice(0, 3).map((area) => (
                          <span
                            key={area}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Botón de WhatsApp */}
                  {prof.whatsapp && (
                    <a
                      href={`https://wa.me/${prof.whatsapp}?text=Hola%20${encodeURIComponent(
                        prof.full_name
                      )}%2C%20te%20contacto%20desde%20Sumee%20App.%20Estoy%20interesado%20en%20tus%20servicios.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors"
                    >
                      <FontAwesomeIcon icon={faWhatsapp} className="mr-2" />
                      Contactar
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Leyenda */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000] text-xs">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
            <span>Tu ubicación</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-indigo-500 rounded-full"></div>
            <span>Profesionales ({professionals.length})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 border-2 border-emerald-500 rounded-full bg-emerald-100"></div>
            <span>Radio: {searchRadius} km</span>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-[1001]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Buscando profesionales cercanos...</p>
          </div>
        </div>
      )}
    </div>
  );
}

