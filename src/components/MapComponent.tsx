'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Lead, Profesional } from '@/types/supabase';

// (Asegúrate de tener un ícono por defecto para los marcadores)
const defaultIcon = new L.Icon({
    iconUrl: '/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

interface MapProps {
    leads: Lead[];
    profesional: Profesional;
    selectedLeadId: string | null;
    onLeadClick: (id: string) => void;
}

export default function MapComponent({ leads, profesional, selectedLeadId, onLeadClick }: MapProps) {
    const profesionalPosition: [number, number] = [
        profesional.ubicacion_lat ?? 19.4326, // Fallback a CDMX
        profesional.ubicacion_lng ?? -99.1332
    ];

    return (
        <MapContainer center={profesionalPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Marcador para el profesional */}
            <Marker position={profesionalPosition} icon={defaultIcon}>
                <Popup>Tu ubicación base</Popup>
            </Marker>

            {/* Marcadores para los Leads */}
            {leads
                // --- LA CORRECCIÓN CLAVE ESTÁ AQUÍ ---
                .filter(lead => lead.ubicacion_lat != null && lead.ubicacion_lng != null)
                .map(lead => (
                    <Marker
                        key={lead.id}
                        // Ahora es seguro usar `!` porque el filtro ya eliminó los nulos.
                        position={[lead.ubicacion_lat!, lead.ubicacion_lng!]}
                        icon={defaultIcon} // Puedes usar un ícono diferente para los leads
                        eventHandlers={{
                            click: () => onLeadClick(lead.id),
                        }}
                    >
                        <Popup>
                            <b>{lead.nombre_cliente}</b><br />
                            {lead.descripcion_proyecto}
                        </Popup>
                    </Marker>
                ))
            }
        </MapContainer>
    );
}