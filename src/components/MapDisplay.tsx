// src/components/MapDisplay.tsx
'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Solución para el ícono por defecto que a veces no carga con React-Leaflet
const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface MapDisplayProps {
    professionals: any[];
}

const MapDisplay: React.FC<MapDisplayProps> = ({ professionals }) => {
    return (
        <MapContainer center={[19.4326, -99.1332]} zoom={12} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {professionals.map(prof => (
                <Marker key={prof.id} position={[prof.location.lat, prof.location.lng]} icon={customIcon}>
                    <Popup>
                        <strong>{prof.profession}</strong><br />
                        Aprox. a 15 min de distancia.
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MapDisplay;