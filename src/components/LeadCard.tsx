'use client';

import { Lead } from '@/types/supabase';
import React from 'react';

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
}

export default function LeadCard({ lead, profesionalLat, profesionalLng, isSelected, onSelect }: LeadCardProps) {
    
    // --- ESTA ES LA CORRECCIÓN ESPECÍFICA ---
    const distanciaKm = calcularDistancia(
        profesionalLat,
        profesionalLng,
        lead.ubicacion_lat ?? profesionalLat, // Si la lat del lead es null, usamos la del profesional (distancia = 0)
        lead.ubicacion_lng ?? profesionalLng  // Si la lng del lead es null, usamos la del profesional (distancia = 0)
    ).toFixed(1); // Redondeamos a 1 decimal

    return (
        <div 
            onClick={onSelect}
            className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${isSelected ? 'bg-indigo-100 border-indigo-500 shadow-md' : 'bg-white hover:border-gray-400'}`}
        >
            <h3 className="font-bold text-gray-800">{lead.nombre_cliente}</h3>
            <p className="text-sm text-gray-600 truncate">{lead.descripcion_proyecto}</p>
            <div className="text-xs text-gray-500 mt-2">
                {distanciaKm > "0.0" 
                    ? `Aprox. a ${distanciaKm} km de tu ubicación`
                    : 'Ubicación no especificada por el cliente'
                }
            </div>
        </div>
    );
}