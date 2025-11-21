// RUTA DEL ARCHIVO: src/app/professional-dashboard/page.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { useProfesionalData } from "@/hooks/useProfesionalData";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useNewLeadsSubscription } from "@/hooks/useNewLeadsSubscription";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Profesional, Lead } from "@/types/supabase";
import { useRouter } from "next/navigation";

// Componentes pesados cargados dinámicamente para mejorar performance
const ProfesionalHeader = dynamic(
  () => import("@/components/ProfesionalHeader"),
  { ssr: true }
);

const EditProfileModal = dynamic(
  () => import("@/components/EditProfileModal"),
  { ssr: false }
);

const WorkFeed = dynamic(
  () => import("@/components/dashboard/WorkFeed"),
  { ssr: true }
);

const ControlPanel = dynamic(
  () => import("@/components/dashboard/ControlPanel"),
  { ssr: true }
);

const ProfessionalTabs = dynamic(
  () => import("@/components/dashboard/ProfessionalTabs"),
  { ssr: true }
);

const MobileBottomNav = dynamic(
  () => import("@/components/dashboard/MobileBottomNav"),
  { ssr: false }
);

const NewLeadAlertModal = dynamic(
  () => import("@/components/dashboard/NewLeadAlertModal"),
  { ssr: false }
);

const RequiredWhatsAppModal = dynamic(
  () => import("@/components/dashboard/RequiredWhatsAppModal"),
  { ssr: false }
);

const RealtimeLeadNotifier = dynamic(
  () => import("@/components/dashboard/RealtimeLeadNotifier"),
  { ssr: false }
);

const ProfessionalVerificationID = dynamic(
  () => import("@/components/ProfessionalVerificationID"),
  { ssr: false }
);

export default function ProfesionalDashboardPage() {
  // --- HOOKS Y ESTADO ---
  const { profesional, leads, isLoading, error, refetchData } =
    useProfesionalData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isOnline] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [leadViewType, setLeadViewType] = useState<"mapa" | "lista">("mapa");
  const [leadTab, setLeadTab] = useState<"nuevos" | "en_progreso">("nuevos");
  const [showCredential, setShowCredential] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const [mobileActiveTab, setMobileActiveTab] = useState<
    "home" | "leads" | "profile" | "stats"
  >("home");
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [newLeadAlert, setNewLeadAlert] = useState<Lead | null>(null);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [hasCheckedWhatsApp, setHasCheckedWhatsApp] = useState(false);

  // Geolocalización en tiempo real (siempre activa para ofrecer experiencias tipo Uber)
  const {
    lat: geoLat,
    lng: geoLng,
    updateLocation,
  } = useGeolocation({
    watch: true,
    updateInterval: 30000,
  });

  // Actualizar ubicación actual cuando cambia la geolocalización
  useEffect(() => {
    if (geoLat && geoLng) {
      setCurrentLocation({ lat: geoLat, lng: geoLng });
    }
  }, [geoLat, geoLng]);

  // Forzar una lectura de ubicación al iniciar sesión
  useEffect(() => {
    updateLocation();
  }, [updateLocation]);

  // Verificar si el profesional tiene WhatsApp al cargar
  useEffect(() => {
    if (!profesional || hasCheckedWhatsApp) return;

    // Revisar si el profesional NO tiene whatsapp
    const needsWhatsApp = !profesional.whatsapp || profesional.whatsapp.trim() === '';
    
    if (needsWhatsApp) {
      // Mostrar modal después de un breve delay para mejor UX
      setTimeout(() => {
        setShowWhatsAppModal(true);
      }, 500);
    }
    
    setHasCheckedWhatsApp(true);
  }, [profesional, hasCheckedWhatsApp]);

  // --- FUNCIONES HANDLER ---
  const handleProfileUpdateSuccess = useCallback(() => {
    // ✅ FIX: Invalidar caché y forzar refetch completo
    try {
      sessionStorage.removeItem("sumeeapp/professional-dashboard");
    } catch {
      /* ignore */
    }
    refetchData();
    setIsModalOpen(false);
    // Forzar recarga después de un pequeño delay para asegurar sincronización
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }, [refetchData]);

  const handleLeadClick = useCallback(
    (leadId: string) => {
      setSelectedLeadId(leadId);
      if (mobileActiveTab !== "leads") {
        setMobileActiveTab("leads");
      }
    },
    [mobileActiveTab]
  );

  // Callback para cuando se recibe un lead nuevo en tiempo real
  const handleNewLeadReceived = useCallback((lead: Lead) => {
    setNewLeadAlert(lead);
    setIsNewLeadModalOpen(true);
  }, []);

  // Callback para el componente RealtimeLeadNotifier
  const handleRealtimeLeadNotification = useCallback((lead: Lead) => {
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

  const scrollToLeads = () => {
    const container = document.getElementById("professional-leads-section");
    if (container) {
      container.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const navigateToLeads = useCallback(
    (tab: "nuevos" | "en_progreso", view: "mapa" | "lista") => {
      setLeadTab(tab);
      setLeadViewType(view);
      setMobileActiveTab("leads");
      setIsSidebarOpen(false);
      setTimeout(scrollToLeads, 120);
    },
    []
  );

  const showLeadsList = () => navigateToLeads("nuevos", "lista");
  const showLeadsMap = () => navigateToLeads("nuevos", "mapa");
  const showAcceptedLeads = () => navigateToLeads("en_progreso", "lista");

  const openCredential = useCallback(() => setShowCredential(true), []);
  const closeCredential = useCallback(() => setShowCredential(false), []);

  const handleLeadAccepted = useCallback(
    (lead: Lead) => {
      console.log("✅ [DASHBOARD] Lead aceptado, refrescando datos...", {
        leadId: lead.id,
        estado: lead.estado,
        profesional_asignado_id: lead.profesional_asignado_id,
        currentProfesionalId: profesional?.user_id,
      });
      
      // Refrescar datos inmediatamente para que aparezca en "En Progreso"
      refetchData();
      
      // Navegar a "En Progreso" después de un delay para que los datos se actualicen
      // Aumentar el delay para dar tiempo a que la suscripción en tiempo real actualice
      setTimeout(() => {
        console.log("🔄 [DASHBOARD] Navegando a 'En Progreso'...");
        navigateToLeads("en_progreso", "lista");
        setSelectedLeadId(lead.id);
        
        // Refrescar nuevamente después de navegar para asegurar que los datos estén actualizados
        setTimeout(() => {
          console.log("🔄 [DASHBOARD] Refresco adicional después de navegar...");
          refetchData();
        }, 1000);
      }, 1000); // Aumentado a 1 segundo
    },
    [navigateToLeads, refetchData, profesional?.user_id]
  );

  const handleAcceptLeadFromModal = useCallback(
    async (leadId: string) => {
      await refetchData();
      setIsNewLeadModalOpen(false);
      setNewLeadAlert(null);
      navigateToLeads("en_progreso", "lista");
      setSelectedLeadId(leadId);
    },
    [navigateToLeads, refetchData]
  );

  // Handler para rechazar lead desde el modal
  const handleRejectLeadFromModal = useCallback(() => {
    setIsNewLeadModalOpen(false);
    setNewLeadAlert(null);
  }, []);

  // Handler cuando se completa la actualización de WhatsApp
  const handleWhatsAppSuccess = useCallback((whatsapp: string) => {
    setShowWhatsAppModal(false);
    // Actualizar el profesional localmente
    if (profesional) {
      profesional.whatsapp = whatsapp;
    }
    // Re-fetch data para asegurar sincronización
    refetchData();
  }, [profesional, refetchData]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleTabNavigation = (
    tab: "profile" | "leads" | "help" | "logout"
  ) => {
    switch (tab) {
      case "profile":
        setIsModalOpen(true);
        break;
      case "leads":
        setMobileActiveTab("leads");
        setLeadViewType("lista");
        break;
      case "help":
        router.push("/help");
        break;
      default:
        break;
    }
  };

  const handleMobileBottomNavChange = (tab: typeof mobileActiveTab) => {
    if (tab === "profile") {
      setIsModalOpen(true);
      setMobileActiveTab("home");
      return;
    }
    setMobileActiveTab(tab);
    if (tab === "leads") {
      setLeadViewType("lista");
    }
  };

  const renderMobileContent = () => {
    switch (mobileActiveTab) {
      case "home":
        return (
          <ProfessionalTabs
            profesional={profesional as Profesional}
            onShowLeadsList={() => {
              setMobileActiveTab("leads");
              setLeadViewType("lista");
            }}
            onShowLeadsMap={() => {
              setMobileActiveTab("leads");
              setLeadViewType("mapa");
            }}
            onShowCredential={openCredential}
            onShowAcceptedLeads={showAcceptedLeads}
            onNavigate={handleTabNavigation}
            isMobile
          />
        );
      case "leads":
        return (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setMobileActiveTab("home")}
                className="inline-flex items-center gap-2 text-indigo-600 font-semibold"
              >
                <span className="text-lg">←</span>
                Volver
              </button>
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1 rounded-full">
                {leadViewType === "lista" ? "Lista" : "Mapa"}
              </div>
            </div>
            <WorkFeed
              leads={leads}
              profesionalLat={profesional?.ubicacion_lat ?? undefined}
              profesionalLng={profesional?.ubicacion_lng ?? undefined}
              currentLat={currentLocation?.lat}
              currentLng={currentLocation?.lng}
              profesionalId={profesional?.user_id} // ✅ Pasar ID del profesional para filtrar leads asignados
              onLeadClick={handleLeadClick}
              onLeadAccepted={handleLeadAccepted}
              selectedLeadId={selectedLeadId}
              avatarUrl={profesional?.avatar_url ?? null}
              onEditProfileClick={() => setIsModalOpen(true)}
              forcedViewType={leadViewType}
              onViewTypeChange={setLeadViewType}
              forcedTab={leadTab}
              onTabChange={setLeadTab}
            />
          </div>
        );
      case "stats":
        return (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setMobileActiveTab("home")}
              className="inline-flex items-center gap-2 text-indigo-600 font-semibold"
            >
              <span className="text-lg">←</span>
              Volver
            </button>
            <ControlPanel
              profesional={profesional as Profesional}
              leads={leads}
              onEditClick={() => setIsModalOpen(true)}
              onLeadClick={handleLeadClick}
              selectedLeadId={selectedLeadId}
            />
          </div>
        );
      default:
        return null;
    }
  };

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

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 pt-[calc(var(--header-offset,72px)+1.5rem)] pb-20">
        <div className="px-4 space-y-6">{renderMobileContent()}</div>

        <MobileBottomNav
          activeTab={mobileActiveTab}
          onTabChange={handleMobileBottomNavChange}
          newLeadsCount={leads.filter((lead) => lead.estado === "nuevo").length}
        />

        {/* Modal de Edición de Perfil */}
        <EditProfileModal
          profesional={profesional as Profesional}
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

        {showCredential && profesional && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden relative">
              <button
                onClick={closeCredential}
                className="absolute top-3 right-3 bg-gray-900/70 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-900 transition"
                aria-label="Cerrar credencial"
              >
                ×
              </button>
              <ProfessionalVerificationID
                profesional={profesional as Profesional}
              />
            </div>
          </div>
        )}

        {/* Modal Obligatorio de WhatsApp - Versión Móvil */}
        {profesional && (
          <RequiredWhatsAppModal
            isOpen={showWhatsAppModal}
            userId={profesional.user_id}
            userEmail={profesional.email}
            userName={profesional.full_name || 'Profesional'}
            onSuccess={handleWhatsAppSuccess}
          />
        )}

        {/* Componente de Notificaciones en Tiempo Real */}
        {profesional && (
          <RealtimeLeadNotifier
            profesional={profesional}
            onNewLead={handleRealtimeLeadNotification}
            isOnline={isOnline}
          />
        )}
      </div>
    );
  }

  // --- LAYOUT PRINCIPAL: 2 COLUMNAS ---
  return (
    <div className="flex flex-col min-h-screen md:h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 md:overflow-hidden overflow-y-auto pt-[calc(var(--header-offset,72px)+0.75rem)] md:pt-[calc(var(--header-offset,72px)+1.5rem)]">
      {/* Header - Más compacto en móvil */}
      <div className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200">
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
      <main className="flex flex-1 md:overflow-hidden overflow-y-auto relative pb-20 md:pb-0 safe-area-bottom">
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
          <div className="flex-1 min-w-0 p-2 md:p-3 md:p-6 md:overflow-hidden overflow-y-auto w-full">
            <WorkFeed
              leads={leads}
              profesionalLat={profesional?.ubicacion_lat ?? undefined}
              profesionalLng={profesional?.ubicacion_lng ?? undefined}
              currentLat={currentLocation?.lat}
              currentLng={currentLocation?.lng}
              profesionalId={profesional?.user_id} // ✅ Pasar ID del profesional para filtrar leads asignados
              onLeadClick={handleLeadClick}
              onLeadAccepted={handleLeadAccepted}
              selectedLeadId={selectedLeadId}
              avatarUrl={profesional?.avatar_url ?? null}
              onEditProfileClick={() => setIsModalOpen(true)}
              forcedViewType={leadViewType}
              onViewTypeChange={setLeadViewType}
              forcedTab={leadTab}
              onTabChange={setLeadTab}
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
              onShowLeadsList={showLeadsList}
              onShowLeadsMap={showLeadsMap}
              onShowCredential={openCredential}
              onShowAcceptedLeads={showAcceptedLeads}
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

          <div className="p-2 md:p-4 space-y-2 md:space-y-4 pt-14 md:pt-4">
            {/* Pestañas Profesionales */}
            <ProfessionalTabs
              profesional={profesional}
              onClose={() => {
                setIsModalOpen(false);
                setIsSidebarOpen(false); // Cerrar sidebar en móvil al abrir modal
              }}
              onShowLeadsList={showLeadsList}
              onShowLeadsMap={showLeadsMap}
              onShowCredential={openCredential}
              onShowAcceptedLeads={showAcceptedLeads}
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

      {showCredential && profesional && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 pt-16 sm:pt-20 overflow-y-auto">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md sm:max-w-lg w-full overflow-hidden relative my-4">
            <button
              onClick={closeCredential}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-gray-900/70 text-white rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-gray-900 transition z-10"
              aria-label="Cerrar credencial"
            >
              ×
            </button>
            <div className="overflow-y-auto max-h-[calc(100vh-8rem)]">
              <ProfessionalVerificationID
                profesional={profesional as Profesional}
                showCustomization={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal Obligatorio de WhatsApp */}
      {profesional && (
        <RequiredWhatsAppModal
          isOpen={showWhatsAppModal}
          userId={profesional.user_id}
          userEmail={profesional.email}
          userName={profesional.full_name || 'Profesional'}
          onSuccess={handleWhatsAppSuccess}
        />
      )}
    </div>
  );
}
