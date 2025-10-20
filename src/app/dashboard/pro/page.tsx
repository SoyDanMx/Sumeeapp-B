// src/app/dashboard/pro/page.tsx
'use client'; 

import { useProfesionalData } from '@/hooks/useProfesionalData'; 
import MapComponent from '@/components/MapComponent';
import LeadCard from '@/components/LeadCard';
import ProfesionalHeader from '@/components/ProfesionalHeader';
// Importa tus componentes de UI (Loading, Error, Grid, etc.)

export default function ProfesionalDashboardPage() {
    const { profesional, leads, isLoading, error } = useProfesionalData();

    if (isLoading) {
        return <div className="p-8">Cargando datos del profesional...</div>; // O tu componente Loading
    }

    if (error) {
        return <div className="p-8 text-red-600">Error al cargar el dashboard: {error.message}</div>;
    }
    
    // Asegúrate de que el usuario sea un profesional antes de renderizar
    if (!profesional) {
        return <div className="p-8">No se encontraron datos de profesional.</div>;
    }

    return (
        <div className="flex flex-col h-screen">
            
            {/* 1. Header del Profesional */}
            <ProfesionalHeader profesional={profesional} />

            <div className="flex flex-1 overflow-hidden">
                
                {/* 2. Mapa (Ocupa la mayoría del espacio) */}
                <div className="flex-1">
                    <MapComponent leads={leads || []} profesional={profesional} />
                </div>

                {/* 3. Columna de Leads (Scrollable) */}
                <aside className="w-80 overflow-y-auto bg-gray-50 p-4 border-l">
                    <h2 className="text-xl font-bold mb-4">Leads Asignados ({leads?.length || 0})</h2>
                    {leads && leads.length > 0 ? (
                        <div className="space-y-4">
                            {leads.map((lead) => (
                                // Renderiza cada Lead Card, incluyendo el botón de WhatsApp
                                <LeadCard key={lead.id} lead={lead} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No tienes leads asignados en este momento. ¡Paciencia!</p>
                    )}
                </aside>
            </div>
        </div>
    );
}