'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation'; // FIX: Import faltante
import dynamic from 'next/dynamic'; 
import { useProfesionalData } from '@/hooks/useProfesionalData'; 
import LeadCard from '@/components/LeadCard';
import ProfesionalHeader from '@/components/ProfesionalHeader';
import EditProfileModal from '@/components/EditProfileModal'; 
import { Profesional, Lead } from '@/types/supabase';

// 1. Carga Dinámica del Mapa (Deshabilita SSR para Leaflet/React-Leaflet)
const DynamicMapComponent = dynamic(
  () => import('@/components/MapComponent'), 
  { 
    loading: () => <div className="p-8 text-center text-gray-500 animate-pulse">Cargando mapa de leads...</div>,
    ssr: false 
  }
);

export default function ProfesionalDashboardPage() {
  const router = useRouter(); // FIX: Hook para router
  const { profesional, leads, isLoading, error, refetchData } = useProfesionalData(); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estados para la interacción del Dashboard
  const [selectedOffice, setSelectedOffice] = useState<string>('Todos'); 
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null); 
  
  // Lógica de Errores y Carga
  if (isLoading) {
    return <div className="p-8 text-center bg-gray-50">Cargando datos del profesional...</div>; 
  }

  if (error) {
    console.error("Error al cargar perfil:", error);
    return (
      <div className="p-8 text-red-600 font-semibold text-center">
        Error al cargar el perfil. Por favor, asegúrate de que tu usuario tiene una fila en la tabla 'profiles' en Supabase.
        <button onClick={refetchData} className="ml-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Reintentar
        </button>
      </div>
    );
  }
  
  // Esto debería resolverse al insertar la fila de prueba en la DB
  if (!profesional) {
    return (
      <div className="p-8 text-center">
        No se encontraron datos de profesional. 
        <button onClick={() => router.push('/join-as-pro')} className="ml-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Completar Registro
        </button>
      </div>
    );
  }
  
  // Función de éxito después de guardar en el modal
  const handleProfileUpdateSuccess = useCallback(() => {
    refetchData(); 
    setIsModalOpen(false); 
  }, [refetchData]);
  
  // Lógica para filtros (memoizado para performance)
  const availableOffices = useMemo(() => ['Todos', ...(profesional.areas_servicio || [])], [profesional.areas_servicio]);
  const filteredLeads = useMemo(() => (leads || []).filter(lead => {
    if (selectedOffice === 'Todos') return true;
    // Filtra por inclusión de la palabra clave del oficio en la descripción del proyecto
    return lead.descripcion_proyecto?.toLowerCase().includes(selectedOffice.toLowerCase());
  }), [leads, selectedOffice]);

  // Coordenadas del profesional (necesarias para LeadCard y MapComponent)
  const profesionalLat = profesional.ubicacion_lat ?? 19.4326; // Default CDMX
  const profesionalLng = profesional.ubicacion_lng ?? -99.1332; // Default CDMX

  // Callback para clic en lead (enriquecedor: sincroniza mapa y card)
  const onLeadClick = useCallback((leadId: string) => {
    setSelectedLeadId(leadId);
  }, []);

  return (
    <div className="flex flex-col h-screen">
      
      <ProfesionalHeader 
        profesional={profesional as Profesional} 
        onEditClick={() => setIsModalOpen(true)} // Abre el modal de edición
      />

      {/* BARRA DE FILTROS (Mejorada con accesibilidad) */}
      <div className="p-4 bg-gray-100 border-b flex flex-wrap gap-2 items-center">
        <h3 className="font-medium mr-2 text-gray-700" aria-label="Filtrar por Oficio">Filtrar por Oficio:</h3>
        {availableOffices.map(office => (
          <button 
            key={office} 
            onClick={() => setSelectedOffice(office)}
            className={`px-3 py-1 text-sm rounded transition-colors ${selectedOffice === office ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border text-gray-700 hover:bg-indigo-100'}`}
            aria-pressed={selectedOffice === office}
            aria-label={`Filtrar por ${office}`}
          >
            {office}
          </button>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* COLUMNA PRINCIPAL: MAPA (Enfoque tipo Uber) */}
        <div className="flex-1 min-w-0 h-full">
          <DynamicMapComponent 
            leads={filteredLeads as Lead[]} // Cast para types
            profesional={profesional as Profesional} 
            selectedLeadId={selectedLeadId} // Pasa el ID seleccionado al mapa
            onLeadClick={onLeadClick} // Actualiza el ID seleccionado al hacer clic en un pin
          />
        </div>
        
        {/* BARRA LATERAL: LISTA DE LEADS (Scrollable, Enriquecida) */}
        <aside className="w-[380px] overflow-y-auto bg-gray-50 p-4 border-l">
          <h2 className="text-xl font-bold mb-4 text-gray-800" aria-label="Leads Asignados">Leads Asignados ({filteredLeads.length})</h2>
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
                  onSelect={() => onLeadClick(lead.id)} // Selecciona la tarjeta
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg bg-white">
              <p className="text-gray-500 mb-2">No hay leads de {selectedOffice !== 'Todos' ? selectedOffice : 'ningún oficio'} para mostrar.</p>
              <p className="text-sm text-gray-400">Completa tu perfil para atraer más oportunidades en CDMX.</p>
            </div>
          )}
        </aside>
      </div>

      {/* Modal de Edición (Oculto por defecto) */}
      <EditProfileModal
        profesional={profesional as Profesional}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleProfileUpdateSuccess}
      />
    </div>
  );
}