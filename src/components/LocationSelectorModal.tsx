// src/components/LocationSelectorModal.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react'; // Para un modal robusto
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet'; // Importa el objeto global de Leaflet para iconos
import 'leaflet/dist/leaflet.css'; // Estilos CSS de Leaflet

// Importa los iconos de FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCrosshairs, faCheckCircle, faTimes } from '@fortawesome/free-solid-svg-icons';

// Fix para los iconos de marcador de Leaflet
// Esto es necesario porque Webpack/Next.js no siempre maneja bien los recursos estáticos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'leaflet/images/marker-icon-2x.png',
  iconUrl: 'leaflet/images/marker-icon.png',
  shadowUrl: 'leaflet/images/marker-shadow.png',
});


// Definimos un tipo para la ubicación seleccionada
export interface SelectedLocation {
  lat: number;
  lon: number;
  address: string;
}

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: SelectedLocation) => void;
  currentLocation?: SelectedLocation; // Ubicación actual si ya hay una
}

// Componente para manejar la lógica de interacción del mapa
function LocationMarker({ onLocationChange }: { onLocationChange: (lat: number, lon: number) => void }) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
    locationfound(e) { // Evento de geolocalización del navegador
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
    moveend() { // Cuando el usuario arrastra el mapa y lo suelta
      const center = map.getCenter();
      setPosition(center);
      onLocationChange(center.lat, center.lng);
    }
  });

  // Permitir arrastrar el marcador manualmente
  const markerRef = useRef(null);
  const eventHandlers = {
    dragend() {
      const marker = markerRef.current as any;
      if (marker != null) {
        const newPos = marker.getLatLng();
        setPosition(newPos);
        onLocationChange(newPos.lat, newPos.lng);
      }
    },
  }

  // Si se actualiza la posición desde fuera (ej. búsqueda o GPS inicial)
  useEffect(() => {
    if (position) {
      map.setView(position, 13); // Centra el mapa en la nueva posición
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position} ref={markerRef} draggable={true} />
  );
}


export const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({
  isOpen,
  onClose,
  onLocationSelect,
  currentLocation,
}) => {
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedLatLng, setSelectedLatLng] = useState<L.LatLngLiteral | null>(
    currentLocation ? { lat: currentLocation.lat, lng: currentLocation.lon } : null
  );
  const [selectedAddress, setSelectedAddress] = useState<string>(currentLocation?.address || '');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const mapCenter: L.LatLngLiteral = selectedLatLng || { lat: 19.4326, lng: -99.1332 }; // Centro inicial: Ciudad de México

  // Maneja la búsqueda de direcciones con Nominatim (autocompletado)
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 3) { // Mínimo 3 caracteres para buscar
      setSuggestions([]);
      return;
    }
    try {
      // Usar un proxy para Nominatim es una buena práctica para ocultar el User-Agent o si hay CORS.
      // Por simplicidad, aquí lo haremos directo. Recuerda respetar las políticas de uso de Nominatim.
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=mx&addressdetails=1`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(searchText);
    }, 500); // Debounce de 500ms
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchText, fetchSuggestions]);

  // Maneja la geolocalización del navegador
  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setSelectedLatLng({ lat: latitude, lng: longitude });
          await reverseGeocode(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('No se pudo obtener tu ubicación. Asegúrate de que el permiso de geolocalización esté habilitado.');
        }
      );
    } else {
      alert('Tu navegador no soporta geolocalización.');
    }
  };

  // Reverse geocoding: convierte lat/lon a dirección textual
  const reverseGeocode = useCallback(async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`
      );
      const data = await response.json();
      if (data && data.display_name) {
        setSelectedAddress(data.display_name);
        setSearchText(data.display_name); // Actualiza el campo de búsqueda con la dirección
      } else {
        setSelectedAddress('Dirección no encontrada');
      }
    } catch (error) {
      console.error('Error during reverse geocoding:', error);
      setSelectedAddress('Error al obtener la dirección');
    }
  }, []);

  // Maneja el cambio de posición desde el mapa
  const handleMapLocationChange = useCallback((lat: number, lon: number) => {
    setSelectedLatLng({ lat, lng: lon });
    reverseGeocode(lat, lon);
  }, [reverseGeocode]);

  // Maneja la selección de una sugerencia de autocompletado
  const handleSelectSuggestion = async (suggestion: any) => {
    setSelectedLatLng({ lat: parseFloat(suggestion.lat), lng: parseFloat(suggestion.lon) });
    setSelectedAddress(suggestion.display_name);
    setSearchText(suggestion.display_name);
    setSuggestions([]); // Limpiar sugerencias
  };

  // Maneja la confirmación de la ubicación
  const handleConfirmLocation = () => {
    if (selectedLatLng && selectedAddress) {
      onLocationSelect({
        lat: selectedLatLng.lat,
        lon: selectedLatLng.lng,
        address: selectedAddress,
      });
      onClose(); // Cierra el modal después de seleccionar
    } else {
      alert('Por favor, selecciona una ubicación en el mapa o busca una dirección.');
    }
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center">
                  Escribe la dirección de tu servicio
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <FontAwesomeIcon icon={faTimes} size="lg" />
                  </button>
                </Dialog.Title>
                <div className="mt-4">
                  <div className="relative mb-4">
                    <input
                      type="text"
                      className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Buscar dirección..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    {suggestions.length > 0 && searchText.length > 2 && (
                      <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-b-lg shadow-lg max-h-60 overflow-y-auto">
                        {suggestions.map((sug) => (
                          <li
                            key={sug.place_id}
                            className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                            onClick={() => handleSelectSuggestion(sug)}
                          >
                            {sug.display_name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <button
                    onClick={handleLocateMe}
                    className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mb-4"
                  >
                    <FontAwesomeIcon icon={faCrosshairs} className="mr-2" />
                    Usar mi ubicación actual
                  </button>

                  {/* Mapa Leaflet */}
                  <div className="relative w-full h-80 rounded-lg overflow-hidden border border-gray-300">
                    {typeof window !== 'undefined' && ( // Solo renderizar en el cliente
                      <MapContainer
                        center={mapCenter}
                        zoom={13}
                        scrollWheelZoom={true}
                        className="h-full w-full"
                        key={selectedLatLng ? `${selectedLatLng.lat}-${selectedLatLng.lng}` : 'default'} // Key para forzar re-renderizado del mapa si la posición cambia significativamente
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {selectedLatLng && (
                          <LocationMarker onLocationChange={handleMapLocationChange} />
                        )}
                        {/* Esto permite que LocationMarker reciba la posición inicial si ya hay una */}
                        {selectedLatLng && !searchText && ( // Solo si hay una ubicación inicial y no se está buscando
                           <LocationMarker onLocationChange={handleMapLocationChange} />
                        )}
                      </MapContainer>
                    )}
                    {selectedLatLng && (
                        <div className="absolute top-2 left-2 bg-white px-3 py-1.5 rounded-lg shadow-md text-sm font-medium text-gray-800 z-[1000]">
                            {selectedAddress || 'Cargando dirección...'}
                        </div>
                    )}
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={handleConfirmLocation}
                      disabled={!selectedLatLng} // Deshabilitar si no hay ubicación seleccionada
                    >
                      <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                      Confirmar Ubicación
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};