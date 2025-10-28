"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getClientLeads } from "@/lib/supabase/data";
import { Lead } from "@/types/supabase";
import { useAuth } from "@/context/AuthContext";
import { useMembership } from "@/context/MembershipContext";
import RequestServiceModal from "@/components/client/RequestServiceModal";
import UpcomingServiceWidget from "@/components/dashboard/UpcomingServiceWidget";
import QuickActionsWidget from "@/components/dashboard/QuickActionsWidget";
import RecentActivityWidget from "@/components/dashboard/RecentActivityWidget";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faExclamationTriangle,
  faPlus,
  faWrench,
} from "@fortawesome/free-solid-svg-icons";

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

  // Manejar clic en servicio rápido
  const handleQuickServiceClick = (serviceName: string) => {
    setSelectedService(serviceName);
    setIsModalOpen(true);
  };

  // Cerrar modal y limpiar servicio seleccionado
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedService(null);
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

  // Loading State
  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
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
    <div className="min-h-screen bg-gray-50 pt-20">
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

      {/* Contenido Principal - Grid de Widgets */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Grid de Widgets Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Widget de Próximo Servicio - Ocupa 2 columnas */}
          <div className="lg:col-span-2">
            <UpcomingServiceWidget upcomingLead={upcomingService} />
          </div>

          {/* Widget de Actividad Reciente - Ocupa 1 columna */}
          <div className="lg:col-span-1">
            <RecentActivityWidget recentLeads={recentCompleted} />
          </div>
        </div>

        {/* Widget de Servicios Rápidos - Full Width */}
        {leads.length > 0 && (
          <div className="mb-8">
            <QuickActionsWidget onServiceClick={handleQuickServiceClick} />
          </div>
        )}

        {/* Lista de Todas las Solicitudes */}
        {leads.length > 0 ? (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Todas tus Solicitudes
            </h2>
            <div className="space-y-4">
              {leads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/solicitudes/${lead.id}`}
                  className="block p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
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
                    <FontAwesomeIcon
                      icon={faPlus}
                      className="text-gray-400 transform rotate-45 ml-4"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FontAwesomeIcon
                icon={faWrench}
                className="text-4xl text-blue-600"
              />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              ¡Bienvenido a tu Dashboard!
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Comienza solicitando tu primer servicio. Te ayudaremos a encontrar
              el profesional perfecto para resolverlo.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center text-lg font-semibold shadow-lg"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Solicitar mi Primer Servicio
            </button>
          </div>
        )}
      </div>

      {/* Modal de Solicitud de Servicio */}
      <RequestServiceModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onLeadCreated={refreshLeads}
      />
    </div>
  );
}
