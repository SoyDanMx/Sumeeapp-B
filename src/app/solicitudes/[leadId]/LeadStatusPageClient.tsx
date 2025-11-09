
"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Lead } from "@/types/supabase";
import StatusTracker from "@/components/client/StatusTracker";
import ChatBox from "@/components/client/ChatBox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCalendarCheck,
  faClock,
  faPen,
  faStar as faStarSolid,
  faThumbsUp,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import {
  confirmLeadAppointment,
  scheduleLeadAppointment,
  submitLeadReview,
} from "@/lib/supabase/data";

type ClientLead = Lead & {
  appointment_at?: string | null;
  appointment_notes?: string | null;
  appointment_status?: string | null;
  profesional_asignado?: {
    full_name?: string | null;
    profession?: string | null;
    whatsapp?: string | null;
    calificacion_promedio?: number | null;
    areas_servicio?: string[] | null;
  } | null;
  lead_review?: {
    id: string;
    rating: number;
    comment?: string | null;
    created_at: string;
    created_by?: string | null;
  } | null;
};

interface LeadStatusPageClientProps {
  initialLead: ClientLead;
  currentUserId: string | null; // Puede ser null para usuarios anónimos
}

export default function LeadStatusPageClient({
  initialLead,
  currentUserId,
}: LeadStatusPageClientProps) {
  const [lead, setLead] = useState<ClientLead>(initialLead);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [proposedDate, setProposedDate] = useState<string>(
    initialLead.appointment_at
      ? new Date(initialLead.appointment_at).toISOString().slice(0, 16)
      : ""
  );
  const [proposedNotes, setProposedNotes] = useState(
    initialLead.appointment_notes ?? ""
  );
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const canChat = useMemo(() => {
    const estado = (lead.estado || "").toLowerCase();
    return ["aceptado", "contactado", "en_progreso", "completado"].includes(
      estado
    );
  }, [lead.estado]);

  const appointmentInfo = useMemo(() => {
    if (!lead.appointment_at) return null;
    return new Date(lead.appointment_at).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }, [lead.appointment_at]);

  const requiresConfirmation =
    lead.appointment_status === "pendiente_confirmacion";

  const handleLeadChange = (updated: Lead) => {
    setLead(updated as ClientLead);
  };

  const handleConfirmAppointment = async () => {
    setIsConfirming(true);
    try {
      const updated = await confirmLeadAppointment(lead.id);
      setLead(updated as ClientLead);
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "No pudimos confirmar la cita. Intenta más tarde."
      );
    } finally {
      setIsConfirming(false);
    }
  };

  const handleReschedule = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!proposedDate) {
      alert("Selecciona fecha y hora para la nueva cita.");
      return;
    }
    setIsRescheduling(true);
    try {
      const updated = await scheduleLeadAppointment(
        lead.id,
        new Date(proposedDate).toISOString(),
        proposedNotes
      );
      setLead(updated);
      setShowRescheduleModal(false);
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "No pudimos proponer una nueva cita. Intenta nuevamente."
      );
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleSubmitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (reviewRating < 1 || reviewRating > 5) {
      alert("Selecciona una calificación entre 1 y 5 estrellas.");
      return;
    }
    setIsSubmittingReview(true);
    try {
      const review = await submitLeadReview(lead.id, reviewRating, reviewComment);
      setLead((prev) => ({ ...prev, lead_review: review }));
      setReviewSuccess(true);
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "No pudimos registrar tu reseña. Intenta de nuevo más tarde."
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const headerSubtitle = `ID: ${lead.id.substring(0, 8)}... | Servicio: ${
    lead.servicio_solicitado || "Servicio general"
  }`;

  return (
    <div className="min-h-screen bg-gray-50 pt-[calc(var(--header-offset,72px)+2rem)]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/client"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Volver al Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Seguimiento de Solicitud
          </h1>
          <p className="text-gray-600 mt-2">{headerSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal - Status Tracker y acciones */}
          <div className="lg:col-span-2 space-y-6">
            <StatusTracker
              lead={lead}
              currentUserId={currentUserId}
              onLeadChange={handleLeadChange}
            />

            {lead.appointment_at && (
              <div className="bg-white border border-indigo-100 rounded-xl shadow-sm p-6 space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <FontAwesomeIcon icon={faCalendarCheck} />
                      Cita agendada
                    </h3>
                    <p className="text-sm text-gray-600">
                      {appointmentInfo}
                    </p>
                    {lead.appointment_notes && (
                      <p className="text-xs text-gray-500 mt-1">
                        Nota del profesional: {lead.appointment_notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowRescheduleModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-sm font-medium"
                    >
                      <FontAwesomeIcon icon={faPen} />
                      Proponer nueva hora
                    </button>
                    {requiresConfirmation && (
                      <button
                        onClick={handleConfirmAppointment}
                        disabled={isConfirming}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-semibold disabled:opacity-60"
                      >
                        {isConfirming ? (
                          <>
                            <FontAwesomeIcon icon={faClock} className="animate-spin" />
                            Confirmando...
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faCalendarCheck} />
                            Confirmar cita
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
                {requiresConfirmation && (
                  <p className="text-xs text-amber-600">
                    Recuerda confirmar la cita para asegurar la disponibilidad del profesional.
                  </p>
                )}
              </div>
            )}

            {/* Información adicional del lead */}
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">
                Detalles de la Solicitud
              </h2>
              <section>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Descripción
                  </h3>
                <p className="text-gray-900 leading-relaxed">
                  {lead.descripcion_proyecto}
                </p>
              </section>
              {lead.urgencia && (
                <section>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Urgencia
                    </h3>
                    <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                    {lead.urgencia}
                    </span>
                </section>
                )}
              <section>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Fecha de creación
                  </h3>
                  <p className="text-gray-900">
                  {new Date(lead.fecha_creacion).toLocaleDateString("es-MX", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                  })}
                </p>
              </section>
            </div>

            {/* Reseña del cliente */}
            {lead.estado === "completado" && (
              <div className="bg-white border border-green-100 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FontAwesomeIcon icon={faThumbsUp} className="text-green-500" />
                    Califica al profesional
                  </h3>
                  {lead.lead_review && (
                    <span className="text-xs text-green-600 font-medium bg-green-50 border border-green-200 rounded-full px-3 py-1">
                      Reseña enviada
                    </span>
                  )}
                </div>

                {lead.lead_review ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-yellow-500 text-xl">
                      {"★".repeat(lead.lead_review.rating)}
                      {"☆".repeat(5 - lead.lead_review.rating)}
                    </div>
                    {lead.lead_review.comment && (
                      <p className="text-sm text-gray-600 italic">
                        “{lead.lead_review.comment}”
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      {new Date(lead.lead_review.created_at).toLocaleString("es-MX", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                ) : reviewSuccess ? (
                  <p className="text-sm text-green-600">
                    ¡Gracias por tu reseña! Esto ayuda a que más clientes confíen en técnicos certificados.
                  </p>
                ) : (
                  <form className="space-y-4" onSubmit={handleSubmitReview}>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        ¿Cómo calificarías la experiencia?
                      </p>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setReviewRating(value)}
                            className={`text-2xl ${
                              reviewRating >= value
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                          >
                            <FontAwesomeIcon icon={faStarSolid} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="review-comment"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Comentarios (opcional)
                      </label>
                      <textarea
                        id="review-comment"
                        rows={3}
                        value={reviewComment}
                        onChange={(event) => setReviewComment(event.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Cuéntanos qué te gustó o qué se puede mejorar."
                      />
                </div>
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-60"
                    >
                      {isSubmittingReview ? "Enviando..." : "Enviar reseña"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Columna lateral - Chat y contacto */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Chat de la solicitud
              </h3>
            {canChat ? (
                <ChatBox leadId={lead.id} currentUserId={currentUserId} />
              ) : (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 text-sm text-blue-900 space-y-2">
                  <p>
                    El chat estará disponible en cuanto un profesional acepte y contacte tu solicitud.
                  </p>
                  <p className="text-xs text-blue-700">
                    Recibirás notificaciones cuando tu técnico esté asignado.
                  </p>
                </div>
              )}
              </div>

            {lead.profesional_asignado?.whatsapp && (
              <div className="bg-white rounded-xl shadow-lg border border-green-200 p-6 space-y-3">
                <h3 className="font-semibold text-gray-900">
                  Contactar al profesional
                </h3>
                <p className="text-sm text-gray-600">
                  Usa WhatsApp para resolver dudas rápidas o enviar referencias.
                </p>
                <a
                  href={`https://wa.me/${lead.profesional_asignado.whatsapp}?text=Hola, tengo una consulta sobre mi solicitud de servicio en Sumee App.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full gap-2 bg-green-600 hover:bg-green-700 text-white text-center py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  <FontAwesomeIcon icon={faWhatsapp} />
                  Contactar por WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de reagendar cita */}
      {showRescheduleModal && (
        <div
          className="fixed inset-0 z-40 bg-black/70 p-4 flex items-center justify-center"
          onClick={() => setShowRescheduleModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Proponer nueva fecha
              </h3>
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleReschedule}>
              <div className="space-y-1">
                <label
                  htmlFor="reschedule-datetime"
                  className="text-sm font-medium text-gray-700"
                >
                  Fecha y hora sugeridas
                </label>
                <input
                  id="reschedule-datetime"
                  type="datetime-local"
                  value={proposedDate}
                  onChange={(event) => setProposedDate(event.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="reschedule-notes"
                  className="text-sm font-medium text-gray-700"
                >
                  Nota para el profesional (opcional)
                </label>
                <textarea
                  id="reschedule-notes"
                  rows={3}
                  value={proposedNotes}
                  onChange={(event) => setProposedNotes(event.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ej. Prefiero después de las 6 pm, llego del trabajo."
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isRescheduling}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {isRescheduling ? "Enviando..." : "Enviar propuesta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
