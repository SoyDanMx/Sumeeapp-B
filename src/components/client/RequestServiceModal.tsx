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
import { useUserContext } from '@/context/UserContext';
import { useMembership } from '@/context/MembershipContext';
import StripeBuyButton from '@/components/stripe/StripeBuyButton';
import Link from 'next/link';

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
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmittingFreeRequest, setIsSubmittingFreeRequest] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user, profile, hasActiveMembership, isLoading } = useUserContext();
  const { isFreeUser, isBasicUser, isPremiumUser, requestsRemaining } = useMembership();

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

  const handleUseMyLocation = async () => {
    console.log('🔍 Iniciando geolocalización...');
    
    if (!navigator.geolocation) {
      console.error('❌ Geolocalización no disponible');
      setError('La geolocalización no está disponible en tu navegador');
      return;
    }

    setIsGettingLocation(true);
    setError(null);

    try {
      console.log('📍 Solicitando ubicación...');
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            console.log('✅ Ubicación obtenida:', pos.coords);
            resolve(pos);
          },
          (err) => {
            console.error('❌ Error de geolocalización:', err);
            reject(err);
          },
          {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 300000
          }
        );
      });

      const { latitude, longitude } = position.coords;
      console.log(`📍 Coordenadas: ${latitude}, ${longitude}`);
      
      // Verificar si tenemos API key de Google Maps
      const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      console.log('🔑 Google Maps API Key:', googleMapsApiKey ? 'Configurada' : 'No configurada');
      
      if (!googleMapsApiKey) {
        // Fallback: usar OpenStreetMap Nominatim (gratuito)
        console.log('🗺️ Usando OpenStreetMap Nominatim...');
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=es&zoom=18`
        );
        
        console.log('📡 Respuesta OpenStreetMap:', response.status);
        const data = await response.json();
        console.log('📋 Datos OpenStreetMap:', data);
        
        if (data && data.display_name) {
          const address = data.display_name;
          console.log('✅ Dirección obtenida:', address);
          setFormData(prev => ({ ...prev, ubicacion: address }));
        } else {
          console.error('❌ No se pudo obtener dirección de OpenStreetMap');
          setError('No se pudo obtener la dirección. Por favor, ingrésala manualmente.');
        }
      } else {
        // Usar Google Maps Geocoding API
        console.log('🗺️ Usando Google Maps API...');
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleMapsApiKey}&language=es&region=mx`
        );
        
        console.log('📡 Respuesta Google Maps:', response.status);
        const data = await response.json();
        console.log('📋 Datos Google Maps:', data);
        
        if (data.status === 'OK' && data.results && data.results.length > 0) {
          const address = data.results[0].formatted_address;
          console.log('✅ Dirección obtenida:', address);
          setFormData(prev => ({ ...prev, ubicacion: address }));
        } else if (data.status === 'ZERO_RESULTS') {
          console.error('❌ ZERO_RESULTS de Google Maps');
          setError('No se encontró dirección para esta ubicación. Por favor, ingrésala manualmente.');
        } else if (data.status === 'OVER_QUERY_LIMIT') {
          console.error('❌ OVER_QUERY_LIMIT de Google Maps');
          setError('Límite de consultas excedido. Por favor, ingresa la dirección manualmente.');
        } else {
          console.error('❌ Error de Google Maps:', data.status);
          setError('Error en el servicio de geocodificación. Por favor, ingresa la dirección manualmente.');
        }
      }
    } catch (err: any) {
      console.error('❌ Error en geolocalización:', err);
      if (err.code === 1) {
        setError('Permiso de ubicación denegado. Por favor, ingresa la dirección manualmente.');
      } else if (err.code === 2) {
        setError('Ubicación no disponible. Por favor, ingresa la dirección manualmente.');
      } else if (err.code === 3) {
        setError('Tiempo de espera agotado. Por favor, ingresa la dirección manualmente.');
      } else if (err.name === 'NetworkError') {
        setError('Error de conexión. Por favor, verifica tu internet e intenta de nuevo.');
      } else {
        setError('Error al obtener la ubicación. Por favor, ingresa la dirección manualmente.');
      }
    } finally {
      console.log('🏁 Finalizando geolocalización...');
      setIsGettingLocation(false);
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

  // Función específica para manejar la solicitud gratuita
  const handleFreeRequestSubmit = async () => {
    if (!user) {
      setError('Debes estar logueado para solicitar un servicio');
      return;
    }

    // Verificar si ya usó su solicitud gratuita este mes
    // TODO: Implementar lógica de verificación de límite mensual
    // Por ahora, permitimos la solicitud
    // En el futuro: verificar last_free_request_date en el perfil
    
    setIsSubmittingFreeRequest(true);
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

      // Actualizar el contador de solicitudes usadas en el perfil
      // TODO: Implementar actualización de last_free_request_date
      
      // Redirigir a la página de estado del lead
      router.push(`/solicitudes/${leadData.id}`);
      onClose();

    } catch (err: any) {
      console.error('Error creating free lead:', err);
      setError(err.message || 'Error al crear la solicitud gratuita');
    } finally {
      setIsSubmittingFreeRequest(false);
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
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={formData.ubicacion}
                      onChange={(e) => setFormData(prev => ({ ...prev, ubicacion: e.target.value }))}
                      className="flex-1 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Calle, número, colonia, delegación"
                    />
                    <button
                      type="button"
                      onClick={handleUseMyLocation}
                      disabled={isGettingLocation}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                      title="Permite al navegador acceder a tu ubicación para llenar automáticamente la dirección"
                    >
                      {isGettingLocation ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} spin />
                          <span>Detectando...</span>
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faMapMarkerAlt} />
                          <span>Usar mi Ubicación</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Tip: Permite el acceso a tu ubicación para llenar automáticamente la dirección
                  </p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {hasActiveMembership ? 'Confirma y Envía' : '¡Activa tu Membresía!'}
                </h3>
                <p className="text-gray-600">
                  {hasActiveMembership 
                    ? 'Revisa los detalles de tu solicitud' 
                    : 'Tu solicitud está lista. Activa tu membresía para conectar con profesionales.'
                  }
                </p>
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

              {/* Lógica de Membresía */}
              {!hasActiveMembership && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-blue-900 mb-3">
                    ¡Estás a un paso de conectar con profesionales!
                  </h4>
                  <p className="text-blue-800 mb-4">
                    Tu solicitud ha sido preparada. Para que los profesionales puedan verla y contactarte, necesitas una membresía activa.
                  </p>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Plan Gratuito */}
                    <div className="bg-white border border-green-200 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-900 mb-2">Plan Gratuito</h5>
                      <div className="text-2xl font-bold text-green-600 mb-2">$0 MXN</div>
                      <p className="text-sm text-gray-600 mb-4">Siempre gratis</p>
                      <ul className="text-sm text-gray-700 space-y-1 mb-4">
                        <li>• 1 solicitud por mes</li>
                        <li>• Acceso básico a técnicos</li>
                        <li>• Seguimiento básico en la app</li>
                        <li>• Soporte por chat</li>
                      </ul>
                      
                      {/* LÓGICA CONDICIONAL INTELIGENTE */}
                      {/* DEBUG: Mostrar información del usuario */}
                      {process.env.NODE_ENV === 'development' && (
                        <div className="text-xs text-gray-500 mb-2 p-2 bg-gray-100 rounded">
                          DEBUG: user={user ? 'YES' : 'NO'}, profile={profile ? 'YES' : 'NO'}, 
                          membership={profile?.membership_status || 'none'}
                        </div>
                      )}
                      {user ? (
                        // Usuario logueado - mostrar botón de acción
                        <div className="space-y-2">
                          <button
                            onClick={handleFreeRequestSubmit}
                            disabled={isSubmittingFreeRequest}
                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                          >
                            {isSubmittingFreeRequest ? (
                              <>
                                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                <span>Publicando...</span>
                              </>
                            ) : (
                              <>
                                <FontAwesomeIcon icon={faCheck} />
                                <span>Publicar mi Solicitud Gratis</span>
                              </>
                            )}
                          </button>
                          <p className="text-xs text-green-600 text-center">
                            Estás usando tu solicitud gratuita de este mes
                          </p>
                        </div>
                      ) : (
                        // Usuario no logueado - mostrar registro
                        <Link
                          href="/registro-cliente"
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-center block"
                        >
                          Regístrate Gratis
                        </Link>
                      )}
                    </div>

                    {/* Plan Básico */}
                    <div className="bg-white border border-blue-200 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-900 mb-2">Plan Básico</h5>
                      <div className="text-2xl font-bold text-blue-600 mb-2">$299 MXN</div>
                      <p className="text-sm text-gray-600 mb-4">Suscripción anual</p>
                      <ul className="text-sm text-gray-700 space-y-1 mb-4">
                        <li>• Hasta 5 solicitudes por mes</li>
                        <li>• Acceso a técnicos verificados</li>
                        <li>• Diagnóstico por foto/video</li>
                        <li>• Seguimiento completo en la app</li>
                      </ul>
                      <StripeBuyButton 
                        buyButtonId="buy_btn_1SLx83E2shKTNR9MwlSZog2K"
                        publishableKey="pk_live_51P8c4AE2shKTNR9MVARQB4La2uYMMc2shlTCcpcg8EI6MqqPV1uN5uj6UbB5mpfReRKd4HL2OP1LoF17WXcYYeB000Ot1l847E"
                      />
                    </div>

                    {/* Plan Premium */}
                    <div className="bg-white border-2 border-purple-300 rounded-lg p-4 relative">
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <span className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full">Más Popular</span>
                      </div>
                      <h5 className="font-semibold text-gray-900 mb-2">Plan Premium</h5>
                      <div className="text-2xl font-bold text-purple-600 mb-2">$499 MXN</div>
                      <p className="text-sm text-gray-600 mb-4">Suscripción anual</p>
                      <ul className="text-sm text-gray-700 space-y-1 mb-4">
                        <li>• Solicitudes ilimitadas</li>
                        <li>• Prioridad en asignación</li>
                        <li>• Diagnóstico por foto/video</li>
                        <li>• Servicio de conserjería</li>
                        <li>• Historial de mantenimiento</li>
                      </ul>
                      <StripeBuyButton 
                        buyButtonId="buy_btn_1SLwlqE2shKTNR9MmwebXHlB"
                        publishableKey="pk_live_51P8c4AE2shKTNR9MVARQB4La2uYMMc2shlTCcpcg8EI6MqqPV1uN5uj6UbB5mpfReRKd4HL2OP1LoF17WXcYYeB000Ot1l847E"
                      />
                    </div>
                  </div>
                </div>
              )}
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
              hasActiveMembership ? (
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
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Selecciona un plan arriba para continuar
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
