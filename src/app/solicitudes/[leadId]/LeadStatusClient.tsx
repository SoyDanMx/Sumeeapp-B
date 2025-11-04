"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faCheckCircle,
  faUser,
  faPhone,
  faMapMarkerAlt,
  faClock,
  faEye,
  faStar,
  faArrowLeft,
  faCamera,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { supabase } from "@/lib/supabase/client";
import { Lead } from "@/types/supabase";

interface LeadStatusClientProps {
  initialLead: Lead;
}

export default function LeadStatusClient({
  initialLead,
}: LeadStatusClientProps) {
  const [lead, setLead] = useState<Lead>(initialLead);
  const [professionalsViewing, setProfessionalsViewing] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Suscribirse a cambios en el lead
    const leadSubscription = supabase
      .channel("lead-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "leads",
          filter: `id=eq.${lead.id}`,
        },
        (payload) => {
          console.log("Lead updated:", payload);
          setLead(payload.new as Lead);
        }
      )
      .subscribe();

    // Suscribirse a vistas del lead (si implementamos esta funcionalidad)
    const viewsSubscription = supabase
      .channel("lead-views")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "lead_views",
          filter: `lead_id=eq.${lead.id}`,
        },
        async (payload) => {
          console.log("New view:", payload);
          // Obtener información del profesional que vio el lead
          const { data: professional } = await supabase
            .from("profiles")
            .select("full_name, avatar_url, profession")
            .eq("user_id", payload.new.profesional_id)
            .single();

          if (professional) {
            setProfessionalsViewing((prev) => [...prev, professional]);
          }
        }
      )
      .subscribe();

    return () => {
      leadSubscription.unsubscribe();
      viewsSubscription.unsubscribe();
    };
  }, [lead.id]);

  const getStatusMessage = () => {
    switch (lead.estado) {
      case "buscando":
        return {
          title: "Buscando profesionales...",
          message: "Estamos encontrando al mejor técnico para tu solicitud",
          icon: faSpinner,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
        };
      case "aceptado":
        return {
          title: "¡Profesional asignado!",
          message: "Un técnico ha aceptado tu solicitud",
          icon: faCheckCircle,
          color: "text-green-600",
          bgColor: "bg-green-50",
        };
      case "en_progreso":
        return {
          title: "Trabajo en progreso",
          message: "El técnico está trabajando en tu solicitud",
          icon: faClock,
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
        };
      case "completado":
        return {
          title: "¡Trabajo completado!",
          message: "Tu solicitud ha sido finalizada",
          icon: faCheckCircle,
          color: "text-green-600",
          bgColor: "bg-green-50",
        };
      default:
        return {
          title: "Estado desconocido",
          message: "Contacta a soporte si tienes dudas",
          icon: faExclamationTriangle,
          color: "text-gray-600",
          bgColor: "bg-gray-50",
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>Volver</span>
            </button>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Estado de Solicitud
              </h1>
              <p className="text-gray-600">ID: #{lead.id}</p>
            </div>
            <div></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            <div
              className={`w-20 h-20 ${statusInfo.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}
            >
              <FontAwesomeIcon
                icon={statusInfo.icon}
                className={`text-3xl ${statusInfo.color} ${
                  lead.estado === "buscando" ? "animate-spin" : ""
                }`}
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {statusInfo.title}
            </h2>
            <p className="text-xl text-gray-600">{statusInfo.message}</p>
          </div>

          {/* Lead Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Detalles de la Solicitud
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <FontAwesomeIcon icon={faUser} className="text-blue-600" />
                <span>
                  <strong>Cliente:</strong> {lead.nombre_cliente}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className="text-red-600"
                />
                <span>
                  <strong>Ubicación:</strong> CDMX
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <FontAwesomeIcon icon={faClock} className="text-gray-600" />
                <span>
                  <strong>Fecha:</strong>{" "}
                  {new Date(lead.fecha_creacion).toLocaleDateString()}
                </span>
              </div>
              {lead.whatsapp && (
                <div className="flex items-center space-x-3">
                  <FontAwesomeIcon
                    icon={faWhatsapp}
                    className="text-green-600"
                  />
                  <span>
                    <strong>WhatsApp:</strong> {lead.whatsapp}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                Descripción del Problema
              </h4>
              <p className="text-gray-700">{lead.descripcion_proyecto}</p>
            </div>

            {lead.imagen_url && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Imagen Adjunta
                </h4>
                <img
                  src={lead.imagen_url}
                  alt="Imagen del problema"
                  className="max-w-md rounded-lg shadow-sm"
                />
              </div>
            )}
          </div>

          {/* Professionals Viewing */}
          {lead.estado === "buscando" && professionalsViewing.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FontAwesomeIcon icon={faEye} className="text-blue-600 mr-2" />
                Profesionales viendo tu solicitud
              </h3>
              <div className="flex flex-wrap gap-4">
                {professionalsViewing.map((professional, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 bg-white rounded-lg p-3 shadow-sm"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      {professional.avatar_url ? (
                        <img
                          src={professional.avatar_url}
                          alt={professional.full_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <FontAwesomeIcon
                          icon={faUser}
                          className="text-blue-600"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {professional.full_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {professional.profession}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assigned Professional */}
          {lead.estado === "aceptado" && lead.profesional_asignado && (
            <div className="bg-green-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Profesional Asignado
              </h3>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  {lead.profesional_asignado?.avatar_url ? (
                    <img
                      src={lead.profesional_asignado.avatar_url}
                      alt={lead.profesional_asignado.full_name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <FontAwesomeIcon
                      icon={faUser}
                      className="text-2xl text-green-600"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-900">
                    {lead.profesional_asignado?.full_name}
                  </h4>
                  <p className="text-gray-600">
                    {lead.profesional_asignado?.profession}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    {Array.from({ length: 5 }, (_, i) => {
                      const rating =
                        lead.profesional_asignado?.calificacion_promedio ?? 5;
                      return (
                        <FontAwesomeIcon
                          key={i}
                          icon={faStar}
                          className={`text-sm ${
                            i < Math.floor(rating)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      );
                    })}
                    <span className="text-sm text-gray-600 ml-1">
                      (
                      {(
                        lead.profesional_asignado?.calificacion_promedio ?? 5
                      ).toFixed(1)}
                      )
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {lead.profesional_asignado?.whatsapp && (
                    <a
                      href={`https://wa.me/${lead.profesional_asignado.whatsapp.replace(
                        /[^\d]/g,
                        ""
                      )}?text=Hola, te contacté por el servicio a través de Sumee App.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                    >
                      <FontAwesomeIcon icon={faWhatsapp} />
                      <span>WhatsApp</span>
                    </a>
                  )}
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2">
                    <FontAwesomeIcon icon={faPhone} />
                    <span>Llamar</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => router.push("/dashboard/client")}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Ir al Dashboard
            </button>
            {lead.estado === "buscando" && (
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Actualizar Estado
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
