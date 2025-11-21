"use client";

import { useState, Fragment, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faSpinner,
  faTimes,
  faDollarSign,
  faPlus,
  faTrash,
  faFileAlt,
  faExclamationTriangle,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import { supabase } from "@/lib/supabase/client";
import { Lead } from "@/types/supabase";
import { useAuth } from "@/context/AuthContext";

interface QuoteItem {
  id: string;
  concepto: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

interface ProfessionalQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  onSuccess: () => void;
}

export default function ProfessionalQuoteModal({
  isOpen,
  onClose,
  lead,
  onSuccess,
}: ProfessionalQuoteModalProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<QuoteItem[]>([
    {
      id: crypto.randomUUID(),
      concepto: "",
      cantidad: 1,
      precio_unitario: 0,
      subtotal: 0,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sendingToClient, setSendingToClient] = useState(false);

  // Calcular total
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  // Validar que todos los items tengan concepto y precio válido
  const isValidQuote = items.every(
    (item) =>
      item.concepto.trim().length >= 3 &&
      item.cantidad > 0 &&
      item.precio_unitario > 0
  ) && items.length > 0;

  // Agregar nueva partida
  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        concepto: "",
        cantidad: 1,
        precio_unitario: 0,
        subtotal: 0,
      },
    ]);
  };

  // Eliminar partida
  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  // Actualizar partida
  const handleUpdateItem = (
    id: string,
    field: keyof QuoteItem,
    value: string | number
  ) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          // Recalcular subtotal si cambió cantidad o precio_unitario
          if (field === "cantidad" || field === "precio_unitario") {
            updated.subtotal =
              Number(updated.cantidad) * Number(updated.precio_unitario);
          }
          return updated;
        }
        return item;
      })
    );
  };

  // Enviar propuesta al cliente
  const handleSendToClient = async () => {
    if (!isValidQuote || !user) return;

    setSendingToClient(true);
    setError(null);

    try {
      // Validar que el usuario es el profesional asignado
      if (lead.profesional_asignado_id !== user.id) {
        throw new Error("No tienes permiso para enviar esta propuesta");
      }

      // Preparar datos de la cotización
      const quoteData = {
        items: items.map(({ id, ...item }) => item), // Excluir id temporal
        total: total,
        created_at: new Date().toISOString(),
        sent_by: user.id,
      };

      // Actualizar el lead con la propuesta enviada
      const { error: updateError } = await (supabase
        .from("leads") as any)
        .update({
          quote_items: quoteData.items, // Array de partidas
          agreed_price: total, // Precio total calculado
          agreed_scope: JSON.stringify(quoteData.items), // Backup en texto
          negotiation_status: "propuesta_enviada" as any, // Nuevo estado
          quote_sent_at: new Date().toISOString(),
          quote_sent_by: user.id,
        })
        .eq("id", lead.id);

      if (updateError) {
        throw updateError;
      }

      console.log("✅ Propuesta enviada exitosamente al cliente");
      setSuccess(true);

      // Esperar y cerrar
      setTimeout(() => {
        onSuccess();
        onClose();
        resetForm();
      }, 2000);
    } catch (err: any) {
      console.error("❌ Error enviando propuesta:", err);
      setError(err.message || "Error al enviar la propuesta");
    } finally {
      setSendingToClient(false);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setItems([
      {
        id: crypto.randomUUID(),
        concepto: "",
        cantidad: 1,
        precio_unitario: 0,
        subtotal: 0,
      },
    ]);
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    if (loading || sendingToClient) return;
    resetForm();
    onClose();
  };

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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center mr-3 sm:mr-4">
                      <FontAwesomeIcon
                        icon={faFileAlt}
                        className="text-white text-lg sm:text-xl"
                      />
                    </div>
                    <div>
                      <Dialog.Title className="text-lg sm:text-xl font-bold text-white">
                        Crear Cotización Profesional
                      </Dialog.Title>
                      <p className="text-xs sm:text-sm text-purple-100 mt-0.5">
                        Agrega conceptos y montos para enviar al cliente
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    disabled={loading || sendingToClient}
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
                          ¡Propuesta enviada exitosamente! ✅
                        </strong>
                        <p className="text-xs text-green-600 mt-1">
                          El cliente recibirá una notificación en tiempo real.
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

                  {/* Información del lead */}
                  <div className="mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base">
                      Cliente: {lead.nombre_cliente}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      <strong>Servicio:</strong>{" "}
                      {lead.servicio_solicitado || lead.servicio || "No especificado"}
                    </p>
                  </div>

                  {/* Tabla de Cotización */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800 text-sm sm:text-base">
                        Partidas de Cotización
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-indigo-700 transition-colors"
                      >
                        <FontAwesomeIcon icon={faPlus} className="text-xs" />
                        <span>Agregar Partida</span>
                      </button>
                    </div>

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
                            <th className="px-2 sm:px-3 py-2 text-center text-[10px] sm:text-xs font-semibold text-gray-700 w-12">
                              Acción
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, index) => (
                            <tr
                              key={item.id}
                              className="border-b border-gray-200 hover:bg-gray-50"
                            >
                              <td className="px-2 sm:px-3 py-2 text-[10px] sm:text-xs font-medium text-gray-600">
                                {index + 1}
                              </td>
                              <td className="px-2 sm:px-3 py-2">
                                <input
                                  type="text"
                                  value={item.concepto}
                                  onChange={(e) =>
                                    handleUpdateItem(item.id, "concepto", e.target.value)
                                  }
                                  placeholder="Ej: Instalación de contacto eléctrico duplex"
                                  className="w-full px-2 py-1.5 text-[10px] sm:text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                  disabled={sendingToClient}
                                />
                              </td>
                              <td className="px-2 sm:px-3 py-2">
                                <input
                                  type="number"
                                  min="1"
                                  step="1"
                                  value={item.cantidad}
                                  onChange={(e) =>
                                    handleUpdateItem(
                                      item.id,
                                      "cantidad",
                                      parseInt(e.target.value) || 1
                                    )
                                  }
                                  className="w-16 sm:w-20 px-2 py-1.5 text-[10px] sm:text-xs border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                  disabled={sendingToClient}
                                />
                              </td>
                              <td className="px-2 sm:px-3 py-2">
                                <div className="flex items-center justify-end">
                                  <span className="text-gray-500 mr-1 text-[10px] sm:text-xs">
                                    $
                                  </span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.precio_unitario || ""}
                                    onChange={(e) =>
                                      handleUpdateItem(
                                        item.id,
                                        "precio_unitario",
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    placeholder="0.00"
                                    className="w-20 sm:w-24 px-2 py-1.5 text-[10px] sm:text-xs border border-gray-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    disabled={sendingToClient}
                                  />
                                </div>
                              </td>
                              <td className="px-2 sm:px-3 py-2 text-right text-[10px] sm:text-xs font-semibold text-gray-800">
                                ${item.subtotal.toLocaleString("es-MX", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                              <td className="px-2 sm:px-3 py-2 text-center">
                                {items.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItem(item.id)}
                                    disabled={sendingToClient}
                                    className="text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors"
                                  >
                                    <FontAwesomeIcon icon={faTrash} className="text-xs" />
                                  </button>
                                )}
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
                              Total a Cobrar:
                            </td>
                            <td className="px-2 sm:px-3 py-3 text-right text-base sm:text-lg font-bold text-indigo-700">
                              ${total.toLocaleString("es-MX", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {!isValidQuote && items.length > 0 && (
                      <p className="mt-2 text-xs text-amber-600">
                        ⚠️ Completa todos los conceptos con cantidad y precio válidos
                      </p>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={sendingToClient}
                      className="px-4 sm:px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-base"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSendToClient}
                      disabled={!isValidQuote || sendingToClient}
                      className="px-4 sm:px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      {sendingToClient ? (
                        <>
                          <FontAwesomeIcon
                            icon={faSpinner}
                            className="animate-spin"
                          />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faPaperPlane} />
                          Enviar Propuesta al Cliente
                        </>
                      )}
                    </button>
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

