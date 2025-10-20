// src/components/MapComponent.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Importante para los estilos y markers!
import L from 'leaflet'; // Para personalizar los íconos y la manipulación de Leaflet

import { Lead, Profesional } from '@/types/supabase';

// --- Definición de Íconos ---
// Necesitas crear estos archivos en public/markers/
const leadIcon = new L.Icon({
    iconUrl: '/markers/pin_red.png', 
    iconSize: [25, 41],
    iconAnchor: [12, 41],
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
// --- FIN Definición de Íconos ---


interface Props {
  leads: Lead[];
  profesional: Profesional;
  selectedLeadId: string | null; // ID del lead seleccionado
  onLeadClick: (id: string) => void; // Función para manejar el clic en el mapa/pin
}

// Componente auxiliar para centrar el mapa en el lead seleccionado
const MapController = ({ selectedLeadId, leads }: Pick<Props, 'selectedLeadId' | 'leads'>) => {
    const map = useMap();

    useEffect(() => {
        if (selectedLeadId) {
            const lead = leads.find(l => l.id === selectedLeadId);
            if (lead && lead.ubicacion_lat && lead.ubicacion_lng) {
                // Centra el mapa suavemente en la ubicación del lead seleccionado
                map.flyTo([lead.ubicacion_lat, lead.ubicacion_lng], 15);
            }
        }
    }, [selectedLeadId, leads, map]);

    return null;
};


export default function MapComponent({ leads, profesional, selectedLeadId, onLeadClick }: Props) {
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
        >
            {/* Componente para controlar el centrado del mapa */}
            <MapController selectedLeadId={selectedLeadId} leads={leads} />
            
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
                        <strong className='text-indigo-700'>Tú Estás Aquí</strong><br/>
                        Ubicación actual del profesional: {profesional.full_name}
                    </Popup>
                </Marker>
            )}

            {/* Marcadores de Leads (Pins Rojos) */}
            {leads.map((lead) => (
                <Marker 
                    key={lead.id} 
                    position={[lead.ubicacion_lat, lead.ubicacion_lng]} 
                    // Si el lead está seleccionado, quizás cambiar el ícono para resaltarlo
                    icon={leadIcon} 
                    eventHandlers={{
                        click: () => {
                            // 💡 Lógica de Interactividad: Notifica a la página que este pin fue seleccionado
                            onLeadClick(lead.id); 
                        },
                    }}
                >
                    <Popup>
                        <strong className='text-red-700'>LEAD: {lead.nombre_cliente}</strong><br/>
                        Proyecto: {lead.descripcion_proyecto}<br/>
                        <a href={`https://wa.me/${lead.whatsapp}`} target="_blank" rel="noopener noreferrer" className='text-green-500 font-semibold'>
                            Contactar por WhatsApp
                        </a>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}