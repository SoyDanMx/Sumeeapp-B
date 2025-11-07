"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getClientLeads } from "@/lib/supabase/data";
import { supabase } from "@/lib/supabase/client";
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
  const [leadDetails, setLeadDetails] = useState<Lead | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

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

  const handleViewLead = (lead: Lead) => {
    setLeadDetails(lead);
    setIsDetailsOpen(true);
    setActionError(null);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setLeadDetails(null);
    setActionError(null);
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
      {isDetailsOpen && leadDetails && (
        <LeadDetailsModal
          lead={leadDetails}
          onClose={handleCloseDetails}
          onDelete={() => handleDeleteLead(leadDetails)}
          onUpdate={(data) => handleUpdateLead(leadDetails.id, data)}
          isDeleting={isDeleting}
          isUpdating={isUpdating}
        />
      )}
    </div>
  );
}

interface LeadUpdatePayload {
  service: string;
  description: string;
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
}

function LeadDetailsModal({
  lead,
  onClose,
  onDelete,
  onUpdate,
  isDeleting,
  isUpdating,
}: LeadDetailsModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [service, setService] = useState(lead.servicio_solicitado || "");
  const [description, setDescription] = useState(
    lead.descripcion_proyecto || ""
  );
  const [address, setAddress] = useState(lead.ubicacion_direccion || "");
  const [photos, setPhotos] = useState<string[]>(lead.photos_urls || []);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    setService(lead.servicio_solicitado || "");
    setDescription(lead.descripcion_proyecto || "");
    setAddress(lead.ubicacion_direccion || "");
    setPhotos(lead.photos_urls || []);
  }, [lead]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onUpdate({ service, description, address, photos });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
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
        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
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
