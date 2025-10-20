// src/components/MapComponent.tsx
'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // ¡Importante para los estilos y markers!
import L from 'leaflet'; // Para personalizar los íconos de los marcadores

import { Lead, Profesional } from '@/types/supabase';

// Definir los íconos personalizados (simulando Pin Rojo y Azul)
// Leaflet requiere definir la ruta al ícono de esta manera
const leadIcon = new L.Icon({
    iconUrl: '/markers/pin_red.png', // Necesitas crear esta imagen
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const profesionalIcon = new L.Icon({
    iconUrl: '/markers/pin_blue.png', // Necesitas crear esta imagen
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface Props {
  leads: Lead[];
  profesional: Profesional;
}

export default function MapComponent({ leads, profesional }: Props) {
    // Coordenadas de inicio: Centrar en el profesional o en el primer lead
    const initialLat = profesional.ubicacion_lat || leads[0]?.ubicacion_lat || 19.4326; 
    const initialLng = profesional.ubicacion_lng || leads[0]?.ubicacion_lng || -99.1332;

    const position: [number, number] = [initialLat, initialLng];

    // Verifica que las coordenadas existan y sean válidas antes de renderizar
    if (!initialLat || !initialLng) {
        return <div className="p-8">No se pudo cargar la ubicación inicial del mapa.</div>;
    }

    return (
        <MapContainer 
            center={position} 
            zoom={12} 
            style={{ width: '100%', height: '100%' }}
            // MapContainer necesita ser el componente raíz si está en un Client Component
        >
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
                        Ubicación actual del profesional: {profesional.full_name}
                    </Popup>
                </Marker>
            )}

            {/* Marcadores de Leads (Pins Rojos) */}
            {leads.map((lead) => (
                <Marker 
                    key={lead.id} 
                    position={[lead.ubicacion_lat, lead.ubicacion_lng]} 
                    icon={leadIcon}
                >
                    <Popup>
                        <strong className='text-red-700'>LEAD: {lead.nombre_cliente}</strong><br/>
                        Proyecto: {lead.descripcion_proyecto}<br/>
                        <a href={`https://wa.me/${lead.whatsapp}`} target="_blank" rel="noopener noreferrer" className='text-green-500'>
                            Contactar por WhatsApp
                        </a>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
