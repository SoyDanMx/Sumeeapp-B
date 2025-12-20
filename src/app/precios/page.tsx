'use client';

import React, { useState, useEffect } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { PageHeader } from '@/components/PageHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDollarSign,
  faWrench,
  faLightbulb,
  faThermometerHalf,
  faPaintBrush,
  faBroom,
  faSeedling,
  faHammer,
  faHardHat,
  faCubes,
  faVideo,
  faWifi,
  faBug,
  faTools,
  faCheckCircle,
  faArrowRight,
  faSearch,
  faTag,
} from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

interface ServiceCatalogItem {
  id: string;
  discipline: string;
  service_name: string;
  price_type: 'fixed' | 'range' | 'starting_at';
  min_price: number;
  max_price: number | null;
  unit: string;
  includes_materials: boolean;
  description: string | null;
}

interface DisciplineConfig {
  name: string;
  icon: any;
  color: string;
  bgColor: string;
  slug: string;
}

const DISCIPLINE_CONFIG: Record<string, DisciplineConfig> = {
  'electricidad': {
    name: 'Electricidad',
    icon: faLightbulb,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    slug: 'electricidad',
  },
  'plomeria': {
    name: 'Plomería',
    icon: faWrench,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    slug: 'plomeria',
  },
  'montaje-armado': {
    name: 'Montaje y Armado',
    icon: faTools,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    slug: 'montaje-armado',
  },
  'aire-acondicionado': {
    name: 'Aire Acondicionado',
    icon: faThermometerHalf,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    slug: 'aire-acondicionado',
  },
  'pintura': {
    name: 'Pintura',
    icon: faPaintBrush,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    slug: 'pintura',
  },
  'limpieza': {
    name: 'Limpieza',
    icon: faBroom,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    slug: 'limpieza',
  },
  'jardineria': {
    name: 'Jardinería',
    icon: faSeedling,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    slug: 'jardineria',
  },
  'carpinteria': {
    name: 'Carpintería',
    icon: faHammer,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    slug: 'carpinteria',
  },
  'construccion': {
    name: 'Construcción',
    icon: faHardHat,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    slug: 'construccion',
  },
  'tablaroca': {
    name: 'Tablaroca',
    icon: faCubes,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    slug: 'tablaroca',
  },
  'cctv': {
    name: 'CCTV y Alarmas',
    icon: faVideo,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    slug: 'cctv',
  },
  'wifi': {
    name: 'Redes y WiFi',
    icon: faWifi,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    slug: 'wifi',
  },
  'fumigacion': {
    name: 'Fumigación',
    icon: faBug,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    slug: 'fumigacion',
  },
};

export default function PreciosPage() {
  const [services, setServices] = useState<Record<string, ServiceCatalogItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDisciplines, setExpandedDisciplines] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchServices() {
      try {
        const { data, error } = await supabase
          .from('service_catalog')
          .select('*')
          .eq('is_active', true)
          .order('discipline', { ascending: true })
          .order('service_name', { ascending: true });

        if (error) throw error;

        // Agrupar por disciplina
        const grouped: Record<string, ServiceCatalogItem[]> = {};
        data?.forEach((service: any) => {
          if (!grouped[service.discipline]) {
            grouped[service.discipline] = [];
          }
          grouped[service.discipline].push(service);
        });

        setServices(grouped);
        // Expandir todas las disciplinas por defecto
        setExpandedDisciplines(new Set(Object.keys(grouped)));
      } catch (err) {
        console.error('Error fetching services:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, []);

  const toggleDiscipline = (discipline: string) => {
    const newExpanded = new Set(expandedDisciplines);
    if (newExpanded.has(discipline)) {
      newExpanded.delete(discipline);
    } else {
      newExpanded.add(discipline);
    }
    setExpandedDisciplines(newExpanded);
  };

  const formatPrice = (service: ServiceCatalogItem) => {
    const price = `$${service.min_price.toLocaleString('es-MX')}`;
    const unitText = service.unit === 'metro lineal' ? ' por metro lineal' : service.unit === 'pieza' ? ' por pieza' : '';
    
    if (service.price_type === 'fixed') {
      return `${price} MXN${unitText}`;
    } else if (service.price_type === 'range' && service.max_price) {
      const maxPrice = `$${service.max_price.toLocaleString('es-MX')}`;
      return `${price} - ${maxPrice} MXN${unitText}`;
    } else {
      return `Desde ${price} MXN${unitText}`;
    }
  };

  const getServiceSlug = (serviceName: string, discipline: string): string => {
    // Convertir nombre a slug
    return serviceName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const filteredServices = Object.entries(services).filter(([discipline, items]) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      DISCIPLINE_CONFIG[discipline]?.name.toLowerCase().includes(query) ||
      items.some(item => item.service_name.toLowerCase().includes(query))
    );
  });

  const fixedPriceCount = Object.values(services).flat().filter(s => s.price_type === 'fixed').length;
  const totalServicesCount = Object.values(services).flat().length;

  return (
    <PageLayout>
      <div className="bg-gray-50 min-h-screen">
        {/* Hero Section - Extendido hacia arriba para cubrir el header */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white -mt-24 md:-mt-28 pt-24 md:pt-28 pb-12 md:pb-16 lg:pb-20 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto text-center">
              <PageHeader 
                icon={faDollarSign}
                title="Guía de Precios"
                subtitle="Precios transparentes y fijos. Sabes exactamente cuánto pagarás antes de contratar."
              />
              
              {/* Estadísticas destacadas - Base más ancha */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8 max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-2xl md:text-3xl font-bold">{totalServicesCount}+</div>
                  <div className="text-sm md:text-base text-white/90 mt-1">Servicios Disponibles</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-2xl md:text-3xl font-bold">{fixedPriceCount}</div>
                  <div className="text-sm md:text-base text-white/90 mt-1">Precios Fijos</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 col-span-2 md:col-span-1">
                  <div className="text-2xl md:text-3xl font-bold">100%</div>
                  <div className="text-sm md:text-base text-white/90 mt-1">Transparencia</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-6 md:-mt-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <FontAwesomeIcon 
                icon={faSearch} 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Buscar servicio o categoría..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:outline-none shadow-lg bg-white text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Services List */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">Cargando servicios...</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No se encontraron servicios.</p>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto space-y-4">
              {filteredServices.map(([discipline, items]) => {
                const config = DISCIPLINE_CONFIG[discipline];
                if (!config) return null;

                const isExpanded = expandedDisciplines.has(discipline);
                const fixedPriceServices = items.filter(s => s.price_type === 'fixed');

                return (
                  <div
                    key={discipline}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                  >
                    {/* Discipline Header */}
                    <button
                      onClick={() => toggleDiscipline(discipline)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`${config.bgColor} ${config.color} p-3 rounded-lg`}>
                          <FontAwesomeIcon icon={config.icon} className="text-xl" />
                        </div>
                        <div className="text-left">
                          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                            {config.name}
                          </h2>
                          <p className="text-sm text-gray-500 mt-1">
                            {items.length} servicio{items.length !== 1 ? 's' : ''}
                            {fixedPriceServices.length > 0 && (
                              <span className="ml-2 text-indigo-600 font-semibold">
                                • {fixedPriceServices.length} con precio fijo
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <FontAwesomeIcon
                        icon={faArrowRight}
                        className={`text-gray-400 transition-transform duration-200 ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                    </button>

                    {/* Services List */}
                    {isExpanded && (
                      <div className="border-t border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                          {items.map((service) => {
                            const serviceSlug = getServiceSlug(service.service_name, discipline);
                            const isFixed = service.price_type === 'fixed';

                            return (
                              <Link
                                key={service.id}
                                href={`/servicios/${config.slug}/${serviceSlug}`}
                                className="group block p-4 rounded-lg border-2 border-gray-100 hover:border-indigo-300 hover:shadow-md transition-all duration-200 bg-white"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="font-semibold text-gray-900 text-sm md:text-base group-hover:text-indigo-600 transition-colors flex-1">
                                    {service.service_name}
                                  </h3>
                                  {isFixed && (
                                    <span className="ml-2 flex-shrink-0">
                                      <FontAwesomeIcon
                                        icon={faTag}
                                        className="text-green-500 text-xs"
                                        title="Precio fijo"
                                      />
                                    </span>
                                  )}
                                </div>
                                <div className="mt-3">
                                  <div className={`text-lg md:text-xl font-bold ${isFixed ? 'text-indigo-600' : 'text-gray-700'}`}>
                                    {formatPrice(service)}
                                  </div>
                                  {service.description && (
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                      {service.description}
                                    </p>
                                  )}
                                  {service.includes_materials && (
                                    <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                      Incluye materiales
                                    </span>
                                  )}
                                </div>
                                <div className="mt-3 flex items-center text-xs text-indigo-600 group-hover:text-indigo-700">
                                  Ver detalles
                                  <FontAwesomeIcon icon={faArrowRight} className="ml-1 text-xs" />
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Nota sobre Actualización de Precios */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-t border-indigo-100 py-8 md:py-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border-l-4 border-indigo-600">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="bg-indigo-100 rounded-full p-3">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-indigo-600 text-xl" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                      Precios Actualizados Constantemente
                    </h3>
                    <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-3">
                      Todos nuestros precios están <strong>investigados y actualizados constantemente</strong> según los estándares del mercado mexicano, específicamente para la Ciudad de México y área metropolitana. Revisamos y ajustamos nuestros precios <strong>trimestralmente</strong> para asegurar que siempre reflejen el mercado actual y sean justos tanto para clientes como para profesionales.
                    </p>
                    <p className="text-gray-600 text-xs md:text-sm">
                      <strong>Última actualización:</strong> Enero 2025 | <strong>Próxima revisión:</strong> Abril 2025
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white border-t border-gray-200 py-12 md:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                ¿No encuentras el servicio que buscas?
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                Contáctanos y te ayudamos a encontrar el técnico perfecto para tu proyecto.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/dashboard/client"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
                >
                  Solicitar un Servicio
                  <FontAwesomeIcon icon={faArrowRight} />
                </Link>
                <Link
                  href="/blog/guia-precios-servicios-hogar-cdmx"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg border-2 border-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  Leer Guía Completa
                  <FontAwesomeIcon icon={faArrowRight} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

