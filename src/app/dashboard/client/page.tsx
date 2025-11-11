"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getClientLeadDetails, getClientLeads } from "@/lib/supabase/data";
import { supabase } from "@/lib/supabase/client";
import { Lead, Profile } from "@/types/supabase";
import { useAuth } from "@/context/AuthContext";
import { useMembership } from "@/context/MembershipContext";
import RequestServiceModal from "@/components/client/RequestServiceModal";
import UpcomingServiceWidget from "@/components/dashboard/UpcomingServiceWidget";
import QuickActionsWidget from "@/components/dashboard/QuickActionsWidget";
import RecentActivityWidget from "@/components/dashboard/RecentActivityWidget";
import NearbyProfessionalsWidget from "@/components/dashboard/NearbyProfessionalsWidget";
import ExploreMapCTA from "@/components/dashboard/ExploreMapCTA";
import ClientOnboardingModal from "@/components/dashboard/ClientOnboardingModal";
import ClientProfileWidget from "@/components/dashboard/ClientProfileWidget";
import ClientProfileWidgetCompact from "@/components/dashboard/ClientProfileWidgetCompact";
import ExploreMapCTACompact from "@/components/dashboard/ExploreMapCTACompact";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faExclamationTriangle,
  faPlus,
  faWrench,
  faRocket,
  faBolt,
  faWater,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

export default function ClientDashboardPage() {
  const { user, isLoading: userLoading, isAuthenticated } = useAuth();
  const {
    permissions,
    isFreeUser,
    requestsUsed,
    requestsRemaining,
    upgradeUrl,
  } = useMembership();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [leadDetails, setLeadDetails] = useState<Lead | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [clientLocation, setClientLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showProfessionalsMap, setShowProfessionalsMap] = useState(false);
  
  // 🆕 ONBOARDING MODAL
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);
  const [isEmergencyMenuOpen, setIsEmergencyMenuOpen] = useState(false);

  // Función para refrescar los leads
  const refreshLeads = async () => {
    if (!user) return;

    try {
      console.log("🔍 Dashboard - Refrescando leads...");
      const userLeads = await getClientLeads(user.id);
      console.log("🔍 Dashboard - Leads refrescados:", userLeads.length);
      setLeads(userLeads);
    } catch (error) {
      console.error("Error refreshing leads:", error);
    }
  };

  useEffect(() => {
    const fetchLeads = async () => {
      if (userLoading) {
        setLoading(true);
        return;
      }

      if (!user) {
        setError("Usuario no autenticado");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log("🔍 Dashboard - Obteniendo leads para usuario:", user.id);
        const userLeads = await getClientLeads(user.id);
        console.log("🔍 Dashboard - Leads obtenidos:", userLeads.length);
        setLeads(userLeads);
      } catch (leadError) {
        console.error("Error fetching client leads:", leadError);
        setLeads([]);
        setError("Error al cargar los leads");
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [user, userLoading]);

  // 🆕 VERIFICAR SI NECESITA ONBOARDING
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user || hasCheckedOnboarding) return;

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile for onboarding:', error);
          return;
        }

        if (profile) {
          setUserProfile(profile);
          
          // Verificar si necesita onboarding (falta WhatsApp o ubicación)
          const needsOnboarding = !profile.whatsapp || !profile.ubicacion_lat;
          
          if (needsOnboarding) {
            console.log('🆕 Cliente necesita onboarding');
            // Delay de 500ms para mejor UX (evitar flash)
            setTimeout(() => {
              setShowOnboarding(true);
            }, 500);
          }
          
          setHasCheckedOnboarding(true);
        }
      } catch (err) {
        console.error('Error checking onboarding:', err);
        setHasCheckedOnboarding(true);
      }
    };

    checkOnboarding();
  }, [user, hasCheckedOnboarding]);

  // Obtener ubicación del cliente desde su perfil
  useEffect(() => {
    const fetchClientLocation = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('ubicacion_lat, ubicacion_lng')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching client location:', error);
          // Fallback a ubicación por defecto (Centro CDMX)
          setClientLocation({ lat: 19.4326, lng: -99.1332 });
          return;
        }

        if (data && data.ubicacion_lat && data.ubicacion_lng) {
          setClientLocation({ lat: data.ubicacion_lat, lng: data.ubicacion_lng });
        } else {
          // Si no tiene ubicación, usar geolocalización del navegador
          if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                setClientLocation({
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                });
              },
              () => {
                // Fallback a Centro CDMX
                setClientLocation({ lat: 19.4326, lng: -99.1332 });
              }
            );
          } else {
            // Fallback a Centro CDMX
            setClientLocation({ lat: 19.4326, lng: -99.1332 });
          }
        }
      } catch (err) {
        console.error('Error:', err);
        setClientLocation({ lat: 19.4326, lng: -99.1332 });
      }
    };

    fetchClientLocation();
  }, [user]);

  // Manejar clic en servicio rápido
  const handleQuickServiceClick = (serviceName: string) => {
    setSelectedService(serviceName);
    setIsModalOpen(true);
  };

  const handleEmergencyRequest = (serviceId: string) => {
    setSelectedService(serviceId);
    setIsEmergencyMenuOpen(false);
    setIsModalOpen(true);
  };

  const handleProgrammedRequest = () => {
    setSelectedService(null);
    setIsEmergencyMenuOpen(false);
    setIsModalOpen(true);
  };

  // Cerrar modal y limpiar servicio seleccionado
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedService(null);
    setIsEmergencyMenuOpen(false);
  };

  // 🆕 CALLBACK DE ONBOARDING COMPLETADO
  const handleOnboardingComplete = async () => {
    console.log('✅ Onboarding completado, refrescando datos...');
    setShowOnboarding(false);
    
    // Refrescar el perfil del usuario
    if (user) {
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (updatedProfile) {
        setUserProfile(updatedProfile);
        
        // Actualizar ubicación del cliente
        if (updatedProfile.ubicacion_lat && updatedProfile.ubicacion_lng) {
          setClientLocation({
            lat: updatedProfile.ubicacion_lat,
            lng: updatedProfile.ubicacion_lng
          });
        }
      }
    }
  };

  const handleViewLead = async (lead: Lead) => {
    setIsDetailsOpen(true);
    setActionError(null);
    setDetailsError(null);
    setIsDetailsLoading(true);
    setLeadDetails(lead);

    try {
      const fullLead = await getClientLeadDetails(lead.id);
      setLeadDetails(fullLead as Lead);
    } catch (fetchError) {
      console.error("Error fetching full lead details:", fetchError);
      setDetailsError(
        fetchError instanceof Error
          ? fetchError.message
          : "No pudimos cargar todos los detalles del servicio."
      );
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setLeadDetails(null);
    setActionError(null);
    setDetailsError(null);
    setIsDetailsLoading(false);
  };

  const handleDeleteLead = async (lead: Lead) => {
    if (!user) return;
    const confirmed = window.confirm(
      "¿Deseas eliminar esta solicitud? Esta acción no se puede deshacer."
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      setActionError(null);
      const { error } = await supabase
        .from("leads")
        .delete()
        .eq("id", lead.id)
        .eq("cliente_id", user.id);

      if (error) {
        console.error("Error deleting lead:", error);
        if (error.code === "42501") {
          setActionError(
            "No tienes permisos para eliminar esta solicitud. Verifica las políticas RLS o contacta a soporte."
          );
        } else {
          setActionError(
            "No pudimos eliminar la solicitud. Intenta nuevamente o contacta a soporte."
          );
        }
        return;
      }

      await refreshLeads();
      // Si se estaba viendo el detalle, cerrarlo
      if (leadDetails?.id === lead.id) {
        handleCloseDetails();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateLead = async (leadId: string, data: LeadUpdatePayload) => {
    if (!user) return;

    try {
      setIsUpdating(true);
      setActionError(null);
      const updatePayload = {
        servicio_solicitado: data.service.trim() || null,
        descripcion_proyecto: data.description.trim() || null,
        ubicacion_direccion: data.address?.trim() || null,
        whatsapp: data.whatsapp || null,
        photos_urls: data.photos.length > 0 ? data.photos : null,
      };

      const { error } = await supabase
        .from("leads")
        .update(updatePayload)
        .eq("id", leadId)
        .eq("cliente_id", user.id)
        .select("id")
        .single();

      if (error) {
        console.error("Error updating lead:", error);
        console.error("Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        if (error.code === "42501") {
          console.warn("Falling back to RPC update_lead_details due to RLS.");
          const { error: rpcError } = await supabase.rpc(
            "update_lead_details",
            {
              lead_id: leadId,
              servicio_solicitado_in: updatePayload.servicio_solicitado,
              descripcion_proyecto_in: updatePayload.descripcion_proyecto,
              ubicacion_direccion_in: updatePayload.ubicacion_direccion,
              whatsapp_in: updatePayload.whatsapp,
              photos_urls_in: updatePayload.photos_urls,
            }
          );

          if (rpcError) {
            console.error("RPC update_lead_details failed:", rpcError);
            setActionError(
              rpcError.message ||
                "No pudimos guardar los cambios (RPC). Verifica las políticas RLS."
            );
            return;
          }
        } else {
          setActionError(
            error.message
              ? `No pudimos guardar los cambios. Detalle: ${error.message}`
              : "No pudimos guardar los cambios. Intenta nuevamente."
          );
          return;
        }
      }

      await refreshLeads();
      handleCloseDetails();
    } finally {
      setIsUpdating(false);
    }
  };

  // Obtener el próximo servicio (el más reciente no completado)
  const getUpcomingService = (): Lead | null => {
    const incompleteLeads = leads.filter(
      (lead) => lead.estado !== "completado" && lead.estado !== "cancelado"
    );
    return incompleteLeads.length > 0 ? incompleteLeads[0] : null;
  };

  // Obtener servicios completados recientes
  const getRecentCompleted = (): Lead[] => {
    return leads.filter((lead) => lead.estado === "completado").slice(0, 3);
  };

  const hasLeads = leads.length > 0;
  const showWelcomeCard = !hasLeads;

  // Loading State
  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-[calc(var(--header-offset,72px)+2rem)]">
        <div className="text-center">
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            className="text-4xl text-blue-600 mb-4"
          />
          <p className="text-gray-600">Cargando tu dashboard...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-[calc(var(--header-offset,72px)+2rem)]">
        <div className="text-center">
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className="text-4xl text-red-600 mb-4"
          />
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mr-2"
            >
              Reintentar
            </button>
            <Link
              href="/login"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 inline-block"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const upcomingService = getUpcomingService();
  const recentCompleted = getRecentCompleted();

  return (
    <div className="min-h-screen bg-gray-50 pt-[calc(var(--header-offset,72px)+2rem)]">
      {/* Header con Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-6 md:mb-0">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                Dashboard de tu Hogar
              </h1>
              <p className="text-blue-100 text-lg">
                Gestiona todos tus servicios en un solo lugar
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <FontAwesomeIcon icon={faWrench} className="mr-2" />
                  {leads.length} solicitud{leads.length !== 1 ? "es" : ""}
                </div>
                <div className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  Solicitudes este mes: {requestsUsed} /{" "}
                  {permissions.maxRequests === 999
                    ? "∞"
                    : permissions.maxRequests}
                </div>
              </div>
            </div>

            {/* CTA Principal */}
            <div className="flex flex-col sm:flex-row gap-3">
              {requestsRemaining > 0 ? (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors font-semibold flex items-center justify-center shadow-lg"
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  Solicitar un Servicio
                </button>
              ) : (
                <Link
                  href={upgradeUrl}
                  className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg hover:bg-yellow-300 transition-colors font-semibold flex items-center justify-center shadow-lg text-center"
                >
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="mr-2"
                  />
                  Upgrade a Premium
                </Link>
              )}
              <Link
                href="/tecnicos"
                className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-white/30 transition-colors font-semibold flex items-center justify-center border border-white/30"
              >
                Buscar Profesionales
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Banner de Upgrade (solo para usuarios gratuitos) */}
      {isFreeUser && requestsRemaining === 0 && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-3">
                <FontAwesomeIcon icon={faWrench} className="text-2xl" />
                <div>
                  <h3 className="font-bold text-lg">
                    Has alcanzado tu límite mensual
                  </h3>
                  <p className="text-sm">
                    Upgrade a Premium para solicitudes ilimitadas y más
                    beneficios
                  </p>
                </div>
              </div>
              <Link
                href={upgradeUrl}
                className="bg-white text-orange-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
              >
                Ver Planes Premium
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Contenido Principal - Grid de Widgets COMPACTO RESPONSIVE */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* CTA de Emergencias Express */}
        <div className="mb-4 sm:mb-6">
          <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 text-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-white/10 p-5 sm:p-7 lg:p-8 flex flex-col lg:flex-row gap-5 lg:gap-8 items-start">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.35em] text-white/70 font-semibold mb-2">
                Servicios Express • Atención inmediata
              </p>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black leading-tight mb-2 sm:mb-3">
                ¿Emergencia en casa? Te asignamos un técnico en minutos.
              </h2>
              <p className="text-sm sm:text-base text-white/85 max-w-2xl">
                Elige una urgencia y comienza el chat de coordinación de forma inmediata. Para proyectos programados, agenda con calma desde la misma vista.
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-4 text-[11px] sm:text-xs text-white/80">
                <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                  <FontAwesomeIcon icon={faBolt} className="text-yellow-300 text-sm" />
                  Tiempo promedio 25 min
                </span>
                <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                  <FontAwesomeIcon icon={faWater} className="text-cyan-200 text-sm" />
                  Técnicos verificados
                </span>
                <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                  <FontAwesomeIcon icon={faRocket} className="text-white text-sm" />
                  Garantía Sumee Express
                </span>
              </div>
            </div>

            <div className="w-full lg:w-auto flex flex-col gap-2.5 sm:gap-3 min-w-[240px]">
              <button
                onClick={() => handleEmergencyRequest("electricidad")}
                className="group w-full inline-flex items-center justify-between gap-3 bg-white text-indigo-600 font-semibold text-sm sm:text-base px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                <span className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faBolt} className="text-yellow-500 text-base sm:text-lg" />
                  Urgencia Eléctrica
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-indigo-500">
                  Express
                </span>
              </button>
              <button
                onClick={() => handleEmergencyRequest("plomeria")}
                className="group w-full inline-flex items-center justify-between gap-3 bg-white/90 text-cyan-700 font-semibold text-sm sm:text-base px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                <span className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faWater} className="text-cyan-500 text-base sm:text-lg" />
                  Urgencia de Plomería
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-cyan-600">
                  Express
                </span>
              </button>
              <button
                onClick={handleProgrammedRequest}
                className="w-full inline-flex items-center justify-between gap-3 bg-white/10 text-white font-semibold text-sm sm:text-base px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-200"
              >
                <span className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faWrench} className="text-white text-base sm:text-lg" />
                  Agendar Proyecto Pro
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-white/70">
                  Programado
                </span>
              </button>
              <p className="text-[11px] sm:text-xs text-white/80 leading-snug">
                Express = atención inmediata. PRO = servicios planificados con visita diagnóstica y múltiples cotizaciones.
              </p>
            </div>
          </div>
        </div>

        {/* Grid de Widgets Principal - Layout Compacto Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* Widget de Próximo Servicio - Ocupa 2 columnas */}
          <div className="lg:col-span-2">
            <UpcomingServiceWidget
              upcomingLead={upcomingService}
              onViewDetails={handleViewLead}
            />
          </div>

          {/* Columna Lateral - Widgets Compactos Apilados - RESPONSIVE */}
          <div className="lg:col-span-1 space-y-3 sm:space-y-4">
            {/* CTA de Primer Servicio - Solo si no hay leads */}
            {showWelcomeCard && (
              <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 text-white rounded-xl sm:rounded-2xl shadow-lg border border-white/10 px-4 py-4 sm:px-5 sm:py-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 flex items-center justify-center shadow-inner">
                    <FontAwesomeIcon icon={faRocket} className="text-white text-lg sm:text-xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white/70 font-semibold">
                      Primer paso
                    </p>
                    <h3 className="text-base sm:text-lg font-bold leading-tight">
                      ¡Bienvenido a tu Dashboard!
                    </h3>
                    <p className="text-white/85 text-sm sm:text-[15px] mt-2 leading-relaxed">
                      Solicita tu primer servicio y te conectaremos con especialistas verificados en minutos.
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 font-semibold text-sm sm:text-sm px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg hover:bg-indigo-50 transition-colors"
                  >
                    <FontAwesomeIcon icon={faPlus} className="text-xs sm:text-sm" />
                    Solicitar servicio
                  </button>
                  <Link
                    href="/tecnicos"
                    className="inline-flex items-center justify-center gap-2 bg-white/15 text-white font-semibold text-sm sm:text-sm px-4 py-2.5 rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
                  >
                    Explorar profesionales
                  </Link>
                </div>
              </div>
            )}

            {/* Widget de Perfil del Cliente COMPACTO */}
            {userProfile && (
              <ClientProfileWidgetCompact
                profile={userProfile}
                onProfileUpdate={() => {
                  // Refrescar perfil
                  if (user) {
                    supabase
                      .from("profiles")
                      .select("*")
                      .eq("user_id", user.id)
                      .single()
                      .then(({ data }) => {
                        if (data) setUserProfile(data);
                      });
                  }
                }}
              />
            )}
            
            {/* Widget de Mapa Interactivo COMPACTO */}
            <ExploreMapCTACompact professionalCount={50} maxRadius={15} />
            
            {/* Widget de Actividad Reciente */}
            <RecentActivityWidget recentLeads={recentCompleted} />
          </div>
        </div>

        {/* Widget de Servicios Rápidos - Full Width */}
        {hasLeads && (
          <div className="mb-8">
            <QuickActionsWidget onServiceClick={handleQuickServiceClick} />
          </div>
        )}

        {/* Lista de Todas las Solicitudes */}
        {hasLeads ? (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Todas tus Solicitudes
            </h2>
            <div className="space-y-4">
              {actionError && (
                <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                  {actionError}
                </div>
              )}
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="font-semibold text-gray-900 mr-3">
                          {lead.servicio_solicitado || "Servicio Profesional"}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            lead.estado === "completado"
                              ? "bg-green-100 text-green-700"
                              : lead.estado === "aceptado" ||
                                lead.estado === "en_camino"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {lead.estado || "Nuevo"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {lead.descripcion_proyecto}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(lead.fecha_creacion).toLocaleDateString(
                          "es-MX",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleViewLead(lead)}
                        className="px-3 py-1.5 text-sm rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                      >
                        Ver detalles
                      </button>
                      <button
                        onClick={() => handleDeleteLead(lead)}
                        className="px-3 py-1.5 text-sm rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50"
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Eliminando..." : "Eliminar"}
                      </button>
                  </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-dashed border-blue-200 p-8 sm:p-10 text-center shadow-sm">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faWrench} className="text-2xl sm:text-3xl text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aún no tienes solicitudes activas
            </h3>
            <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
              Puedes comenzar desde el botón “Solicitar servicio” en la parte superior derecha o explorar profesionales destacados para inspirarte.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
                <FontAwesomeIcon icon={faPlus} className="text-sm" />
                Solicitar servicio
            </button>
              <Link
                href="/tecnicos"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold border border-blue-100 text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                Explorar profesionales
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* FAB de emergencias (solo móvil) */}
      {isEmergencyMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-30"
          onClick={() => setIsEmergencyMenuOpen(false)}
        />
      )}
      <div className="md:hidden fixed bottom-24 right-4 z-40 flex flex-col items-end gap-3">
        <div
          className={`flex flex-col gap-2 w-56 transition-all duration-200 ${
            isEmergencyMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
          }`}
        >
          <button
            onClick={() => handleEmergencyRequest("electricidad")}
            className="w-full inline-flex items-center justify-between px-4 py-3 rounded-xl bg-white shadow-lg text-indigo-600 font-semibold"
          >
            <span className="flex items-center gap-2">
              <FontAwesomeIcon icon={faBolt} className="text-yellow-500" />
              Urgencia eléctrica
            </span>
            <span className="text-[10px] uppercase tracking-[0.3em]">Express</span>
          </button>
          <button
            onClick={() => handleEmergencyRequest("plomeria")}
            className="w-full inline-flex items-center justify-between px-4 py-3 rounded-xl bg-white shadow-lg text-cyan-700 font-semibold"
          >
            <span className="flex items-center gap-2">
              <FontAwesomeIcon icon={faWater} className="text-cyan-500" />
              Urgencia plomería
            </span>
            <span className="text-[10px] uppercase tracking-[0.3em]">Express</span>
          </button>
          <button
            onClick={handleProgrammedRequest}
            className="w-full inline-flex items-center justify-between px-4 py-3 rounded-xl border border-white/70 bg-white/80 text-gray-900 font-semibold"
          >
            <span className="flex items-center gap-2">
              <FontAwesomeIcon icon={faWrench} className="text-indigo-600" />
              Proyecto programado
            </span>
            <span className="text-[10px] uppercase tracking-[0.3em]">Pro</span>
          </button>
        </div>
        <button
          onClick={() => setIsEmergencyMenuOpen((prev) => !prev)}
          className="w-14 h-14 rounded-full shadow-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center text-2xl active:scale-95 transition-transform duration-150"
          aria-label="Abrir atajos de emergencia"
        >
          <FontAwesomeIcon icon={isEmergencyMenuOpen ? faTimes : faBolt} />
        </button>
      </div>

      {/* Modal de Solicitud de Servicio */}
      <RequestServiceModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onLeadCreated={refreshLeads}
        initialService={selectedService}
      />
      {isDetailsOpen && leadDetails && (
        <LeadDetailsModal
          lead={leadDetails}
          onClose={handleCloseDetails}
          onDelete={() => handleDeleteLead(leadDetails)}
          onUpdate={(data) => handleUpdateLead(leadDetails.id, data)}
          isDeleting={isDeleting}
          isUpdating={isUpdating}
          isLoading={isDetailsLoading}
          loadError={detailsError}
        />
      )}

      {/* 🆕 ONBOARDING MODAL */}
      {showOnboarding && userProfile && (
        <ClientOnboardingModal
          isOpen={showOnboarding}
          userProfile={userProfile}
          onComplete={handleOnboardingComplete}
        />
      )}
    </div>
  );
}

interface LeadUpdatePayload {
  service: string;
  description: string;
  whatsapp: string;
  address?: string;
  photos: string[];
}

interface LeadDetailsModalProps {
  lead: Lead;
  onClose: () => void;
  onDelete: () => void;
  onUpdate: (data: LeadUpdatePayload) => void;
  isDeleting: boolean;
  isUpdating: boolean;
  isLoading: boolean;
  loadError: string | null;
}

const normalizeWhatsappNumber = (input: string) => {
  const digits = (input || "").replace(/\D/g, "");

  if (digits.length === 0) {
    return { normalized: "", isValid: false };
  }

  if (digits.startsWith("521") && digits.length === 13) {
    return { normalized: `52${digits.slice(3)}`, isValid: true };
  }

  if (digits.startsWith("52") && digits.length === 12) {
    return { normalized: digits, isValid: true };
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    const trimmed = digits.slice(1);
    return {
      normalized: trimmed.length === 10 ? `52${trimmed}` : digits,
      isValid: trimmed.length === 10,
    };
  }

  if (digits.length === 10) {
    return { normalized: `52${digits}`, isValid: true };
  }

  if (digits.length > 12 && digits.startsWith("52")) {
    const trimmed = digits.slice(0, 12);
    return { normalized: trimmed, isValid: trimmed.length === 12 };
  }

  return { normalized: digits, isValid: false };
};

const formatWhatsappForDisplay = (normalized: string) => {
  if (!normalized) return "";
  const localDigits = normalized.startsWith("52")
    ? normalized.slice(2)
    : normalized;

  if (localDigits.length === 10) {
    return localDigits.replace(/(\d{2})(\d{4})(\d{4})/, "$1 $2 $3");
  }

  return normalized;
};

function LeadDetailsModal({
  lead,
  onClose,
  onDelete,
  onUpdate,
  isDeleting,
  isUpdating,
  isLoading,
  loadError,
}: LeadDetailsModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [service, setService] = useState(lead.servicio_solicitado || "");
  const [description, setDescription] = useState(
    lead.descripcion_proyecto || ""
  );
  const [address, setAddress] = useState(lead.ubicacion_direccion || "");
  const [whatsapp, setWhatsapp] = useState(() => {
    const { normalized, isValid } = normalizeWhatsappNumber(lead.whatsapp || "");
    return isValid
      ? formatWhatsappForDisplay(normalized)
      : lead.whatsapp || "";
  });
  const [whatsappError, setWhatsappError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>(lead.photos_urls || []);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    setService(lead.servicio_solicitado || "");
    setDescription(lead.descripcion_proyecto || "");
    setAddress(lead.ubicacion_direccion || "");
    const { normalized, isValid } = normalizeWhatsappNumber(
      lead.whatsapp || ""
    );
    setWhatsapp(
      isValid ? formatWhatsappForDisplay(normalized) : lead.whatsapp || ""
    );
    setWhatsappError(null);
    setPhotos(lead.photos_urls || []);
  }, [lead]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const { normalized, isValid } = normalizeWhatsappNumber(whatsapp);

    if (!isValid) {
      setWhatsappError(
        "Ingresa un número de WhatsApp válido de 10 dígitos (ej. 55 1234 5678)."
      );
      return;
    }

    setWhatsapp(formatWhatsappForDisplay(normalized));
    onUpdate({
      service,
      description,
      whatsapp: normalized,
      address,
      photos,
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleWhatsappChange = (value: string) => {
    setWhatsapp(value);
    if (whatsappError) {
      setWhatsappError(null);
    }
  };

  const applyWhatsappFormatting = () => {
    const { normalized, isValid } = normalizeWhatsappNumber(whatsapp);
    if (isValid) {
      setWhatsapp(formatWhatsappForDisplay(normalized));
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const newUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const sanitizedName = file.name.replace(/\s+/g, "-");
        const fileExt = sanitizedName.split(".").pop();
        const filePath = `${lead.id}/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("lead-photos")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          });

        if (uploadError) {
          throw uploadError;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("lead-photos").getPublicUrl(filePath);

        newUrls.push(publicUrl);
      }

      setPhotos((prev) => [...prev, ...newUrls]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("Error uploading lead photos:", error);
      setUploadError(
        "No pudimos subir una o más imágenes. Verifica que el bucket 'lead-photos' exista y que tengas permisos."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async (url: string) => {
    const confirmRemoval = window.confirm(
      "¿Deseas eliminar esta foto? Esta acción no se puede deshacer."
    );

    if (!confirmRemoval) return;

    try {
      const path = url.split("/lead-photos/")[1];
      if (path) {
        const { error } = await supabase.storage
          .from("lead-photos")
          .remove([path]);
        if (error) {
          throw error;
        }
      }
      setPhotos((prev) => prev.filter((photo) => photo !== url));
    } catch (error: any) {
      console.error("Error removing lead photo:", error);
      setUploadError(
        "No pudimos eliminar la foto. Verifica tus permisos en el bucket de almacenamiento."
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-bold">Detalle de la Solicitud</h3>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        <form className="p-6 space-y-5" onSubmit={handleSubmit}>
          {isLoading && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm">
              <FontAwesomeIcon icon={faSpinner} spin className="text-base" />
              Cargando información completa del servicio…
            </div>
          )}

          {loadError && (
            <div className="px-4 py-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-sm">
              {loadError}
            </div>
          )}

          {lead.profesional_asignado && (
            <section className="p-4 rounded-xl border border-blue-100 bg-blue-50/60">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold flex items-center justify-center text-xl shadow-inner">
                    {lead.profesional_asignado.full_name
                      ?.charAt(0)
                      .toUpperCase() || "P"}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                      Profesional asignado
                    </p>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {lead.profesional_asignado.full_name || "Profesional Sumee"}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {lead.profesional_asignado.profession || "Especialista certificado"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      ⭐{" "}
                      {(lead.profesional_asignado.calificacion_promedio ?? 5).toFixed(
                        1
                      )}{" "}
                      / 5.0 · ID Sumee Pro{" "}
                      {lead.profesional_asignado.user_id
                        ? lead.profesional_asignado.user_id.slice(0, 8).toUpperCase()
                        : "—"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 w-full sm:w-auto sm:items-end">
                  {lead.profesional_asignado.whatsapp && (
                    <a
                      href={`https://wa.me/${lead.profesional_asignado.whatsapp}?text=Hola%20${
                        lead.profesional_asignado.full_name
                          ? encodeURIComponent(lead.profesional_asignado.full_name)
                          : ""
                      }%2C%20tengo%20dudas%20sobre%20mi%20servicio%20de%20${encodeURIComponent(
                        lead.servicio_solicitado || "Sumee App"
                      )}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors"
                    >
                      <FontAwesomeIcon icon={faWhatsapp} />
                      WhatsApp profesional
                    </a>
                  )}
                  {lead.profesional_asignado.areas_servicio &&
                    lead.profesional_asignado.areas_servicio.length > 0 && (
                      <div className="flex flex-wrap gap-2 justify-end">
                        {lead.profesional_asignado.areas_servicio
                          .slice(0, 3)
                          .map((area) => (
                            <span
                              key={area}
                              className="px-3 py-1 rounded-full bg-white/70 text-blue-700 text-xs font-medium border border-blue-200"
                            >
                              {area}
                            </span>
                          ))}
                      </div>
                    )}
                </div>
              </div>
            </section>
          )}

          <div>
            <label className="text-sm font-semibold text-gray-500 block mb-1">
              Servicio
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              value={service}
              onChange={(event) => setService(event.target.value)}
              placeholder="Servicio Profesional"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-500 block mb-1">
              Descripción
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2 h-32 resize-y focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe el servicio que necesitas"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-500 block mb-1">
              WhatsApp de contacto <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-200 ${
                whatsappError ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-blue-500"
              }`}
              value={whatsapp}
              onChange={(event) => handleWhatsappChange(event.target.value)}
              onBlur={applyWhatsappFormatting}
              placeholder="55 1234 5678"
            />
            <p className="text-xs text-gray-500 mt-1">
              Este número se comparte con profesionales verificados para coordinar el servicio por WhatsApp.
            </p>
            {whatsappError && (
              <p className="text-xs text-red-600 mt-1">{whatsappError}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-500 block mb-2">
              Galería de fotos (opcional)
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Sube evidencia del problema o avances del servicio (máximo 10MB
              por archivo).
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-3">
                {photos.map((url) => (
                  <div
                    key={url}
                    className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200"
                  >
                    <img
                      src={url}
                      alt="Evidencia del servicio"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(url)}
                      className="absolute top-1 right-1 bg-black/60 text-white text-xs rounded-full px-1.5 py-0.5 hover:bg-black/80"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="px-4 py-2 rounded-lg border border-dashed border-blue-400 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                  disabled={isUploading || isUpdating}
                >
                  {isUploading ? "Subiendo..." : "Agregar fotos"}
                </button>
              </div>
              {uploadError && (
                <p className="text-sm text-red-600">{uploadError}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-500">Estado</h4>
              <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                {lead.estado || "Nuevo"}
              </span>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-500">Fecha</h4>
              <p className="text-gray-700">
                {new Date(lead.fecha_creacion).toLocaleString("es-MX", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
          <div className="bg-gray-50 -mx-6 -mb-6 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={isUpdating || isUploading}
            >
              {isUpdating ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
