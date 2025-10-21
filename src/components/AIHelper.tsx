// src/components/AIHelper.tsx
'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faSpinner, faBrain, faCheckCircle, faLightbulb, faCog, faBox, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { ProfessionalCard } from './ProfessionalCard';
import Link from 'next/link';

interface AIResponse {
  service_category: string;
  technical_info: {
    title: string;
    description: string;
    technologies: string[];
    considerations: string[];
    kit_options?: string[];
  };
  recommendations: Array<{
    user_id: string;
    full_name: string | null;
    profession: string | null;
    calificacion_promedio: number | null;
    areas_servicio: string[] | null;
    whatsapp: string | null;
    numero_imss: string | null;
    experiencia_uber: boolean;
    años_experiencia_uber: number | null;
    work_zones: string[] | null;
    descripcion_perfil: string | null;
    avatar_url: string | null;
  }>;
  estimated_price_range: string;
}

export const AIHelper = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResponse(null);
    setError('');

    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const data: AIResponse = await res.json();
      setResponse(data);
    } catch (err) {
      console.error('Error calling AI assistant:', err);
      setError('Error al procesar tu consulta. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-gray-50" id="ai-helper">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <FontAwesomeIcon icon={faBrain} className="text-5xl text-blue-600 mb-4" />
          <h2 className="text-4xl font-bold text-gray-900">¿No sabes a quién necesitas?</h2>
          <p className="text-lg text-gray-600 mt-4">
            Describe tu problema y deja que nuestra IA te guíe al profesional perfecto para el trabajo.
          </p>
        </div>

        <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center border border-gray-300 rounded-lg p-2 focus-within:ring-2 focus-within:ring-blue-500">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ej: 'Deseo instalar un minisplit en mi domicilio...'"
                className="w-full border-none focus:ring-0 text-gray-800 placeholder-gray-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white rounded-md p-3 ml-2 disabled:bg-blue-400"
              >
                {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faPaperPlane} />}
              </button>
            </div>
          </form>

          {/* Área de Resultados */}
          <div className="mt-8">
            {loading && (
              <div className="text-center text-gray-600 py-8">
                <FontAwesomeIcon icon={faSpinner} spin className="text-2xl mb-4" />
                <p>Analizando tu consulta y buscando los mejores técnicos calificados...</p>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-red-600">{error}</p>
              </div>
            )}
            {response && (
              <div className="space-y-8">
                {/* Resumen del servicio */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-blue-600 mr-2" />
                    Te recomendamos un especialista en: <span className="text-blue-600 ml-1">{response.service_category}</span>
                  </h3>
                  <p className="text-gray-600">{response.technical_info.description}</p>
                </div>

                {/* Información Técnica */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FontAwesomeIcon icon={faLightbulb} className="text-yellow-500 mr-2" />
                    {response.technical_info.title}
                  </h4>
                  
                  {/* Tecnologías */}
                  <div className="mb-6">
                    <h5 className="font-semibold text-gray-700 mb-3 flex items-center">
                      <FontAwesomeIcon icon={faCog} className="text-gray-500 mr-2" />
                      Tecnologías disponibles:
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {response.technical_info.technologies.map((tech, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Consideraciones */}
                  <div className="mb-6">
                    <h5 className="font-semibold text-gray-700 mb-3">Consideraciones importantes:</h5>
                    <ul className="space-y-2">
                      {response.technical_info.considerations.map((consideration, index) => (
                        <li key={index} className="flex items-start">
                          <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                          <span className="text-gray-600">{consideration}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Kits disponibles */}
                  {response.technical_info.kit_options && response.technical_info.kit_options.length > 0 && (
                    <div className="mb-6">
                      <h5 className="font-semibold text-gray-700 mb-3 flex items-center">
                        <FontAwesomeIcon icon={faBox} className="text-gray-500 mr-2" />
                        Kits completos disponibles:
                      </h5>
                      <ul className="space-y-2">
                        {response.technical_info.kit_options.map((kit, index) => (
                          <li key={index} className="flex items-start">
                            <span className="bg-green-100 text-green-800 w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                              {index + 1}
                            </span>
                            <span className="text-gray-600">{kit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Rango de precios */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-gray-700 mb-2 flex items-center">
                      <FontAwesomeIcon icon={faDollarSign} className="text-green-500 mr-2" />
                      Rango de precios estimado:
                    </h5>
                    <p className="text-lg font-semibold text-green-600">{response.estimated_price_range}</p>
                  </div>
                </div>

                {/* Recomendaciones de Profesionales */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mr-2" />
                    Los mejores técnicos calificados para tu proyecto:
                  </h4>
                  <div className="space-y-4">
                    {response.recommendations.map((prof, index) => (
                      <div key={prof.user_id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h5 className="text-lg font-semibold text-gray-800">
                                #{index + 1} - {prof.full_name || 'Técnico'}
                              </h5>
                              <p className="text-blue-600 font-medium">{prof.profession}</p>
                            </div>
                            <div className="text-right">
                              {prof.calificacion_promedio && (
                                <div className="flex items-center space-x-1">
                                  <span className="text-yellow-500">⭐</span>
                                  <span className="font-semibold text-gray-800">
                                    {prof.calificacion_promedio.toFixed(1)}/5.0
                                  </span>
                                </div>
                              )}
                              {prof.experiencia_uber && (
                                <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mt-1">
                                  Uber Pro
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {prof.areas_servicio && prof.areas_servicio.length > 0 && (
                            <div className="mb-3">
                              <p className="text-sm text-gray-600 mb-2">Especialidades:</p>
                              <div className="flex flex-wrap gap-1">
                                {prof.areas_servicio.slice(0, 4).map((area, idx) => (
                                  <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                                    {area}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {prof.descripcion_perfil && (
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {prof.descripcion_perfil}
                            </p>
                          )}
                        </div>
                        
                        <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                          <div className="text-sm text-gray-600">
                            {prof.numero_imss && <span>IMSS: {prof.numero_imss}</span>}
                          </div>
                          <div className="flex space-x-2">
                            {prof.whatsapp && (
                              <a
                                href={`https://wa.me/${prof.whatsapp.replace(/[^\d]/g, '')}`}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                WhatsApp
                              </a>
                            )}
                            <Link 
                              href={`/profesional/${prof.user_id}`}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              Ver Perfil
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};