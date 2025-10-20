'use client'; 

import { useState, useMemo } from 'react'; // Agregamos useMemo para optimización
import dynamic from 'next/dynamic'; 

// Importaciones de Hooks y Utilidades
import { useProfesionalData } from '@/hooks/useProfesionalData'; 

// Importaciones de Componentes
import ProfesionalHeader from '@/components/ProfesionalHeader';
import LeadCard from '@/components/LeadCard';
import EditProfileModal from '@/components/EditProfileModal'; 


// Carga dinámica del mapa (Sin SSR) para evitar el error 'window is not defined'
const DynamicMapComponent = dynamic(
  () => import('@/components/MapComponent'),
  { 
    loading: () => <div className="flex items-center justify-center h-full p-8 text-gray-500">Cargando mapa...</div>,
    ssr: false 
  }
);


// --------------------------------------------------------------------------
// COMPONENTE PRINCIPAL (DEBE SER EXPORTADO POR DEFECTO)
// --------------------------------------------------------------------------
export default function ProfesionalDashboardPage() {
    const { profesional, leads, isLoading, error, refetchData } = useProfesionalData(); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOffice, setSelectedOffice] = useState<string>('Todos'); 

    // --- Lógica de Filtrado Optimizado (usamos useMemo) ---
    const availableOffices = useMemo(() => {
        return ['Todos', ...(profesional?.areas_servicio || [])];
    }, [profesional?.areas_servicio]);
    
    const filteredLeads = useMemo(() => {
        if (!leads) return [];
        
        return leads.filter(lead => {
            if (selectedOffice === 'Todos') return true;
            
            // Filtrado simple por inclusión de texto en la descripción del proyecto
            return lead.descripcion_proyecto.toLowerCase().includes(selectedOffice.toLowerCase());
        });
    }, [leads, selectedOffice]);
    // --------------------------------------------------------
    
    // Función de éxito para refrescar los datos después de editar el perfil
    const handleProfileUpdateSuccess = () => {
        refetchData(); 
        setIsModalOpen(false); 
    };
    
    // --- Manejo de Estado y Errores (UI/UX) ---
    if (isLoading) {
        return <div className="p-8 text-center text-xl text-indigo-600 animate-pulse">Cargando datos del profesional...</div>; 
    }

    if (error || !profesional) {
        console.error("Error al cargar perfil:", error);
        return (
            <div className="p-8 text-red-600 bg-red-50 rounded-lg m-8">
                <h1 className="text-2xl font-bold">Error de Acceso o Carga</h1>
                <p>No se pudo cargar el perfil. Esto puede ser un error de RLS o que el perfil aún no existe.</p>
                <p className="mt-2 text-sm font-mono">Detalle del Error: {error || 'Perfil vacío'}</p>
            </div>
        );
    }
    
    // --- Renderizado del Dashboard (Layout de dos columnas) ---
    return (
        <div className="flex flex-col h-screen bg-gray-100">
            
            <ProfesionalHeader 
                profesional={profesional} 
                onEditClick={() => setIsModalOpen(true)}
            />

            {/* Barra de Filtros de Oficio */}
            <div className="p-4 bg-white shadow-sm border-b flex flex-wrap items-center space-x-3">
                <h3 className="font-medium text-gray-700">Filtrar por Oficio:</h3>
                {availableOffices.map(office => (
                    <button 
                        key={office} 
                        onClick={() => setSelectedOffice(office)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors mt-1 
                           ${selectedOffice === office ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-indigo-100'}`}
                    >
                        {office}
                    </button>
                ))}
            </div>


            <div className="flex flex-1 overflow-hidden">
                
                {/* Columna Principal: Mapa (70% del ancho) */}
                <div className="flex-1 min-w-0 h-full">
                    <DynamicMapComponent 
                        leads={filteredLeads} 
                        profesional={profesional} 
                    />
                </div>

                {/* Barra Lateral: Leads (30% del ancho, scrollable) */}
                <aside className="w-96 overflow-y-auto bg-gray-50 p-4 border-l shadow-inner">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">
                        Proyectos/Leads ({filteredLeads.length})
                    </h2>
                    
                    {filteredLeads.length > 0 ? (
                        <div className="space-y-4">
                            {filteredLeads.map((lead) => (
                                <LeadCard 
                                    key={lead.id} 
                                    lead={lead} 
                                    profesionalLat={profesional.ubicacion_lat} 
                                    profesionalLng={profesional.ubicacion_lng}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg">
                            No hay leads asignados para el filtro "{selectedOffice}".
                        </div>
                    )}
                </aside>
            </div>
            
            {/* Modal de Edición de Perfil */}
            {profesional && (
                <EditProfileModal
                    profesional={profesional}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleProfileUpdateSuccess}
                />
            )}
        </div>
    );
}
