'use client';

import React, { useState, useEffect } from 'react';
import { useLocation } from '@/context/LocationContext'; // Importa el hook de ubicación
import ProfessionalCard from '@/components/ProfessionalCard'; // Tu componente de tarjeta de profesional
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faMapMarkerAlt, faSearch } from '@fortawesome/free-solid-svg-icons';
import type { Profesional } from '@/types/supabase'; // Usar el tipo Profesional como fuente única de verdad
import { PageLayout } from '@/components/PageLayout'; // Asumo que usas PageLayout para el layout de la página

// AVISO: Asumiendo que useLocation() devuelve un objeto con { location: { lat, lon, address } }
// Se recomienda definir un tipo LocationContextType explícito para el contexto.

export default function ProfessionalsPage() {
  const { location: userSelectedLocation } = useLocation();
  const [professionals, setProfessionals] = useState<Profesional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNoLocationMessage, setShowNoLocationMessage] = useState(false);

  // Estados para filtros y búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfession, setSelectedProfession] = useState('');
  const [searchRadius, setSearchRadius] = useState<number>(10000);

  // Ubicación por defecto (Ciudad de México)
  const DEFAULT_LOCATION = {
    lat: 19.4326,
    lon: -99.1332,
    address: 'Ciudad de México, CDMX, México'
  };

  // Esta función se encarga de buscar profesionales
  const fetchProfessionals = async () => {
    setIsLoading(true);
    setError(null);
    setShowNoLocationMessage(false);

    // Usar ubicación del usuario o la ubicación por defecto
    const locationToUse = userSelectedLocation || DEFAULT_LOCATION;
    
    // Determinar si estamos usando ubicación por defecto
    if (!userSelectedLocation) {
      setShowNoLocationMessage(true);
    }

    // Construir la URL de la API con los parámetros de filtro
    const params = new URLSearchParams();
    params.append('lat', locationToUse.lat.toString());
    params.append('lon', locationToUse.lon.toString());
    params.append('radius', searchRadius.toString());
    
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
      setProfessionals(data.professionals || []);
    } catch (err: any) {
      console.error('Fetch professionals error:', err);
      // Si falla la API, intentar con Supabase directo
      await fetchProfessionalsDirectly(locationToUse);
    } finally {
      setIsLoading(false);
    }
  };

  // Función de respaldo para obtener profesionales directamente desde Supabase
  const fetchProfessionalsDirectly = async (location: typeof DEFAULT_LOCATION) => {
    try {
      // Importar supabase client dinámicamente
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      let query = supabase
        .from('profiles')
        .select('*')
        .not('profession', 'is', null)
        .not('profession', 'eq', '');

      if (selectedProfession) {
        query = query.eq('profession', selectedProfession);
      }

      if (searchQuery) {
        query = query.ilike('full_name', `%${searchQuery}%`);
      }

      const { data, error } = await query.limit(20);

      if (error) {
        throw error;
      }

      setProfessionals(data || []);
      setError(null);
    } catch (err: any) {
      setError('Error al cargar profesionales. Intenta recargar la página.');
      console.error('Direct fetch error:', err);
    }
  };

  // Efecto para cargar profesionales cuando la ubicación cambia o los filtros cambian
  useEffect(() => {
    // Cargar inmediatamente en el primer render, luego con debounce para cambios de filtros
    if (searchQuery === '' && selectedProfession === '') {
      // Primera carga
      fetchProfessionals();
    } else {
      // Debounce para búsquedas de texto
      const handler = setTimeout(() => {
        fetchProfessionals();
      }, 500);

      return () => {
        clearTimeout(handler);
      };
    }
  }, [userSelectedLocation, searchRadius, selectedProfession, searchQuery]); // Dependencias del efecto

  // Lista de profesiones disponibles
  const professionsList = [
    'Plomero', 'Electricista', 'Carpintero', 'Pintor', 'Limpieza', 
    'CCTV y Alarmas', 'Redes WiFi', 'Aire Acondicionado', 'Jardinería', 
    'Tablaroca', 'Fumigación', 'Construcción'
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
          
          {/* Información de ubicación */}
          <div className="mt-4 text-center">
            {showNoLocationMessage ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 flex items-center justify-center">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                  Mostrando profesionales de <span className="font-semibold ml-1">Ciudad de México</span> por defecto.
                  <span className="ml-2 text-blue-600 underline cursor-pointer" onClick={() => {
                    // Abrir el modal de selección de ubicación - esto requeriría acceso al context del header
                    alert('Por favor, selecciona tu ubicación desde el header para una búsqueda más precisa.');
                  }}>
                    Seleccionar tu ubicación
                  </span>
                </p>
              </div>
            ) : userSelectedLocation && userSelectedLocation.address ? (
              <p className="text-sm text-gray-600 flex items-center justify-center">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                Buscando profesionales cerca de: <span className="font-semibold ml-1">{userSelectedLocation.address.split(',')[0].trim()}</span>
              </p>
            ) : null}
          </div>
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
            <button 
              onClick={fetchProfessionals}
              className="block sm:inline ml-2 text-red-600 underline hover:text-red-800"
            >
              Intentar de nuevo
            </button>
          </div>
        )}

        {!isLoading && !error && professionals.length === 0 && (
          <div className="text-center py-10 text-gray-600">
            <p className="text-xl font-semibold mb-2">¡No se encontraron profesionales!</p>
            <p>Intenta ajustar tu ubicación o ampliar el radio de búsqueda.</p>
          </div>
        )}

        {!isLoading && !error && professionals.length > 0 && (
          <div>
            <div className="mb-6 text-center">
              <p className="text-gray-600">
                Se encontraron <span className="font-semibold text-blue-600">{professionals.length}</span> profesional{professionals.length !== 1 ? 'es' : ''}
                {selectedProfession && ` en ${selectedProfession}`}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {professionals.map((professional) => (
                <ProfessionalCard key={professional.user_id} professional={professional} />
              ))}
            </div>
            
            {professionals.length >= 20 && (
              <div className="text-center mt-8 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600">
                  Mostrando los primeros 20 resultados. Usa los filtros para refinar tu búsqueda.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}