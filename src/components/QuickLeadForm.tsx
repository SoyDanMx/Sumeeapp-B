'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLightbulb, 
  faWrench, 
  faThermometerHalf, 
  faMapMarkerAlt, 
  faArrowRight,
  faCheck,
  faSpinner,
  faExclamationTriangle,
  faVideo,
  faWifi,
  faPaintBrush,
  faBroom,
  faSeedling,
  faHammer,
  faHardHat,
  faCubes,
  faBug
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { submitLead } from '@/lib/supabase/data';

interface QuickLeadFormProps {
  className?: string;
  onLeadSubmit?: (leadData: any) => void;
}

const SERVICES = [
  {
    id: 'electricistas',
    name: 'Electricistas',
    icon: faLightbulb,
    description: 'Instalaciones, reparaciones y mantenimiento eléctrico',
    color: 'yellow',
    priceRange: 'Desde $350 MXN'
  },
  {
    id: 'cctv-alarmas',
    name: 'CCTV y Alarmas',
    icon: faVideo,
    description: 'Sistemas de seguridad y monitoreo',
    color: 'red',
    priceRange: 'Desde $800 MXN'
  },
  {
    id: 'redes-wifi',
    name: 'Redes WiFi',
    icon: faWifi,
    description: 'Instalación y configuración de redes',
    color: 'blue',
    priceRange: 'Desde $500 MXN'
  },
  {
    id: 'plomeros',
    name: 'Plomeros',
    icon: faWrench,
    description: 'Reparaciones, instalaciones y mantenimiento de plomería',
    color: 'blue',
    priceRange: 'Desde $400 MXN'
  },
  {
    id: 'pintores',
    name: 'Pintores',
    icon: faPaintBrush,
    description: 'Pintura interior y exterior',
    color: 'green',
    priceRange: 'Desde $600 MXN'
  },
  {
    id: 'aire-acondicionado',
    name: 'Aire Acondicionado',
    icon: faThermometerHalf,
    description: 'Aire acondicionado, calefacción y ventilación',
    color: 'red',
    priceRange: 'Desde $800 MXN'
  },
  {
    id: 'limpieza',
    name: 'Limpieza',
    icon: faBroom,
    description: 'Servicios de limpieza profesional',
    color: 'green',
    priceRange: 'Desde $300 MXN'
  },
  {
    id: 'jardineria',
    name: 'Jardinería',
    icon: faSeedling,
    description: 'Mantenimiento y diseño de jardines',
    color: 'green',
    priceRange: 'Desde $450 MXN'
  },
  {
    id: 'carpinteria',
    name: 'Carpintería',
    icon: faHammer,
    description: 'Trabajos en madera y muebles',
    color: 'yellow',
    priceRange: 'Desde $500 MXN'
  },
  {
    id: 'construccion',
    name: 'Construcción',
    icon: faHardHat,
    description: 'Obras y remodelaciones',
    color: 'gray',
    priceRange: 'Desde $800 MXN'
  },
  {
    id: 'tablaroca',
    name: 'Tablaroca',
    icon: faCubes,
    description: 'Instalación y acabados en tablaroca',
    color: 'gray',
    priceRange: 'Desde $400 MXN'
  },
  {
    id: 'fumigacion',
    name: 'Fumigación',
    icon: faBug,
    description: 'Control de plagas y fumigación',
    color: 'yellow',
    priceRange: 'Desde $350 MXN'
  }
];

export default function QuickLeadForm({ className = '', onLeadSubmit }: QuickLeadFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string>('');
  const [submittedLeadId, setSubmittedLeadId] = useState<string>('');
  const [formData, setFormData] = useState({
    service: '',
    location: '',
    whatsapp: '',
    nombreCliente: ''
  });

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setFormData(prev => ({ ...prev, service: serviceId }));
  };

  const handleNextStep = () => {
    if (selectedService) {
      setCurrentStep(2);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Llamamos a la función submitLead de Supabase
      const result = await submitLead({
        servicio: formData.service,
        ubicacion: formData.location,
        whatsapp: formData.whatsapp,
        nombre_cliente: formData.nombreCliente || undefined
      });

      if (result.success) {
        setSubmittedLeadId(result.leadId);
        
        if (onLeadSubmit) {
          onLeadSubmit({
            ...formData,
            leadId: result.leadId
          });
        }

        // Redirigir a la página de estado del lead
        router.push(`/status/${result.leadId}`);
      }
    } catch (error: any) {
      console.error('Error enviando lead:', error);
      setError(error.message || 'Error al enviar la solicitud. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getServiceInfo = (serviceId: string) => {
    return SERVICES.find(s => s.id === serviceId);
  };

  const getColorClasses = (color: string) => {
    const colors = {
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
      red: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
      green: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getIconColorClasses = (color: string) => {
    const colors = {
      yellow: 'text-yellow-600',
      blue: 'text-blue-600',
      red: 'text-red-600',
      green: 'text-green-600',
      gray: 'text-gray-600'
    };
    return colors[color as keyof typeof colors] || 'text-gray-600';
  };

  if (isSubmitted) {
    return (
      <div className={`bg-white rounded-2xl shadow-xl p-8 text-center ${className}`}>
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FontAwesomeIcon icon={faCheck} className="text-3xl text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Solicitud Enviada!</h3>
        <p className="text-gray-600 mb-6">
          Hemos recibido tu solicitud de {getServiceInfo(formData.service)?.name.toLowerCase()}. 
          Un técnico verificado se pondrá en contacto contigo pronto.
        </p>
        <button
          onClick={() => {
            setIsSubmitted(false);
            setCurrentStep(1);
            setSelectedService('');
            setFormData({ service: '', location: '', whatsapp: '', nombreCliente: '' });
            setError('');
            setSubmittedLeadId('');
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Nueva Solicitud
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Solicita un Técnico Verificado</h2>
        <p className="text-blue-100">Respuesta rápida garantizada en menos de 2 horas</p>
      </div>

      {/* Progress Indicator */}
      <div className="px-6 py-4 bg-gray-50 border-b">
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              1
            </div>
            <span className="ml-2 text-sm font-medium">Servicio</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-300"></div>
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
            <span className="ml-2 text-sm font-medium">Contacto</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">¿Qué servicio necesitas?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                {SERVICES.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceSelect(service.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left group hover:shadow-lg ${
                      selectedService === service.id
                        ? `${getColorClasses(service.color)} border-current shadow-lg transform scale-[1.02]`
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'
                    }`}
                  >
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          selectedService === service.id 
                            ? 'bg-white/20' 
                            : 'bg-gray-100 group-hover:bg-gray-200'
                        }`}>
                          <FontAwesomeIcon 
                            icon={service.icon} 
                            className={`text-lg ${
                              selectedService === service.id 
                                ? getIconColorClasses(service.color)
                                : 'text-gray-600'
                            }`} 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm leading-tight">{service.name}</h4>
                          <p className="text-xs text-gray-600 mt-1">{service.priceRange}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{service.description}</p>
                      {selectedService === service.id && (
                        <div className="flex items-center justify-center text-green-600">
                          <FontAwesomeIcon icon={faCheck} className="text-sm mr-1" />
                          <span className="text-xs font-medium">Seleccionado</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Selected Service Summary */}
              {selectedService && (
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <FontAwesomeIcon 
                      icon={getServiceInfo(selectedService)?.icon || faWrench} 
                      className="text-indigo-600 text-lg" 
                    />
                    <div>
                      <span className="font-medium text-indigo-900">
                        {getServiceInfo(selectedService)?.name}
                      </span>
                      <span className="text-indigo-600 text-sm ml-2">
                        - {getServiceInfo(selectedService)?.priceRange}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleNextStep}
              disabled={!selectedService}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <span>Continuar</span>
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Completa tus datos de contacto
              </h3>
              
              {/* Service Summary */}
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FontAwesomeIcon 
                    icon={getServiceInfo(formData.service)?.icon || faWrench} 
                    className="text-gray-600" 
                  />
                  <span className="font-medium text-gray-900">
                    Servicio seleccionado: {getServiceInfo(formData.service)?.name}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="nombreCliente" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre (opcional)
              </label>
              <input
                type="text"
                id="nombreCliente"
                value={formData.nombreCliente}
                onChange={(e) => handleInputChange('nombreCliente', e.target.value)}
                placeholder="Tu nombre"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-gray-500" />
                Ubicación o Código Postal
              </label>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Ej: Colonia Roma, CDMX o 06700"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
                <FontAwesomeIcon icon={faWhatsapp} className="mr-2 text-green-600" />
                WhatsApp (Para contacto directo)
              </label>
              <input
                type="tel"
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                placeholder="+52 55 1234 5678"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">
                Un técnico verificado se pondrá en contacto contigo por WhatsApp
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !formData.location || !formData.whatsapp}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  <span>Enviando solicitud...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faWhatsapp} />
                  <span>Enviar Solicitud</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="w-full text-gray-600 hover:text-gray-800 py-2 text-sm transition-colors"
            >
              ← Cambiar servicio
            </button>
          </form>
        )}
      </div>

      {/* Trust Indicators */}
      <div className="px-6 py-4 bg-gray-50 border-t">
        <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-gray-600">
          <span className="flex items-center">
            <FontAwesomeIcon icon={faCheck} className="text-green-500 mr-1" />
            Técnicos verificados
          </span>
          <span className="flex items-center">
            <FontAwesomeIcon icon={faCheck} className="text-green-500 mr-1" />
            Respuesta en 2 horas
          </span>
          <span className="flex items-center">
            <FontAwesomeIcon icon={faCheck} className="text-green-500 mr-1" />
            Sin compromiso
          </span>
        </div>
      </div>
    </div>
  );
}
