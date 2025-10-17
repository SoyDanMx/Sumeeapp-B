'use client';

import React, { useState, useEffect } from 'react';
import { useLocation } from '@/context/LocationContext'; // Importa el hook de ubicación
import { ProfessionalCard } from '@/components/ProfessionalCard'; // Tu componente de tarjeta de profesional
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faMapMarkerAlt, faSearch } from '@fortawesome/free-solid-svg-icons';
import type { Profile } from '@/types'; // ✅ CORRECCIÓN: Usamos el tipo Profile y el alias de ruta.
import { PageLayout } from '@/components/PageLayout'; // Asumo que usas PageLayout para el layout de la página

// AVISO: Asumiendo que useLocation() devuelve un objeto con { location: { lat, lon, address } }
// Se recomienda definir un tipo LocationContextType explícito para el contexto.

export default function ProfessionalsPage() {
  const { location: userSelectedLocation } = useLocation(); // Obtiene la ubicación del usuario del contexto
  const [professionals, setProfessionals] = useState<Profile[]>([]); // ✅ CORRECCIÓN: Usamos el tipo Profile[]
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para filtros y búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfession, setSelectedProfession] = useState(''); // Estado para el filtro de profesión
  const [searchRadius, setSearchRadius] = useState<number>(10000); // Radio por defecto: 10 km (10000 metros)

  // Esta función se encarga de buscar profesionales
  const fetchProfessionals = async () => {
    setIsLoading(true);
    setError(null);

    // Solo buscar si tenemos una ubicación seleccionada
    if (!userSelectedLocation || !userSelectedLocation.lat || !userSelectedLocation.lon) {
      // Si no hay una ubicación válida, muestra un mensaje y espera
      setError('Por favor, selecciona tu ubicación en el encabezado para encontrar profesionales.');
      setProfessionals([]); // Limpia profesionales si no hay ubicación
      setIsLoading(false);
      return;
    }

    // Construir la URL de la API con los parámetros de filtro
    const params = new URLSearchParams();
    params.append('lat', userSelectedLocation.lat.toString());
    params.append('lon', userSelectedLocation.lon.toString());
    params.append('radius', searchRadius.toString()); // Añadir el radio
    
    if (selectedProfession) {
      params.append('profession', selectedProfession);
    }
    if (searchQuery) {
      params.append('query', searchQuery);
    }

    try {
      const response = await fetch(`/api/professionals?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar profesionales.');
      }
      const data = await response.json();
      setProfessionals(data.professionals);
    } catch (err: any) {
      setError(err.message || 'Error desconocido al cargar profesionales.');
      console.error('Fetch professionals error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Efecto para cargar profesionales cuando la ubicación cambia o los filtros cambian
  useEffect(() => {
    // Añadir un pequeño retraso (debounce) para las búsquedas de texto
    const handler = setTimeout(() => {
      fetchProfessionals();
    }, 500); // Espera 500ms después de que el usuario deja de escribir/seleccionar

    return () => {
      clearTimeout(handler); // Limpia el timeout si el componente se desmonta o las dependencias cambian rápido
    };
  }, [userSelectedLocation, searchRadius, selectedProfession, searchQuery]); // Dependencias del efecto

  // Ejemplo de profesiones para el filtro (ajusta según tus datos reales en Supabase)
  const professionsList = [
    'Plomero', 'Electricista', 'Carpintero', 'Pintor', 'Limpieza', 'CCTV y Alarmas', 'Redes WiFi', 'Aire Acondicionado'
  ];

  return (
    <PageLayout> {/* Envuelve la página con PageLayout si lo usas */}
      <div className="container mx-auto px-4 py-8 mt-20"> {/* mt-20 para dejar espacio al header fijo */}
        <h1 className="text-3xl font-bold text-center mb-8">Profesionales Cerca de Ti</h1>

        {/* Barra de Filtros y Búsqueda */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                placeholder="Buscar por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex-1 w-full">
              <select
                className="w-full px-3 py-3 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                value={selectedProfession}
                onChange={(e) => setSelectedProfession(e.target.value)}
              >
                <option value="">Todas las profesiones</option>
                {professionsList.map(prof => (
                  <option key={prof} value={prof}>{prof}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 w-full">
              <select
                className="w-full px-3 py-3 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                value={searchRadius}
                onChange={(e) => setSearchRadius(parseFloat(e.target.value))}
              >
                <option value={5000}>5 km</option>
                <option value={10000}>10 km</option>
                <option value={25000}>25 km</option>
                <option value={50000}>50 km</option>
                <option value={100000}>100 km</option>
              </select>
            </div>
          </div>
          {/* Mostramos la ubicación si está disponible */}
          {userSelectedLocation && userSelectedLocation.address && (
            <p className="text-sm text-gray-600 mt-4 flex items-center justify-center text-center">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
              Buscando profesionales cerca de: <span className="font-semibold ml-1">{userSelectedLocation.address.split(',')[0].trim()}</span>
            </p>
          )}
        </div>

        {isLoading && (
          <div className="text-center py-10">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-blue-600 mb-4" />
            <p className="text-gray-700">Cargando profesionales...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        {!isLoading && !error && professionals.length === 0 && (
          <div className="text-center py-10 text-gray-600">
            <p className="text-xl font-semibold mb-2">¡No se encontraron profesionales!</p>
            <p>Intenta ajustar tu ubicación o ampliar el radio de búsqueda.</p>
          </div>
        )}

        {!isLoading && !error && professionals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professionals.map((professional) => (
              <ProfessionalCard key={professional.user_id} profile={professional} />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}