"use client";

import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faSpinner,
  faTimes,
  faDollarSign,
  faFileAlt,
  faExclamationTriangle,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { supabase } from "@/lib/supabase/client";
import { Lead } from "@/types/supabase";
import { useAuth } from "@/context/AuthContext";

interface ClientQuoteViewProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  onSuccess: () => void;
}

export default function ClientQuoteView({
  isOpen,
  onClose,
  lead,
  onSuccess,
}: ClientQuoteViewProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Obtener partidas de la cotización
  const quoteItems = lead.quote_items || [];
  const total = quoteItems.reduce(
    (sum, item) => sum + (item.subtotal || 0),
    0
  );

  // Verificar si ya fue aceptada
  const isAccepted = lead.negotiation_status === "propuesta_aceptada";

  // Aceptar propuesta
  const handleAcceptQuote = async () => {
    if (!user || isAccepted) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validar que el usuario es el cliente del lead
      if (lead.cliente_id !== user.id) {
        throw new Error("No tienes permiso para aceptar esta propuesta");
      }

      // Actualizar el lead
      const { error: updateError } = await (supabase
        .from("leads") as any)
        .update({
          negotiation_status: "propuesta_aceptada",
          quote_accepted_at: new Date().toISOString(),
          quote_accepted_by: user.id,
          agreed_price: total, // Confirmar el precio total
          agreed_at: new Date().toISOString(),
          agreed_by: user.id,
        })
        .eq("id", lead.id);

      if (updateError) {
        throw updateError;
      }

      console.log("✅ Propuesta aceptada exitosamente");
      setSuccess(true);

      // Esperar y cerrar
      setTimeout(() => {
        onSuccess();
        onClose();
        setSuccess(false);
        setError(null);
      }, 2000);
    } catch (err: any) {
      console.error("❌ Error aceptando propuesta:", err);
      setError(err.message || "Error al aceptar la propuesta");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setError(null);
    setSuccess(false);
    onClose();
  };

  if (!quoteItems || quoteItems.length === 0) {
    return null; // No mostrar si no hay partidas
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[9999]" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-2 sm:p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center mr-3 sm:mr-4">
                      <FontAwesomeIcon
                        icon={faFileAlt}
                        className="text-white text-lg sm:text-xl"
                      />
                    </div>
                    <div>
                      <Dialog.Title className="text-lg sm:text-xl font-bold text-white">
                        Propuesta de Cotización
                      </Dialog.Title>
                      <p className="text-xs sm:text-sm text-indigo-100 mt-0.5">
                        {isAccepted
                          ? "Propuesta aceptada"
                          : "Revisa la propuesta y acepta si estás de acuerdo"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    disabled={loading}
                    className="text-white hover:bg-white/20 rounded-full p-2 transition-colors disabled:opacity-50"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>

                {/* Content */}
                <div className="px-3 sm:px-6 py-4 sm:py-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {/* Mensaje de éxito */}
                  {success && (
                    <div className="mb-4 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-lg flex items-center">
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="text-green-600 text-lg sm:text-xl mr-3"
                      />
                      <div>
                        <strong className="text-green-800 text-sm sm:text-base">
                          ¡Propuesta aceptada exitosamente! ✅
                        </strong>
                        <p className="text-xs text-green-600 mt-1">
                          El profesional será notificado y procederá con el trabajo.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Mensaje de error */}
                  {error && !success && (
                    <div className="mb-4 p-3 sm:p-4 bg-red-50 border-2 border-red-400 rounded-lg flex items-start">
                      <FontAwesomeIcon
                        icon={faExclamationTriangle}
                        className="text-red-600 text-lg sm:text-xl mr-3 mt-0.5"
                      />
                      <div className="flex-1">
                        <strong className="text-red-800 block mb-1 text-sm sm:text-base">
                          Error:
                        </strong>
                        <p className="text-xs sm:text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Información del profesional */}
                  {lead.profesional_asignado && (
                    <div className="mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base">
                        Profesional: {lead.profesional_asignado.full_name || "Profesional Sumee"}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600">
                        <strong>Servicio:</strong>{" "}
                        {lead.servicio_solicitado || lead.servicio || "No especificado"}
                      </p>
                      {lead.quote_sent_at && (
                        <p className="text-xs text-gray-500 mt-1">
                          Propuesta enviada el{" "}
                          {new Date(lead.quote_sent_at).toLocaleString("es-MX", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Tabla de Cotización */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">
                      Detalle de la Cotización
                    </h4>

                    {/* Tabla responsive */}
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100 border-b-2 border-gray-300">
                            <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-semibold text-gray-700">
                              #
                            </th>
                            <th className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-semibold text-gray-700">
                              Concepto
                            </th>
                            <th className="px-2 sm:px-3 py-2 text-center text-[10px] sm:text-xs font-semibold text-gray-700">
                              Cantidad
                            </th>
                            <th className="px-2 sm:px-3 py-2 text-right text-[10px] sm:text-xs font-semibold text-gray-700">
                              Precio Unit.
                            </th>
                            <th className="px-2 sm:px-3 py-2 text-right text-[10px] sm:text-xs font-semibold text-gray-700">
                              Subtotal
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {quoteItems.map((item, index) => (
                            <tr
                              key={index}
                              className="border-b border-gray-200 hover:bg-gray-50"
                            >
                              <td className="px-2 sm:px-3 py-2 text-[10px] sm:text-xs font-medium text-gray-600">
                                {index + 1}
                              </td>
                              <td className="px-2 sm:px-3 py-2 text-[10px] sm:text-xs text-gray-800">
                                {item.concepto}
                              </td>
                              <td className="px-2 sm:px-3 py-2 text-center text-[10px] sm:text-xs text-gray-600">
                                {item.cantidad}
                              </td>
                              <td className="px-2 sm:px-3 py-2 text-right text-[10px] sm:text-xs text-gray-600">
                                ${item.precio_unitario.toLocaleString("es-MX", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                              <td className="px-2 sm:px-3 py-2 text-right text-[10px] sm:text-xs font-semibold text-gray-800">
                                ${item.subtotal.toLocaleString("es-MX", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-indigo-50 border-t-2 border-indigo-300">
                            <td
                              colSpan={4}
                              className="px-2 sm:px-3 py-3 text-right text-sm sm:text-base font-bold text-gray-800"
                            >
                              Total a Pagar:
                            </td>
                            <td className="px-2 sm:px-3 py-3 text-right text-base sm:text-lg font-bold text-indigo-700">
                              ${total.toLocaleString("es-MX", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Badge de aceptación */}
                  {isAccepted && (
                    <div className="mb-4 p-3 sm:p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="text-green-600 text-lg"
                        />
                        <div>
                          <p className="font-semibold text-green-900 text-sm sm:text-base">
                            Propuesta Aceptada
                          </p>
                          {lead.quote_accepted_at && (
                            <p className="text-xs text-green-700 mt-1">
                              Aceptada el{" "}
                              {new Date(lead.quote_accepted_at).toLocaleString("es-MX", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={loading}
                      className="px-4 sm:px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-base"
                    >
                      {isAccepted ? "Cerrar" : "Rechazar"}
                    </button>
                    {!isAccepted && (
                      <button
                        type="button"
                        onClick={handleAcceptQuote}
                        disabled={loading}
                        className="px-4 sm:px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                      >
                        {loading ? (
                          <>
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                            Aceptando...
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faCheck} />
                            Aceptar Estimado
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

