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
  faCog,
  faCrown,
  faCreditCard,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  showPaymentCTA?: boolean;
}

interface DisciplineAIHelperProps {
  discipline: string;
  disciplineName: string;
  disciplineIcon: any;
  disciplineColor: string;
  onPaymentRedirect?: () => void;
}

const DISCIPLINE_EXPERTS = {
  'electricidad': {
    name: 'Ingeniero Eléctrico',
    icon: faLightbulb,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    expertise: 'Instalaciones eléctricas, cortos circuitos, sistemas de energía',
    commonProblems: [
      'Corto circuito en mi casa',
      'Instalar contactos nuevos',
      'Reparar luminarias',
      'Cableado eléctrico',
      'Problemas con el tablero'
    ],
    urgencyLevel: 'ALTA',
    averageResponseTime: '2 horas'
  },
  'plomeria': {
    name: 'Ingeniero en Sistemas Hidráulicos',
    icon: faWrench,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    expertise: 'Sistemas de agua, drenaje, fugas, instalaciones hidráulicas',
    commonProblems: [
      'Fuga de agua en el baño',
      'Desagüe tapado',
      'Instalar tinaco',
      'Reparar llaves',
      'Problemas de presión'
    ],
    urgencyLevel: 'ALTA',
    averageResponseTime: '1 hora'
  },
  'aire-acondicionado': {
    name: 'Ingeniero en HVAC',
    icon: faThermometerHalf,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    expertise: 'Climatización, aire acondicionado, sistemas de ventilación',
    commonProblems: [
      'Aire acondicionado no enfría',
      'Instalar nuevo equipo',
      'Mantenimiento preventivo',
      'Reparar compresor',
      'Optimizar eficiencia energética'
    ],
    urgencyLevel: 'MEDIA',
    averageResponseTime: '4 horas'
  },
  'cctv': {
    name: 'Especialista en Seguridad',
    icon: faShieldAlt,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    expertise: 'Sistemas de seguridad, CCTV, alarmas, ciberseguridad',
    commonProblems: [
      'Instalar cámaras de seguridad',
      'Configurar sistema de alarmas',
      'Reparar cámaras dañadas',
      'Optimizar red de seguridad',
      'Integración con WiFi'
    ],
    urgencyLevel: 'MEDIA',
    averageResponseTime: '6 horas'
  }
};

export default function DisciplineAIHelper({ 
  discipline, 
  disciplineName, 
  disciplineIcon, 
  disciplineColor,
  onPaymentRedirect 
}: DisciplineAIHelperProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showPaymentCTA, setShowPaymentCTA] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const expert = DISCIPLINE_EXPERTS[discipline as keyof typeof DISCIPLINE_EXPERTS] || DISCIPLINE_EXPERTS.electricidad;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = async (query: string): Promise<{ response: string; showPaymentCTA: boolean }> => {
    // Simular delay de IA
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const lowerQuery = query.toLowerCase();
    
    // Detectar si el usuario necesita un técnico
    const needsTechnician = lowerQuery.includes('necesito') || 
                           lowerQuery.includes('requiero') || 
                           lowerQuery.includes('busco') || 
                           lowerQuery.includes('contratar') ||
                           lowerQuery.includes('servicio') ||
                           lowerQuery.includes('técnico') ||
                           lowerQuery.includes('profesional');

    if (needsTechnician) {
      return {
        response: `Como ${expert.name}, entiendo que necesitas un ${disciplineName} profesional. Para conectar con nuestros técnicos especializados y certificados, necesitas activar tu membresía Sumee App. 

Nuestros ${disciplineName}s están verificados, tienen licencias vigentes y ofrecen garantía en todos sus trabajos. Con tu membresía podrás:

✅ Contactar directamente con técnicos especializados
✅ Recibir respuesta en ${expert.averageResponseTime}
✅ Trabajos con garantía de 1 año
✅ Precios transparentes sin sorpresas
✅ Seguimiento completo del servicio

¿Te gustaría configurar tu método de pago para conectar con el mejor ${disciplineName} de tu zona?`,
        showPaymentCTA: true
      };
    }

    // Respuestas técnicas generales
    const technicalResponses = [
      `Como ${expert.name}, puedo orientarte sobre tu problema de ${disciplineName}. Sin embargo, para una solución completa y segura, necesitarás un técnico especializado.`,
      `Entiendo tu consulta sobre ${disciplineName}. Para brindarte la mejor asesoría y solución, te recomiendo contactar con un profesional certificado.`,
      `Como especialista en ${expert.expertise}, puedo darte algunas recomendaciones generales, pero para resolver tu problema necesitarás un técnico profesional.`
    ];

    return {
      response: technicalResponses[Math.floor(Math.random() * technicalResponses.length)],
      showPaymentCTA: false
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
        timestamp: new Date(),
        showPaymentCTA: aiResponse.showPaymentCTA
      };

      setMessages(prev => [...prev, assistantMessage]);
      setShowPaymentCTA(aiResponse.showPaymentCTA);
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

  const handlePaymentRedirect = () => {
    if (onPaymentRedirect) {
      onPaymentRedirect();
    } else {
      window.location.href = '/pago-de-servicios';
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setInputValue('');
    setShowPaymentCTA(false);
  };

  // Función para enviar un mensaje con un prompt específico
  const handleSendMessageWithPrompt = async (prompt: string) => {
    if (!prompt.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const aiResponse = await generateAIResponse(prompt);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.response,
        timestamp: new Date(),
        showPaymentCTA: aiResponse.showPaymentCTA
      };

      setMessages(prev => [...prev, assistantMessage]);
      setShowPaymentCTA(aiResponse.showPaymentCTA);
    } catch (error) {
      console.error('Error generating AI response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Escuchar eventos personalizados para abrir el chat desde el botón "Consultar IA"
  useEffect(() => {
    const handleOpenChat = (event: CustomEvent) => {
      // Verificar que el evento es para esta disciplina
      if (event.detail?.discipline === discipline || !event.detail?.discipline) {
        // Hacer scroll primero al contenedor
        if (chatRef.current) {
          // Scroll al contenedor padre (#ai-helper)
          const aiHelperContainer = document.getElementById('ai-helper');
          if (aiHelperContainer) {
            aiHelperContainer.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }
          
          // Luego abrir el chat después de un pequeño delay
          setTimeout(() => {
            setIsOpen(true);
            
            // Si hay un prompt inicial, enviarlo automáticamente
            if (event.detail?.initialPrompt) {
              setTimeout(() => {
                setInputValue(event.detail.initialPrompt);
                // Simular envío después de que el chat esté completamente abierto
                setTimeout(() => {
                  handleSendMessageWithPrompt(event.detail.initialPrompt);
                }, 500);
              }, 300);
            }
          }, 500);
        }
      }
    };

    // Escuchar el evento personalizado
    window.addEventListener('openAIHelperChat' as any, handleOpenChat as EventListener);

    return () => {
      window.removeEventListener('openAIHelperChat' as any, handleOpenChat as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discipline]);

  return (
    <div ref={chatRef} className="fixed bottom-4 right-4 z-50">
      {/* Botón flotante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          aria-label={`Abrir chat con ${expert.name}`}
        >
          <FontAwesomeIcon icon={faRobot} className="text-2xl" />
        </button>
      )}

      {/* Chat Modal */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-2xl w-96 h-[500px] flex flex-col border border-gray-200">
          {/* Header */}
          <div className={`${expert.bgColor} ${expert.borderColor} border-b p-4 rounded-t-lg`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={expert.icon} className={`text-lg ${expert.color}`} />
                <div>
                  <h3 className="font-semibold text-gray-900">{expert.name}</h3>
                  <p className="text-xs text-gray-600">{expert.expertise}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <FontAwesomeIcon icon={expert.icon} className="text-3xl mb-3 text-blue-500" />
                <p className="text-sm font-medium">¡Hola! Soy tu {expert.name}</p>
                <p className="text-xs mt-2">Pregúntame sobre tu problema de {disciplineName}</p>
                <div className="mt-4">
                  <p className="text-xs text-gray-400 mb-2">Problemas comunes:</p>
                  <div className="flex flex-wrap gap-1">
                    {expert.commonProblems.slice(0, 3).map((problem, index) => (
                      <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {problem}
                      </span>
                    ))}
                  </div>
                </div>
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
                  <span className="ml-2 text-sm text-gray-600">Analizando tu problema...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Payment Setup CTA */}
          {showPaymentCTA && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 border-t">
              <div className="flex items-center space-x-2 mb-2">
                <FontAwesomeIcon icon={faCrown} className="text-lg" />
                <span className="font-semibold">¡Configura tu Método de Pago!</span>
              </div>
              <p className="text-sm mb-3">
                Conecta con {expert.name}s verificados y recibe respuesta en {expert.averageResponseTime}
              </p>
              <button
                onClick={handlePaymentRedirect}
                className="w-full bg-white text-orange-600 py-2 px-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
              >
                <FontAwesomeIcon icon={faCreditCard} />
                <span>Configurar Pago</span>
              </button>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Describe tu problema de ${disciplineName}...`}
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
