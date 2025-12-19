"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faInfoCircle,
  faLightbulb,
  faWrench,
  faTools,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { ServiceFormData } from "./ServiceFormBase";

interface ServiceSummaryPanelProps {
  serviceName: string;
  serviceId?: string;
  formData?: ServiceFormData;
  priceEstimate?: {
    laborPrice?: number;
    materialsPrice?: number;
    totalPrice?: number;
  };
  onShowConditions?: () => void;
  className?: string;
}

export default function ServiceSummaryPanel({
  serviceName,
  serviceId,
  formData,
  priceEstimate,
  onShowConditions,
  className = "",
}: ServiceSummaryPanelProps) {
  // Determinar icono según el servicio
  const getServiceIcon = () => {
    if (serviceId?.includes("electricidad") || serviceId?.includes("contacto")) {
      return faLightbulb;
    }
    if (serviceId?.includes("plomeria")) {
      return faWrench;
    }
    return faTools;
  };

  // Formatear acción
  const formatAction = (action?: string) => {
    if (!action) return null;
    const actions: Record<string, string> = {
      instalar: "Instalar",
      reemplazar: "Reemplazar",
      visita: "Visita electricista",
    };
    return actions[action] || action;
  };

  // Formatear respuesta booleana
  const formatBoolean = (value?: boolean | null) => {
    if (value === undefined || value === null) return null;
    return value ? "Sí" : "No";
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md border border-gray-200 p-6 ${className}`}
    >
      {/* Título */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
          <FontAwesomeIcon
            icon={getServiceIcon()}
            className="text-white text-lg"
          />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Resumen del servicio</h3>
          <p className="text-sm text-gray-600">{serviceName}</p>
        </div>
      </div>

      {/* Detalles del servicio si hay formData */}
      {formData && (
        <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
          {formData.action && (
            <div className="flex items-start space-x-3">
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="text-green-600 mt-0.5 text-sm"
              />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Acción</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatAction(formData.action)}
                </p>
              </div>
            </div>
          )}

          {formData.quantity !== undefined && formData.quantity !== null && (
            <div className="flex items-start space-x-3">
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="text-green-600 mt-0.5 text-sm"
              />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Cantidad</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formData.quantity} {formData.quantity === 1 ? "unidad" : "unidades"}
                </p>
              </div>
            </div>
          )}

          {formData.hasMaterials !== undefined && (
            <div className="flex items-start space-x-3">
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="text-green-600 mt-0.5 text-sm"
              />
              <div className="flex-1">
                <p className="text-sm text-gray-600">¿Tienes los materiales?</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatBoolean(formData.hasMaterials)}
                </p>
              </div>
            </div>
          )}

          {(formData.hasExistingInfrastructure !== undefined || (formData as any).hasExistingContact !== undefined) && (
            <div className="flex items-start space-x-3">
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="text-green-600 mt-0.5 text-sm"
              />
              <div className="flex-1">
                <p className="text-sm text-gray-600">¿Ya existe contacto eléctrico?</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatBoolean(formData.hasExistingInfrastructure ?? (formData as any).hasExistingContact)}
                </p>
              </div>
            </div>
          )}

          {formData.additionalInfo && (
            <div className="flex items-start space-x-3">
              <FontAwesomeIcon
                icon={faInfoCircle}
                className="text-blue-600 mt-0.5 text-sm"
              />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Información adicional</p>
                <p className="text-sm text-gray-700 line-clamp-2">
                  {formData.additionalInfo}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Precio estimado si está disponible */}
      {priceEstimate && priceEstimate.totalPrice && (
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Precio estimado
          </h4>
          <div className="space-y-2">
            {priceEstimate.laborPrice && priceEstimate.laborPrice > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Mano de obra:</span>
                <span className="font-semibold text-gray-900">
                  ${priceEstimate.laborPrice.toLocaleString("es-MX")}
                </span>
              </div>
            )}
            {priceEstimate.materialsPrice && priceEstimate.materialsPrice > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Materiales:</span>
                <span className="font-semibold text-gray-900">
                  ${priceEstimate.materialsPrice.toLocaleString("es-MX")}
                </span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total:</span>
              <span className="text-purple-600">
                ${priceEstimate.totalPrice.toLocaleString("es-MX")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Link a condiciones del servicio */}
      <div>
        {onShowConditions ? (
          <button
            onClick={onShowConditions}
            className="w-full text-left text-sm text-purple-600 hover:text-purple-700 hover:underline flex items-center space-x-2 transition-colors"
          >
            <FontAwesomeIcon icon={faInfoCircle} className="text-sm" />
            <span>¿Qué incluye el servicio?</span>
          </button>
        ) : (
          <Link
            href="#service-conditions"
            className="text-sm text-purple-600 hover:text-purple-700 hover:underline flex items-center space-x-2 transition-colors"
          >
            <FontAwesomeIcon icon={faInfoCircle} className="text-sm" />
            <span>¿Qué incluye el servicio?</span>
          </Link>
        )}
      </div>
    </div>
  );
}

