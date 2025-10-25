'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons';

interface ServiceSearchProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  onAIConsultation?: () => void;
}

export default function ServiceSearch({ 
  onSearch, 
  placeholder = "Ej: Fuga en el baño, Instalar lámpara, Pintar habitación",
  onAIConsultation
}: ServiceSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      // Lógica de búsqueda futura:
      // 1. Filtrar servicios por nombre/descripción
      // 2. Abrir modal RequestServiceModal con servicio preseleccionado
      // 3. Navegar a página de resultados de búsqueda
      
      if (onSearch) {
        onSearch(searchQuery);
      } else {
        // Comportamiento por defecto: abrir modal de solicitud
        console.log('🔍 Búsqueda:', searchQuery);
        // TODO: Implementar apertura del modal RequestServiceModal
        // con el servicio más relevante preseleccionado
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full px-6 py-4 pr-16 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors shadow-sm"
            disabled={isSearching}
          />
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSearching ? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
            ) : (
              <FontAwesomeIcon icon={faSearch} />
            )}
          </button>
        </div>
      </form>
      
      {/* Sugerencias de búsqueda rápida */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {[
          'Fuga de agua',
          'Corto circuito',
          'Pintar casa',
          'Instalar aire acondicionado',
          'Limpieza profunda'
        ].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => setSearchQuery(suggestion)}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
      
      {/* Botón de consulta IA */}
      {onAIConsultation && (
        <div className="mt-4 text-center">
          <button
            onClick={onAIConsultation}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <span className="text-sm font-medium">🤖 Consultar con IA Especialista</span>
          </button>
        </div>
      )}
    </div>
  );
}
