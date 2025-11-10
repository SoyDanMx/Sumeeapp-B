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
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    // Esperar a que el mapa esté completamente inicializado usando whenReady
    if (!map) {
      return;
    }

    let cleanupTimer: NodeJS.Timeout | null = null;

    const checkMapReady = () => {
      try {
        // Verificar que el contenedor tenga dimensiones válidas
        const container = map.getContainer();
        if (
          !container ||
          container.offsetWidth === 0 ||
          container.offsetHeight === 0
        ) {
          // Si el contenedor no tiene dimensiones, esperar un poco más
          cleanupTimer = setTimeout(() => {
            const container = map.getContainer();
            if (
              container &&
              container.offsetWidth > 0 &&
              container.offsetHeight > 0
            ) {
              setIsMapReady(true);
            }
          }, 100);
          return;
        }

        setIsMapReady(true);
      } catch (error) {
        console.warn("Error verificando estado del mapa:", error);
      }
    };

    // Usar whenReady si está disponible, sino esperar un poco
    if (map.whenReady) {
      map.whenReady(checkMapReady);
    } else {
      cleanupTimer = setTimeout(checkMapReady, 100);
    }

    // Cleanup function
    return () => {
      if (cleanupTimer) {
        clearTimeout(cleanupTimer);
      }
    };
  }, [map]);

  useEffect(() => {
    // Solo intentar cambiar la vista cuando el mapa esté listo
    if (!isMapReady || !map) {
      return;
    }

    // Usar un pequeño delay para asegurar que el mapa esté completamente renderizado
    const timer = setTimeout(() => {
      try {
        // Verificar múltiples veces que el mapa esté listo
        if (!map || !map.getContainer) {
          return;
        }

        const container = map.getContainer();
        if (
          !container ||
          !container.parentElement ||
          container.offsetWidth === 0 ||
          container.offsetHeight === 0
        ) {
          return;
        }

        // Verificar que el mapa tenga las propiedades internas necesarias
        // Intentar acceder a getCenter puede fallar si el mapa no está completamente inicializado
        let currentCenter, currentZoom;
        try {
          currentCenter = map.getCenter();
          currentZoom = map.getZoom();
        } catch (e) {
          // Si no puede obtener el centro, el mapa no está listo
          return;
        }

        // Solo cambiar la vista si el centro o zoom han cambiado significativamente
        const centerChanged =
          Math.abs(currentCenter.lat - center[0]) > 0.0001 ||
          Math.abs(currentCenter.lng - center[1]) > 0.0001;
        const zoomChanged = Math.abs(currentZoom - zoom) > 0.5;

        if (centerChanged || zoomChanged) {
          map.setView(center, zoom, { animate: true });
        }
      } catch (error) {
        // Silenciar errores de inicialización, son esperados durante la carga
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "Error al cambiar la vista del mapa (puede ser normal durante la inicialización):",
            error
          );
        }
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [map, center, zoom, isMapReady]);

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
  const [serviceFilter, setServiceFilter] = useState<string | null>(null);

  // Usar ubicación actual si está disponible, sino usar la del perfil
  const displayLat = currentLat || profesionalLat || 19.4326;
  const displayLng = currentLng || profesionalLng || -99.1332;
  const center: [number, number] = [displayLat, displayLng];

  // Filtrar leads con coordenadas válidas y calcular distancias
  const leadsWithDistance = useMemo(() => {
    let filtered = leads
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
      .filter((lead) => lead.distance <= searchRadius * 2); // Mostrar leads hasta 2x el radio de búsqueda

    // Aplicar filtro de servicio si está activo
    if (serviceFilter) {
      filtered = filtered.filter(
        (lead) => lead.servicio_solicitado === serviceFilter
      );
    }

    return filtered.sort((a, b) => a.distance - b.distance);
  }, [leads, displayLat, displayLng, searchRadius, serviceFilter]);

  // Convertir km a metros para el círculo de radio
  const radiusInMeters = searchRadius * 1000;

  // Obtener lista única de servicios disponibles
  const availableServices = useMemo(() => {
    const services = new Set<string>();
    leads.forEach((lead) => {
      if (lead.servicio_solicitado) {
        services.add(lead.servicio_solicitado);
      }
    });
    return Array.from(services).sort();
  }, [leads]);

  // Estadísticas de leads
  const stats = useMemo(() => {
    return {
      total: leadsWithDistance.length,
      totalAvailable: leads.filter((l) => l.estado === "nuevo").length,
      nearest: leadsWithDistance[0]?.distance || 0,
      inRadius: leadsWithDistance.filter((l) => l.distance <= searchRadius).length,
    };
  }, [leadsWithDistance, leads, searchRadius]);

  return (
    <div className="relative w-full h-full flex flex-col rounded-lg overflow-hidden">
      {/* Barra superior con filtros y estadísticas */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-4 shadow-lg z-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Estadísticas */}
          <div className="flex items-center gap-4 text-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="font-bold">{stats.inRadius}</span>
              </div>
              <div className="text-sm">
                <div className="font-semibold">En radio</div>
                <div className="text-xs text-blue-100">{searchRadius} km</div>
              </div>
            </div>
            {stats.nearest > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-xs">📍</span>
                </div>
                <div className="text-sm">
                  <div className="font-semibold">Más cercano</div>
                  <div className="text-xs text-blue-100">{stats.nearest.toFixed(1)} km</div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="font-bold">{stats.totalAvailable}</span>
              </div>
              <div className="text-sm">
                <div className="font-semibold">Disponibles</div>
                <div className="text-xs text-blue-100">Total CDMX</div>
              </div>
            </div>
          </div>

          {/* Filtros de servicio */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setServiceFilter(null)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                !serviceFilter
                  ? "bg-white text-indigo-600 shadow-md"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              Todos ({stats.totalAvailable})
            </button>
            {availableServices.map((service) => {
              const count = leads.filter(
                (l) => l.servicio_solicitado === service && l.estado === "nuevo"
              ).length;
              return (
                <button
                  key={service}
                  onClick={() => setServiceFilter(service)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                    serviceFilter === service
                      ? "bg-white text-indigo-600 shadow-md"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  {service} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mapa */}
      <div className="relative flex-1 w-full">
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

        {/* Contador de leads visible */}
        {leadsWithDistance.length > 0 && (
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {leadsWithDistance.length}
              </div>
              <div className="text-xs text-gray-600">
                {serviceFilter ? "filtrados" : "en mapa"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
