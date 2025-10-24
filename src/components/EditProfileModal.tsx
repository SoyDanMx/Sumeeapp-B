'use client';
import React, { useState, FormEvent, useEffect } from 'react';
import { Profesional } from '@/types/supabase';
import { updateUserProfile, verifyUserPermissions } from '@/lib/supabase/actions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faUser, 
  faPhone, 
  faMapMarkerAlt, 
  faBriefcase, 
  faCertificate,
  faStar,
  faCheck,
  faSpinner,
  faExclamationTriangle,
  faEdit,
  faRocket,
  faPlus,
  faLightbulb,
  faVideo,
  faWifi,
  faWrench,
  faPaintBrush,
  faThermometerHalf,
  faBroom,
  faSeedling,
  faHammer,
  faHardHat,
  faCubes,
  faBug
} from '@fortawesome/free-solid-svg-icons';

interface EditProfileModalProps {
  profesional: Profesional;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const OFICIOS_OPTIONS = [
    { id: 'electricistas', name: 'Electricistas', icon: faLightbulb, emoji: '⚡' },
    { id: 'cctv-alarmas', name: 'CCTV y Alarmas', icon: faVideo, emoji: '📹' },
    { id: 'redes-wifi', name: 'Redes WiFi', icon: faWifi, emoji: '📶' },
    { id: 'plomeros', name: 'Plomeros', icon: faWrench, emoji: '🔧' },
    { id: 'pintores', name: 'Pintores', icon: faPaintBrush, emoji: '🎨' },
    { id: 'aire-acondicionado', name: 'Aire Acondicionado', icon: faThermometerHalf, emoji: '❄️' },
    { id: 'limpieza', name: 'Limpieza', icon: faBroom, emoji: '✨' },
    { id: 'jardineria', name: 'Jardinería', icon: faSeedling, emoji: '🌿' },
    { id: 'carpinteria', name: 'Carpintería', icon: faHammer, emoji: '🪵' },
    { id: 'construccion', name: 'Construcción', icon: faHardHat, emoji: '🏗️' },
    { id: 'tablaroca', name: 'Tablaroca', icon: faCubes, emoji: '🧱' },
    { id: 'fumigacion', name: 'Fumigación', icon: faBug, emoji: '🐛' }
];

export default function EditProfileModal({ profesional, isOpen, onClose, onSuccess }: EditProfileModalProps) {
    if (!isOpen) return null;

    const [formData, setFormData] = useState<Partial<Profesional>>({
        full_name: profesional.full_name, // Asegurar que full_name esté incluido
        whatsapp: profesional.whatsapp,
        numero_imss: profesional.numero_imss,
        descripcion_perfil: profesional.descripcion_perfil,
        experiencia_uber: profesional.experiencia_uber,
        años_experiencia_uber: profesional.años_experiencia_uber,
        areas_servicio: profesional.areas_servicio || [],
    });
    const [locationAddress, setLocationAddress] = useState(''); 
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [currentStep, setCurrentStep] = useState(1);
    const [isSuccess, setIsSuccess] = useState(false);
    const [customService, setCustomService] = useState('');

    const userId = profesional.user_id;
    const totalSteps = 4;

    // Reset modal state when opened/closed
    useEffect(() => {
        if (isOpen) {
            setFormData({
                full_name: profesional.full_name, // Asegurar que full_name esté incluido
                whatsapp: profesional.whatsapp,
                numero_imss: profesional.numero_imss,
                descripcion_perfil: profesional.descripcion_perfil,
                experiencia_uber: profesional.experiencia_uber,
                años_experiencia_uber: profesional.años_experiencia_uber,
                areas_servicio: profesional.areas_servicio || [],
            });
            setLocationAddress('');
            setCustomService('');
            setLoading(false);
            setStatusMessage('');
            setCurrentStep(1);
            setIsSuccess(false);
        }
    }, [isOpen, profesional]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleOfficesChange = (officeName: string) => {
        setFormData(prev => {
            const currentAreas = prev.areas_servicio || [];
            if (currentAreas.includes(officeName)) {
                return { ...prev, areas_servicio: currentAreas.filter(a => a !== officeName) };
            } else {
                return { ...prev, areas_servicio: [...currentAreas, officeName] };
            }
        });
    };

    const isOfficeSelected = (officeName: string) => {
        return formData.areas_servicio?.includes(officeName) || false;
    };

    const addCustomService = () => {
        if (customService.trim() && !formData.areas_servicio?.includes(customService.trim())) {
            setFormData(prev => ({
                ...prev,
                areas_servicio: [...(prev.areas_servicio || []), customService.trim()]
            }));
            setCustomService('');
        }
    };

    const removeService = (serviceName: string) => {
        setFormData(prev => ({
            ...prev,
            areas_servicio: prev.areas_servicio?.filter(a => a !== serviceName) || []
        }));
    };
    
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatusMessage('Guardando información...');
        setIsSuccess(false);

        if (formData.areas_servicio?.length === 0) {
            setStatusMessage('Error: Debes seleccionar al menos un área de especialización.');
            setLoading(false);
            return;
        }

        try {
            // 1. Verificar permisos del usuario
            setStatusMessage('Verificando permisos...');
            await verifyUserPermissions(userId);
            
            // 2. Preparar datos para actualización
            const dataToSubmit = {
                ...formData,
                full_name: formData.full_name || profesional.full_name || 'Sin nombre'
            };
            
            // 3. Actualizar perfil usando función centralizada
            setStatusMessage('Guardando información...');
            const updatedProfile = await updateUserProfile(
                userId, 
                dataToSubmit, 
                locationAddress || undefined
            );
            
            console.log('✅ Perfil actualizado exitosamente:', updatedProfile);
            setStatusMessage('¡Perfil actualizado con éxito!');
            setIsSuccess(true);
            
            // Delay before closing to show success message
            setTimeout(() => {
                onSuccess(); 
            }, 1500);
            
        } catch (error: any) {
            console.error('❌ Error al actualizar el perfil:', error);
            
            // Manejo específico de errores
            let errorMessage = 'Error desconocido';
            
            if (error.message.includes('permisos') || error.message.includes('RLS')) {
                errorMessage = `Error de permisos: ${error.message}. Contacta al administrador.`;
            } else if (error.message.includes('coordenadas')) {
                errorMessage = `Error de ubicación: ${error.message}. Intenta con una dirección más específica.`;
            } else if (error.message.includes('No se encontró')) {
                errorMessage = `Error de perfil: ${error.message}. Verifica que estés registrado correctamente.`;
            } else {
                errorMessage = `Error al guardar: ${error.message || 'Error desconocido'}. Revisa la consola.`;
            }
            
            setStatusMessage(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const formatPhoneNumber = (value: string) => {
        const phoneNumber = value.replace(/\D/g, '');
        if (phoneNumber.startsWith('52')) {
            return `+52 ${phoneNumber.slice(2)}`;
        }
        return value;
    };

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4"
            style={{ zIndex: 9999 }}
            onClick={(e) => {
                if (e.target === e.currentTarget && !loading) {
                    onClose();
                }
            }}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header con progreso */}
                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <FontAwesomeIcon icon={faEdit} className="text-xl" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Completar Perfil Profesional</h2>
                                <p className="text-blue-100 text-sm">Aumenta tus oportunidades de trabajo</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors duration-200 disabled:opacity-50"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="flex items-center space-x-2">
                        {Array.from({ length: totalSteps }, (_, i) => (
                            <div key={i} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                    i + 1 <= currentStep ? 'bg-white text-indigo-600' : 'bg-white/20 text-white'
                                }`}>
                                    {i + 1 < currentStep ? <FontAwesomeIcon icon={faCheck} /> : i + 1}
                                </div>
                                {i < totalSteps - 1 && (
                                    <div className={`w-8 h-1 mx-1 rounded ${
                                        i + 1 < currentStep ? 'bg-white' : 'bg-white/20'
                                    }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto max-h-[calc(95vh-140px)]">
                    <form onSubmit={handleSubmit}>
                        {/* Step 1: Información básica */}
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FontAwesomeIcon icon={faUser} className="text-2xl text-indigo-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Información de Contacto</h3>
                                    <p className="text-gray-600">Los clientes te contactarán por WhatsApp</p>
                                </div>
                                
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-semibold text-gray-700">
                                            <FontAwesomeIcon icon={faPhone} className="mr-2 text-indigo-500" />
                                            Número WhatsApp *
                                        </label>
                                <input
                                    type="tel"
                                    name="whatsapp"
                                    value={formData.whatsapp ?? ''}
                                    onChange={handleChange}
                                            placeholder="Ej: +52 55 1234 5678"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                            required
                                />
                                        <p className="text-xs text-gray-500">Los leads te llegarán por este número</p>
                            </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-semibold text-gray-700">
                                            <FontAwesomeIcon icon={faCertificate} className="mr-2 text-indigo-500" />
                                            Número IMSS (Opcional)
                                        </label>
                                <input
                                    type="text"
                                    name="numero_imss"
                                    value={formData.numero_imss ?? ''}
                                    onChange={handleChange}
                                            placeholder="Ej: 12345678901"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                />
                                        <p className="text-xs text-gray-500">Para mayor credibilidad</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Biografía */}
                        {currentStep === 2 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FontAwesomeIcon icon={faStar} className="text-2xl text-indigo-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Tu Historia Profesional</h3>
                                    <p className="text-gray-600">Destaca tu experiencia y confianza</p>
                        </div>
                                
                                <div className="space-y-4">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Descripción Profesional *
                                    </label>
                            <textarea
                                name="descripcion_perfil"
                                value={formData.descripcion_perfil ?? ''}
                                onChange={handleChange}
                                        rows={6}
                                        placeholder="Ej: Soy electricista certificado con 10 años de experiencia. Especialista en instalaciones residenciales y comerciales. Trabajos garantizados y materiales de calidad. Atiendo toda la CDMX y área metropolitana."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 resize-none"
                                        required
                                    />
                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <span>{formData.descripcion_perfil?.length || 0} caracteres</span>
                                        <span className="text-indigo-500">Mín. 100 caracteres</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Especialidades */}
                        {currentStep === 3 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FontAwesomeIcon icon={faBriefcase} className="text-2xl text-indigo-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Tus Especialidades</h3>
                                    <p className="text-gray-600">Selecciona todos los servicios que ofreces (puedes elegir múltiples)</p>
                                </div>
                                
                                <div className="space-y-6">
                                    {/* Servicios predefinidos */}
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Servicios Disponibles</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                            {OFICIOS_OPTIONS.map(office => (
                                                <button
                                                    key={office.id}
                                                    type="button"
                                                    onClick={() => handleOfficesChange(office.name)}
                                                    className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center space-y-2 group ${
                                                        isOfficeSelected(office.name)
                                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-lg transform scale-105'
                                                            : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <FontAwesomeIcon icon={office.icon} className="text-2xl" />
                                                    <span className="text-sm font-medium text-center">{office.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Campo para servicio personalizado */}
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                            <FontAwesomeIcon icon={faPlus} className="mr-2 text-indigo-500" />
                                            Agregar Servicio Personalizado
                                        </h4>
                                        <p className="text-sm text-gray-600 mb-4">
                                            ¿No encuentras tu especialidad? Agrega un servicio personalizado que no esté en la lista.
                                        </p>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={customService}
                                                onChange={(e) => setCustomService(e.target.value)}
                                                placeholder="Ej: Instalación de Persianas, Soldadura, etc."
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addCustomService();
                                                    }
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={addCustomService}
                                                disabled={!customService.trim()}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <FontAwesomeIcon icon={faPlus} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Servicios seleccionados */}
                                    {formData.areas_servicio && formData.areas_servicio.length > 0 && (
                                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center space-x-2 text-green-700">
                                                    <FontAwesomeIcon icon={faCheck} />
                                                    <span className="font-semibold">
                                                        Especialidades seleccionadas ({formData.areas_servicio.length})
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {formData.areas_servicio.map((area, index) => (
                                                    <span 
                                                        key={index} 
                                                        className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                                                    >
                                                        <span>{area}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeService(area)}
                                                            className="ml-1 text-green-600 hover:text-green-800 transition-colors"
                                                        >
                                                            <FontAwesomeIcon icon={faTimes} className="text-xs" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 4: Ubicación */}
                        {currentStep === 4 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-2xl text-indigo-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Ubicación de Servicio</h3>
                                    <p className="text-gray-600">Actualiza tu ubicación para recibir leads cercanos</p>
                                </div>
                                
                                <div className="space-y-4">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Dirección de Servicio
                                    </label>
                            <input
                                        type="text"
                                        value={locationAddress}
                                        onChange={(e) => setLocationAddress(e.target.value)}
                                        placeholder="Ej: Calle Catorce #123, Benito Juárez, Ciudad de México, CDMX"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                    />
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                        <div className="flex items-start space-x-3">
                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-500 mt-1" />
                                            <div>
                                                <p className="text-blue-800 font-medium mb-1">Ubicación en el mapa</p>
                                                <p className="text-blue-600 text-sm">Tu pin azul se actualizará con esta dirección para que los clientes puedan encontrarte en el mapa.</p>
                                            </div>
                                        </div>
                                    </div>
                        </div>
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex justify-between items-center pt-8 border-t border-gray-200 mt-8">
                            <div className="flex items-center space-x-4">
                                {currentStep > 1 && (
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        disabled={loading}
                                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
                                    >
                                        Anterior
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center space-x-4">
                                {statusMessage && (
                                    <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                                        statusMessage.includes('Error') 
                                            ? 'bg-red-50 text-red-600 border border-red-200' 
                                            : isSuccess 
                                                ? 'bg-green-50 text-green-600 border border-green-200'
                                                : 'bg-blue-50 text-blue-600 border border-blue-200'
                                    }`}>
                                        {loading ? (
                                            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                        ) : statusMessage.includes('Error') ? (
                                            <FontAwesomeIcon icon={faExclamationTriangle} />
                                        ) : (
                                            <FontAwesomeIcon icon={faCheck} />
                                        )}
                                        <span className="text-sm font-medium">{statusMessage}</span>
                        </div>
                                )}

                                {currentStep < totalSteps ? (
                            <button
                                type="button"
                                        onClick={nextStep}
                                        disabled={
                                            (currentStep === 1 && !formData.whatsapp) ||
                                            (currentStep === 2 && !formData.descripcion_perfil) ||
                                            (currentStep === 3 && (!formData.areas_servicio || formData.areas_servicio.length === 0))
                                        }
                                        className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                                    >
                                        <span>Siguiente</span>
                                        <FontAwesomeIcon icon={faRocket} className="text-sm" />
                            </button>
                                ) : (
                            <button
                                type="submit"
                                disabled={loading || !formData.areas_servicio || formData.areas_servicio.length === 0}
                                        className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                                    >
                                        {loading ? (
                                            <>
                                                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                                <span>Guardando...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FontAwesomeIcon icon={faCheck} />
                                                <span>Completar Perfil</span>
                                            </>
                                        )}
                            </button>
                                )}
                            </div>
                        </div>
                    </form>
                    </div>
            </div>
        </div>
    );
}