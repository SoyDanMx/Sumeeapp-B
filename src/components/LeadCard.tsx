"use client";

import { Lead } from "@/types/supabase";
import React, { useState, useMemo, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
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

  const whatsappIntroMessage = React.useMemo(() => {
    const clientName = leadInfo.nombre_cliente?.trim() || "hola";
    return encodeURIComponent(
      `Hola ${clientName}, soy un profesional verificado de Sumee. Vi tu solicitud sobre "${
        leadInfo.descripcion_proyecto || "tu proyecto"
      }" y me gustaría coordinar los detalles contigo. ¿Te parece si conversamos?`
    );
  }, [leadInfo.nombre_cliente, leadInfo.descripcion_proyecto]);

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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      const result = await acceptLead(leadInfo.id);

      if (result.success) {
        const updatedLead: Lead = {
          ...leadInfo,
          ...result.lead,
        };

        setAccepted(true);
        setLeadState(updatedLead);

        try {
          const credentialResult = await sendCredentialToClient(
            leadInfo.id,
            user.id
          );
          if (credentialResult.success && credentialResult.whatsappLink) {
            openWhatsAppLink(credentialResult.whatsappLink);
          }
        } catch (credentialError) {
          console.error(
            "Error al enviar credencial (no crítico):",
            credentialError
          );
        }

        if (onLeadAccepted) {
          onLeadAccepted(updatedLead);
        }
        if (onLeadUpdated) {
          onLeadUpdated(updatedLead);
        }
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
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo registrar el contacto."
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
      <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4 animate-pulse">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="font-semibold text-amber-700">
              Tienes 2 horas para contactar al cliente. ¡Hazlo cuanto antes!
            </p>
            <p className="text-sm text-amber-600 flex items-center gap-2">
              <FontAwesomeIcon icon={faBell} />
              {contactCountdown.isExpired
                ? "El tiempo límite expiró. Registra el contacto o re-asigna el trabajo."
                : `Tiempo restante: ${contactCountdown.hours}h ${contactCountdown.minutes}m ${contactCountdown.seconds}s`}
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
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md transition-transform animate-[wiggle_2s_ease-in-out_infinite]"
              style={{ animationDelay: "0.5s" }}
            >
              Contactar por WhatsApp
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                void handleMarkContacted();
              }}
              disabled={isSavingContact}
              className="bg-white border border-green-500 text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 disabled:opacity-50"
            >
              {isSavingContact ? "Guardando..." : "Ya contacté al cliente"}
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
      className={`p-3 md:p-4 border rounded-lg transition-all duration-200 touch-manipulation ${
        isSelected
          ? "bg-indigo-100 border-indigo-500 shadow-md"
          : "bg-white hover:border-gray-400 active:scale-[0.98]"
      }`}
    >
      <div onClick={onSelect} className="cursor-pointer">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="font-bold text-gray-800 flex items-center text-base md:text-lg flex-1 min-w-0">
            <FontAwesomeIcon
              icon={faUser}
              className="mr-2 text-gray-500 flex-shrink-0"
            />
            <span className="truncate">
              {leadInfo.nombre_cliente || "Cliente Anónimo"}
            </span>
          </h3>
          {getStatusBadge()}
        </div>
        <p className="text-sm text-gray-600 mb-3">
          {leadInfo.descripcion_proyecto || "Sin descripción"}
        </p>
        <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 mb-4">
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
          {renderAppointmentSection()}
          {renderCompletionSection()}
          <div className="grid grid-cols-3 gap-2 md:gap-2">
            {hasLeadLocation && (
              <a
                href={`https://www.google.com/maps/dir/${profesionalLat},${profesionalLng}/${leadInfo.ubicacion_lat},${leadInfo.ubicacion_lng}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="bg-blue-500 hover:bg-blue-600 text-white py-3 md:py-2 px-2 md:px-3 rounded-lg text-sm md:text-xs font-semibold md:font-medium transition-colors flex items-center justify-center space-x-1 touch-manipulation active:scale-95"
              >
                <FontAwesomeIcon icon={faRoute} className="text-sm" />
                <span className="hidden sm:inline">Ver ruta</span>
                <span className="sm:hidden">🗺️</span>
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
              className="bg-green-500 hover:bg-green-600 text-white py-3 md:py-2 px-2 md:px-3 rounded-lg text-sm md:text-xs font-semibold md:font-medium transition-colors flex items-center justify-center space-x-1 touch-manipulation active:scale-95"
            >
              <FontAwesomeIcon icon={faWhatsappBrand} className="text-sm" />
              <span className="hidden sm:inline">WhatsApp cliente</span>
              <span className="sm:hidden">💬</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                alert(
                  "Para llamadas directas, usa el botón de WhatsApp o revisa el detalle del lead en tu panel."
                );
              }}
              className="bg-yellow-500 hover:bg-yellow-600 text-white py-3 md:py-2 px-2 md:px-3 rounded-lg text-sm md:text-xs font-semibold md:font-medium transition-colors flex items-center justify-center space-x-1 touch-manipulation active:scale-95"
            >
              <FontAwesomeIcon icon={faQuestion} className="text-sm" />
              <span className="hidden sm:inline">Notas</span>
              <span className="sm:hidden">ℹ️</span>
            </button>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 space-y-2">
            <div className="flex items-center justify-between text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2 font-semibold">
                <FontAwesomeIcon icon={faCheck} />
                <span>{leadInfo.estado === "completado" ? "Trabajo completado" : "Trabajo agendado"}</span>
              </div>
              <span className="text-xs text-green-600">#{leadInfo.id.slice(0, 8)}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <p className="text-gray-700 font-semibold mb-1">Cliente</p>
                <p className="text-gray-900">
                  {leadInfo.nombre_cliente ?? "Cliente Sumee"}
                </p>
                {leadInfo.whatsapp && (
                  <p className="text-xs text-gray-500 mt-1">
                    WhatsApp: {leadInfo.whatsapp}
                  </p>
                )}
                {leadInfo.ubicacion_direccion && (
                  <p className="text-xs text-gray-500 mt-1">
                    Dirección: {leadInfo.ubicacion_direccion}
                  </p>
                )}
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (contactClientWhatsappLink) {
                      openWhatsAppLink(contactClientWhatsappLink);
                    }
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                  disabled={!contactClientWhatsappLink}
                >
                  <FontAwesomeIcon icon={faWhatsappBrand} />
                  <span>Enviar mensaje al cliente</span>
                </button>
                {hasLeadLocation && (
                  <a
                    href={`https://www.google.com/maps/dir/${profesionalLat},${profesionalLng}/${leadInfo.ubicacion_lat},${leadInfo.ubicacion_lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <FontAwesomeIcon icon={faRoute} />
                    <span>Ver ruta en Google Maps</span>
                  </a>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetailsModal(true);
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faQuestion} />
                  <span>Detalles y notas</span>
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
    </div>
  );
}
