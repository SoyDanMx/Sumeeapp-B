'use client'; 

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic'; 
import { useProfesionalData } from '@/hooks/useProfesionalData'; 
import LeadCard from '@/components/LeadCard';
import ProfesionalHeader from '@/components/ProfesionalHeader';
import EditProfileModal from '@/components/EditProfileModal'; 
import { Profesional, Lead } from '@/types/supabase';

// 1. Usa next/dynamic para deshabilitar el SSR para MapComponent
const DynamicMapComponent = dynamic(
  // La ruta de importación es correcta, pero la variable debía ser MapComponent
  () => import('@/components/MapComponent'), 
  { 
    loading: () => <p className="text-center p-8">Cargando mapa...</p>,
    ssr: false 
  }
);

export default function ProfesionalDashboardPage() {
    const { profesional, leads, isLoading, error, refetchData } = useProfesionalData(); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Nuevo estado para el filtro de oficios
    const [selectedOffice, setSelectedOffice] = useState<string>('Todos'); 
    
    // NUEVO ESTADO: Para el lead seleccionado desde el mapa o la lista
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null); 


    // Función para obtener la lista de oficios únicos más la opción 'Todos'
    const availableOffices = ['Todos', ...(profesional?.areas_servicio || [])];
    
    // Lógica de Filtrado (Mejorada para no depender solo del 'servicio_requerido' explícito)
    const filteredLeads = leads?.filter(lead => {
        if (selectedOffice === 'Todos') return true;
        // Filtra por inclusión de la palabra clave del oficio en la descripción del proyecto
        return lead.descripcion_proyecto.toLowerCase().includes(selectedOffice.toLowerCase());
    }) || [];

    // Lógica de Errores y Carga
    if (isLoading) {
        return <div className="p-8">Cargando datos del profesional...</div>; 
    }

    if (error) {
        console.error("Error al cargar perfil:", error);
        return <div className="p-8 text-red-600">Error crítico al cargar el perfil. Por favor, asegúrate de que tu usuario tiene una fila en la tabla 'profiles' en Supabase.</div>;
    }
    
    if (!profesional) {
        return <div className="p-8">No se encontraron datos de profesional. Por favor, contacta a soporte.</div>;
    }
    
    // Función de éxito después de guardar en el modal
    const handleProfileUpdateSuccess = () => {
        refetchData(); // Vuelve a ejecutar la función de fetching de datos
        setIsModalOpen(false); // Cierra el modal
    };
    
    // Comprueba las coordenadas del profesional antes de pasarlas al LeadCard
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
                {/* COLUMNA PRINCIPAL: MAPA (65%) */}
                <div className="flex-1 min-h-[50vh]">
                    <DynamicMapComponent 
                        leads={filteredLeads} 
                        profesional={profesional as Profesional} 
                        // Pasa el estado de selección
                        selectedLeadId={selectedLeadId} 
                        onLeadClick={setSelectedLeadId} // Función para manejar el clic en el pin
                    />
                </div>
                
                {/* BARRA LATERAL: LISTA DE LEADS (35%) */}
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
                                    // Resalta la tarjeta si está seleccionada
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