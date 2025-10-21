'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPaperPlane, faSpinner, faRobot, faCheckCircle, faDollarSign, faArrowRight } from '@fortawesome/free-solid-svg-icons';

interface AIResponse {
  service_id: string;
  service_name: string;
  diagnosis_summary: string;
  cost_estimate_range: string;
  next_step_cta: string;
}

interface AIDiagnosisChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIDiagnosisChatbot: React.FC<AIDiagnosisChatbotProps> = ({ isOpen, onClose }) => {
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState('');

  // Función mockup para simular la respuesta AI
  const mockAIApiCall = async (description: string): Promise<AIResponse> => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulación de lógica AI básica
    const lowerDescription = description.toLowerCase();
    
    if (lowerDescription.includes('agua') || lowerDescription.includes('grifo') || lowerDescription.includes('fuga') || lowerDescription.includes('plomer')) {
      return {
        service_id: "PLUMBER_001",
        service_name: "Servicio de Plomería - Fuga de Grifo",
        diagnosis_summary: "Diagnóstico Preliminar: Fuga de baja presión en empaque de grifo de lavabo. Requiere cambio de empaques o cartucho completo.",
        cost_estimate_range: "$500 MXN - $950 MXN (Solo mano de obra y materiales básicos)",
        next_step_cta: "Ver Plomeros Verificados para este Servicio"
      };
    } else if (lowerDescription.includes('luz') || lowerDescription.includes('electric') || lowerDescription.includes('cortocircuito')) {
      return {
        service_id: "ELECTRIC_001",
        service_name: "Servicio de Electricidad - Problemas de Iluminación",
        diagnosis_summary: "Diagnóstico Preliminar: Problema en conexión eléctrica o componente defectuoso. Requiere inspección técnica especializada.",
        cost_estimate_range: "$800 MXN - $1,500 MXN (Incluye diagnóstico y reparación básica)",
        next_step_cta: "Ver Electricistas Verificados para este Servicio"
      };
    } else if (lowerDescription.includes('clima') || lowerDescription.includes('aire') || lowerDescription.includes('minisplit')) {
      return {
        service_id: "HVAC_001",
        service_name: "Servicio de HVAC - Mantenimiento de Aire Acondicionado",
        diagnosis_summary: "Diagnóstico Preliminar: Mantenimiento preventivo o reparación de sistema de climatización. Verificación de componentes esenciales.",
        cost_estimate_range: "$1,200 MXN - $2,800 MXN (Mantenimiento completo incluido)",
        next_step_cta: "Ver Técnicos HVAC Verificados para este Servicio"
      };
    } else {
      return {
        service_id: "GENERAL_001",
        service_name: "Servicio General de Mantenimiento",
        diagnosis_summary: "Diagnóstico Preliminar: Requiere evaluación técnica presencial para determinar el alcance exacto del problema y solución más adecuada.",
        cost_estimate_range: "$300 MXN - $1,000 MXN (Consulta inicial y evaluación)",
        next_step_cta: "Ver Técnicos Verificados para este Servicio"
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setLoading(true);
    setResponse(null);
    setError('');

    try {
      const aiResponse = await mockAIApiCall(userInput);
      setResponse(aiResponse);
    } catch (err) {
      setError('Error al procesar tu consulta. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUserInput('');
    setResponse(null);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FontAwesomeIcon icon={faRobot} className="text-2xl" />
            <div>
              <h2 className="text-xl font-bold">SumeeBot</h2>
              <p className="text-blue-100 text-sm">Asistente de Diagnóstico IA</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-blue-200 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        </div>

        {/* Chat Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Bot Message */}
          <div className="mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FontAwesomeIcon icon={faRobot} className="text-blue-600 text-sm" />
              </div>
              <div className="bg-gray-50 rounded-lg p-4 max-w-[80%]">
                <p className="text-gray-800">
                  ¡Hola! Soy SumeeBot. Para ayudarte a encontrar al mejor profesional, cuéntame: 
                  <strong> ¿Cuál es exactamente el problema?</strong>
                </p>
                <p className="text-sm text-gray-600 mt-2 italic">
                  Ej: 'Mi lavabo gotea mucho' o 'La luz de la cocina parpadea'
                </p>
              </div>
            </div>
          </div>

          {/* User Input Form */}
          {!response && (
            <form onSubmit={handleSubmit} className="mb-6">
              <div className="flex items-center border border-gray-300 rounded-lg p-3 focus-within:ring-2 focus-within:ring-blue-500">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Describe tu problema aquí..."
                  className="w-full border-none focus:ring-0 text-gray-800 placeholder-gray-500"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !userInput.trim()}
                  className="bg-blue-600 text-white rounded-md p-2 ml-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <FontAwesomeIcon icon={faSpinner} spin />
                  ) : (
                    <FontAwesomeIcon icon={faPaperPlane} />
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Loading State */}
          {loading && (
            <div className="mb-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faSpinner} spin className="text-blue-600 text-sm" />
                </div>
                <div className="bg-gray-50 rounded-lg p-4 max-w-[80%]">
                  <p className="text-gray-800">Analizando tu problema y buscando la mejor solución...</p>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* AI Response */}
          {response && (
            <div className="space-y-4">
              {/* Bot Response */}
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-blue-600 text-sm" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-[80%] shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-2">{response.service_name}</h3>
                  <p className="text-gray-600 mb-3">{response.diagnosis_summary}</p>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <FontAwesomeIcon icon={faDollarSign} className="text-green-600" />
                      <span className="font-semibold text-green-800">Estimación de Costo:</span>
                    </div>
                    <p className="text-green-700 font-medium">{response.cost_estimate_range}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {response && (
          <div className="bg-gray-50 px-6 py-4 border-t">
            <button
              onClick={() => {
                // Aquí se integrará la navegación al flujo de contratación
                window.location.href = `/servicios?service_id=${response.service_id}`;
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
            >
              <span>{response.next_step_cta}</span>
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
