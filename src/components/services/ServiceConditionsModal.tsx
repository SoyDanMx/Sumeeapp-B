"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faCheckCircle,
  faExclamationTriangle,
  faPlusCircle,
} from "@fortawesome/free-solid-svg-icons";

interface ServiceConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
  serviceId: string;
}

export default function ServiceConditionsModal({
  isOpen,
  onClose,
  serviceName,
  serviceId,
}: ServiceConditionsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Condiciones del servicio base
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              El servicio base solicitado contempla:
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  Visita de un técnico certificado, diagnóstico previo y validación del servicio solicitado.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  Instalación o reemplazo de la cantidad seleccionada.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  Herramientas necesarias para realizar el servicio.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  Insumos incluidos: cinta aislante, tornillos, terminales, conectores, termofil, grapas, correa plástica.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  Garantía de 7 días desde la entrega del servicio.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-600 mt-1 flex-shrink-0" />
                <span className="text-gray-700">
                  La garantía solo es en mano de obra, partes eléctricas no hay garantía.
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Nuestro profesional le puede ofrecer los siguientes servicios adicionales:
            </h3>
            <ul className="space-y-2">
              {[
                "Instalación o reemplazo de unidades adicionales",
                "Instalación o reubicación de circuito eléctrico",
                "Materiales o repuestos no incluidos (contactos, interruptores, focos, bases, cables, cajas de paso, tubería, conectores)",
                "Entrega a domicilio de repuestos y materiales adicionales",
                "Herramientas complementarias si se requieren",
              ].map((service, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <FontAwesomeIcon icon={faPlusCircle} className="text-purple-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


