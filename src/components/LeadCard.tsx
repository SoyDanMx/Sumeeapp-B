'use client';

import { Lead } from '@/types/supabase';
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faSpinner, faUser } from '@fortawesome/free-solid-svg-icons';
import { acceptLead } from '@/lib/supabase/data';
import { supabase } from '@/lib/supabase/client';

// Asumo que tienes una función como esta en alguna parte de tu proyecto
function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
    // ... lógica para calcular la distancia en km ...
    // Esta función NO acepta null, por eso fallaba el build.
    return 0; // Placeholder
}

interface LeadCardProps {
    lead: Lead;
    profesionalLat: number;
    profesionalLng: number;
    isSelected: boolean;
    onSelect: () => void;
    onLeadAccepted?: () => void; // Callback para refrescar datos cuando se acepta un lead
}

export default function LeadCard({ lead, profesionalLat, profesionalLng, isSelected, onSelect, onLeadAccepted }: LeadCardProps) {
    const [isAccepting, setIsAccepting] = useState(false);
    const [accepted, setAccepted] = useState(false);
    
    // --- ESTA ES LA CORRECCIÓN ESPECÍFICA ---
    const distanciaKm = calcularDistancia(
        profesionalLat,
        profesionalLng,
        lead.ubicacion_lat ?? profesionalLat, // Si la lat del lead es null, usamos la del profesional (distancia = 0)
        lead.ubicacion_lng ?? profesionalLng  // Si la lng del lead es null, usamos la del profesional (distancia = 0)
    ).toFixed(1); // Redondeamos a 1 decimal

    const handleAcceptLead = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Evitar que se ejecute onSelect
        setIsAccepting(true);

        try {
            // Obtener el ID del usuario actual
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error('Usuario no autenticado');
            }

            // Aceptar el lead
            const result = await acceptLead(lead.id, user.id);
            
            if (result.success) {
                setAccepted(true);
                // Llamar callback para refrescar datos
                if (onLeadAccepted) {
                    onLeadAccepted();
                }
            }
        } catch (error: any) {
            console.error('Error al aceptar el lead:', error);
            alert('Error al aceptar el proyecto. Por favor, inténtalo de nuevo.');
        } finally {
            setIsAccepting(false);
        }
    };

    const getStatusBadge = () => {
        switch (lead.estado?.toLowerCase()) {
            case 'nuevo':
                return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Nuevo</span>;
            case 'contactado':
                return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Contactado</span>;
            case 'en_progreso':
                return <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">En Progreso</span>;
            case 'completado':
                return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Completado</span>;
            default:
                return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{lead.estado || 'Nuevo'}</span>;
        }
    };

    return (
        <div className={`p-4 border rounded-lg transition-all duration-200 ${
            isSelected ? 'bg-indigo-100 border-indigo-500 shadow-md' : 'bg-white hover:border-gray-400'
        }`}>
            <div onClick={onSelect} className="cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-800 flex items-center">
                        <FontAwesomeIcon icon={faUser} className="mr-2 text-gray-500" />
                        {lead.nombre_cliente || 'Cliente Anónimo'}
                    </h3>
                    {getStatusBadge()}
                </div>
                
                <p className="text-sm text-gray-600 truncate mb-2">{lead.descripcion_proyecto}</p>
                
                <div className="text-xs text-gray-500">
                    {distanciaKm > "0.0" 
                        ? `Aprox. a ${distanciaKm} km de tu ubicación`
                        : 'Ubicación no especificada por el cliente'
                    }
                </div>
                
                <div className="text-xs text-gray-400 mt-1">
                    {new Date(lead.fecha_creacion).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
            </div>

            {/* Botón Aceptar Proyecto - Solo si está en estado 'Nuevo' */}
            {lead.estado?.toLowerCase() === 'nuevo' && !accepted && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <button
                        onClick={handleAcceptLead}
                        disabled={isAccepting}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                        {isAccepting ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin />
                                <span>Aceptando...</span>
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faCheck} />
                                <span>Aceptar Proyecto</span>
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Estado de aceptado */}
            {accepted && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-center space-x-2 text-green-600 text-sm font-medium">
                        <FontAwesomeIcon icon={faCheck} />
                        <span>¡Proyecto Aceptado!</span>
                    </div>
                </div>
            )}
        </div>
    );
}