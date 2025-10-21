'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Profesional } from '@/types/supabase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

// Crear iconos personalizados para diferentes tipos de profesionales
const createProfessionalIcon = (profesional: Profesional) => {
  const iconColor = getServiceColor(profesional);
  
  return new L.DivIcon({
    html: `
      <div class="professional-marker" style="
        width: 50px;
        height: 50px;
        background: ${iconColor};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        position: relative;
      ">
        <div style="
          width: 35px;
          height: 35px;
          background: rgba(255,255,255,0.9);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: ${iconColor};
        ">
          ${profesional.full_name ? profesional.full_name[0].toUpperCase() : 'P'}
        </div>
        <div style="
          position: absolute;
          top: -5px;
          right: -5px;
          width: 16px;
          height: 16px;
          background: #10b981;
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: white;
        ">
          ✓
        </div>
      </div>
    `,
    className: 'custom-professional-icon',
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    popupAnchor: [0, -25]
  });
};

// Función para asignar colores según el servicio principal
const getServiceColor = (profesional: Profesional): string => {
  const areas = profesional.areas_servicio || [];
  const firstArea = areas[0]?.toLowerCase() || '';
  
  if (firstArea.includes('plomería') || firstArea.includes('plomeria')) return '#3b82f6'; // Azul
  if (firstArea.includes('electricidad') || firstArea.includes('electric')) return '#f59e0b'; // Amarillo
  if (firstArea.includes('hvac') || firstArea.includes('aire')) return '#ef4444'; // Rojo
  if (firstArea.includes('pintura') || firstArea.includes('paint')) return '#8b5cf6'; // Púrpura
  if (firstArea.includes('carpintería') || firstArea.includes('carpinteria')) return '#059669'; // Verde
  if (firstArea.includes('jardinería') || firstArea.includes('jardineria')) return '#10b981'; // Verde claro
  
  return '#6b7280'; // Gris por defecto
};

const getServiceEmoji = (profesional: Profesional): string => {
  const areas = profesional.areas_servicio || [];
  const firstArea = areas[0]?.toLowerCase() || '';
  
  if (firstArea.includes('plomería') || firstArea.includes('plomeria')) return '🔧';
  if (firstArea.includes('electricidad') || firstArea.includes('electric')) return '⚡';
  if (firstArea.includes('hvac') || firstArea.includes('aire')) return '❄️';
  if (firstArea.includes('pintura') || firstArea.includes('paint')) return '🎨';
  if (firstArea.includes('carpintería') || firstArea.includes('carpinteria')) return '🔨';
  if (firstArea.includes('jardinería') || firstArea.includes('jardineria')) return '🌱';
  
  return '👷';
};

interface ClientMapProps {
  profesionales: Profesional[];
  selectedProfesional: Profesional | null;
  onProfesionalClick: (profesional: Profesional) => void;
}

export default function ClientMapComponent({ 
  profesionales, 
  selectedProfesional, 
  onProfesionalClick 
}: ClientMapProps) {
  // Centro del mapa en CDMX
  const mapCenter: [number, number] = [19.4326, -99.1332];

  return (
    <MapContainer 
      center={mapCenter} 
      zoom={11} 
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Marcadores para profesionales */}
      {profesionales.map(profesional => {
        if (!profesional.ubicacion_lat || !profesional.ubicacion_lng) return null;

        const position: [number, number] = [
          profesional.ubicacion_lat,
          profesional.ubicacion_lng
        ];

        const rating = Math.min(Math.max(profesional.calificacion_promedio || 0, 0), 5);
        const stars = '⭐'.repeat(Math.round(rating));

        return (
          <Marker
            key={profesional.id}
            position={position}
            icon={createProfessionalIcon(profesional)}
            eventHandlers={{
              click: () => onProfesionalClick(profesional),
            }}
          >
            <Popup className="professional-popup">
              <div className="p-4 min-w-[250px]">
                {/* Header del popup */}
                <div className="flex items-center space-x-3 mb-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: getServiceColor(profesional) }}
                  >
                    {profesional.full_name ? profesional.full_name[0].toUpperCase() : 'P'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">
                      {profesional.full_name || 'Nombre no disponible'}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-500 text-sm">{stars}</span>
                      <span className="text-sm text-gray-600">
                        ({rating.toFixed(1)}/5.0)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Servicios */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <span className="text-lg mr-2">{getServiceEmoji(profesional)}</span>
                    Especialidades
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {profesional.areas_servicio?.slice(0, 3).map((area, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {area}
                      </span>
                    ))}
                    {profesional.areas_servicio && profesional.areas_servicio.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        +{profesional.areas_servicio.length - 3} más
                      </span>
                    )}
                  </div>
                </div>

                {/* Estado de verificación */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                    <span className="text-sm font-medium text-green-700">Verificado</span>
                  </div>
                  {profesional.experiencia_uber && (
                    <div className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      Uber Pro
                    </div>
                  )}
                </div>

                {/* Botón de acción */}
                <button 
                  onClick={() => onProfesionalClick(profesional)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Ver Perfil Completo
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
