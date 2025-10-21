// RUTA DEL ARCHIVO: src/app/dashboard/page.tsx
'use client'; 

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic'; 
import { useProfesionalData } from '@/hooks/useProfesionalData'; 
import LeadCard from '@/components/LeadCard';
import ProfesionalHeader from '@/components/ProfesionalHeader';
import EditProfileModal from '@/components/EditProfileModal';
import RevenueWidget from '@/components/RevenueWidget'; 
import { Profesional, Lead } from '@/types/supabase';

// Carga dinámica del mapa para optimizar el rendimiento y evitar errores de SSR
const DynamicMapComponent = dynamic(
  () => import('@/components/MapComponent'), 
  { 
    loading: () => <div className="p-8 text-center text-gray-500">Cargando mapa...</div>,
    ssr: false 
  }
);

// Definir una ubicación por defecto para cuando el profesional no tenga una.
const DEFAULT_MAP_CENTER = { lat: 19.4326, lng: -99.1332 }; // Centro de CDMX

export default function ProfesionalDashboardPage() {
    // --- TODOS LOS HOOKS VAN PRIMERO - ANTES DE CUALQUIER RETURN CONDICIONAL ---
    const { profesional, leads, isLoading, error, refetchData } = useProfesionalData(); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOffice, setSelectedOffice] = useState<string>('Todos'); 
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null); 

    // Función para ser llamada cuando el perfil se actualiza con éxito en el modal
    const handleProfileUpdateSuccess = () => {
        refetchData(); 
        setIsModalOpen(false); 
    };
    
    // Memoización del availableOffices - debe ir después de los hooks
    const availableOffices = useMemo(() => {
        return ['Todos', ...(profesional?.areas_servicio || [])];
    }, [profesional?.areas_servicio]);

    // Lógica de filtrado de leads con "null-safety" para evitar errores de compilación
    const filteredLeads = useMemo(() => {
        if (!leads) return [];

        return leads.filter(lead => {
            if (selectedOffice === 'Todos') return true;
            
            // Comprobación segura para evitar llamar a .toLowerCase() en un valor nulo
            return (lead.descripcion_proyecto?.toLowerCase() ?? '').includes(selectedOffice.toLowerCase());
        });
    }, [leads, selectedOffice]);

    // Memoización de coordenadas del profesional
    const profesionalCoords = useMemo(() => ({
        lat: profesional?.ubicacion_lat ?? DEFAULT_MAP_CENTER.lat,
        lng: profesional?.ubicacion_lng ?? DEFAULT_MAP_CENTER.lng
    }), [profesional?.ubicacion_lat, profesional?.ubicacion_lng]);
    
    // --- AHORA SÍ, RETURNS CONDICIONALES DESPUÉS DE TODOS LOS HOOKS ---
    if (isLoading) {
        return <div className="p-8 text-center bg-gray-50 min-h-screen flex items-center justify-center">Cargando datos del profesional...</div>; 
    }

    if (error) {
        return <div className="p-8 text-red-600 font-semibold min-h-screen flex items-center justify-center text-center">Error al cargar el perfil. Asegúrate de que tu usuario tiene un perfil asociado o contacta a soporte.</div>;
    }
    
    if (!profesional) {
        return <div className="p-8 min-h-screen flex items-center justify-center">No se encontraron datos del profesional.</div>;
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            
            <ProfesionalHeader 
                profesional={profesional} 
                onEditClick={() => setIsModalOpen(true)}
            />

            {/* Revenue Widget para Métricas MVP */}
            <div className="px-4 py-2 bg-gray-50">
                <RevenueWidget className="max-w-5xl mx-auto" />
            </div>

            {/* BARRA DE FILTROS */}
            <div className="p-4 bg-white border-b flex flex-wrap gap-2 items-center shadow-sm">
                <h3 className="font-medium mr-2 text-gray-700">Filtrar por Oficio:</h3>
                {availableOffices.map(office => (
                    <button 
                        key={office} 
                        onClick={() => setSelectedOffice(office)}
                        className={`px-3 py-1 text-sm rounded-full transition-all duration-200 
                           ${selectedOffice === office 
                                ? 'bg-indigo-600 text-white shadow-md transform scale-105' 
                                : 'bg-gray-200 text-gray-700 hover:bg-indigo-100'}`}
                    >
                        {office}
                    </button>
                ))}
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* COLUMNA PRINCIPAL: MAPA */}
                <div className="flex-1 min-w-0 h-full">
                    <DynamicMapComponent 
                        leads={filteredLeads} 
                        profesional={profesional} 
                        selectedLeadId={selectedLeadId}
                        onLeadClick={setSelectedLeadId}
                    />
                </div>
                
                {/* BARRA LATERAL: LISTA DE LEADS */}
                <aside className="w-full md:w-[380px] overflow-y-auto bg-white p-4 border-l">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Leads Asignados ({filteredLeads.length})</h2>
                    {filteredLeads.length > 0 ? (
                        <div className="space-y-4">
                            {filteredLeads.map((lead) => (
                                <LeadCard 
                                    key={lead.id} 
                                    lead={lead} 
                                    profesionalLat={profesionalCoords.lat} 
                                    profesionalLng={profesionalCoords.lng}
                                    isSelected={lead.id === selectedLeadId}
                                    onSelect={() => setSelectedLeadId(lead.id)}
                                />
                            ))}
                        </div>
                    ) : (
                         <p className="text-gray-500 p-4 text-center border-dashed border-2 rounded-lg bg-gray-50">
                            No hay leads de {selectedOffice !== 'Todos' ? `"${selectedOffice}"` : 'ningún oficio'} para mostrar.
                        </p>
                    )}
                </aside>
            </div>

            {/* Modal de Edición */}
            <EditProfileModal
                profesional={profesional}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleProfileUpdateSuccess}
            />
        </div>
    );
}