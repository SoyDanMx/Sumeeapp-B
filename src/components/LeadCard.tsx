// src/components/LeadCard.tsx
import React from 'react';
import { Lead } from '@/types/supabase'; 
import { calculateDistance } from '@/lib/calculateDistance'; 

// Mapeo de colores para el estado del Lead
const statusColors: { [key: string]: string } = {
    'Nuevo': 'bg-red-100 text-red-800',
    'Contactado': 'bg-yellow-100 text-yellow-800',
    'En Proceso': 'bg-blue-100 text-blue-800',
    'Cerrado': 'bg-green-100 text-green-800',
};

// 🚨 CORRECCIÓN: Se añaden isSelected y onSelect a la interfaz
interface LeadCardProps {
    lead: Lead;
    profesionalLat: number;
    profesionalLng: number;
    isSelected: boolean; // ⬅️ NUEVO: Para saber si la tarjeta debe resaltarse
    onSelect: () => void; // ⬅️ NUEVO: Para manejar el clic en la tarjeta
}

export default function LeadCard({ lead, profesionalLat, profesionalLng, isSelected, onSelect }: LeadCardProps) {
    
    const distance = calculateDistance(
        profesionalLat, 
        profesionalLng, 
        lead.ubicacion_lat, 
        lead.ubicacion_lng
    );

    const whatsappLink = `https://wa.me/${lead.whatsapp}?text=Hola%20${lead.nombre_cliente},%20soy%20tu%20profesional%20de%20SumeeApp.%20Sobre%20tu%20proyecto%20de%20${lead.descripcion_proyecto}.`;

    // Lógica de estilo para resaltar la tarjeta si está seleccionada
    const cardClasses = `bg-white border p-4 rounded-lg shadow-md transition-all cursor-pointer 
        ${isSelected 
            ? 'border-indigo-500 ring-4 ring-indigo-200 shadow-xl' // Estilo para tarjeta seleccionada
            : 'hover:shadow-lg border-gray-200'
        }`;

    return (
        <div 
            className={cardClasses}
            onClick={onSelect} // ⬅️ Hace que toda la tarjeta sea clickable
        >
            
            <div className="flex justify-between items-center mb-2">
                {/* Titulo y Distancia */}
                <h3 className="font-semibold text-lg text-gray-800 truncate">
                    {lead.descripcion_proyecto.split(' ').slice(0, 3).join(' ')}...
                </h3>
                <span className="text-sm font-medium text-indigo-600">
                    {distance} km 📍
                </span>
            </div>
            
            <div className="flex justify-between items-center text-sm mb-3">
                {/* Estado del Lead */}
                <span className={`px-2 py-0.5 rounded-full ${statusColors[lead.estado] || 'bg-gray-200'}`}>
                    {lead.estado}
                </span>
                <span className="text-gray-500">
                    Creado: {new Date(lead.fecha_creacion).toLocaleDateString()}
                </span>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {lead.descripcion_proyecto}
            </p>

            {/* Acción Clara (CTA) - Botón de WhatsApp */}
            <a 
                href={whatsappLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-500 hover:bg-green-600 transition-colors"
                onClick={(e) => e.stopPropagation()} // Evita que el clic del enlace dispare el onSelect de la tarjeta
            >
                Contactar a {lead.nombre_cliente}
            </a>

            <button 
                className="w-full mt-2 text-indigo-500 hover:text-indigo-700 text-xs font-medium"
                // Esta acción ya está cubierta por el onSelect de la tarjeta, pero se mantiene para claridad
            >
                Ver en Mapa
            </button>
        </div>
    );
}