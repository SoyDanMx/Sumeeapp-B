// RUTA DEL ARCHIVO: src/app/professional-dashboard/page.tsx
'use client'; 

import { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic'; 
import { useProfesionalData } from '@/hooks/useProfesionalData'; 
import LeadCard from '@/components/LeadCard';
import ProfesionalHeader from '@/components/ProfesionalHeader';
import EditProfileModal from '@/components/EditProfileModal'; 
import ProfessionalVerificationID from '@/components/ProfessionalVerificationID';
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
    const [showVerificationID, setShowVerificationID] = useState(false); 

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

    // Memoización de coordenadas del profesional para consistencia
    const profesionalCoords = useMemo(() => ({
        lat: profesional?.ubicacion_lat ?? DEFAULT_MAP_CENTER.lat,
        lng: profesional?.ubicacion_lng ?? DEFAULT_MAP_CENTER.lng
    }), [profesional?.ubicacion_lat, profesional?.ubicacion_lng]);

    // Datos de ubicación en tiempo real (simulado - en producción vendría de GPS)
    const realTimeLocation = useMemo(() => {
        if (!profesional?.ubicacion_lat || !profesional?.ubicacion_lng) return null;
        return {
            lat: profesional.ubicacion_lat,
            lng: profesional.ubicacion_lng,
            lastUpdate: new Date().toISOString()
        };
    }, [profesional?.ubicacion_lat, profesional?.ubicacion_lng]);

    // --- PASO 3: FUNCIONES HANDLER - DEBEN IR ANTES DE LOS RETURNS CONDICIONALES ---
    const handleProfileUpdateSuccess = useCallback(() => {
        refetchData(); 
        setIsModalOpen(false); 
    }, [refetchData]);

    // --- PASO 4: UX/UI PRINCIPLES - Loading & Error States ---
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

    // --- PASO 5: UX/UI PRINCIPLES - Main Layout & Navigation ---
    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
            <ProfesionalHeader 
                profesional={profesional} 
                onEditClick={() => setIsModalOpen(true)}
            />

            {/* 🎯 UX/UI PRINCIPLE: Clear Navigation & Filtering */}
            <nav className="px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Filter Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                            Filtrar por especialidad:
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {availableOffices.map(office => (
                                <button 
                                    key={office} 
                                    onClick={() => setSelectedOffice(office)}
                                    className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 border ${
                                        selectedOffice === office 
                                            ? 'bg-indigo-600 text-white shadow-lg border-indigo-600 transform scale-105' 
                                            : 'bg-white text-gray-700 hover:bg-indigo-50 border-gray-200 hover:border-indigo-300 hover:shadow-md'
                                    }`}
                                    aria-pressed={selectedOffice === office}
                                >
                                    {office}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* 🎯 UX/UI PRINCIPLE: Primary Action Button */}
                    <button
                        onClick={() => setShowVerificationID(!showVerificationID)}
                        className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center space-x-3 border-2 shadow-md hover:shadow-lg transform hover:scale-105 ${
                            showVerificationID 
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-200' 
                                : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-400'
                        }`}
                        aria-label={showVerificationID ? 'Ocultar ID de verificación' : 'Mostrar ID de verificación'}
                    >
                        <span className="text-xl">🆔</span>
                        <span>{showVerificationID ? 'Ocultar ID' : 'ID de Verificación'}</span>
                        {showVerificationID && (
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        )}
                    </button>
                </div>
            </nav>

            {/* 🎯 UX/UI PRINCIPLE: Content Area with Proper Spacing */}
            <main className="flex flex-1 overflow-hidden">
                {/* Map Section */}
                <div className="flex-1 min-w-0 h-full relative">
                    <DynamicMapComponent 
                        leads={filteredLeads} 
                        profesional={profesional} 
                        selectedLeadId={selectedLeadId}
                        onLeadClick={setSelectedLeadId}
                    />
                </div>
                
                {/* 🎯 UX/UI PRINCIPLE: Sidebar with Progressive Disclosure */}
                <aside className="w-full md:w-[420px] overflow-y-auto bg-white/95 backdrop-blur-sm shadow-xl border-l border-gray-200 scroll-smooth">
                    <div className="p-6 space-y-6">
                        {/* ID Section with smooth animations */}
                        {showVerificationID && (
                            <div className="animate-in slide-in-from-right-4 duration-300 ease-out">
                                <ProfessionalVerificationID 
                                    profesional={profesional}
                                    realTimeLocation={realTimeLocation}
                                />
                            </div>
                        )}
                        
                        {/* 🎯 UX/UI PRINCIPLE: Contextual Information */}
                        <section className={showVerificationID ? "border-t border-gray-200 pt-6" : ""}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                                    <span>Leads Asignados</span>
                                </h2>
                                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                                    {filteredLeads.length}
                                </span>
                            </div>
                            
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
                                <div className="text-center py-12 px-6">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl text-gray-400">📋</span>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-700 mb-2">No hay leads disponibles</h3>
                                    <p className="text-gray-500 text-sm">
                                        {selectedOffice !== 'Todos' 
                                            ? `No se encontraron leads para "${selectedOffice}"`
                                            : 'No tienes leads asignados en este momento'
                                        }
                                    </p>
                                </div>
                            )}
                        </section>
                    </div>
                </aside>
            </main>

            <EditProfileModal
                profesional={profesional}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleProfileUpdateSuccess}
            />
        </div>
    );
}