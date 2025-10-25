'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faArrowLeft, 
  faArrowRight, 
  faCamera, 
  faMapMarkerAlt, 
  faCheck,
  faSpinner,
  faWrench,
  faLightbulb,
  faThermometerHalf,
  faKey,
  faPaintBrush,
  faBroom,
  faSeedling,
  faHammer,
  faVideo,
  faWifi,
  faBug,
  faHardHat,
  faCubes
} from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';

interface RequestServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const serviceCategories = [
  { id: 'plomeria', name: 'Plomería', icon: faWrench, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { id: 'electricidad', name: 'Electricidad', icon: faLightbulb, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  { id: 'aire-acondicionado', name: 'Aire Acondicionado', icon: faThermometerHalf, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
  { id: 'cerrajeria', name: 'Cerrajería', icon: faKey, color: 'text-gray-600', bgColor: 'bg-gray-50' },
  { id: 'pintura', name: 'Pintura', icon: faPaintBrush, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { id: 'limpieza', name: 'Limpieza', icon: faBroom, color: 'text-green-600', bgColor: 'bg-green-50' },
  { id: 'jardineria', name: 'Jardinería', icon: faSeedling, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  { id: 'carpinteria', name: 'Carpintería', icon: faHammer, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  { id: 'construccion', name: 'Construcción', icon: faHardHat, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  { id: 'tablaroca', name: 'Tablaroca', icon: faCubes, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  { id: 'cctv', name: 'CCTV', icon: faVideo, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  { id: 'wifi', name: 'WiFi', icon: faWifi, color: 'text-pink-600', bgColor: 'bg-pink-50' },
  { id: 'fumigacion', name: 'Fumigación', icon: faBug, color: 'text-red-600', bgColor: 'bg-red-50' }
];

export default function RequestServiceModal({ isOpen, onClose }: RequestServiceModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    servicio: '',
    descripcion: '',
    imagen: null as File | null,
    ubicacion: '',
    urgencia: 'normal'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user } = useUser();

  const totalSteps = 4;

  const handleServiceSelect = (serviceId: string) => {
    setFormData(prev => ({ ...prev, servicio: serviceId }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, imagen: file }));
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('Debes estar logueado para solicitar un servicio');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Subir imagen si existe
      let imagenUrl = null;
      if (formData.imagen) {
        const fileExt = formData.imagen.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('lead-images')
          .upload(fileName, formData.imagen);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('lead-images')
          .getPublicUrl(fileName);
        
        imagenUrl = publicUrl;
      }

      // Crear el lead
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .insert({
          nombre_cliente: user.user_metadata?.full_name || 'Cliente',
          whatsapp: user.user_metadata?.phone || null,
          descripcion_proyecto: formData.descripcion,
          ubicacion_lat: 19.4326, // CDMX por defecto - se puede mejorar con geocoding
          ubicacion_lng: -99.1332,
          estado: 'buscando',
          servicio_solicitado: formData.servicio,
          imagen_url: imagenUrl,
          urgencia: formData.urgencia,
          cliente_id: user.id
        })
        .select()
        .single();

      if (leadError) throw leadError;

      // Redirigir a la página de estado del lead
      router.push(`/solicitudes/${leadData.id}`);
      onClose();

    } catch (err: any) {
      console.error('Error creating lead:', err);
      setError(err.message || 'Error al crear la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetModal = () => {
    setCurrentStep(1);
    setFormData({
      servicio: '',
      descripcion: '',
      imagen: null,
      ubicacion: '',
      urgencia: 'normal'
    });
    setError(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faWrench} className="text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Solicitar Servicio</h2>
                <p className="text-blue-100">Paso {currentStep} de {totalSteps}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} className="text-2xl" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">¿Qué servicio necesitas?</h3>
                <p className="text-gray-600">Selecciona la categoría que mejor describa tu problema</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {serviceCategories.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceSelect(service.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      formData.servicio === service.id
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-12 h-12 ${service.bgColor} rounded-full flex items-center justify-center mx-auto mb-3`}>
                        <FontAwesomeIcon icon={service.icon} className={`text-2xl ${service.color}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{service.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Describe el problema</h3>
                <p className="text-gray-600">Sé lo más detallado posible. ¿Puedes subir una foto o video corto? ¡Ayuda mucho al técnico!</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción detallada
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    placeholder="Describe el problema en detalle. Incluye síntomas, cuándo empezó, qué has intentado, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foto o Video (Opcional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center space-y-2 text-gray-600 hover:text-blue-600"
                    >
                      <FontAwesomeIcon icon={faCamera} className="text-3xl" />
                      <span className="font-medium">
                        {formData.imagen ? formData.imagen.name : 'Subir foto o video'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">¿Dónde es el servicio?</h3>
                <p className="text-gray-600">Confirma la dirección donde necesitas el servicio</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.ubicacion}
                    onChange={(e) => setFormData(prev => ({ ...prev, ubicacion: e.target.value }))}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Calle, número, colonia, delegación"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgencia
                  </label>
                  <select
                    value={formData.urgencia}
                    onChange={(e) => setFormData(prev => ({ ...prev, urgencia: e.target.value }))}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="normal">Normal (1-2 días)</option>
                    <option value="urgente">Urgente (mismo día)</option>
                    <option value="emergencia">Emergencia (inmediato)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirma y Envía</h3>
                <p className="text-gray-600">Revisa los detalles de tu solicitud</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <FontAwesomeIcon icon={faWrench} className="text-blue-600" />
                  <span><strong>Servicio:</strong> {serviceCategories.find(s => s.id === formData.servicio)?.name}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <FontAwesomeIcon icon={faCheck} className="text-green-600 mt-1" />
                  <span><strong>Descripción:</strong> {formData.descripcion}</span>
                </div>
                {formData.imagen && (
                  <div className="flex items-center space-x-3">
                    <FontAwesomeIcon icon={faCamera} className="text-purple-600" />
                    <span><strong>Imagen:</strong> {formData.imagen.name}</span>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-red-600" />
                  <span><strong>Ubicación:</strong> {formData.ubicacion || 'CDMX'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>Anterior</span>
            </button>
            
            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                disabled={!formData.servicio || (currentStep === 2 && !formData.descripcion)}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Siguiente</span>
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center space-x-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCheck} />
                    <span>Enviar Solicitud</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
