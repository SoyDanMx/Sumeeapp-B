'use client';

import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRobot, 
  faUser, 
  faPaperPlane, 
  faSpinner, 
  faLightbulb,
  faWrench,
  faShieldAlt,
  faBuilding,
  faNetworkWired,
  faThermometerHalf,
  faBroom,
  faBug,
  faCog
} from '@fortawesome/free-solid-svg-icons';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  specialist?: string;
  timestamp: Date;
}

interface AIAdvisorProps {
  onServiceRecommendation?: (service: string) => void;
}

const SPECIALISTS = {
  'electricista': {
    name: 'Ingeniero Eléctrico',
    icon: faLightbulb,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    description: 'Especialista en instalaciones eléctricas, cortos circuitos y sistemas de energía'
  },
  'plomero': {
    name: 'Ingeniero en Sistemas Hidráulicos',
    icon: faWrench,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Experto en sistemas de agua, drenaje, fugas y instalaciones hidráulicas'
  },
  'construccion': {
    name: 'Ingeniero Civil',
    icon: faBuilding,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    description: 'Especialista en construcción, estructuras y proyectos arquitectónicos'
  },
  'tecnologia': {
    name: 'Especialista en Redes y Ciberseguridad',
    icon: faNetworkWired,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    description: 'Experto en sistemas de red, WiFi, CCTV y seguridad digital'
  },
  'hvac': {
    name: 'Ingeniero en HVAC',
    icon: faThermometerHalf,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    description: 'Especialista en climatización, aire acondicionado y sistemas de ventilación'
  },
  'limpieza': {
    name: 'Especialista en Servicios Generales',
    icon: faBroom,
    color: 'text-pink-500',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    description: 'Experto en limpieza, mantenimiento y servicios de jardinería'
  },
  'fumigacion': {
    name: 'Técnico en Fumigación',
    icon: faBug,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    description: 'Especialista en control de plagas y fumigación'
  },
  'general': {
    name: 'Asistente Técnico General',
    icon: faCog,
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    description: 'Asistente general para orientación en servicios técnicos'
  }
};

export default function AIAdvisor({ onServiceRecommendation }: AIAdvisorProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const detectSpecialist = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    // Detectar especialista basado en palabras clave
    if (lowerQuery.includes('electricidad') || lowerQuery.includes('corto') || lowerQuery.includes('luz') || lowerQuery.includes('energía')) {
      return 'electricista';
    }
    if (lowerQuery.includes('agua') || lowerQuery.includes('fuga') || lowerQuery.includes('plomería') || lowerQuery.includes('drenaje')) {
      return 'plomero';
    }
    if (lowerQuery.includes('construcción') || lowerQuery.includes('obra') || lowerQuery.includes('tablaroca') || lowerQuery.includes('albañilería')) {
      return 'construccion';
    }
    if (lowerQuery.includes('wifi') || lowerQuery.includes('red') || lowerQuery.includes('cctv') || lowerQuery.includes('cámara')) {
      return 'tecnologia';
    }
    if (lowerQuery.includes('aire') || lowerQuery.includes('clima') || lowerQuery.includes('ventilación') || lowerQuery.includes('calefacción')) {
      return 'hvac';
    }
    if (lowerQuery.includes('limpieza') || lowerQuery.includes('jardín') || lowerQuery.includes('mantenimiento')) {
      return 'limpieza';
    }
    if (lowerQuery.includes('plaga') || lowerQuery.includes('fumigación') || lowerQuery.includes('insecto')) {
      return 'fumigacion';
    }
    
    return 'general';
  };

  const generateAIResponse = async (query: string): Promise<{ response: string; specialist: string; recommendedService?: string }> => {
    const specialist = detectSpecialist(query);
    const specialistInfo = SPECIALISTS[specialist as keyof typeof SPECIALISTS];
    
    // Simular delay de IA
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const responses = {
      electricista: [
        "Como Ingeniero Eléctrico, te recomiendo revisar inmediatamente el sistema eléctrico. Los cortos circuitos pueden ser peligrosos. ¿El problema es en toda la casa o solo en un área específica?",
        "Para problemas eléctricos, es crucial identificar si es un corto circuito, sobrecarga o falla en el medidor. ¿Puedes describir exactamente qué está pasando?",
        "Los problemas eléctricos requieren atención inmediata por seguridad. Te recomiendo contactar a un electricista certificado para una evaluación completa."
      ],
      plomero: [
        "Como especialista en sistemas hidráulicos, las fugas de agua pueden causar daños estructurales. ¿La fuga es visible o sospechas que está en las tuberías ocultas?",
        "Para diagnosticar el problema hidráulico, necesito saber: ¿es agua fría o caliente? ¿En qué área de la casa? ¿Hay humedad en paredes o techos?",
        "Las fugas de agua requieren atención inmediata. Te recomiendo cerrar la llave de paso principal y contactar a un plomero especializado."
      ],
      construccion: [
        "Como Ingeniero Civil, para proyectos de construcción necesito evaluar la estructura existente. ¿Es una remodelación, ampliación o construcción nueva?",
        "Para trabajos de tablaroca y construcción, es importante verificar la estructura de soporte. ¿El área tiene humedad o problemas estructurales previos?",
        "Los proyectos de construcción requieren permisos y planos técnicos. Te recomiendo una consulta con un arquitecto o ingeniero civil."
      ],
      tecnologia: [
        "Como especialista en redes, para optimizar tu WiFi necesito conocer la estructura de tu casa y el tipo de router. ¿En qué áreas tienes señal débil?",
        "Para sistemas de CCTV y seguridad, es importante planificar la cobertura completa. ¿Qué áreas necesitas monitorear? ¿Interior, exterior o ambos?",
        "Los sistemas de red requieren configuración profesional. Te recomiendo una evaluación técnica para optimizar tu conectividad."
      ],
      hvac: [
        "Como Ingeniero en HVAC, para problemas de aire acondicionado necesito conocer el tipo de sistema, la antigüedad y los síntomas específicos.",
        "Los sistemas de climatización requieren mantenimiento regular. ¿Cuándo fue la última vez que se le dio mantenimiento al equipo?",
        "Para optimizar tu sistema HVAC, es importante evaluar la carga térmica del espacio. Te recomiendo una inspección técnica completa."
      ],
      limpieza: [
        "Como especialista en servicios generales, para limpieza profunda necesito conocer el tipo de superficie y el nivel de suciedad acumulada.",
        "Los servicios de jardinería requieren conocimiento de plantas y sistemas de riego. ¿Qué tipo de jardín tienes? ¿Tienes sistema de riego?",
        "Para mantenimiento general, es importante establecer un programa de limpieza regular. Te recomiendo un servicio profesional especializado."
      ],
      fumigacion: [
        "Como técnico en fumigación, para control de plagas necesito identificar el tipo de plaga y el nivel de infestación. ¿Qué tipo de insectos o roedores has visto?",
        "Las plagas requieren tratamiento especializado. ¿El problema es en interior, exterior o ambos? ¿Hay niños o mascotas en el hogar?",
        "Para fumigación efectiva, es importante usar productos seguros y profesionales. Te recomiendo un servicio especializado en control de plagas."
      ],
      general: [
        "Como asistente técnico, puedo ayudarte a identificar el servicio más adecuado para tu problema. ¿Podrías describir más detalles sobre lo que necesitas?",
        "Para brindarte la mejor asesoría, necesito entender mejor tu situación específica. ¿En qué área de tu hogar o negocio está el problema?",
        "Estoy aquí para ayudarte a encontrar la solución perfecta. ¿Hay algún síntoma específico o problema que hayas notado?"
      ]
    };

    const specialistResponses = responses[specialist as keyof typeof responses] || responses.general;
    const randomResponse = specialistResponses[Math.floor(Math.random() * specialistResponses.length)];
    
    // Detectar servicio recomendado
    let recommendedService = '';
    if (specialist === 'electricista') recommendedService = 'Electricidad';
    else if (specialist === 'plomero') recommendedService = 'Plomería';
    else if (specialist === 'construccion') recommendedService = 'Tablaroca';
    else if (specialist === 'tecnologia') recommendedService = 'CCTV y Seguridad';
    else if (specialist === 'hvac') recommendedService = 'Aire Acondicionado';
    else if (specialist === 'limpieza') recommendedService = 'Limpieza';
    else if (specialist === 'fumigacion') recommendedService = 'Fumigación';

    return {
      response: randomResponse,
      specialist,
      recommendedService: recommendedService || undefined
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const aiResponse = await generateAIResponse(inputValue);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.response,
        specialist: aiResponse.specialist,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Si hay un servicio recomendado, notificar al componente padre
      if (aiResponse.recommendedService && onServiceRecommendation) {
        onServiceRecommendation(aiResponse.recommendedService);
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
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

  const startNewConversation = () => {
    setMessages([]);
    setInputValue('');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Botón flotante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <FontAwesomeIcon icon={faRobot} className="text-2xl" />
        </button>
      )}

      {/* Chat Modal */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-2xl w-96 h-[500px] flex flex-col border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faRobot} />
              <span className="font-semibold">Asistente IA Técnico</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <FontAwesomeIcon icon={faLightbulb} className="text-3xl mb-3 text-blue-500" />
                <p className="text-sm">¡Hola! Soy tu asistente técnico especializado.</p>
                <p className="text-xs mt-2">Pregúntame sobre cualquier problema en tu hogar.</p>
              </div>
            )}

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
                  {message.role === 'assistant' && message.specialist && (
                    <div className={`inline-flex items-center space-x-1 mb-2 px-2 py-1 rounded-full text-xs ${SPECIALISTS[message.specialist as keyof typeof SPECIALISTS]?.bgColor} ${SPECIALISTS[message.specialist as keyof typeof SPECIALISTS]?.borderColor} border`}>
                      <FontAwesomeIcon 
                        icon={SPECIALISTS[message.specialist as keyof typeof SPECIALISTS]?.icon || faCog} 
                        className={`text-xs ${SPECIALISTS[message.specialist as keyof typeof SPECIALISTS]?.color}`}
                      />
                      <span className="text-xs font-medium">
                        {SPECIALISTS[message.specialist as keyof typeof SPECIALISTS]?.name}
                      </span>
                    </div>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin text-blue-500" />
                  <span className="ml-2 text-sm text-gray-600">Pensando...</span>
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
                placeholder="Describe tu problema técnico..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
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
      )}
    </div>
  );
}
