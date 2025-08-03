// src/components/AIHelper.tsx
'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faSpinner, faBrain } from '@fortawesome/free-solid-svg-icons';
import { ProfessionalCard } from './ProfessionalCard';

// Simulación de datos que recibiríamos de la IA
const fakeApiResponse = {
  service_category: "Aire Acondicionado",
  recommendations: [
    { user_id: '1', full_name: 'Juan Pérez', profession: 'Técnico en A/C', work_area: 'Colonia Roma', avatar_url: null, rating: 5.0, estimated_price: '$1,500 - $2,500 MXN' },
    { user_id: '2', full_name: 'Sofía García', profession: 'Técnico en A/C', work_area: 'Condesa', avatar_url: null, rating: 4.9, estimated_price: '$1,600 - $2,600 MXN' },
  ]
};

export const AIHelper = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResponse(null);
    setError('');

    // En una implementación real, aquí llamaríamos a nuestra Supabase Edge Function
    // que a su vez llama a la API de Gemini.
    // Por ahora, simularemos la respuesta después de 2 segundos.
    setTimeout(() => {
      setResponse(fakeApiResponse);
      setLoading(false);
    }, 2000);
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
              <div className="text-center text-gray-600">
                <p>Analizando tu solicitud y buscando los mejores técnicos...</p>
              </div>
            )}
            {error && <p className="text-red-500 text-center">{error}</p>}
            {response && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Entendido. Para este trabajo, te recomendamos un especialista en: <span className="text-blue-600">{response.service_category}</span>
                </h3>
                <p className="text-gray-600 mb-6">Aquí están los profesionales mejor calificados que encontramos para ti:</p>
                <div className="space-y-4">
                  {response.recommendations.map((prof: any) => (
                    <div key={prof.user_id}>
                      <ProfessionalCard profile={prof} />
                      <div className="bg-gray-50 p-3 rounded-b-lg text-center">
                        <p className="font-semibold text-gray-700">Precio estimado: {prof.estimated_price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};