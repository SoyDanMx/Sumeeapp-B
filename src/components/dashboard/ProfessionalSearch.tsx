'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabaseClient';
import type { Profile } from '@/types'; // Importamos el tipo centralizado
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { ProfessionalCard } from '@/components/ProfessionalCard';

// ⚠️ Asumimos la estructura del objeto de ubicación para consistencia en el useMemo
const DEFAULT_LOCATION = { lat: 19.4326, lng: -99.1332 }; // Centro de CDMX

// El mapa se importa dinámicamente aquí, donde se usa.
const MapDisplay = dynamic(() => import('@/components/MapDisplay'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full bg-gray-200 animate-pulse"><p>Cargando mapa...</p></div>
});

export const ProfessionalSearch = () => {
  const [service, setService] = useState('');
  const [area, setArea] = useState('');
  const [results, setResults] = useState<Profile[]>([]); // Tipado correcto en lugar de any[]
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // ✅ CORRECCIÓN: Aseguramos que todos los resultados tengan una propiedad `location`
  // válida para el mapa, usando la ubicación real o la por defecto.
  const professionalsWithLocation = useMemo(() => {
    return results.map((prof) => ({
      ...prof,
      // Si prof.location es null o undefined, usa DEFAULT_LOCATION
      location: (prof.location as any) || DEFAULT_LOCATION, 
    }));
  }, [results]);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    setResults([]);

    // Filtramos solo por perfiles que son profesionales (tienen profesión definida)
    let query = supabase.from('profiles').select('*').not('profession', 'is', null);

    if (service) {
      // Búsqueda de coincidencia parcial
      query = query.ilike('profession', `%${service}%`);
    }
    
    // ✅ CORRECCIÓN: Usamos `contains` para buscar en el array de 'work_zones'
    // Asumiendo que 'work_zones' es un array de texto (text[]) en Supabase/PostgreSQL.
    if (area) {
      // Buscar si el array 'work_zones' contiene la 'area' ingresada.
      query = query.contains('work_zones', [area]);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error en la búsqueda:", error.message);
    } else {
      setResults(data || []);
    }
    setLoading(false);
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Encuentra un Profesional en CDMX</h3>
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-8">
        <input 
          type="text" 
          placeholder="¿Qué servicio necesitas? Ej: Electricista" 
          value={service} 
          onChange={(e) => setService(e.target.value)} 
          className="flex-grow text-gray-900 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50" 
        />
        <input 
          type="text" 
          placeholder="¿En qué alcaldía? Ej: Coyoacán" 
          value={area} 
          onChange={(e) => setArea(e.target.value)} 
          className="flex-grow text-gray-900 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50" 
        />
        <button 
          type="submit" 
          disabled={loading} 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 disabled:bg-blue-400 transition-colors"
        >
          {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSearch} />}
          Encontrar Profesional
        </button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-[400px] lg:h-full rounded-lg overflow-hidden shadow-md border">
          <MapDisplay professionals={professionalsWithLocation} />
        </div>
        <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {loading && <div className="text-center text-gray-600 flex items-center justify-center h-full"><FontAwesomeIcon icon={faSpinner} spin size="2x" /></div>}
          {!loading && searched && results.length === 0 && (
            <div className="text-center text-gray-600 bg-gray-50 p-6 rounded-lg">
              <p className="font-semibold">No se encontraron resultados</p>
              <p className="text-sm">Intenta con otros términos de búsqueda.</p>
            </div>
          )}
          {!loading && results.length > 0 && (
            <div className="space-y-4">
              {results.map(profile => (
                <ProfessionalCard key={profile.id} profile={profile} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};