// RUTA DEL ARCHIVO: src/app/professional-dashboard/page.tsx
'use client'; 

import { useState, useCallback } from 'react';
import { useProfesionalData } from '@/hooks/useProfesionalData'; 
import ProfesionalHeader from '@/components/ProfesionalHeader';
import EditProfileModal from '@/components/EditProfileModal'; 
import WorkFeed from '@/components/dashboard/WorkFeed';
import ControlPanel from '@/components/dashboard/ControlPanel';
import { Profesional, Lead } from '@/types/supabase';

export default function ProfesionalDashboardPage() {
    // --- HOOKS Y ESTADO ---
    const { profesional, leads, isLoading, error, refetchData } = useProfesionalData(); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

    // --- FUNCIONES HANDLER ---
    const handleProfileUpdateSuccess = useCallback(() => {
        refetchData(); 
        setIsModalOpen(false); 
    }, [refetchData]);

    const handleLeadClick = useCallback((leadId: string) => {
        setSelectedLeadId(leadId);
    }, []);

    // --- ESTADOS DE CARGA Y ERROR ---
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                    <h2 className="text-xl font-semibold text-gray-700">Cargando tu dashboard</h2>
                    <p className="text-gray-500">Obteniendo datos del profesional...</p>
                </div>
            </div>
        ); 
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-8">
                <div className="max-w-md text-center space-y-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Error al cargar el perfil</h2>
                        <p className="text-gray-600 mb-4">No se pudieron obtener tus datos como profesional.</p>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                        >
                            Reintentar
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    if (!profesional) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-8">
                <div className="max-w-md text-center space-y-6">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-2xl">👤</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Perfil no encontrado</h2>
                        <p className="text-gray-600 mb-4">No se encontraron datos del profesional asociados a tu cuenta.</p>
                        <button 
                            onClick={() => setIsModalOpen(true)} 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                        >
                            Completar Perfil
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- LAYOUT PRINCIPAL: 2 COLUMNAS ---
    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <ProfesionalHeader 
                profesional={profesional} 
                onEditClick={() => setIsModalOpen(true)}
            />

            {/* Contenido Principal: Layout de 2 Columnas */}
            <main className="flex flex-1 overflow-hidden">
                {/* Columna Izquierda: WorkFeed (Principal) */}
                <div className="flex-1 min-w-0 p-6">
                    <WorkFeed
                        leads={leads}
                        profesionalLat={profesional.ubicacion_lat ?? undefined}
                        profesionalLng={profesional.ubicacion_lng ?? undefined}
                        onLeadClick={handleLeadClick}
                        onLeadAccepted={refetchData}
                        selectedLeadId={selectedLeadId}
                    />
                </div>
                
                {/* Columna Derecha: ControlPanel (Barra Lateral) */}
                <div className="w-96 bg-white/95 backdrop-blur-sm shadow-xl border-l border-gray-200 overflow-y-auto">
                    <div className="p-6">
                        <ControlPanel
                            profesional={profesional}
                            leads={leads}
                            onEditClick={() => setIsModalOpen(true)}
                            onLeadClick={handleLeadClick}
                            selectedLeadId={selectedLeadId}
                        />
                    </div>
                </div>
            </main>

            {/* Modal de Edición de Perfil */}
            <EditProfileModal
                profesional={profesional}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleProfileUpdateSuccess}
            />
        </div>
    );
}