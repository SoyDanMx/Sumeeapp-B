"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faUser,
  faStar,
  faMapMarkerAlt,
  faCheckCircle,
  faBriefcase,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

interface TecnicoDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  professional: {
    user_id: string;
    full_name: string;
    profession?: string;
    avatar_url?: string | null;
    whatsapp?: string;
    calificacion_promedio?: number;
    distance?: number;
    total_reviews?: number;
    verified?: boolean;
    areas_servicio?: string[];
    email?: string;
  } | null;
}

export default function TecnicoDetailsModal({
  isOpen,
  onClose,
  professional,
}: TecnicoDetailsModalProps) {
  if (!professional) return null;

  const {
    full_name,
    profession,
    avatar_url,
    whatsapp,
    calificacion_promedio,
    distance,
    total_reviews = 0,
    verified = true,
    areas_servicio = [],
  } = professional;

  const handleWhatsAppClick = () => {
    if (whatsapp) {
      window.open(
        `https://wa.me/${whatsapp}?text=Hola%20${encodeURIComponent(
          full_name
        )}%2C%20te%20contacto%20desde%20Sumee%20App.`,
        "_blank"
      );
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[200]" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal Container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-end sm:items-center justify-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="w-full sm:max-w-md transform overflow-hidden rounded-t-3xl sm:rounded-2xl bg-white shadow-xl transition-all">
                {/* Header con gradiente */}
                <div className="relative bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 pb-6 pt-6 px-6">
                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-gray-900 transition-colors shadow-sm"
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-sm" />
                  </button>

                  {/* Avatar y Verificación */}
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      {avatar_url ? (
                        <img
                          src={avatar_url}
                          alt={full_name}
                          className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-200 to-purple-200 flex items-center justify-center border-4 border-white shadow-lg">
                          <FontAwesomeIcon
                            icon={faUser}
                            className="text-3xl text-indigo-600"
                          />
                        </div>
                      )}
                      {verified && (
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="text-white text-xs"
                          />
                        </div>
                      )}
                    </div>

                    {/* Nombre */}
                    <h2 className="text-xl font-bold text-gray-900 text-center mb-1">
                      {full_name}
                    </h2>

                    {/* Profesión */}
                    {profession && (
                      <p className="text-sm text-gray-600 mb-3">{profession}</p>
                    )}

                    {/* Rating y Reviews */}
                    <div className="flex items-center gap-4 mb-3">
                      {calificacion_promedio && calificacion_promedio > 0 ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full shadow-sm">
                          <FontAwesomeIcon
                            icon={faStar}
                            className="text-yellow-500 text-sm"
                          />
                          <span className="font-bold text-sm text-gray-900">
                            {calificacion_promedio.toFixed(1)}
                          </span>
                          {total_reviews > 0 && (
                            <span className="text-xs text-gray-500">
                              ({total_reviews} reseñas)
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="px-3 py-1.5 bg-white rounded-full shadow-sm">
                          <span className="text-xs text-gray-500">
                            Sin calificaciones
                          </span>
                        </div>
                      )}

                      {/* Distancia */}
                      {distance !== undefined && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full shadow-sm">
                          <FontAwesomeIcon
                            icon={faMapMarkerAlt}
                            className="text-blue-500 text-xs"
                          />
                          <span className="font-semibold text-sm text-gray-900">
                            {distance.toFixed(1)} km
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contenido */}
                <div className="px-6 py-5 space-y-4">
                  {/* Especialidades */}
                  {areas_servicio && areas_servicio.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <FontAwesomeIcon
                          icon={faBriefcase}
                          className="text-indigo-600 text-sm"
                        />
                        <h3 className="font-semibold text-sm text-gray-900">
                          Especialidades
                        </h3>
                      </div>
                      <div className="space-y-1.5">
                        {areas_servicio.map((area, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm text-gray-700"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                            <span>{area}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Botón de Contacto Principal */}
                  {whatsapp && (
                    <button
                      onClick={handleWhatsAppClick}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                    >
                      <FontAwesomeIcon icon={faWhatsapp} className="text-xl" />
                      <span>Contactar por WhatsApp</span>
                    </button>
                  )}

                  {/* Info Adicional */}
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-center text-gray-500">
                      Al contactar, menciona que vienes desde{" "}
                      <span className="font-semibold text-indigo-600">
                        Sumee App
                      </span>
                    </p>
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

