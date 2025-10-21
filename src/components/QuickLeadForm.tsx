'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLightbulb, 
  faWrench, 
  faThermometerHalf, 
  faMapMarkerAlt, 
  faWhatsapp, 
  faArrowRight,
  faCheck,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';

interface QuickLeadFormProps {
  className?: string;
  onLeadSubmit?: (leadData: any) => void;
}

const SERVICES = [
  {
    id: 'electricity',
    name: 'Electricidad',
    icon: faLightbulb,
    description: 'Instalaciones, reparaciones y mantenimiento eléctrico',
    color: 'yellow'
  },
  {
    id: 'plumbing',
    name: 'Plomería',
    icon: faWrench,
    description: 'Reparaciones, instalaciones y mantenimiento de plomería',
    color: 'blue'
  },
  {
    id: 'hvac',
    name: 'HVAC',
    icon: faThermometerHalf,
    description: 'Aire acondicionado, calefacción y ventilación',
    color: 'red'
  }
];

export default function QuickLeadForm({ className = '', onLeadSubmit }: QuickLeadFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    service: '',
    location: '',
    whatsapp: ''
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

    try {
      // Simulamos el envío del lead a Supabase
      console.log('Enviando lead a Supabase:', {
        service: formData.service,
        location: formData.location,
        whatsapp: formData.whatsapp,
        timestamp: new Date().toISOString()
      });

      // Aquí iría la llamada real a Supabase
      // await supabase.from('leads').insert([leadData]);

      // Simulamos delay de red
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (onLeadSubmit) {
        onLeadSubmit(formData);
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error enviando lead:', error);
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
      red: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
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
            setFormData({ service: '', location: '', whatsapp: '' });
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
              <div className="grid gap-4">
                {SERVICES.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceSelect(service.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      selectedService === service.id
                        ? `${getColorClasses(service.color)} border-current shadow-lg transform scale-105`
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                        <FontAwesomeIcon 
                          icon={service.icon} 
                          className={`text-xl ${
                            selectedService === service.id 
                              ? service.color === 'yellow' ? 'text-yellow-600' :
                                service.color === 'blue' ? 'text-blue-600' : 'text-red-600'
                              : 'text-gray-600'
                          }`} 
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{service.name}</h4>
                        <p className="text-sm text-gray-600">{service.description}</p>
                      </div>
                      {selectedService === service.id && (
                        <FontAwesomeIcon icon={faCheck} className="text-lg" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
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
                  <span>Enviar por WhatsApp</span>
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
