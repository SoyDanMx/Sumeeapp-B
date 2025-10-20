// src/app/dashboard/page.tsx

'use client'; 

import { useState } from 'react';
import dynamic from 'next/dynamic'; 
import { useProfesionalData } from '@/hooks/useProfesionalData'; 
import LeadCard from '@/components/LeadCard';
import ProfesionalHeader from '@/components/ProfesionalHeader';
import EditProfileModal from '@/components/EditProfileModal'; 
import { Profesional, Lead } from '@/types/supabase';

// 1. Carga Dinámica del Mapa
const DynamicMapComponent = dynamic(
  () => import('@/components/MapComponent'), 
  { 
    loading: () => <div className="p-8 text-center text-gray-500">Cargando mapa...</div>,
    ssr: false 
  }
);

export default function ProfesionalDashboardPage() {
    const { profesional, leads, isLoading, error, refetchData } = useProfesionalData(); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Filtros y Estados de Interacción
    const [selectedOffice, setSelectedOffice] = useState<string>('Todos'); 
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null); 
    
    // Lógica de Errores y Carga
    if (isLoading) {
        return <div className="p-8 text-center bg-gray-50">Cargando datos del profesional...</div>; 
    }

    if (error) {
        // El error genérico {} se mostrará aquí si la fila de perfil no existe (el problema de data)
        return <div className="p-8 text-red-600 font-semibold">Error al cargar el perfil. Por favor, asegúrate de que tu usuario tiene una fila en la tabla 'profiles' o contacta a soporte.</div>;
    }
    
    if (!profesional) {
        return <div className="p-8">No se encontraron datos de profesional.</div>;
    }
    
    // Lógica para filtros y refetch
    const handleProfileUpdateSuccess = () => {
        refetchData(); 
        setIsModalOpen(false); 
    };
    
    const availableOffices = ['Todos', ...(profesional.areas_servicio || [])];
    const filteredLeads = leads?.filter(lead => {
        if (selectedOffice === 'Todos') return true;
        return lead.descripcion_proyecto.toLowerCase().includes(selectedOffice.toLowerCase());
    }) || [];
    
    const profesionalLat = profesional.ubicacion_lat ?? 0;
    const profesionalLng = profesional.ubicacion_lng ?? 0;


    return (
        <div className="flex flex-col h-screen">
            
            <ProfesionalHeader 
                profesional={profesional as Profesional} 
                onEditClick={() => setIsModalOpen(true)}
            />

            {/* BARRA DE FILTROS */}
            <div className="p-4 bg-gray-100 border-b flex flex-wrap gap-2 items-center">
                <h3 className="font-medium mr-2 text-gray-700">Filtrar por Oficio:</h3>
                {availableOffices.map(office => (
                    <button 
                        key={office} 
                        onClick={() => setSelectedOffice(office)}
                        className={`px-3 py-1 text-sm rounded transition-colors 
                           ${selectedOffice === office ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border text-gray-700 hover:bg-indigo-100'}`}
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
                        profesional={profesional as Profesional} 
                        selectedLeadId={selectedLeadId} // ⬅️ AHORA PASA ESTE PROP
                        onLeadClick={setSelectedLeadId} // ⬅️ Y ESTE PROP
                    />
                </div>
                
                {/* BARRA LATERAL: LISTA DE LEADS */}
                <aside className="w-[380px] overflow-y-auto bg-gray-50 p-4 border-l">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Leads Asignados ({filteredLeads.length})</h2>
                    {filteredLeads.length > 0 ? (
                        <div className="space-y-4">
                            {filteredLeads.map((lead) => (
                                <LeadCard 
                                    key={lead.id} 
                                    lead={lead} 
                                    profesionalLat={profesionalLat} 
                                    profesionalLng={profesionalLng}
                                    isSelected={lead.id === selectedLeadId}
                                    onSelect={() => setSelectedLeadId(lead.id)}
                                />
                            ))}
                        </div>
                    ) : (
                         <p className="text-gray-500 p-4 text-center border-dashed border-2 rounded">
                            No hay leads de {selectedOffice !== 'Todos' ? selectedOffice : 'ningún oficio'} para mostrar.
                        </p>
                    )}
                </aside>
            </div>

            {/* Modal de Edición */}
            <EditProfileModal
                profesional={profesional as Profesional}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleProfileUpdateSuccess}
            />
        </div>
    );
}