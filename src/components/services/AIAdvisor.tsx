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
    
    // Detectar especialista basado en palabras clave más específicas
    if (lowerQuery.includes('electricidad') || lowerQuery.includes('corto') || lowerQuery.includes('luz') || 
        lowerQuery.includes('energía') || lowerQuery.includes('contacto') || lowerQuery.includes('cable') ||
        lowerQuery.includes('tablero') || lowerQuery.includes('luminaria') || lowerQuery.includes('corto circuito') ||
        lowerQuery.includes('disyuntor') || lowerQuery.includes('chispa') || lowerQuery.includes('quemado')) {
      return 'electricista';
    }
    if (lowerQuery.includes('agua') || lowerQuery.includes('fuga') || lowerQuery.includes('plomería') || 
        lowerQuery.includes('drenaje') || lowerQuery.includes('baño') || lowerQuery.includes('lavabo') ||
        lowerQuery.includes('tinaco') || lowerQuery.includes('boiler') || lowerQuery.includes('llave') ||
        lowerQuery.includes('tubería') || lowerQuery.includes('desagüe') || lowerQuery.includes('sanitario') ||
        lowerQuery.includes('wc') || lowerQuery.includes('regadera') || lowerQuery.includes('grifo')) {
      return 'plomero';
    }
    if (lowerQuery.includes('construcción') || lowerQuery.includes('obra') || lowerQuery.includes('tablaroca') || 
        lowerQuery.includes('albañilería') || lowerQuery.includes('muro') || lowerQuery.includes('pared') ||
        lowerQuery.includes('cemento') || lowerQuery.includes('ladrillo') || lowerQuery.includes('yeso') ||
        lowerQuery.includes('pintura') || lowerQuery.includes('remodelación') || lowerQuery.includes('ampliación')) {
      return 'construccion';
    }
    if (lowerQuery.includes('wifi') || lowerQuery.includes('red') || lowerQuery.includes('cctv') || 
        lowerQuery.includes('cámara') || lowerQuery.includes('seguridad') || lowerQuery.includes('alarma') ||
        lowerQuery.includes('monitoreo') || lowerQuery.includes('vigilancia') || lowerQuery.includes('router') ||
        lowerQuery.includes('internet') || lowerQuery.includes('señal') || lowerQuery.includes('conectividad')) {
      return 'tecnologia';
    }
    if (lowerQuery.includes('aire') || lowerQuery.includes('clima') || lowerQuery.includes('ventilación') || 
        lowerQuery.includes('calefacción') || lowerQuery.includes('frío') || lowerQuery.includes('calor') ||
        lowerQuery.includes('minisplit') || lowerQuery.includes('compresor') || lowerQuery.includes('refrigeración') ||
        lowerQuery.includes('ventilador') || lowerQuery.includes('acondicionado') || lowerQuery.includes('hvac')) {
      return 'hvac';
    }
    if (lowerQuery.includes('limpieza') || lowerQuery.includes('limpio') || lowerQuery.includes('sucio') ||
        lowerQuery.includes('lavado') || lowerQuery.includes('limpiar') || lowerQuery.includes('mantenimiento') ||
        lowerQuery.includes('jardín') || lowerQuery.includes('planta') || lowerQuery.includes('pasto') ||
        lowerQuery.includes('césped') || lowerQuery.includes('verde') || lowerQuery.includes('jardinería') ||
        lowerQuery.includes('poda') || lowerQuery.includes('riego') || lowerQuery.includes('fertilización')) {
      return 'limpieza';
    }
    if (lowerQuery.includes('plaga') || lowerQuery.includes('fumigación') || lowerQuery.includes('insecto') ||
        lowerQuery.includes('cucaracha') || lowerQuery.includes('rata') || lowerQuery.includes('mosquito') ||
        lowerQuery.includes('control de plagas') || lowerQuery.includes('roedor') || lowerQuery.includes('hormiga') ||
        lowerQuery.includes('araña') || lowerQuery.includes('termita')) {
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
        "🔌 Como Ingeniero Eléctrico certificado, puedo ayudarte a diagnosticar el problema. Para darte la mejor asesoría, necesito más detalles: ¿El problema es en toda la casa o solo en un área específica? ¿Hay olor a quemado?",
        "⚡ Los problemas eléctricos pueden ser peligrosos. ¿Puedes describir exactamente qué está pasando? ¿Se fue la luz completamente o hay chispas? ¿Cuándo empezó el problema?",
        "🔧 Para una evaluación segura, necesito saber: ¿El tablero principal tiene disyuntores disparados? ¿Hay humedad cerca de los contactos? ¿Es un problema nuevo o recurrente?"
      ],
      plomero: [
        "🚰 Como especialista en sistemas hidráulicos, las fugas pueden causar daños graves. ¿La fuga es visible o sospechas que está oculta? ¿En qué área de la casa?",
        "💧 Para diagnosticar correctamente, necesito saber: ¿Es agua fría o caliente? ¿Hay humedad en paredes o techos? ¿El problema es constante o intermitente?",
        "🔧 Las fugas requieren atención inmediata. ¿Puedes cerrar la llave de paso principal? ¿Hay agua acumulándose en algún lugar específico? ¿El problema empezó recientemente?"
      ],
      construccion: [
        "🏗️ Como Ingeniero Civil, para proyectos de construcción necesito evaluar la estructura. ¿Es remodelación, ampliación o construcción nueva? ¿Tienes planos?",
        "📐 Para trabajos de tablaroca, es importante verificar la estructura. ¿El área tiene humedad o problemas previos? ¿Qué tipo de acabado necesitas?",
        "🏠 Los proyectos requieren planificación técnica. ¿Cuál es el área aproximada? ¿Necesitas permisos? ¿Hay restricciones de espacio o altura?"
      ],
      tecnologia: [
        "📡 Como especialista en redes, para optimizar tu WiFi necesito conocer tu casa. ¿En qué áreas tienes señal débil? ¿Cuántos dispositivos conectas?",
        "🔒 Para sistemas de CCTV, es importante planificar la cobertura. ¿Qué áreas necesitas monitorear? ¿Interior, exterior o ambos? ¿Cuántas cámaras necesitas?",
        "💻 Los sistemas de red requieren configuración profesional. ¿Qué tipo de router tienes? ¿Necesitas cobertura en todo el hogar? ¿Hay áreas con señal nula?"
      ],
      hvac: [
        "❄️ Como Ingeniero en HVAC, para problemas de aire acondicionado necesito conocer tu sistema. ¿Qué tipo de equipo tienes? ¿Cuándo fue el último mantenimiento?",
        "🌡️ Los sistemas requieren mantenimiento regular. ¿El problema es que no enfría, hace ruido, o consume mucha energía? ¿En qué áreas tienes problemas?",
        "🔧 Para optimizar tu sistema, necesito evaluar la carga térmica. ¿Cuántos metros cuadrados cubre? ¿Hay ventanas grandes o techos altos? ¿El problema es en todo el espacio?"
      ],
      limpieza: [
        "🧹 Como especialista en servicios generales, para limpieza profunda necesito conocer el espacio. ¿Qué tipo de superficie? ¿Cuál es el nivel de suciedad? ¿Hay áreas difíciles?",
        "🌿 Para jardinería, necesito saber qué plantas tienes. ¿Qué tipo de jardín? ¿Tienes sistema de riego? ¿Necesitas poda, fertilización o control de plagas?",
        "✨ Para mantenimiento general, es importante establecer un programa. ¿Qué áreas necesitan atención? ¿Residencial o comercial? ¿Hay mascotas o niños?"
      ],
      fumigacion: [
        "🐛 Como técnico en fumigación, para control de plagas necesito identificar el problema. ¿Qué tipo de insectos o roedores has visto? ¿En qué áreas?",
        "🔍 Las plagas requieren tratamiento especializado. ¿El problema es interior, exterior o ambos? ¿Hay niños o mascotas? ¿Desde cuándo tienes el problema?",
        "💊 Para fumigación efectiva, necesito saber el nivel de infestación. ¿Has intentado alguna solución? ¿Hay áreas específicas donde se concentran las plagas?"
      ],
      general: [
        "🤖 Como asistente técnico especializado, puedo ayudarte a identificar el servicio correcto. ¿Podrías describir más detalles sobre tu problema? ¿En qué área ocurre?",
        "🔧 Para brindarte la mejor asesoría, necesito entender tu situación. ¿Cuál es el problema principal? ¿Es urgente o puede esperar? ¿Hay síntomas específicos?",
        "💡 Estoy aquí para ayudarte a encontrar la solución perfecta. ¿Podrías ser más específico sobre lo que necesitas? ¿Es reparación, instalación o asesoría?"
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
    <div className="fixed bottom-4 left-4 z-50">
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
