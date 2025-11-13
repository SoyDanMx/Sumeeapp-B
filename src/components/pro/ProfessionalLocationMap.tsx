"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type LocationSource = "manual" | "gps" | "search" | "fallback";

interface ProfessionalLocationMapProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number, source?: LocationSource) => void;
  onReady?: () => void;
}

const createMarkerIcon = () =>
  L.divIcon({
    html: `
      <div style="
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        border: 4px solid white;
        box-shadow: 0 12px 30px rgba(99, 102, 241, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        transform: scale(1);
        transition: transform 0.2s ease;
      ">
        <span style="
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 12px solid #6366f1;
          filter: drop-shadow(0 6px 10px rgba(79, 70, 229, 0.35));
        "></span>
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4f46e5;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.5px;
        ">PRO</div>
      </div>
    `,
    iconSize: [48, 60],
    iconAnchor: [24, 54],
    popupAnchor: [0, -48],
    className: "professional-location-marker",
  });

function RecenterView({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView({ lat, lng }, map.getZoom(), {
      animate: true,
      duration: 0.6,
    });
  }, [lat, lng, map]);

  return null;
}

function ClickHandler({
  onChange,
}: {
  onChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(event) {
      onChange(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

function MapReadyHandler({ onReady }: { onReady?: () => void }) {
  const map = useMap();

  useEffect(() => {
    const id = setTimeout(() => {
      map.invalidateSize();
      onReady?.();
    }, 120);

    return () => clearTimeout(id);
  }, [map, onReady]);

  return null;
}

export default function ProfessionalLocationMap({
  lat,
  lng,
  onChange,
  onReady,
}: ProfessionalLocationMapProps) {
  const position = useMemo(() => [lat, lng] as [number, number], [lat, lng]);
  const markerIcon = useMemo(() => createMarkerIcon(), []);

  return (
    <MapContainer
      center={position}
      zoom={15}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <RecenterView lat={lat} lng={lng} />
      <MapReadyHandler onReady={onReady} />
      <ClickHandler
        onChange={(newLat, newLng) => onChange(newLat, newLng, "manual")}
      />

      <Circle
        center={position}
        radius={1200}
        pathOptions={{
          color: "#4f46e5",
          fillColor: "#6366f1",
          fillOpacity: 0.08,
          weight: 2,
          opacity: 0.4,
        }}
      />

      <Marker
        draggable
        icon={markerIcon}
        position={position}
        eventHandlers={{
          dragend: (event) => {
            const marker = event.target;
            const { lat: newLat, lng: newLng } = marker.getLatLng();
            onChange(newLat, newLng, "manual");
          },
        }}
      />
    </MapContainer>
  );
}

