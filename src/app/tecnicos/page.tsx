'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { supabase } from '@/lib/supabase/client';
import { Profesional } from '@/types/supabase';
import ProfessionalCard from '@/components/ProfessionalCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faMapMarkerAlt, 
  faStar, 
  faCheckCircle,
  faFilter,
  faSort,
  faUsers
} from '@fortawesome/free-solid-svg-icons';

// Categorías de servicios principales
const serviceCategories = [
  { id: 'plomeria', name: 'Plomería', icon: '🔧' },
  { id: 'electricidad', name: 'Electricidad', icon: '⚡' },
  { id: 'carpinteria', name: 'Carpintería', icon: '🔨' },
  { id: 'pintura', name: 'Pintura', icon: '🎨' },
  { id: 'aire_acondicionado', name: 'Aire Acondicionado', icon: '❄️' },
  { id: 'jardineria', name: 'Jardinería', icon: '🌱' },
  { id: 'limpieza', name: 'Limpieza', icon: '🧽' },
  { id: 'fumigacion', name: 'Fumigación', icon: '🐛' },
  { id: 'cctv', name: 'CCTV', icon: '📹' },
  { id: 'wifi', name: 'WiFi', icon: '📶' }
];

// Opciones de ordenamiento
const sortOptions = [
  { value: 'relevancia', label: 'Más Relevantes' },
  { value: 'calificacion', label: 'Mejor Calificados' },
  { value: 'reseñas', label: 'Más Reseñas' },
  { value: 'nombre', label: 'Nombre A-Z' }
];

export default function TecnicosPage() {
  // Estados principales
  const [professionals, setProfessionals] = useState<Profesional[]>([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState<Profesional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('relevancia');
  
  // Estados de UI
  const [showFilters, setShowFilters] = useState(false);

  // Función para obtener profesionales
  const fetchProfessionals = async () => {
    try {
      setIsLoading(true);
      // Usar el cliente de Supabase directamente
      
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'profesional')
        .not('full_name', 'is', null);

      // Aplicar filtros
      if (searchTerm) {
        query = query.ilike('full_name', `%${searchTerm}%`);
      }
      
      if (postalCode) {
        query = query.ilike('codigo_postal', `%${postalCode}%`);
      }
      
      if (selectedCategories.length > 0) {
        query = query.overlaps('areas_servicio', selectedCategories);
      }
      
      if (minRating > 0) {
        query = query.gte('calificacion_promedio', minRating);
      }
      
      if (showVerifiedOnly) {
        query = query.eq('is_verified', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching professionals:', error);
        return;
      }

      setProfessionals(data || []);
    } catch (error) {
      console.error('Error in fetchProfessionals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para ordenar profesionales
  const sortProfessionals = (professionals: Profesional[]) => {
    const sorted = [...professionals];
    
    switch (sortBy) {
      case 'calificacion':
        return sorted.sort((a, b) => (b.calificacion_promedio || 0) - (a.calificacion_promedio || 0));
      case 'reseñas':
        return sorted.sort((a, b) => (b.calificacion_promedio || 0) - (a.calificacion_promedio || 0));
      case 'nombre':
        return sorted.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
      default:
        return sorted;
    }
  };

  // Efecto para obtener datos
  useEffect(() => {
    fetchProfessionals();
  }, []);

  // Efecto para búsqueda en tiempo real
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm || postalCode) {
        fetchProfessionals();
      }
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm, postalCode]);

  // Efecto para aplicar filtros y ordenamiento
  useEffect(() => {
    let filtered = [...professionals];
    
    // Aplicar filtros adicionales
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(prof => 
        prof.areas_servicio && 
        selectedCategories.some(cat => prof.areas_servicio?.includes(cat))
      );
    }
    
    if (minRating > 0) {
      filtered = filtered.filter(prof => 
        (prof.calificacion_promedio || 0) >= minRating
      );
    }
    
    if (showVerifiedOnly) {
      // filtered = filtered.filter(prof => prof.is_verified);
      // Comentado temporalmente hasta que se añada is_verified al tipo Profesional
    }
    
    // Ordenar resultados
    const sorted = sortProfessionals(filtered);
    setFilteredProfessionals(sorted);
  }, [professionals, selectedCategories, minRating, showVerifiedOnly, sortBy]);

  // Manejar selección de categorías
  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Limpiar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setPostalCode('');
    setSelectedCategories([]);
    setMinRating(0);
    setShowVerifiedOnly(false);
    setSortBy('relevancia');
  };

  return (
    <>
      <Head>
        <title>Técnicos Verificados en México | Sumee App</title>
        <meta name="description" content="Encuentra técnicos verificados y calificados en tu zona. Plomeros, electricistas, carpinteros y más profesionales de confianza." />
        <meta name="keywords" content="técnicos, plomeros, electricistas, carpinteros, servicios, México, verificados" />
        <meta property="og:title" content="Técnicos Verificados en México | Sumee App" />
        <meta property="og:description" content="Encuentra técnicos verificados y calificados en tu zona. Plomeros, electricistas, carpinteros y más profesionales de confianza." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Técnicos Verificados en México | Sumee App" />
        <meta name="twitter:description" content="Encuentra técnicos verificados y calificados en tu zona. Plomeros, electricistas, carpinteros y más profesionales de confianza." />
      </Head>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Encuentra el Profesional Perfecto
              </h1>
              <p className="mt-2 text-gray-600">
                Técnicos verificados y calificados en tu zona
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FontAwesomeIcon icon={faFilter} />
              <span>Filtros</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Barra de Filtros - Columna Izquierda */}
          <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FontAwesomeIcon icon={faFilter} className="mr-2" />
                Filtros
              </h3>

              {/* Búsqueda por Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar por Nombre
                </label>
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faSearch} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Código Postal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código Postal
                </label>
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faMapMarkerAlt} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="Ej: 06700"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Categorías de Servicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Categorías
                </label>
                <div className="space-y-2">
                  {serviceCategories.map((category) => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => handleCategoryToggle(category.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        {category.icon} {category.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Calificación Mínima */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Calificación Mínima
                </label>
                <div className="space-y-2">
                  {[0, 3, 4, 5].map((rating) => (
                    <label key={rating} className="flex items-center">
                      <input
                        type="radio"
                        name="minRating"
                        checked={minRating === rating}
                        onChange={() => setMinRating(rating)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        {rating === 0 ? 'Todas las calificaciones' : `${rating}+ estrellas`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Solo Verificados */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showVerifiedOnly}
                    onChange={(e) => setShowVerifiedOnly(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700 flex items-center">
                    <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-green-600" />
                    Solo Verificados
                  </span>
                </label>
              </div>

              {/* Botón Limpiar Filtros */}
              <button
                onClick={clearFilters}
                className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>

          {/* Resultados - Columna Derecha */}
          <div className="lg:w-3/4">
            {/* Encabezado de Resultados */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {isLoading ? 'Cargando...' : `${filteredProfessionals.length} profesionales encontrados`}
                  </h2>
                  {!isLoading && (
                    <p className="text-gray-600 mt-1">
                      {selectedCategories.length > 0 && `Filtrado por: ${selectedCategories.join(', ')}`}
                    </p>
                  )}
                </div>
                
                {/* Ordenamiento */}
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faSort} className="text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Grid de Profesionales */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProfessionals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProfessionals.map((professional) => (
                  <ProfessionalCard 
                    key={professional.user_id} 
                    professional={professional} 
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <FontAwesomeIcon icon={faUsers} className="text-6xl text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No se encontraron profesionales
                </h3>
                <p className="text-gray-600 mb-6">
                  Intenta ajustar tus filtros de búsqueda
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Limpiar Filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}