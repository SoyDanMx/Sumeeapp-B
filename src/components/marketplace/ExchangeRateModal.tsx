"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faInfoCircle, faSync } from "@fortawesome/free-solid-svg-icons";
import { useExchangeRate } from "@/hooks/useExchangeRate";

interface ExchangeRateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExchangeRateModal({ isOpen, onClose }: ExchangeRateModalProps) {
  const { exchangeRate, loading, error } = useExchangeRate();

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="flex items-center justify-center min-h-screen p-4 text-center sm:p-0">
        <div className="relative bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Tasa de Cambio USD → MXN</h3>
                <p className="text-indigo-100 text-sm mt-1">Precios convertidos automáticamente</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-500">Obteniendo tasa de cambio...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FontAwesomeIcon icon={faInfoCircle} className="text-red-500 mt-0.5" />
                  <div>
                    <p className="text-red-800 font-semibold">Error al obtener tasa de cambio</p>
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                    <p className="text-red-600 text-sm mt-2">
                      Se está usando una tasa aproximada. Los precios pueden variar.
                    </p>
                  </div>
                </div>
              </div>
            ) : exchangeRate ? (
              <div className="space-y-4">
                {/* Tasa de cambio principal */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Tasa de cambio actual</p>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-black text-indigo-600">
                        1 USD
                      </span>
                      <span className="text-2xl text-gray-400">=</span>
                      <span className="text-4xl font-black text-purple-600">
                        ${exchangeRate.rate.toLocaleString("es-MX", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })} MXN
                      </span>
                    </div>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Fuente:</span>
                    <span className="text-sm font-semibold text-gray-900 capitalize">
                      {exchangeRate.source.replace(/-/g, " ")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Última actualización:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatDate(exchangeRate.lastUpdated)}
                    </span>
                  </div>
                </div>

                {/* Nota informativa */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-blue-800 font-semibold text-sm">Información importante</p>
                      <ul className="text-blue-700 text-sm mt-2 space-y-1 list-disc list-inside">
                        <li>Los precios se actualizan automáticamente cada 24 horas</li>
                        <li>La tasa de cambio puede variar según el mercado</li>
                        <li>Los precios finales pueden incluir impuestos y gastos de envío</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

