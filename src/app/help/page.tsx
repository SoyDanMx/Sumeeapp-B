'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faQuestionCircle, 
  faHeadset, 
  faClock, 
  faEnvelope, 
  faChevronDown, 
  faChevronUp,
  faRobot,
  faPhone,
  faComments,
  faSearch,
  faExclamationTriangle,
  faCheckCircle,
  faLightbulb
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { PageLayout } from '@/components/PageLayout';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQ[] = [
  {
    id: '1',
    question: '¿Cómo funciona Sumee App?',
    answer: 'Sumee App conecta clientes con técnicos verificados. Simplemente selecciona el servicio que necesitas, proporciona tu ubicación y recibe cotizaciones de profesionales certificados en tu área.',
    category: 'General'
  },
  {
    id: '2',
    question: '¿Cómo puedo contratar un técnico?',
    answer: 'Puedes buscar técnicos por servicio en nuestra página principal, filtrar por ubicación, revisar sus perfiles y calificaciones, y contactarlos directamente por WhatsApp o llamada.',
    category: 'Uso de la App'
  },
  {
    id: '3',
    question: '¿Los técnicos están verificados?',
    answer: 'Sí, todos nuestros técnicos pasan por un proceso de verificación que incluye verificación de identidad, revisión de antecedentes y comprobación de experiencia mínima de 3 años.',
    category: 'Seguridad'
  },
  {
    id: '4',
    question: '¿Qué garantía ofrecen los servicios?',
    answer: 'Todos los servicios están respaldados por nuestra Garantía Sumee. Si el servicio falla en los primeros 30 días, lo reparamos sin costo adicional.',
    category: 'Garantías'
  },
  {
    id: '5',
    question: '¿Cómo puedo reportar un problema con un técnico?',
    answer: 'Si tienes algún problema con un técnico, puedes contactarnos inmediatamente por WhatsApp al +52 56 3674 1156 o enviar un reporte a través de nuestro chat de soporte.',
    category: 'Soporte'
  },
  {
    id: '6',
    question: '¿Cuánto tiempo tarda en llegar un técnico?',
    answer: 'El tiempo de respuesta varía según la disponibilidad y ubicación. Generalmente recibes respuesta en menos de 2 horas, y la mayoría de técnicos pueden atender el mismo día.',
    category: 'Tiempos'
  }
];

const categories = ['Todos', 'General', 'Uso de la App', 'Seguridad', 'Garantías', 'Soporte', 'Tiempos'];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [showSupportOptions, setShowSupportOptions] = useState(false);

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleWhatsAppSupport = () => {
    const message = encodeURIComponent('Hola, necesito soporte');
    window.open(`https://api.whatsapp.com/send/?phone=525636741156&text=${message}`, '_blank');
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FontAwesomeIcon icon={faHeadset} className="text-3xl" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Centro de Ayuda
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Estamos aquí para ayudarte. Encuentra respuestas rápidas o contáctanos para soporte personalizado.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            
            {/* Botones de Soporte Rápido */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <FontAwesomeIcon icon={faWhatsapp} className="text-2xl text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Soporte por WhatsApp</h3>
                    <p className="text-gray-600">Respuesta inmediata</p>
                  </div>
                </div>
                <button
                  onClick={handleWhatsAppSupport}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <FontAwesomeIcon icon={faWhatsapp} />
                  <span>Contactar por WhatsApp</span>
                </button>
                <p className="text-sm text-gray-500 mt-3 text-center">
                  Disponible 24/7 • Respuesta en menos de 5 minutos
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <FontAwesomeIcon icon={faComments} className="text-2xl text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Chat en Vivo</h3>
                    <p className="text-gray-600">Asistente virtual</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSupportOptions(!showSupportOptions)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <FontAwesomeIcon icon={faRobot} />
                  <span>Iniciar Chat</span>
                </button>
                <p className="text-sm text-gray-500 mt-3 text-center">
                  Horario: Lunes a Viernes 8:00 AM - 8:00 PM
                </p>
              </div>
            </div>

            {/* Chat de Soporte */}
            {showSupportOptions && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Opciones de Soporte</h3>
                  <button
                    onClick={() => setShowSupportOptions(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FontAwesomeIcon icon={faChevronUp} />
                  </button>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <button
                    onClick={handleWhatsAppSupport}
                    className="p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors text-left"
                  >
                    <FontAwesomeIcon icon={faWhatsapp} className="text-green-600 text-xl mb-2" />
                    <h4 className="font-semibold text-gray-900">WhatsApp</h4>
                    <p className="text-sm text-gray-600">Chat directo y rápido</p>
                  </button>
                  <a
                    href="tel:+525636741156"
                    className="p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-left block"
                  >
                    <FontAwesomeIcon icon={faPhone} className="text-blue-600 text-xl mb-2" />
                    <h4 className="font-semibold text-gray-900">Llamada</h4>
                    <p className="text-sm text-gray-600">Atención telefónica</p>
                  </a>
                  <a
                    href="mailto:contacto@sumeeapp.com"
                    className="p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors text-left block"
                  >
                    <FontAwesomeIcon icon={faEnvelope} className="text-purple-600 text-xl mb-2" />
                    <h4 className="font-semibold text-gray-900">Email</h4>
                    <p className="text-sm text-gray-600">Respuesta en 24 horas</p>
                  </a>
                </div>
              </div>
            )}

            {/* Búsqueda y Filtros */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar en preguntas frecuentes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="text-center">
                <p className="text-gray-600">
                  {filteredFAQs.length} pregunta{filteredFAQs.length !== 1 ? 's' : ''} encontrada{filteredFAQs.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Preguntas Frecuentes */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <FontAwesomeIcon icon={faQuestionCircle} className="mr-3 text-blue-600" />
                  Preguntas Frecuentes
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {filteredFAQs.length > 0 ? (
                  filteredFAQs.map(faq => (
                    <div key={faq.id} className="p-6">
                      <button
                        onClick={() => toggleFAQ(faq.id)}
                        className="w-full text-left flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {faq.question}
                          </h3>
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {faq.category}
                          </span>
                        </div>
                        <FontAwesomeIcon 
                          icon={expandedFAQ === faq.id ? faChevronUp : faChevronDown}
                          className="text-gray-400 ml-4"
                        />
                      </button>
                      
                      {expandedFAQ === faq.id && (
                        <div className="mt-4 pl-0">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <FontAwesomeIcon icon={faSearch} className="text-4xl text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      No se encontraron preguntas
                    </h3>
                    <p className="text-gray-500">
                      Intenta con otros términos de búsqueda o contáctanos directamente.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="mt-12 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">¿Aún necesitas ayuda?</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Nuestro equipo de soporte está disponible para ayudarte con cualquier pregunta o problema que puedas tener.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FontAwesomeIcon icon={faClock} className="text-2xl text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Horarios de Atención</h3>
                  <p className="text-gray-600 text-sm">
                    WhatsApp: 24/7<br />
                    Llamadas: Lun-Vie 8AM-8PM<br />
                    Email: Respuesta en 24h
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-2xl text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Tiempo de Respuesta</h3>
                  <p className="text-gray-600 text-sm">
                    WhatsApp: Menos de 5 min<br />
                    Llamadas: Inmediato<br />
                    Email: Dentro de 24 horas
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FontAwesomeIcon icon={faLightbulb} className="text-2xl text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Soporte Especializado</h3>
                  <p className="text-gray-600 text-sm">
                    Técnicos expertos<br />
                    Soluciones personalizadas<br />
                    Seguimiento completo
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
