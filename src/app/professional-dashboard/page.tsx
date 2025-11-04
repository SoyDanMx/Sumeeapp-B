// RUTA DEL ARCHIVO: src/app/professional-dashboard/page.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { useProfesionalData } from "@/hooks/useProfesionalData";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useNewLeadsSubscription } from "@/hooks/useNewLeadsSubscription";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import ProfesionalHeader from "@/components/ProfesionalHeader";
import EditProfileModal from "@/components/EditProfileModal";
import WorkFeed from "@/components/dashboard/WorkFeed";
import OnlineToggle from "@/components/dashboard/OnlineToggle";
import ControlPanel from "@/components/dashboard/ControlPanel";
import ProfessionalTabs from "@/components/dashboard/ProfessionalTabs";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";
import NewLeadAlertModal from "@/components/dashboard/NewLeadAlertModal";
import { Profesional, Lead } from "@/types/supabase";

export default function ProfesionalDashboardPage() {
  // --- HOOKS Y ESTADO ---
  const { profesional, leads, isLoading, error, refetchData } =
    useProfesionalData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Sincronizar isOnline con el estado del profesional cuando cambia
  useEffect(() => {
    if (profesional?.disponibilidad === "disponible") {
      setIsOnline(true);
    } else {
      setIsOnline(false);
    }
  }, [profesional?.disponibilidad]);
  const [mobileActiveTab, setMobileActiveTab] = useState<
    "home" | "leads" | "profile" | "stats"
  >("home");
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [newLeadAlert, setNewLeadAlert] = useState<Lead | null>(null);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);

  // Geolocalización en tiempo real cuando está online
  const {
    lat: geoLat,
    lng: geoLng,
    updateLocation,
  } = useGeolocation({
    watch: isOnline, // Solo actualizar cuando está online
    updateInterval: 30000, // Cada 30 segundos
  });

  // Actualizar ubicación actual cuando cambia la geolocalización
  useEffect(() => {
    if (geoLat && geoLng) {
      setCurrentLocation({ lat: geoLat, lng: geoLng });
    }
  }, [geoLat, geoLng]);

  // --- FUNCIONES HANDLER ---
  const handleProfileUpdateSuccess = useCallback(() => {
    refetchData();
    setIsModalOpen(false);
  }, [refetchData]);

  const handleLeadClick = useCallback((leadId: string) => {
    setSelectedLeadId(leadId);
  }, []);

  // Callback para cuando se recibe un lead nuevo en tiempo real
  const handleNewLeadReceived = useCallback((lead: Lead) => {
    console.log("🔔 Lead nuevo recibido, mostrando modal...", lead);
    setNewLeadAlert(lead);
    setIsNewLeadModalOpen(true);
  }, []);

  // Suscripción a leads nuevos en tiempo real
  useNewLeadsSubscription({
    isOnline,
    profesional,
    profesionalLat: currentLocation?.lat,
    profesionalLng: currentLocation?.lng,
    onNewLead: handleNewLeadReceived,
  });

  // Handler para aceptar lead desde el modal
  const handleAcceptLeadFromModal = useCallback(
    async (leadId: string) => {
      // Refrescar datos para que el lead aparezca en la lista
      await refetchData();
      // Cerrar modal
      setIsNewLeadModalOpen(false);
      setNewLeadAlert(null);
    },
    [refetchData]
  );

  // Handler para rechazar lead desde el modal
  const handleRejectLeadFromModal = useCallback(() => {
    console.log("❌ Lead rechazado");
    setIsNewLeadModalOpen(false);
    setNewLeadAlert(null);
  }, []);

  // --- ESTADOS DE CARGA Y ERROR ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <h2 className="text-xl font-semibold text-gray-700">
            Cargando tu dashboard
          </h2>
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
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Error al cargar el perfil
            </h2>
            <p className="text-gray-600 mb-4">
              No se pudieron obtener tus datos como profesional.
            </p>
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
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Perfil no encontrado
            </h2>
            <p className="text-gray-600 mb-4">
              No se encontraron datos del profesional asociados a tu cuenta.
            </p>
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Header - Más compacto en móvil */}
      <div className="md:hidden">
        <ProfesionalHeader
          profesional={profesional}
          onEditClick={() => setIsModalOpen(true)}
        />
      </div>
      <div className="hidden md:block">
        <ProfesionalHeader
          profesional={profesional}
          onEditClick={() => setIsModalOpen(true)}
        />
      </div>

      {/* Contenido Principal: Layout de 2 Columnas */}
      <main className="flex flex-1 overflow-hidden relative pb-20 md:pb-0 safe-area-bottom">
        {/* Botón flotante de menú/estado móvil */}
        <button
          onClick={() => {
            if (mobileActiveTab === "home") {
              setIsSidebarOpen(true);
            } else {
              setMobileActiveTab("home");
            }
          }}
          className="md:hidden fixed top-20 right-4 z-40 bg-white rounded-full p-4 shadow-xl border-2 border-indigo-200 hover:bg-gray-50 active:scale-95 transition-all touch-manipulation"
          aria-label="Abrir menú"
        >
          <FontAwesomeIcon icon={faBars} className="text-indigo-600 text-xl" />
        </button>

        {/* Overlay para móvil cuando el sidebar está abierto */}
        {isSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-30 transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Contenido principal según tab activo en móvil */}
        {mobileActiveTab === "home" || mobileActiveTab === "leads" ? (
          <div className="flex-1 min-w-0 p-2 md:p-3 md:p-6 overflow-hidden w-full">
            <WorkFeed
              leads={leads}
              profesionalLat={profesional.ubicacion_lat ?? undefined}
              profesionalLng={profesional.ubicacion_lng ?? undefined}
              currentLat={currentLocation?.lat}
              currentLng={currentLocation?.lng}
              onLeadClick={handleLeadClick}
              onLeadAccepted={refetchData}
              selectedLeadId={selectedLeadId}
              avatarUrl={profesional.avatar_url ?? null}
              onEditProfileClick={() => setIsModalOpen(true)}
            />
          </div>
        ) : mobileActiveTab === "stats" ? (
          <div className="flex-1 min-w-0 p-4 md:p-6 overflow-y-auto w-full">
            <ControlPanel
              profesional={profesional}
              leads={leads}
              onEditClick={() => setIsModalOpen(true)}
              onLeadClick={handleLeadClick}
              selectedLeadId={selectedLeadId}
            />
          </div>
        ) : (
          <div className="flex-1 min-w-0 p-4 md:p-6 overflow-y-auto w-full">
            <ProfessionalTabs
              profesional={profesional}
              onClose={() => {
                setIsModalOpen(false);
                setIsSidebarOpen(false);
              }}
            />
          </div>
        )}

        {/* Columna Derecha: Toggle Online/Offline y Pestañas Profesionales */}
        {/* En móvil: drawer lateral completo, en desktop: columna fija */}
        <div
          className={`fixed md:relative top-0 right-0 h-full w-full md:w-96 bg-white/95 md:bg-white/95 backdrop-blur-sm md:backdrop-blur-none shadow-xl border-l border-gray-200 overflow-y-auto z-40 transition-transform duration-300 ease-in-out ${
            isSidebarOpen
              ? "translate-x-0"
              : "translate-x-full md:translate-x-0"
          }`}
        >
          {/* Botón de cerrar en móvil */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden fixed top-4 right-4 z-50 bg-white rounded-full p-3 shadow-xl border-2 border-gray-200 hover:bg-gray-50 active:scale-95 transition-all touch-manipulation"
            aria-label="Cerrar menú"
          >
            <FontAwesomeIcon icon={faTimes} className="text-gray-700 text-lg" />
          </button>

          <div className="p-4 md:p-6 space-y-4 md:space-y-6 pt-16 md:pt-6">
            {/* Toggle Online/Offline */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 md:p-6 border border-blue-200">
              <h3 className="text-base md:text-sm font-semibold text-gray-700 mb-4 text-center">
                Estado de Disponibilidad
              </h3>
              <OnlineToggle
                initialStatus={isOnline}
                onStatusChange={async (online) => {
                  console.log("🔄 onStatusChange llamado con:", online);
                  setIsOnline(online);
                  if (online) {
                    updateLocation(); // Actualizar ubicación inmediatamente
                  }
                  // IMPORTANTE: Refrescar datos del profesional después de cambiar disponibilidad
                  // Esperar un poco para asegurar que la BD se haya actualizado
                  setTimeout(async () => {
                    await refetchData();
                    console.log("✅ Datos refrescados después de cambio de disponibilidad");
                  }, 500);
                }}
                onLocationUpdate={(lat, lng) => {
                  setCurrentLocation({ lat, lng });
                  // Refrescar datos del profesional cuando se actualiza la ubicación
                  refetchData();
                }}
              />
            </div>

            {/* Pestañas Profesionales */}
            <ProfessionalTabs
              profesional={profesional}
              onClose={() => {
                setIsModalOpen(false);
                setIsSidebarOpen(false); // Cerrar sidebar en móvil al abrir modal
              }}
            />
          </div>
        </div>
      </main>

      {/* Bottom Navigation - Solo en móvil */}
      <MobileBottomNav
        activeTab={mobileActiveTab}
        onTabChange={setMobileActiveTab}
        newLeadsCount={leads.filter((lead) => lead.estado === "nuevo").length}
      />

      {/* Modal de Edición de Perfil */}
      <EditProfileModal
        profesional={profesional}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleProfileUpdateSuccess}
        leads={leads}
      />

      {/* Modal de Alerta de Lead Nuevo */}
      {newLeadAlert && (
        <NewLeadAlertModal
          lead={newLeadAlert}
          profesionalLat={currentLocation?.lat}
          profesionalLng={currentLocation?.lng}
          isOpen={isNewLeadModalOpen}
          onAccept={handleAcceptLeadFromModal}
          onReject={handleRejectLeadFromModal}
          onClose={() => {
            setIsNewLeadModalOpen(false);
            setNewLeadAlert(null);
          }}
        />
      )}
    </div>
  );
}
