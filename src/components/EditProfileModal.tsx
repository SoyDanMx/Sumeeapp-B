'use client';
import React, { useState, FormEvent } from 'react';
import { Profesional } from '@/types/supabase'; // Asegúrate de tener este tipo
import { updateProfesionalProfile } from '@/lib/supabase/data'; // Función de utilidad (Tarea 2.2)

interface EditProfileModalProps {
  profesional: Profesional;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Función para refrescar los datos en el dashboard
}

// Opciones de Oficios (para el Multi-Select)
const OFICIOS_OPTIONS = [
    'Electricista', 'Plomero', 'HVAC (Minisplit)', 'Albañil', 
    'Pintor', 'Carpintero', 'Jardinero', 'Herrero'
];

export default function EditProfileModal({ profesional, isOpen, onClose, onSuccess }: EditProfileModalProps) {
    if (!isOpen) return null;

    // Inicializa el estado con los datos actuales del profesional
    const [formData, setFormData] = useState<Partial<Profesional>>({
        whatsapp: profesional.whatsapp || '',
        numero_imss: profesional.numero_imss || '',
        descripcion_perfil: profesional.descripcion_perfil || '',
        experiencia_uber: profesional.experiencia_uber || false,
        años_experiencia_uber: profesional.años_experiencia_uber || 0,
        areas_servicio: profesional.areas_servicio || [],
    });
    // Estado separado para la dirección que se enviará a Geocoding
    const [locationAddress, setLocationAddress] = useState(''); 
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    const userId = profesional.user_id;

    // Manejador genérico de cambios en inputs y textareas
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        setFormData(prev => ({
            ...prev,
            // Conversión de tipo si es necesario (checkbox)
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    // Manejador específico para la selección de oficios
    const handleOfficesChange = (office: string) => {
        setFormData(prev => {
            const currentAreas = prev.areas_servicio || [];
            if (currentAreas.includes(office)) {
                // Remover oficio
                return { 
                    ...prev, 
                    areas_servicio: currentAreas.filter(a => a !== office) 
                };
            } else {
                // Añadir oficio
                return { 
                    ...prev, 
                    areas_servicio: [...currentAreas, office] 
                };
            }
        });
    };
    
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatusMessage('Guardando información...');

        // Validaciones básicas antes de enviar
        if (formData.areas_servicio?.length === 0) {
            setStatusMessage('Error: Debes seleccionar al menos un área de especialización.');
            setLoading(false);
            return;
        }

        try {
            // Se pasa locationAddress SOLO si no está vacío, sino se pasa undefined
            await updateProfesionalProfile(userId, formData, locationAddress || undefined);

            setStatusMessage('¡Perfil actualizado con éxito!');
            
            // Refresca la data en el dashboard y cierra el modal
            onSuccess(); 

        } catch (error: any) {
            console.error('Error al actualizar el perfil:', error);
            // Mostrar un mensaje de error legible para el usuario
            setStatusMessage(`Error al guardar: ${error.message || 'Error desconocido'}. Revisa la consola.`);
        } finally {
            setLoading(false);
        }
    };
    
    // --- Renderizado del Modal ---

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto transform transition-all">
                
                <h2 className="text-3xl font-bold mb-6 text-indigo-700 border-b pb-2">
                    Enriquecer Perfil PRO
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* SECCIÓN 1: CONTACTO Y BIOGRAFÍA */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="text-xl font-semibold mb-3 text-gray-800">Datos Básicos y Biografía</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">WhatsApp (Para Leads):</label>
                                <input
                                    type="tel"
                                    name="whatsapp"
                                    value={formData.whatsapp}
                                    onChange={handleChange}
                                    placeholder="Ej: 525512345678 (Solo números)"
                                    className="w-full border p-2 rounded focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Número IMSS (Opcional):</label>
                                <input
                                    type="text"
                                    name="numero_imss"
                                    value={formData.numero_imss}
                                    onChange={handleChange}
                                    className="w-full border p-2 rounded focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-1">Biografía / Descripción del Perfil:</label>
                            <textarea
                                name="descripcion_perfil"
                                value={formData.descripcion_perfil}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Describe tu experiencia, certificaciones y tu valor añadido."
                                className="w-full border p-2 rounded focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    {/* SECCIÓN 2: EXPERIENCIA Y OFICIOS */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="text-xl font-semibold mb-3 text-gray-800">Experiencia y Especialización</h3>
                        
                        {/* Experiencia Uber Toggle */}
                        <div className="flex items-center justify-between p-3 bg-white rounded shadow-sm mb-4">
                            <label className="text-base font-medium text-gray-800">¿Tienes experiencia en plataformas (Ej: Uber)?</label>
                            <input
                                type="checkbox"
                                name="experiencia_uber"
                                checked={formData.experiencia_uber}
                                onChange={handleChange}
                                className="h-5 w-5 text-indigo-600 rounded-full focus:ring-indigo-500"
                            />
                        </div>
                        
                        {/* Años de experiencia (Condicional) */}
                        {formData.experiencia_uber && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Años de experiencia en plataformas:</label>
                                <input
                                    type="number"
                                    name="años_experiencia_uber"
                                    value={formData.años_experiencia_uber}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full border p-2 rounded focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        )}

                        {/* Selección de Oficios */}
                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-2">Áreas de Especialización (Oficios):</label>
                            <div className="flex flex-wrap gap-2">
                                {OFICIOS_OPTIONS.map(office => (
                                    <button
                                        key={office}
                                        type="button"
                                        onClick={() => handleOfficesChange(office)}
                                        className={`px-3 py-1 text-sm rounded-full transition-colors 
                                            ${formData.areas_servicio?.includes(office) 
                                                ? 'bg-indigo-600 text-white shadow-md' 
                                                : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
                                            }`
                                        }
                                    >
                                        {office}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Selecciona todos los oficios que manejas.</p>
                        </div>

                    </div>
                    
                    {/* SECCIÓN 3: UBICACIÓN BASE (Geocoding) */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="text-xl font-semibold mb-3 text-gray-800">Ubicación Base de Servicio</h3>
                         <label className="block text-sm font-medium mb-1">Actualizar Dirección de Servicio (para el mapa):</label>
                         <input
                            type="text"
                            value={locationAddress}
                            onChange={(e) => setLocationAddress(e.target.value)}
                            placeholder="Ej: Calle Catorce, Ciudad de México, 09810"
                            className="w-full border p-2 rounded focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            *Solo ingrésala si deseas mover tu pin azul en el mapa. Utiliza una dirección legible.
                        </p>
                    </div>

                    {/* PIE DE PÁGINA Y ACCIONES */}
                    <div className="flex justify-between items-center pt-4 border-t">
                        <p className={`text-sm font-semibold ${statusMessage.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>
                            {statusMessage}
                        </p>
                        <div>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg mr-3 hover:bg-gray-300 transition-colors"
                            >
                                Cerrar
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !formData.areas_servicio || formData.areas_servicio.length === 0}
                                className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 shadow-lg"
                            >
                                {loading ? 'Guardando...' : 'Guardar y Publicar'}
                            </button>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
}