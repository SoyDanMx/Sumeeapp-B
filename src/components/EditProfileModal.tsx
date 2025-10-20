'use client';
import React, { useState, FormEvent } from 'react';
import { Profesional } from '@/types/supabase';
import { updateProfesionalProfile } from '@/lib/supabase/data';

interface EditProfileModalProps {
  profesional: Profesional;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const OFICIOS_OPTIONS = [
    'Electricista', 'Plomero', 'HVAC (Minisplit)', 'Albañil', 
    'Pintor', 'Carpintero', 'Jardinero', 'Herrero'
];

export default function EditProfileModal({ profesional, isOpen, onClose, onSuccess }: EditProfileModalProps) {
    if (!isOpen) return null;

    const [formData, setFormData] = useState<Partial<Profesional>>({
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

    const userId = profesional.user_id;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleOfficesChange = (office: string) => {
        setFormData(prev => {
            const currentAreas = prev.areas_servicio || [];
            if (currentAreas.includes(office)) {
                return { ...prev, areas_servicio: currentAreas.filter(a => a !== office) };
            } else {
                return { ...prev, areas_servicio: [...currentAreas, office] };
            }
        });
    };
    
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatusMessage('Guardando información...');

        if (formData.areas_servicio?.length === 0) {
            setStatusMessage('Error: Debes seleccionar al menos un área de especialización.');
            setLoading(false);
            return;
        }

        try {
            await updateProfesionalProfile(userId, formData, locationAddress || undefined);
            setStatusMessage('¡Perfil actualizado con éxito!');
            onSuccess(); 
        } catch (error: any) {
            console.error('Error al actualizar el perfil:', error);
            setStatusMessage(`Error al guardar: ${error.message || 'Error desconocido'}. Revisa la consola.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto">
                <h2 className="text-3xl font-bold mb-6 text-indigo-700 border-b pb-2">Enriquecer Perfil PRO</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="text-xl font-semibold mb-3 text-gray-800">Datos Básicos y Biografía</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">WhatsApp (Para Leads):</label>
                                <input
                                    type="tel"
                                    name="whatsapp"
                                    // --- CORRECCIÓN ---
                                    value={formData.whatsapp ?? ''}
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
                                    // --- CORRECCIÓN ---
                                    value={formData.numero_imss ?? ''}
                                    onChange={handleChange}
                                    className="w-full border p-2 rounded focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-1">Biografía / Descripción del Perfil:</label>
                            <textarea
                                name="descripcion_perfil"
                                // --- CORRECCIÓN ---
                                value={formData.descripcion_perfil ?? ''}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Describe tu experiencia, certificaciones y tu valor añadido."
                                className="w-full border p-2 rounded focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="text-xl font-semibold mb-3 text-gray-800">Experiencia y Especialización</h3>
                        <div className="flex items-center justify-between p-3 bg-white rounded shadow-sm mb-4">
                            <label className="text-base font-medium text-gray-800">¿Tienes experiencia en plataformas (Ej: Uber)?</label>
                            <input
                                type="checkbox"
                                name="experiencia_uber"
                                // Para checkboxes, `checked` puede manejar booleano directamente
                                checked={formData.experiencia_uber || false}
                                onChange={handleChange}
                                className="h-5 w-5 text-indigo-600 rounded-full focus:ring-indigo-500"
                            />
                        </div>
                        {formData.experiencia_uber && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Años de experiencia en plataformas:</label>
                                <input
                                    type="number"
                                    name="años_experiencia_uber"
                                    // --- CORRECCIÓN ---
                                    value={formData.años_experiencia_uber ?? 0}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full border p-2 rounded focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        )}
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
                    <div className="flex justify-between items-center pt-4 border-t">
                        <p className={`text-sm font-semibold ${statusMessage.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>
                            {statusMessage}
                        </p>
                        <div>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg mr-3 hover:bg-gray-300"
                            >
                                Cerrar
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !formData.areas_servicio || formData.areas_servicio.length === 0}
                                className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
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