'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faFilter, 
  faStar, 
  faMapMarkerAlt, 
  faPhone,
  faUser,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { supabase } from '@/lib/supabase/client';
import { Profesional } from '@/types/supabase';
import Link from 'next/link';

function TecnicosContent() {
  const [tecnicos, setTecnicos] = useState<Profesional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const searchParams = useSearchParams();
  
  const servicioParam = searchParams.get('servicio') || '';

  useEffect(() => {
    fetchTecnicos();
  }, []);

  useEffect(() => {
    if (servicioParam) {
      setSelectedService(servicioParam);
    }
  }, [servicioParam]);

  const fetchTecnicos = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'profesional')
        .eq('status', 'active')
        .order('calificacion_promedio', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setTecnicos(data as Profesional[] || []);
    } catch (err: any) {
      console.error('Error fetching técnicos:', err);
      setError('Error al cargar los técnicos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTecnicos = tecnicos.filter(tecnico => {
    const matchesSearch = tecnico.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tecnico.profession?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesService = !selectedService || 
                          tecnico.areas_servicio?.includes(selectedService) ||
                          tecnico.profession?.toLowerCase().includes(selectedService.toLowerCase());
    
    return matchesSearch && matchesService;
  });

  const services = [
    'plomeria', 'electricidad', 'aire-acondicionado', 'cerrajeria', 
    'pintura', 'limpieza', 'jardineria', 'carpinteria', 'construccion', 
    'tablaroca', 'cctv', 'wifi', 'fumigacion'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-blue-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Cargando técnicos...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchTecnicos}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Intentar de Nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Técnicos Verificados en CDMX
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Encuentra el profesional perfecto para tu proyecto
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por nombre o especialidad..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Service Filter */}
              <div className="md:w-64">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
                  </div>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  >
                    <option value="">Todos los servicios</option>
                    {services.map(service => (
                      <option key={service} value={service}>
                        {service.charAt(0).toUpperCase() + service.slice(1).replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {filteredTecnicos.length} técnicos encontrados
              </h2>
              {selectedService && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  Filtrado por: {selectedService}
                </span>
              )}
            </div>

            {filteredTecnicos.length === 0 ? (
              <div className="text-center py-12">
                <FontAwesomeIcon icon={faUser} className="text-6xl text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No se encontraron técnicos
                </h3>
                <p className="text-gray-500 mb-4">
                  Intenta ajustar los filtros de búsqueda
                </p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedService('');
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Limpiar Filtros
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTecnicos.map((tecnico) => (
                  <div key={tecnico.user_id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          {tecnico.avatar_url ? (
                            <img 
                              src={tecnico.avatar_url} 
                              alt={tecnico.full_name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <FontAwesomeIcon icon={faUser} className="text-blue-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{tecnico.full_name}</h3>
                          <p className="text-sm text-gray-600">{tecnico.profession}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                        <span className="text-sm font-medium">
                          {tecnico.calificacion_promedio?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                    </div>

                    {/* Services */}
                    {tecnico.areas_servicio && tecnico.areas_servicio.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {tecnico.areas_servicio.slice(0, 3).map((area, index) => (
                            <span 
                              key={index}
                              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                            >
                              {area}
                            </span>
                          ))}
                          {tecnico.areas_servicio.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{tecnico.areas_servicio.length - 3} más
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Location */}
                    {tecnico.ubicacion_lat && tecnico.ubicacion_lng && (
                      <div className="flex items-center text-sm text-gray-600 mb-4">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                        <span>Disponible en CDMX</span>
                      </div>
                    )}

                    {/* Contact */}
                    <div className="flex space-x-2">
                      {tecnico.whatsapp && (
                        <a
                          href={`https://wa.me/${tecnico.whatsapp.replace(/[^\d]/g, '')}?text=Hola, te contacté por el servicio a través de Sumee App.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-center py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                        >
                          <FontAwesomeIcon icon={faWhatsapp} className="mr-2" />
                          WhatsApp
                        </a>
                      )}
                      {tecnico.phone && (
                        <a
                          href={`tel:${tecnico.phone}`}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                        >
                          <FontAwesomeIcon icon={faPhone} className="mr-2" />
                          Llamar
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function TecnicosPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-blue-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Cargando técnicos...</h2>
        </div>
      </div>
    }>
      <TecnicosContent />
    </Suspense>
  );
}
