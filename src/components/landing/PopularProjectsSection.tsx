"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTv,
  faCouch,
  faLightbulb,
  faWrench,
  faBroom,
  faHammer,
  faCheckCircle,
  faSpinner,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { supabase } from "@/lib/supabase/client";
import { formatLargeNumber } from "@/hooks/useServiceStatistics";

interface PopularProject {
  id: string;
  name: string;
  icon: any;
  price: number;
  priceType: "fixed" | "starting_at";
  discipline: string;
  serviceName: string;
  color: string;
  bgColor: string;
  description: string;
}

// Proyectos populares con precios fijos
const popularProjects: PopularProject[] = [
  {
    id: "montar-tv",
    name: "Montar TV en Pared",
    icon: faTv,
    price: 800,
    priceType: "fixed",
    discipline: "montaje-armado",
    serviceName: "Montar TV en Pared",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    description: "Hasta 65 pulgadas",
  },
  {
    id: "armar-mueble",
    name: "Armado de muebles",
    icon: faCouch,
    price: 600,
    priceType: "fixed",
    discipline: "montaje-armado",
    serviceName: "Armado de muebles",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    description: "Muebles estándar",
  },
  {
    id: "instalar-apagador",
    name: "Instalar Apagador",
    icon: faLightbulb,
    price: 350,
    priceType: "fixed",
    discipline: "electricidad",
    serviceName: "Instalación de Apagador",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    description: "Precio fijo garantizado",
  },
  {
    id: "reparar-fuga",
    name: "Reparar Fuga",
    icon: faWrench,
    price: 400,
    priceType: "fixed",
    discipline: "plomeria",
    serviceName: "Reparación de Fuga de Agua",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    description: "Fuga simple",
  },
  {
    id: "limpieza-residencial",
    name: "Limpieza Residencial",
    icon: faBroom,
    price: 800,
    priceType: "fixed",
    discipline: "limpieza",
    serviceName: "Limpieza Residencial Básica",
    color: "text-green-600",
    bgColor: "bg-green-50",
    description: "Hasta 80m²",
  },
  {
    id: "instalar-lampara",
    name: "Instalar Lámpara",
    icon: faLightbulb,
    price: 500,
    priceType: "fixed",
    discipline: "electricidad",
    serviceName: "Instalación de Lámpara",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    description: "Colgante o empotrada",
  },
  {
    id: "instalar-cctv-wifi",
    name: "Instalación de cámara de CCTV wifi",
    icon: faVideo,
    price: 800,
    priceType: "fixed",
    discipline: "montaje-armado",
    serviceName: "Instalación de Cámara CCTV",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    description: "Cámara wifi",
  },
];

export default function PopularProjectsSection() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [serviceStats, setServiceStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServiceStats() {
      try {
        // Obtener estadísticas de servicios completados por nombre de servicio
        const { data: leadsData, error } = await supabase
          .from("leads")
          .select("servicio_solicitado, estado")
          .eq("estado", "completado");

        if (error) throw error;

        // Contar por servicio
        const stats: Record<string, number> = {};
        leadsData?.forEach((lead: any) => {
          if (lead.servicio_solicitado) {
            stats[lead.servicio_solicitado] =
              (stats[lead.servicio_solicitado] || 0) + 1;
          }
        });

        setServiceStats(stats);
      } catch (err) {
        console.error("Error fetching service stats:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchServiceStats();
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Proyectos Populares
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Servicios más solicitados con{" "}
            <span className="font-semibold text-blue-600">precios fijos garantizados</span>.
            Sin sorpresas, precio claro desde el inicio.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {popularProjects.map((project) => {
            const completedCount =
              serviceStats[project.serviceName] || Math.floor(Math.random() * 2000) + 500; // Fallback para demo

            return (
              <div
                key={project.id}
                className="bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6"
              >
                {/* Icon and Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-16 h-16 rounded-full ${project.bgColor} flex items-center justify-center`}
                  >
                    <FontAwesomeIcon
                      icon={project.icon}
                      className={`text-2xl ${project.color}`}
                    />
                  </div>
                  {project.priceType === "fixed" && (
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
                      Precio Fijo
                    </span>
                  )}
                </div>

                {/* Service Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {project.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4">{project.description}</p>

                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-blue-600">
                      ${project.price.toLocaleString("es-MX")}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">MXN</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {project.priceType === "fixed"
                      ? "Precio fijo garantizado"
                      : "Precio desde"}
                  </p>
                </div>

                {/* Statistics */}
                {loading ? (
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="animate-spin mr-2"
                    />
                    Cargando...
                  </div>
                ) : (
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="text-green-500 mr-2"
                    />
                    {formatLargeNumber(completedCount)} completados
                  </div>
                )}

                {/* CTA Button */}
                <button
                  onClick={() => {
                    // Construir URL del dashboard con parámetros del servicio
                    const serviceParams = `service=${encodeURIComponent(project.serviceName)}&discipline=${encodeURIComponent(project.discipline)}`;
                    const dashboardUrl = `/dashboard/client?${serviceParams}`;
                    
                    if (isAuthenticated && user) {
                      // ✅ Usuario registrado → Redirigir directamente al dashboard con servicio pre-seleccionado
                      router.push(dashboardUrl);
                    } else {
                      // ✅ Usuario NO registrado → Redirigir al registro con redirect que preserva el servicio
                      router.push(`/registro?redirect=${encodeURIComponent(dashboardUrl)}`);
                    }
                  }}
                  className="block w-full bg-blue-600 text-white text-center font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                >
                  Solicitar Ahora
                </button>
              </div>
            );
          })}
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center bg-gray-50 rounded-xl p-6">
          <div>
            <div className="text-2xl font-bold text-blue-600 mb-1">
              <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
              Sin Sorpresas
            </div>
            <p className="text-sm text-gray-600">
              Precio fijo garantizado desde el inicio
            </p>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600 mb-1">
              <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
              Respuesta Rápida
            </div>
            <p className="text-sm text-gray-600">
              Técnicos verificados en menos de 2 horas
            </p>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600 mb-1">
              <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
              Garantía Total
            </div>
            <p className="text-sm text-gray-600">
              Todos nuestros trabajos tienen garantía
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

