// RUTA DEL ARCHIVO: src/app/professional-dashboard/page.tsx
'use client'; 

import { useState, useMemo } from 'react'; // Movimos useMemo aquí para claridad
import dynamic from 'next/dynamic'; 
import { useProfesionalData } from '@/hooks/useProfesionalData'; 
import LeadCard from '@/components/LeadCard';
import ProfesionalHeader from '@/components/ProfesionalHeader';
import EditProfileModal from '@/components/EditProfileModal'; 
import { Profesional, Lead } from '@/types/supabase';

const DynamicMapComponent = dynamic(
  () => import('@/components/MapComponent'), 
  { 
    loading: () => <div className="p-8 text-center text-gray-500">Cargando mapa...</div>,
    ssr: false 
  }
);

const DEFAULT_MAP_CENTER = { lat: 19.4326, lng: -99.1332 };

export default function ProfesionalDashboardPage() {
    // --- PASO 1: TODOS LOS HOOKS SE DECLARAN AQUÍ ARRIBA ---
    const { profesional, leads, isLoading, error, refetchData } = useProfesionalData(); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOffice, setSelectedOffice] = useState<string>('Todos'); 
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null); 

    // --- PASO 2: TODA LA LÓGICA DE PREPARACIÓN DE DATOS VA AQUÍ ---
    const availableOffices = useMemo(() => 
        ['Todos', ...(profesional?.areas_servicio || [])],
        [profesional?.areas_servicio]
    );
    
    const filteredLeads = useMemo(() => {
        if (!leads) return [];
        return leads.filter(lead => {
            if (selectedOffice === 'Todos') return true;
            return (lead.descripcion_proyecto?.toLowerCase() ?? '').includes(selectedOffice.toLowerCase());
        });
    }, [leads, selectedOffice]);

    const profesionalLat = profesional?.ubicacion_lat ?? DEFAULT_MAP_CENTER.lat;
    const profesionalLng = profesional?.ubicacion_lng ?? DEFAULT_MAP_CENTER.lng;

    // --- PASO 3: LAS GUARDAS DE RETORNO CONDICIONAL VAN DESPUÉS ---
    if (isLoading) {
        return <div className="p-8 text-center bg-gray-50 min-h-screen flex items-center justify-center">Cargando datos del profesional...</div>; 
    }

    if (error) {
        return <div className="p-8 text-red-600 font-semibold min-h-screen flex items-center justify-center text-center">Error al cargar el perfil. Asegúrate de que tu usuario tiene un perfil asociado o contacta a soporte.</div>;
    }
    
    if (!profesional) {
        return <div className="p-8 min-h-screen flex items-center justify-center">No se encontraron datos del profesional.</div>;
    }
    
    // --- PASO 4: LAS FUNCIONES HANDLER PUEDEN IR AQUÍ ---
    const handleProfileUpdateSuccess = () => {
        refetchData(); 
        setIsModalOpen(false); 
    };

    // --- PASO 5: EL RETORNO FINAL DEL JSX ---
    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <ProfesionalHeader 
                profesional={profesional} 
                onEditClick={() => setIsModalOpen(true)}
            />

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
                <div className="flex-1 min-w-0 h-full">
                    <DynamicMapComponent 
                        leads={filteredLeads} 
                        profesional={profesional} 
                        selectedLeadId={selectedLeadId}
                        onLeadClick={setSelectedLeadId}
                    />
                </div>
                
                <aside className="w-full md:w-[380px] overflow-y-auto bg-white p-4 border-l">
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
                         <p className="text-gray-500 p-4 text-center border-dashed border-2 rounded-lg bg-gray-50">
                            No hay leads de {selectedOffice !== 'Todos' ? `"${selectedOffice}"` : 'ningún oficio'} para mostrar.
                        </p>
                    )}
                </aside>
            </div>

            <EditProfileModal
                profesional={profesional}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleProfileUpdateSuccess}
            />
        </div>
    );
}