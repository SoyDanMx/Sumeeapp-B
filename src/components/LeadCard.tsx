// src/components/LeadCard.tsx
import React from 'react';
import { Lead } from '@/types/supabase'; // Asegura que esta interfaz exista
import { calculateDistance } from '@/lib/calculateDistance'; // Importa la utilidad de distancia

// Asegúrate de que las interfaces Lead y Profesional se pasen al componente principal 
// para que profesionalLat y profesionalLng no sean 'undefined'.

interface LeadCardProps {
    lead: Lead;
    profesionalLat: number; // Latitud del profesional (para cálculo de distancia)
    profesionalLng: number; // Longitud del profesional (para cálculo de distancia)
}

// Mapeo de colores para el estado del Lead (Mejora la UX con feedback visual)
const statusColors: { [key: string]: string } = {
    'Nuevo': 'bg-red-100 text-red-800',
    'Contactado': 'bg-yellow-100 text-yellow-800',
    'En Proceso': 'bg-blue-100 text-blue-800',
    'Cerrado': 'bg-green-100 text-green-800',
};

export default function LeadCard({ lead, profesionalLat, profesionalLng }: LeadCardProps) {
    
    // Calcula la distancia en tiempo de renderizado
    const distance = calculateDistance(
        profesionalLat, 
        profesionalLng, 
        lead.ubicacion_lat, 
        lead.ubicacion_lng
    );

    // Crea el enlace de WhatsApp pre-llenado
    const whatsappLink = `https://wa.me/${lead.whatsapp}?text=Hola%20${lead.nombre_cliente},%20soy%20tu%20profesional%20de%20SumeeApp.%20Sobre%20tu%20proyecto%20de%20${lead.descripcion_proyecto}.`;

    return (
        <div className="bg-white border p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            
            <div className="flex justify-between items-center mb-2">
                {/* 1. Titulo y Distancia (UX Prioridad) */}
                <h3 className="font-semibold text-lg text-gray-800 truncate">
                    {lead.descripcion_proyecto.split(' ').slice(0, 3).join(' ')}... {/* Título truncado para la tarjeta */}
                </h3>
                <span className="text-sm font-medium text-indigo-600">
                    {distance} km 📍 {/* Indicador visual de distancia, como en Uber */}
                </span>
            </div>
            
            <div className="flex justify-between items-center text-sm mb-3">
                {/* 2. Estado del Lead (UX Feedback) */}
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

            {/* 3. Acción Clara (CTA) - Botón de WhatsApp */}
            <a 
                href={whatsappLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-500 hover:bg-green-600 transition-colors"
            >
                {/* Reemplaza  con un ícono real de WhatsApp (SVG o componente de ícono) */}
                Contactar a {lead.nombre_cliente}
            </a>

            <button 
                className="w-full mt-2 text-indigo-500 hover:text-indigo-700 text-xs font-medium"
                // Aquí podrías agregar lógica para centrar el mapa en este lead específico
            >
                Ver en Mapa
            </button>
        </div>
    );
}