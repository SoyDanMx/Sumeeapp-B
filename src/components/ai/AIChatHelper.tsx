'use client';

import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRobot, 
  faUser, 
  faPaperPlane, 
  faSpinner, 
  faTimes,
  faLightbulb,
  faWrench,
  faThermometerHalf,
  faShieldAlt,
  faNetworkWired,
  faBroom,
  faBug,
  faCog,
  faBuilding,
  faCheckCircle,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  serviceSuggestion?: {
    name: string;
    slug: string;
    description: string;
    icon: any;
    color: string;
  };
}

interface AIChatHelperProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceSelected?: (service: any) => void;
  initialQuery?: string;
}

const SERVICE_SUGGESTIONS = {
  'plomeria': {
    name: 'Plomería',
    slug: 'plomeria',
    description: 'Reparaciones, instalaciones y mantenimiento de sistemas hidráulicos',
    icon: faWrench,
    color: 'text-blue-500'
  },
  'electricidad': {
    name: 'Electricidad',
    slug: 'electricidad',
    description: 'Instalaciones eléctricas, reparaciones y mantenimiento',
    icon: faLightbulb,
    color: 'text-yellow-500'
  },
  'aire-acondicionado': {
    name: 'Aire Acondicionado',
    slug: 'aire-acondicionado',
    description: 'Instalación, reparación y mantenimiento de sistemas de climatización',
    icon: faThermometerHalf,
    color: 'text-green-500'
  },
  'cctv': {
    name: 'CCTV y Seguridad',
    slug: 'cctv',
    description: 'Sistemas de seguridad, cámaras de vigilancia y alarmas',
    icon: faShieldAlt,
    color: 'text-purple-500'
  },
  'carpinteria': {
    name: 'Carpintería',
    slug: 'carpinteria',
    description: 'Trabajos en madera, muebles y estructuras',
    icon: faCog,
    color: 'text-orange-500'
  },
  'limpieza': {
    name: 'Limpieza',
    slug: 'limpieza',
    description: 'Servicios de limpieza residencial y comercial',
    icon: faBroom,
    color: 'text-pink-500'
  },
  'jardineria': {
    name: 'Jardinería',
    slug: 'jardineria',
    description: 'Mantenimiento de jardines y áreas verdes',
    icon: faBuilding,
    color: 'text-green-600'
  },
  'fumigacion': {
    name: 'Fumigación',
    slug: 'fumigacion',
    description: 'Control de plagas y fumigación profesional',
    icon: faBug,
    color: 'text-red-500'
  }
};

export default function AIChatHelper({ isOpen, onClose, onServiceSelected, initialQuery }: AIChatHelperProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Mensaje inicial cuando se abre el chat
      const initialMessage: Message = {
        id: '1',
        role: 'assistant',
        content: '¡Hola! Soy tu asistente de Sumee. 🏠\n\nDescribe brevemente el problema que tienes en tu hogar y te ayudaré a encontrar el servicio perfecto para solucionarlo.',
        timestamp: new Date()
      };
      setMessages([initialMessage]);
      
      // Si hay consulta inicial, auto-enviarla
      if (initialQuery) {
        setInputValue(initialQuery);
        setTimeout(() => {
          handleSendMessage(initialQuery);
        }, 1000);
      }
    }
  }, [isOpen, initialQuery]);

  const generateAIResponse = async (query: string): Promise<{ response: string; serviceSuggestion?: any }> => {
    // Simular delay de IA
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const lowerQuery = query.toLowerCase();
    
    // Detectar servicio basado en palabras clave
    let suggestedService = null;
    
    if (lowerQuery.includes('agua') || lowerQuery.includes('fuga') || lowerQuery.includes('baño') || 
        lowerQuery.includes('lavabo') || lowerQuery.includes('tinaco') || lowerQuery.includes('boiler')) {
      suggestedService = SERVICE_SUGGESTIONS.plomeria;
    } else if (lowerQuery.includes('luz') || lowerQuery.includes('eléctric') || lowerQuery.includes('corto') || 
               lowerQuery.includes('contacto') || lowerQuery.includes('cable')) {
      suggestedService = SERVICE_SUGGESTIONS.electricidad;
    } else if (lowerQuery.includes('aire') || lowerQuery.includes('clima') || lowerQuery.includes('frío') || 
               lowerQuery.includes('calor') || lowerQuery.includes('ventilador')) {
      suggestedService = SERVICE_SUGGESTIONS['aire-acondicionado'];
    } else if (lowerQuery.includes('cámara') || lowerQuery.includes('seguridad') || lowerQuery.includes('alarma') || 
               lowerQuery.includes('cctv') || lowerQuery.includes('vigilancia')) {
      suggestedService = SERVICE_SUGGESTIONS.cctv;
    } else if (lowerQuery.includes('madera') || lowerQuery.includes('mueble') || lowerQuery.includes('carpintería')) {
      suggestedService = SERVICE_SUGGESTIONS.carpinteria;
    } else if (lowerQuery.includes('limpieza') || lowerQuery.includes('limpio') || lowerQuery.includes('sucio')) {
      suggestedService = SERVICE_SUGGESTIONS.limpieza;
    } else if (lowerQuery.includes('jardín') || lowerQuery.includes('planta') || lowerQuery.includes('pasto')) {
      suggestedService = SERVICE_SUGGESTIONS.jardineria;
    } else if (lowerQuery.includes('plaga') || lowerQuery.includes('insecto') || lowerQuery.includes('fumigación')) {
      suggestedService = SERVICE_SUGGESTIONS.fumigacion;
    }

    if (suggestedService) {
      return {
        response: `Perfecto, entiendo tu problema. Basándome en tu descripción, parece que necesitas un servicio de **${suggestedService.name}**.\n\n${suggestedService.description}\n\n¿Es correcto? ¿Te gustaría que te conecte con nuestros profesionales especializados?`,
        serviceSuggestion: suggestedService
      };
    }

    return {
      response: 'Entiendo tu problema. Para darte la mejor recomendación, ¿podrías ser más específico sobre qué tipo de servicio necesitas? Por ejemplo: problemas de agua, electricidad, aire acondicionado, etc.'
    };
  };

  const handleSendMessage = async (query?: string) => {
    const messageToSend = query || inputValue;
    if (!messageToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const aiResponse = await generateAIResponse(messageToSend);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.response,
        timestamp: new Date(),
        serviceSuggestion: aiResponse.serviceSuggestion
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu consulta. Por favor, intenta de nuevo.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleServiceSelect = (service: any) => {
    if (onServiceSelected) {
      onServiceSelected(service);
    }
    onClose();
  };

  const startNewConversation = () => {
    setMessages([]);
    setInputValue('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faRobot} className="text-2xl" />
              <div>
                <h3 className="font-semibold text-lg">Asistente de Sumee</h3>
                <p className="text-sm opacity-90">Te ayudo a encontrar el servicio perfecto</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
                
                {/* Service Suggestion */}
                {message.serviceSuggestion && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <FontAwesomeIcon 
                        icon={message.serviceSuggestion.icon} 
                        className={`text-lg ${message.serviceSuggestion.color}`}
                      />
                      <span className="font-semibold text-gray-900">
                        {message.serviceSuggestion.name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {message.serviceSuggestion.description}
                    </p>
                    <button
                      onClick={() => handleServiceSelect(message.serviceSuggestion)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <span>Seleccionar este servicio</span>
                      <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-blue-500 mr-2" />
                <span className="text-sm text-gray-600">Analizando tu problema...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe tu problema..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </div>
          
          {messages.length > 0 && (
            <button
              onClick={startNewConversation}
              className="mt-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Nueva conversación
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
