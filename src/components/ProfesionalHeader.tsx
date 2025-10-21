import React from 'react';
import { Profesional } from '@/types/supabase'; 

interface Props {
  profesional: Profesional;
  onEditClick: () => void; // Prop para abrir el modal de edición
}

export default function ProfesionalHeader({ profesional, onEditClick }: Props) {
    const isUberPro = profesional.experiencia_uber;
    // Aseguramos que la calificación sea un número válido entre 0 y 5
    const rating = Math.min(Math.max(profesional.calificacion_promedio || 0, 0), 5);
    const starCount = Math.round(rating); // Redondeo para mostrar estrellas

    return (
        <header className="bg-white shadow-md p-6 border-t-4 border-indigo-600">
            <div className="flex justify-between items-start">
                
                {/* Contenedor de la Tarjeta de Identidad Enriquecida */}
                <div className="flex items-center space-x-6">
                    {/* Placeholder para Foto de Perfil */}
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl border-2 border-indigo-300">
                        {profesional.full_name ? profesional.full_name[0] : 'P'}
                    </div>

                    <div className="flex-1">
                        {/* 1. Nombre Completo con Badge Verificado */}
                        <div className="flex items-center space-x-3 mb-2">
                            <h1 className="text-3xl font-extrabold text-gray-900">{profesional.full_name}</h1>
                            {/* Badge Verificado - Trust Signal */}
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 shadow-sm">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Verificado
                            </span>
                        </div>
                        
                        {/* 2. Calificación en estrellas mejorada (UX visual) */}
                        <div className="flex items-center space-x-2 my-2">
                            <div className="flex items-center space-x-1">
                                {/* Renderiza las estrellas basadas en el rating */}
                                {Array.from({ length: 5 }, (_, i) => (
                                    <span 
                                        key={i} 
                                        className={`text-lg ${i < starCount ? 'text-yellow-400' : 'text-gray-300'}`}
                                    >
                                        ⭐
                                    </span>
                                ))}
                            </div>
                            <span className="text-gray-600 text-sm font-medium">({rating.toFixed(1)} / 5.0)</span>
                        </div>
                        
                        {/* 3. Experiencia Uber Pro (UX Badge) */}
                        {isUberPro && (
                             <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full text-green-700 bg-green-100 border border-green-300 shadow-sm mt-1">
                                 ✅ PRO | {profesional.años_experiencia_uber} años de Experiencia en Plataforma
                             </span>
                        )}
                        
                        {/* 4. Oficios y Biografía */}
                        <p className="text-sm text-gray-600 mt-2">
                            Especialista en: <span className="font-semibold">{profesional.areas_servicio?.join(', ') || 'Sin definir'}</span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1 italic">
                            {profesional.descripcion_perfil ? profesional.descripcion_perfil.substring(0, 50) + '...' : 'Biografía pendiente'}
                        </p>
                    </div>
                </div>

                {/* Columna de Acciones y Contacto */}
                <div className="ml-4 flex flex-col items-end space-y-3">
                    <button
                        onClick={onEditClick} // Llama a la función para abrir el modal
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-indigo-200"
                    >
                        📝 Editar Perfil (Enriquecer)
                    </button>
                    
                    {/* Datos de contacto clave para referencia rápida */}
                    <div className="text-right text-sm text-gray-700 p-2 border rounded-lg bg-gray-50">
                        <p>WhatsApp: <span className="font-medium">{profesional.whatsapp || 'N/A'}</span></p>
                        <p>IMSS: <span className="font-medium">{profesional.numero_imss || 'N/A'}</span></p>
                    </div>

                    {/* Toggle de Disponibilidad (UX Feedback) */}
                    <div className="flex items-center text-sm">
                        <span className="mr-2">Disponibilidad:</span> 
                        <span className="ml-2 bg-green-500 w-4 h-4 rounded-full shadow-inner"></span>
                    </div>
                </div>
            </div>
        </header>
    );
}