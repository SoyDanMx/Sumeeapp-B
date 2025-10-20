'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // ¡Importante para los estilos y markers!
import L from 'leaflet'; // Para personalizar los íconos de los marcadores

import { Lead, Profesional } from '@/types/supabase';

// Definir los íconos personalizados (simulando Pin Rojo y Azul)
// Nota: Estos íconos deben existir en tu carpeta public/markers/
const leadIcon = new L.Icon({
    iconUrl: '/markers/pin_red.png', 
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const selectedLeadIcon = new L.Icon({
    iconUrl: '/markers/pin_orange.png', // Nuevo ícono para el lead seleccionado (por ejemplo, naranja)
    iconSize: [30, 41],
    iconAnchor: [15, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const profesionalIcon = new L.Icon({
    iconUrl: '/markers/pin_blue.png', 
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface Props {
  leads: Lead[];
  profesional: Profesional;
  selectedLeadId: string | null; // ID del lead actualmente seleccionado (desde la lista o el mapa)
  onLeadClick: (leadId: string) => void; // Función para notificar a la página principal
}

// Componente auxiliar para forzar el centro del mapa
const MapCenterUpdater = ({ position }: { position: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        if (position[0] !== 0 && position[1] !== 0) {
             map.setView(position, map.getZoom());
        }
    }, [position, map]);
    return null;
};


export default function MapComponent({ leads, profesional, selectedLeadId, onLeadClick }: Props) {
    
    // Si hay un lead seleccionado, centramos el mapa en él; si no, en el profesional.
    const selectedLead = leads.find(l => l.id === selectedLeadId);

    const initialLat = selectedLead?.ubicacion_lat || profesional.ubicacion_lat || 19.4326; 
    const initialLng = selectedLead?.ubicacion_lng || profesional.ubicacion_lng || -99.1332;

    const position: [number, number] = [initialLat, initialLng];
    
    const [mapInitialized, setMapInitialized] = useState(false);

    // Verifica que las coordenadas existan y sean válidas antes de renderizar
    if (!initialLat || !initialLng) {
        return <div className="p-8">No se pudo cargar la ubicación inicial del mapa.</div>;
    }

    return (
        <MapContainer 
            center={position} 
            zoom={12} 
            style={{ width: '100%', height: '100%' }}
            // El key fuerza la re-inicialización del mapa si la posición inicial cambia drásticamente
            key={mapInitialized ? 'map-loaded' : 'map-loading'} 
            whenReady={() => setMapInitialized(true)}
        >
            {/* Permite mover el centro del mapa al hacer clic en la lista */}
            <MapCenterUpdater position={position} />

            {/* Capa de OpenStreetMap */}
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Marcador del Profesional (Pin Azul) */}
            {profesional.ubicacion_lat && profesional.ubicacion_lng && (
                <Marker 
                    position={[profesional.ubicacion_lat, profesional.ubicacion_lng]} 
                    icon={profesionalIcon}
                >
                    <Popup>
                        <strong className='text-indigo-600'>{profesional.full_name}</strong><br/>
                        Ubicación Base del Profesional
                    </Popup>
                </Marker>
            )}

            {/* Marcadores de Leads (Pins Rojos/Naranja) */}
            {leads.map((lead) => {
                const isSelected = lead.id === selectedLeadId;
                const iconToUse = isSelected ? selectedLeadIcon : leadIcon;
                const whatsappLink = `https://wa.me/${lead.whatsapp}?text=Hola%20${lead.nombre_cliente},%20soy%20tu%20profesional%20de%20SumeeApp.`;
                
                return (
                    <Marker 
                        key={lead.id} 
                        position={[lead.ubicacion_lat, lead.ubicacion_lng]} 
                        icon={iconToUse}
                        // 🚨 INTERACCIÓN CLAVE: Notificar a la página principal sobre el clic
                        eventHandlers={{
                            click: () => onLeadClick(lead.id),
                        }}
                    >
                        {/* Popup siempre visible para el lead seleccionado, si lo deseas */}
                        {isSelected && (
                            <Popup>
                                <strong className='text-red-700'>LEAD: {lead.nombre_cliente}</strong><br/>
                                Proyecto: {lead.descripcion_proyecto}<br/>
                                Estado: <span className='font-semibold'>{lead.estado}</span>
                                <div className='mt-2'>
                                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className='text-green-600 font-medium'>
                                        Contactar por WhatsApp
                                    </a>
                                </div>
                            </Popup>
                        )}
                    </Marker>
                );
            })}
        </MapContainer>
    );
}
