"use client";

import { Lead } from "@/types/supabase";
import React, { useState, useMemo, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faCheckCircle,
  faSpinner,
  faUser,
  faQuestion,
  faRoute,
  faCalendarDays,
  faFlagCheckered,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp as faWhatsappBrand } from "@fortawesome/free-brands-svg-icons";
import {
  acceptLead,
  markLeadContacted,
  scheduleLeadAppointment,
  confirmLeadAppointment,
  completeLeadWork,
} from "@/lib/supabase/data";
import { supabase } from "@/lib/supabase/client";
import { calculateDistance } from "@/lib/calculateDistance";
import {
  sendCredentialToClient,
  openWhatsAppLink,
} from "@/lib/supabase/credential-sender";
import { useCountdown } from "@/hooks/useCountdown";
import ProfessionalQuoteModal from "@/components/dashboard/ProfessionalQuoteModal";
import { useAuth } from "@/context/AuthContext";

interface LeadCardProps {
    lead: Lead;
    profesionalLat: number;
    profesionalLng: number;
    isSelected: boolean;
    onSelect: () => void;
  onLeadAccepted?: (lead: Lead) => void; // Callback con el lead actualizado
  onLeadUpdated?: (lead: Lead) => void;
}

export default function LeadCard({
  lead,
  profesionalLat,
  profesionalLng,
  isSelected,
  onSelect,
  onLeadAccepted,
  onLeadUpdated,
}: LeadCardProps) {
  const [leadState, setLeadState] = useState<Lead>(lead);
    const [isAccepting, setIsAccepting] = useState(false);
  const [accepted, setAccepted] = useState(
    ["aceptado", "contactado", "en_progreso", "completado"].includes(
      (lead.estado || "").toLowerCase()
    )
  );
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isConfirmingAppointment, setIsConfirmingAppointment] = useState(false);
  const [isCompletingWork, setIsCompletingWork] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [appointmentAt, setAppointmentAt] = useState<string>(
    lead.appointment_at
      ? new Date(lead.appointment_at).toISOString().slice(0, 16)
      : ""
  );
  const [appointmentNotes, setAppointmentNotes] = useState<string>(
    lead.appointment_notes ?? ""
  );
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setLeadState(lead);
    setAccepted(
      ["aceptado", "contactado", "en_progreso", "completado"].includes(
        (lead.estado || "").toLowerCase()
      )
    );
    setAppointmentAt(
      lead.appointment_at
        ? new Date(lead.appointment_at).toISOString().slice(0, 16)
        : ""
    );
    setAppointmentNotes(lead.appointment_notes ?? "");
  }, [lead]);

  const leadInfo = useMemo(() => leadState, [leadState]);

  const normalizedClientWhatsapp = React.useMemo(() => {
    if (!leadInfo.whatsapp) return null;
    const cleanPhone = leadInfo.whatsapp.replace(/\D/g, "");
    if (!cleanPhone) return null;
    return cleanPhone.startsWith("52") ? cleanPhone : `52${cleanPhone}`;
  }, [leadInfo.whatsapp]);

  // ✅ FIX: Mensaje mejorado con texto específico sobre ser técnico verificado de SumeeApp
  const whatsappIntroMessage = React.useMemo(() => {
    const clientName = leadInfo.nombre_cliente?.trim() || "hola";
    const servicio = leadInfo.servicio_solicitado || leadInfo.servicio || "tu solicitud de servicio";
    return encodeURIComponent(
      `Hola ${clientName}, soy un técnico verificado de SumeeApp. He aceptado el trabajo disponible "${servicio}" y me gustaría coordinar los detalles contigo. ¿Te parece si conversamos?`
    );
  }, [leadInfo.nombre_cliente, leadInfo.descripcion_proyecto, leadInfo.servicio_solicitado, leadInfo.servicio]);

  const contactClientWhatsappLink = normalizedClientWhatsapp
    ? `https://wa.me/${normalizedClientWhatsapp}?text=${whatsappIntroMessage}`
    : null;

  const contactCountdown = useCountdown(leadInfo.contact_deadline_at);

  const hasLeadLocation =
    leadInfo.ubicacion_lat !== null &&
    leadInfo.ubicacion_lat !== undefined &&
    leadInfo.ubicacion_lng !== null &&
    leadInfo.ubicacion_lng !== undefined;

  const distanciaKm = hasLeadLocation
        ? calculateDistance(
            profesionalLat,
            profesionalLng,
        leadInfo.ubicacion_lat,
        leadInfo.ubicacion_lng
          ).toFixed(1)
    : "0.0";

    const handleAcceptLead = async (e: React.MouseEvent) => {
    e.stopPropagation();
        setIsAccepting(true);

        try {
      // Usar el user de useAuth() en lugar de obtenerlo de nuevo
      if (!user?.id) {
        throw new Error("Usuario no autenticado");
      }

      const result = await acceptLead(leadInfo.id);
            
            if (result.success) {
        // Asegurar que el lead tenga el estado correcto
        const updatedLead: Lead = {
          ...leadInfo,
          ...result.lead,
          estado: result.lead.estado || "aceptado", // Asegurar que el estado sea "aceptado"
        };

        console.log("✅ Lead aceptado exitosamente:", updatedLead);
        console.log("📋 Estado del lead:", updatedLead.estado);
        console.log("📞 WhatsApp del cliente:", updatedLead.whatsapp);
        console.log("📍 Ubicación:", updatedLead.ubicacion_lat, updatedLead.ubicacion_lng);
        console.log("⏰ Deadline de contacto:", updatedLead.contact_deadline_at);

                setAccepted(true);
        setLeadState(updatedLead);

        try {
          if (!user?.id) {
            console.warn("Usuario no disponible para enviar credencial");
            return;
          }
          
          const credentialResult = await sendCredentialToClient(
            leadInfo.id,
            user.id
          );
          
          if (credentialResult.success && credentialResult.whatsappLink) {
            openWhatsAppLink(credentialResult.whatsappLink);
          } else if (credentialResult.error) {
            console.warn("No se pudo generar el link de WhatsApp:", credentialResult.error);
            // No mostrar alerta porque el lead ya fue aceptado exitosamente
          }
        } catch (credentialError: any) {
          console.error(
            "Error al enviar credencial (no crítico):",
            credentialError
          );
          // No bloquear el flujo si falla el envío de credencial
        }

                // ✅ Refrescar datos inmediatamente para que aparezca en "En Progreso"
        // Usar setTimeout para asegurar que el estado se actualice primero
        setTimeout(() => {
          if (onLeadAccepted) {
            onLeadAccepted(updatedLead);
          }
          if (onLeadUpdated) {
            onLeadUpdated(updatedLead);
          }
        }, 100);
      }
    } catch (error) {
      console.error("Error al aceptar el lead:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al aceptar el proyecto. Por favor, inténtalo de nuevo.";
      alert(errorMessage);
        } finally {
            setIsAccepting(false);
        }
    };

  const emitLeadUpdate = (updated: Lead) => {
    setLeadState(updated);
    if (onLeadUpdated) {
      onLeadUpdated(updated);
    }
    if (onLeadAccepted) {
      onLeadAccepted(updated);
    }
  };

  const handleMarkContacted = async () => {
    // Verificar que el usuario esté autenticado antes de proceder
    if (!user?.id) {
      alert(
        "Debes iniciar sesión para marcar el contacto. Por favor, recarga la página e inicia sesión nuevamente."
      );
      return;
    }

    if (!contactClientWhatsappLink) {
      alert(
        "No se detectó el número de WhatsApp del cliente. Puedes marcarlo como contactado manualmente desde Detalles."
      );
      return;
    }

    const confirmation = confirm(
      "¿Confirmas que ya contactaste al cliente por WhatsApp?"
    );
    if (!confirmation) return;

    try {
      setIsSavingContact(true);
      const updatedLead = await markLeadContacted(
        leadInfo.id,
        "whatsapp",
        "Contacto registrado desde LeadCard"
      );
      emitLeadUpdate(updatedLead);
    } catch (error) {
      console.error("Error al marcar contacto:", error);
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo registrar el contacto. Por favor, recarga la página e inténtalo nuevamente."
      );
    } finally {
      setIsSavingContact(false);
    }
  };

  const handleScheduleAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentAt) {
      alert("Selecciona la fecha y hora de la cita.");
      return;
    }

    try {
      setIsScheduling(true);
      const updatedLead = await scheduleLeadAppointment(
        leadInfo.id,
        new Date(appointmentAt).toISOString(),
        appointmentNotes
      );
      emitLeadUpdate(updatedLead);
      setShowScheduleModal(false);
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo agendar la cita."
      );
    } finally {
      setIsScheduling(false);
    }
  };

  const handleConfirmAppointment = async () => {
    try {
      setIsConfirmingAppointment(true);
      const updatedLead = await confirmLeadAppointment(leadInfo.id);
      emitLeadUpdate(updatedLead);
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo confirmar la cita."
      );
    } finally {
      setIsConfirmingAppointment(false);
    }
  };

  const handleCompleteWork = async () => {
    const confirmation = confirm(
      "Confirma que el trabajo fue realizado y deseas marcarlo como completado."
    );
    if (!confirmation) return;

    try {
      setIsCompletingWork(true);
      const updatedLead = await completeLeadWork(leadInfo.id);
      emitLeadUpdate(updatedLead);
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo completar el trabajo."
      );
    } finally {
      setIsCompletingWork(false);
    }
  };

  const renderContactBanner = () => {
    if (!accepted) return null;
    if (leadInfo.contacted_at) {
      return (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 flex flex-col gap-1">
          <div className="flex items-center gap-2 font-semibold">
            <FontAwesomeIcon icon={faCheck} />
            <span>Contacto registrado</span>
          </div>
          <p className="text-sm">
            Contactaste al cliente el {new Date(leadInfo.contacted_at).toLocaleString("es-MX", {
              dateStyle: "medium",
              timeStyle: "short",
            })} mediante {leadInfo.contact_method || "WhatsApp"}.
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-2.5 md:p-3 animate-pulse">
        <div className="flex flex-col gap-2">
          <div>
            <p className="font-semibold text-amber-700 text-xs md:text-sm">
              Tienes 30 minutos para contactar al cliente. ¡Hazlo cuanto antes!
            </p>
            <p className="text-xs text-amber-600 flex items-center gap-1.5 mt-1">
              <FontAwesomeIcon icon={faBell} className="text-xs" />
              {contactCountdown.isExpired
                ? "El tiempo límite expiró. Registra el contacto o re-asigna el trabajo."
                : `Tiempo restante: ${contactCountdown.minutes}m ${contactCountdown.seconds}s`}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (contactClientWhatsappLink) {
                  openWhatsAppLink(contactClientWhatsappLink);
                } else {
                  alert(
                    "El cliente no compartió WhatsApp. Contacta usando el detalle del lead."
                  );
                }
              }}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold shadow-md transition-transform animate-[wiggle_2s_ease-in-out_infinite] flex items-center justify-center gap-1.5"
              style={{ animationDelay: "0.5s" }}
            >
              <FontAwesomeIcon icon={faWhatsappBrand} className="text-xs" />
              <span>Contactar WhatsApp</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                void handleMarkContacted();
              }}
              disabled={isSavingContact}
              className="bg-white border border-green-500 text-green-600 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold hover:bg-green-50 disabled:opacity-50"
            >
              {isSavingContact ? "Guardando..." : "Ya contacté"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderAppointmentSection = () => {
    if (!leadInfo.contacted_at) return null;

    return (
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-indigo-700 font-semibold">
          <FontAwesomeIcon icon={faCalendarDays} />
          <span>
            {leadInfo.appointment_status === "confirmada"
              ? "Cita confirmada"
              : leadInfo.appointment_status === "pendiente_confirmacion"
              ? "Cita pendiente de confirmación"
              : leadInfo.appointment_status === "contactado"
              ? "Agenda la fecha del servicio"
              : "Gestiona la cita con el cliente"}
          </span>
        </div>
        {leadInfo.appointment_at ? (
          <p className="text-sm text-indigo-800">
            Programada para el {new Date(leadInfo.appointment_at).toLocaleString(
              "es-MX",
              { dateStyle: "medium", timeStyle: "short" }
            )}
          </p>
        ) : (
          <p className="text-sm text-indigo-700">
            Define la fecha y hora acordada para que quede registrada.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowScheduleModal(true);
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700"
          >
            {leadInfo.appointment_at ? "Reagendar" : "Agendar cita"}
          </button>
          {leadInfo.appointment_status === "pendiente_confirmacion" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                void handleConfirmAppointment();
              }}
              disabled={isConfirmingAppointment}
              className="border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-50 disabled:opacity-50"
            >
              {isConfirmingAppointment ? "Confirmando..." : "Confirmar cita"}
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderCompletionSection = () => {
    if (leadInfo.estado === "completado") {
      return (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-700 flex items-center gap-2">
          <FontAwesomeIcon icon={faFlagCheckered} />
          <div>
            <p className="font-semibold">Trabajo marcado como completado.</p>
            {leadInfo.work_completed_at && (
              <p className="text-sm">
                {new Date(leadInfo.work_completed_at).toLocaleString("es-MX", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            )}
          </div>
        </div>
      );
    }

    if (leadInfo.appointment_status === "confirmada") {
      return (
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 flex flex-col gap-2">
          <p className="text-sky-700 text-sm">
            Cuando concluyas el servicio, marca el trabajo como completado para
            sumar puntos y solicitar la reseña del cliente.
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              void handleCompleteWork();
            }}
            disabled={isCompletingWork}
            className="bg-sky-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-sky-700 disabled:opacity-50"
          >
            {isCompletingWork ? "Guardando..." : "Marcar trabajo completado"}
          </button>
        </div>
      );
    }

    return null;
  };

    const getStatusBadge = () => {
    switch (leadInfo.estado?.toLowerCase()) {
      case "nuevo":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
            Nuevo
          </span>
        );
      case "contactado":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            Contactado
          </span>
        );
      case "en_progreso":
        return (
          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
            En Progreso
          </span>
        );
      case "completado":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            Completado
          </span>
        );
            default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
            {leadInfo.estado || "Nuevo"}
          </span>
        );
        }
    };

    return (
    <div
      className={`p-2.5 md:p-3 border rounded-lg transition-all duration-200 touch-manipulation ${
        isSelected
          ? "bg-indigo-100 border-indigo-500 shadow-md"
          : "bg-white hover:border-gray-400 active:scale-[0.98]"
      }`}
    >
            <div onClick={onSelect} className="cursor-pointer">
        <div className="flex justify-between items-start mb-1.5 gap-2">
          <h3 className="font-semibold text-gray-800 flex items-center text-sm md:text-base flex-1 min-w-0">
            <FontAwesomeIcon
              icon={faUser}
              className="mr-1.5 text-gray-500 flex-shrink-0 text-xs"
            />
            <span className="truncate">
              {leadInfo.nombre_cliente || "Cliente Anónimo"}
            </span>
                    </h3>
                    {getStatusBadge()}
                </div>
        <p className="text-xs md:text-sm text-gray-600 mb-2 line-clamp-2">
          {leadInfo.descripcion_proyecto || "Sin descripción"}
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
          <div>
            <p className="font-semibold text-gray-700">Servicio</p>
            <p>{leadInfo.servicio_solicitado || leadInfo.servicio || "General"}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-700">Distancia</p>
            <p>{distanciaKm} km aprox.</p>
                </div>
                </div>
            </div>

      {!accepted && (
        <div className="space-y-3">
                        <button
                            onClick={handleAcceptLead}
                            disabled={isAccepting}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-colors ${
              isAccepting
                ? "bg-gray-300 text-gray-600"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
                        >
                            {isAccepting ? (
                                <>
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                    <span>Aceptando...</span>
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faCheck} />
                                    <span>Aceptar Trabajo</span>
                                </>
                            )}
                        </button>
        </div>
      )}

      {accepted && (
        <div className="space-y-4 mt-4">
          {renderContactBanner()}
          
          {/* Botón de Crear Cotización */}
          {user?.id === leadInfo.profesional_asignado_id && 
           (leadInfo.negotiation_status === null || 
            leadInfo.negotiation_status === 'asignado') && (
            <div className="rounded-lg border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-indigo-50 p-2.5 md:p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <FontAwesomeIcon icon={faCheckCircle} className="text-purple-600 text-xs" />
                <p className="font-semibold text-purple-900 text-xs md:text-sm">
                  Crear Cotización
                </p>
              </div>
              <p className="text-xs text-purple-700 mb-2">
                Agrega conceptos y montos para enviar propuesta al cliente.
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAgreementModal(true);
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-1.5 md:py-2 px-3 md:px-4 rounded-lg text-xs md:text-sm font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-1.5"
              >
                <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                <span>Crear Cotización</span>
              </button>
            </div>
          )}

          {/* Badge de Propuesta Enviada */}
          {leadInfo.negotiation_status === 'propuesta_enviada' && (
            <div className="rounded-lg border-2 border-blue-300 bg-blue-50 p-2.5 md:p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <FontAwesomeIcon icon={faCheckCircle} className="text-blue-600 text-xs" />
                <p className="font-semibold text-blue-900 text-xs md:text-sm">
                  Propuesta Enviada
                </p>
              </div>
              <p className="text-xs text-blue-700">
                Esperando respuesta del cliente...
              </p>
            </div>
          )}

          {/* Badge de Propuesta Aceptada o Acuerdo Confirmado */}
          {(leadInfo.negotiation_status === 'propuesta_aceptada' || leadInfo.negotiation_status === 'acuerdo_confirmado') && (
            <div className="rounded-xl border-2 border-green-300 bg-green-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                <p className="font-semibold text-green-900">
                  Acuerdo Confirmado
                </p>
              </div>
              {leadInfo.agreed_price && (
                <p className="text-sm text-green-700">
                  <strong>Precio acordado:</strong> ${leadInfo.agreed_price.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
                </p>
              )}
              {leadInfo.agreed_at && (
                <p className="text-xs text-green-600 mt-1">
                  Confirmado el {new Date(leadInfo.agreed_at).toLocaleString("es-MX", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              )}
            </div>
          )}

          {renderAppointmentSection()}
          {renderCompletionSection()}
          <div className="grid grid-cols-3 gap-1.5 md:gap-2">
            {hasLeadLocation && (
              <a
                href={`https://www.google.com/maps/dir/${profesionalLat},${profesionalLng}/${leadInfo.ubicacion_lat},${leadInfo.ubicacion_lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-1.5 md:px-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center touch-manipulation active:scale-95"
                                >
                <FontAwesomeIcon icon={faRoute} className="text-xs" />
                <span className="hidden sm:inline ml-1">Ruta</span>
                                </a>
                            )}
                            
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!contactClientWhatsappLink) {
                  alert(
                    "El cliente no compartió un número de WhatsApp. Puedes intentar llamarlo desde la sección de detalles."
                  );
                  return;
                }
                openWhatsAppLink(contactClientWhatsappLink);
              }}
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-1.5 md:px-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center touch-manipulation active:scale-95"
            >
              <FontAwesomeIcon icon={faWhatsappBrand} className="text-xs" />
              <span className="hidden sm:inline ml-1">WhatsApp</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                alert(
                  "Para llamadas directas, usa el botón de WhatsApp o revisa el detalle del lead en tu panel."
                );
              }}
              className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-1.5 md:px-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center touch-manipulation active:scale-95"
            >
              <FontAwesomeIcon icon={faQuestion} className="text-xs" />
              <span className="hidden sm:inline ml-1">Notas</span>
            </button>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 md:p-2.5 text-xs md:text-sm text-gray-700 space-y-1.5">
            <div className="flex items-center justify-between text-xs md:text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-2 py-1.5">
              <div className="flex items-center gap-1.5 font-semibold">
                <FontAwesomeIcon icon={faCheck} className="text-xs" />
                <span>{leadInfo.estado === "completado" ? "Trabajo completado" : "Trabajo agendado"}</span>
              </div>
              <span className="text-[10px] md:text-xs text-green-600">#{leadInfo.id.slice(0, 8)}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 md:gap-2 text-xs md:text-sm">
              <div className="bg-white rounded-lg border border-gray-200 p-2">
                <p className="text-gray-700 font-semibold mb-1 text-xs">Cliente</p>
                <p className="text-gray-900 text-xs md:text-sm">
                  {leadInfo.nombre_cliente ?? "Cliente Sumee"}
                </p>
                {leadInfo.whatsapp && (
                  <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">
                    WhatsApp: {leadInfo.whatsapp}
                  </p>
                )}
                {leadInfo.ubicacion_direccion && (
                  <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 line-clamp-1">
                    {leadInfo.ubicacion_direccion}
                  </p>
                )}
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-2 space-y-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (contactClientWhatsappLink) {
                      openWhatsAppLink(contactClientWhatsappLink);
                    }
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
                  disabled={!contactClientWhatsappLink}
                >
                  <FontAwesomeIcon icon={faWhatsappBrand} className="text-xs" />
                  <span>Mensaje cliente</span>
                </button>
                {hasLeadLocation && (
                  <a
                    href={`https://www.google.com/maps/dir/${profesionalLat},${profesionalLng}/${leadInfo.ubicacion_lat},${leadInfo.ubicacion_lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
                                >
                    <FontAwesomeIcon icon={faRoute} className="text-xs" />
                    <span className="hidden md:inline">Ver ruta</span>
                    <span className="md:hidden">Ruta</span>
                                </a>
                            )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetailsModal(true);
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <FontAwesomeIcon icon={faQuestion} className="text-xs" />
                  <span>Detalles</span>
                </button>
              </div>
                        </div>
                    </div>
                </div>
            )}

      {showScheduleModal && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowScheduleModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {leadInfo.appointment_at ? "Actualizar cita" : "Agendar cita"}
              </h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleScheduleAppointment}>
              <div className="space-y-1">
                <label
                  htmlFor="appointmentAt"
                  className="text-sm font-medium text-gray-700"
                >
                  Fecha y hora
                </label>
                <input
                  id="appointmentAt"
                  type="datetime-local"
                  value={appointmentAt}
                  onChange={(e) => setAppointmentAt(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="appointmentNotes"
                  className="text-sm font-medium text-gray-700"
                >
                  Notas para el cliente (opcional)
                </label>
                <textarea
                  id="appointmentNotes"
                  rows={3}
                  value={appointmentNotes}
                  onChange={(e) => setAppointmentNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ej. Llegaré 10 minutos antes, favor de tener acceso al área de trabajo."
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isScheduling}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isScheduling ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailsModal && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Detalles del trabajo
                </h3>
                <p className="text-sm text-gray-500">ID {leadInfo.id}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <section className="border border-gray-200 rounded-xl p-4 space-y-2">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Cliente
                </h4>
                <p className="text-gray-900 font-medium">
                  {leadInfo.nombre_cliente ?? "Cliente Sumee"}
                </p>
                {leadInfo.whatsapp && (
                  <p className="text-sm text-gray-600">
                    WhatsApp: {leadInfo.whatsapp}
                  </p>
                )}
                {leadInfo.ubicacion_direccion && (
                  <p className="text-sm text-gray-600">
                    Dirección: {leadInfo.ubicacion_direccion}
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  Distancia estimada: {distanciaKm} km
                </p>
              </section>

              <section className="border border-gray-200 rounded-xl p-4 space-y-2">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Contacto
                </h4>
                <p className="text-sm text-gray-700">
                  Deadline de contacto: {leadInfo.contact_deadline_at
                    ? new Date(leadInfo.contact_deadline_at).toLocaleString("es-MX", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "No asignado"}
                </p>
                {leadInfo.contacted_at ? (
                  <>
                    <p className="text-sm text-green-600 font-medium">
                      Contactado el {new Date(leadInfo.contacted_at).toLocaleString("es-MX", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                    <p className="text-sm text-gray-600">
                      Método: {leadInfo.contact_method || "WhatsApp"}
                    </p>
                    {leadInfo.contact_notes && (
                      <p className="text-sm text-gray-600">
                        Notas: {leadInfo.contact_notes}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-amber-600">
                    Aún no has registrado el contacto. Usa el banner principal para hacerlo y ganar puntos.
                  </p>
                )}
              </section>
                    </div>

            <section className="border border-gray-200 rounded-xl p-4 space-y-3">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Cita
              </h4>
              {leadInfo.appointment_at ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    Programada: {new Date(leadInfo.appointment_at).toLocaleString("es-MX", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    Estado: {leadInfo.appointment_status ?? "Sin estado"}
                  </p>
                  {leadInfo.appointment_notes && (
                    <p className="text-sm text-gray-600">
                      Notas: {leadInfo.appointment_notes}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  Aún no has definido una cita. Hazlo desde el panel principal para que el cliente la confirme.
                </p>
              )}
            </section>

            <section className="border border-gray-200 rounded-xl p-4 space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Proyecto
              </h4>
              <p className="text-gray-900 font-medium">
                {leadInfo.servicio_solicitado || leadInfo.servicio || "General"}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {leadInfo.descripcion_proyecto || "Sin descripción proporcionada"}
              </p>
            </section>

            <section className="border border-gray-200 rounded-xl p-4 space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Progreso
              </h4>
              <ul className="space-y-1 text-sm text-gray-600 list-disc pl-5">
                <li>
                  Lead aceptado el {leadInfo.fecha_asignacion
                    ? new Date(leadInfo.fecha_asignacion).toLocaleString("es-MX", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "Sin registrar"}
                </li>
                <li>
                  Contactado: {leadInfo.contacted_at ? "Sí" : "No"}
                </li>
                <li>
                  Cita: {leadInfo.appointment_status ?? "Pendiente"}
                </li>
                <li>
                  Trabajo completado: {leadInfo.work_completed_at ? "Sí" : "No"}
                </li>
              </ul>
            </section>

            <div className="flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cotización Profesional */}
      <ProfessionalQuoteModal
        isOpen={showAgreementModal}
        onClose={() => setShowAgreementModal(false)}
        lead={leadInfo}
        onSuccess={() => {
          // Refrescar el lead después de enviar propuesta
          if (onLeadUpdated) {
            // Recargar el lead desde la BD
            supabase
              .from("leads")
              .select("*")
              .eq("id", leadInfo.id)
              .single()
              .then(({ data, error }) => {
                if (!error && data) {
                  emitLeadUpdate(data as Lead);
                }
              });
          }
        }}
      />
    </div>
  );
}
