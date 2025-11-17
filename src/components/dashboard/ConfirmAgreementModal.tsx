"use client";

import { useState, Fragment, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faSpinner,
  faTimes,
  faDollarSign,
  faFileAlt,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { supabase } from "@/lib/supabase/client";
import { Lead } from "@/types/supabase";
import { useAuth } from "@/context/AuthContext";

interface ConfirmAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  onSuccess: () => void;
}

export default function ConfirmAgreementModal({
  isOpen,
  onClose,
  lead,
  onSuccess,
}: ConfirmAgreementModalProps) {
  const { user } = useAuth();
  const [agreedPrice, setAgreedPrice] = useState<string>("");
  const [agreedScope, setAgreedScope] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Validaciones
  const MIN_PRICE = 100; // Mínimo $100 MXN
  const MAX_PRICE = 1000000; // Máximo $1,000,000 MXN
  const MIN_SCOPE_LENGTH = 50; // Mínimo 50 caracteres

  // Obtener rango sugerido por IA
  const aiPriceMin = lead.ai_suggested_price_min || null;
  const aiPriceMax = lead.ai_suggested_price_max || null;
  
  // Obtener pro_tier del profesional (para flexibilidad de precio)
  const [proTier, setProTier] = useState<'verified_express' | 'certified_pro' | 'premium_elite'>('verified_express');
  
  useEffect(() => {
    // Obtener pro_tier del profesional
    if (user?.id) {
      supabase
        .from("profiles")
        .select("pro_tier")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.pro_tier) {
            setProTier(data.pro_tier as any);
          }
        });
    }
  }, [user]);

  // Calcular flexibilidad según tier
  const getPriceFlexibility = () => {
    switch (proTier) {
      case 'certified_pro': return 0.15; // ±15%
      case 'premium_elite': return 0.20; // ±20%
      default: return 0.10; // ±10% para verified_express
    }
  };

  const flexibility = getPriceFlexibility();
  
  // Calcular rango permitido basado en precio sugerido por IA
  const minAllowed = aiPriceMin ? aiPriceMin * (1 - flexibility) : MIN_PRICE;
  const maxAllowed = aiPriceMax ? aiPriceMax * (1 + flexibility) : MAX_PRICE;

  const priceValue = parseFloat(agreedPrice) || 0;
  const isValidPrice = priceValue >= Math.max(MIN_PRICE, minAllowed) && priceValue <= Math.min(MAX_PRICE, maxAllowed);
  const isValidScope = agreedScope.trim().length >= MIN_SCOPE_LENGTH;
  const canSubmit = isValidPrice && isValidScope && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !user) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validar que el usuario es el profesional asignado
      if (lead.profesional_asignado_id !== user.id) {
        throw new Error("No tienes permiso para confirmar este acuerdo");
      }

      // Validar que el lead está en estado válido
      const validStatuses = ["nuevo", "contactado", "asignado"];
      const currentStatus = (lead.estado || "").toLowerCase();
      if (!validStatuses.includes(currentStatus) && lead.negotiation_status !== "asignado") {
        throw new Error("Este lead no está en un estado válido para confirmar acuerdo");
      }

      // Actualizar el lead
      const { error: updateError } = await supabase
        .from("leads")
        .update({
          agreed_price: priceValue,
          agreed_scope: agreedScope.trim(),
          negotiation_status: "acuerdo_confirmado",
          agreed_at: new Date().toISOString(),
          agreed_by: user.id,
          // Actualizar estado a 'en_progreso' si está en 'nuevo' o 'contactado'
          estado: currentStatus === "nuevo" || currentStatus === "contactado" 
            ? "en_progreso" 
            : lead.estado,
        })
        .eq("id", lead.id);

      if (updateError) {
        throw updateError;
      }

      console.log("✅ Acuerdo confirmado exitosamente");
      setSuccess(true);

      // Esperar 1.5 segundos y cerrar
      setTimeout(() => {
        onSuccess();
        onClose();
        // Resetear formulario
        setAgreedPrice("");
        setAgreedScope("");
        setSuccess(false);
        setError(null);
      }, 1500);
    } catch (err: any) {
      console.error("❌ Error confirmando acuerdo:", err);
      setError(err.message || "Error al confirmar el acuerdo");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setAgreedPrice("");
    setAgreedScope("");
    setError(null);
    setSuccess(false);
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
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="text-white text-xl"
                      />
                    </div>
                    <div>
                      <Dialog.Title className="text-xl font-bold text-white">
                        Confirmar Acuerdo Final
                      </Dialog.Title>
                      <p className="text-sm text-blue-100 mt-1">
                        Captura el precio y alcance del trabajo acordado
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
                <form onSubmit={handleSubmit} className="px-6 py-6">
                  {/* Mensaje de éxito */}
                  {success && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-lg flex items-center">
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="text-green-600 text-xl mr-3"
                      />
                      <div>
                        <strong className="text-green-800">
                          ¡Acuerdo confirmado exitosamente! ✅
                        </strong>
                        <p className="text-xs text-green-600 mt-1">
                          El cliente será notificado en tiempo real.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Mensaje de error */}
                  {error && !success && (
                    <div className="mb-4 p-4 bg-red-50 border-2 border-red-400 rounded-lg flex items-start">
                      <FontAwesomeIcon
                        icon={faExclamationTriangle}
                        className="text-red-600 text-xl mr-3 mt-0.5"
                      />
                      <div className="flex-1">
                        <strong className="text-red-800 block mb-1">
                          Error al guardar:
                        </strong>
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Información del lead */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Cliente: {lead.nombre_cliente}
                    </h3>
                    <p className="text-sm text-gray-600">
                      <strong>Servicio:</strong> {lead.servicio_solicitado || lead.servicio || "No especificado"}
                    </p>
                    {lead.diagnostico_ia && (
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Diagnóstico IA:</strong> {lead.diagnostico_ia}
                      </p>
                    )}
                  </div>

                  {/* Mostrar rango sugerido por IA si está disponible */}
                  {aiPriceMin && aiPriceMax && (
                    <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FontAwesomeIcon icon={faDollarSign} className="text-blue-600" />
                        <h4 className="font-semibold text-blue-900">Rango Sugerido por IA:</h4>
                      </div>
                      <p className="text-sm text-blue-800 mb-1">
                        <strong>Precio sugerido:</strong> ${aiPriceMin.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} - ${aiPriceMax.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
                      </p>
                      <p className="text-xs text-blue-700">
                        Puedes ofertar entre ${minAllowed.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} y ${maxAllowed.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN (${(flexibility * 100).toFixed(0)}% de flexibilidad según tu tier: {proTier === 'verified_express' ? 'Express' : proTier === 'certified_pro' ? 'Certificado' : 'Premium'})
                      </p>
                    </div>
                  )}

                  {/* Campo: Precio */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FontAwesomeIcon icon={faDollarSign} className="mr-2 text-green-600" />
                      Precio Final Acordado (MXN) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min={MIN_PRICE}
                        max={MAX_PRICE}
                        value={agreedPrice}
                        onChange={(e) => setAgreedPrice(e.target.value)}
                        placeholder="0.00"
                        className={`w-full pl-8 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          agreedPrice && !isValidPrice
                            ? "border-red-300 focus:ring-red-500"
                            : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        }`}
                        disabled={loading || success}
                        required
                      />
                    </div>
                    {agreedPrice && !isValidPrice && (
                      <p className="mt-1 text-xs text-red-600">
                        {aiPriceMin && aiPriceMax 
                          ? `El precio debe estar entre $${minAllowed.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} y $${maxAllowed.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN (basado en rango sugerido por IA)`
                          : `El precio debe estar entre $${MIN_PRICE.toLocaleString()} y $${MAX_PRICE.toLocaleString()} MXN`
                        }
                      </p>
                    )}
                    {agreedPrice && isValidPrice && (
                      <p className="mt-1 text-xs text-green-600">
                        ✓ Precio válido: ${priceValue.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
                        {aiPriceMin && aiPriceMax && (
                          <span className="block mt-1">
                            {priceValue < aiPriceMin && `⚠️ Precio ${((aiPriceMin - priceValue) / aiPriceMin * 100).toFixed(0)}% menor que el mínimo sugerido`}
                            {priceValue > aiPriceMax && `⚠️ Precio ${((priceValue - aiPriceMax) / aiPriceMax * 100).toFixed(0)}% mayor que el máximo sugerido`}
                            {priceValue >= aiPriceMin && priceValue <= aiPriceMax && `✓ Dentro del rango sugerido por IA`}
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Campo: Alcance */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FontAwesomeIcon icon={faFileAlt} className="mr-2 text-blue-600" />
                      Alcance del Trabajo (Resumen) *
                    </label>
                    <textarea
                      value={agreedScope}
                      onChange={(e) => setAgreedScope(e.target.value)}
                      placeholder="Describe detalladamente el trabajo a realizar, materiales incluidos, tiempo estimado, garantía, etc. (Mínimo 50 caracteres)"
                      rows={6}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${
                        agreedScope && !isValidScope
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      }`}
                      disabled={loading || success}
                      required
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <p className={`text-xs ${
                        agreedScope && !isValidScope
                          ? "text-red-600"
                          : agreedScope && isValidScope
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}>
                        {agreedScope.trim().length} / {MIN_SCOPE_LENGTH} caracteres mínimo
                      </p>
                      {agreedScope && isValidScope && (
                        <span className="text-xs text-green-600">✓ Alcance válido</span>
                      )}
                    </div>
                  </div>

                  {/* Preview del acuerdo */}
                  {isValidPrice && isValidScope && (
                    <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Vista Previa del Acuerdo:</h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>Precio:</strong>{" "}
                          <span className="text-green-700 font-semibold">
                            ${priceValue.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
                          </span>
                        </p>
                        <p>
                          <strong>Alcance:</strong> {agreedScope.trim().substring(0, 100)}
                          {agreedScope.trim().length > 100 && "..."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={loading}
                      className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
                    >
                      {loading ? (
                        <>
                          <FontAwesomeIcon
                            icon={faSpinner}
                            className="mr-2 animate-spin"
                          />
                          Confirmando...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                          Confirmar y Notificar Cliente
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

