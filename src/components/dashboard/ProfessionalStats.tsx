// src/components/dashboard/ProfessionalStats.tsx
"use client";

import React, { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faStar,
  faClock,
  faDollarSign,
  faUsers,
  faThumbsUp,
  faCalendarAlt,
  faTrophy,
  faCheckCircle,
  faTimesCircle,
  faRocket,
} from "@fortawesome/free-solid-svg-icons";
import { Profesional, Lead } from "@/types/supabase";

interface ProfessionalStatsProps {
  profesional: Profesional;
  leads: Lead[];
}

export default function ProfessionalStats({
  profesional,
  leads,
}: ProfessionalStatsProps) {
  // Calcular estadísticas mejoradas
  const stats = useMemo(() => {
    const allLeads = leads;
    const completedLeads = leads.filter((lead) => lead.estado === "completado");
    const acceptedLeads = leads.filter(
      (lead) => lead.profesional_asignado_id === profesional.user_id
    );
    const activeLeads = leads.filter((lead) => {
      const estado = (lead.estado || "").toLowerCase();
      return ["aceptado", "contactado", "en_progreso"].includes(estado);
    });
    const newLeads = leads.filter((lead) => lead.estado === "nuevo");

    // Calcular tasa de aceptación
    // Leads recibidos = todos los leads que tienen este profesional asignado
    // Leads aceptados = leads donde el profesional_asignado_id coincide con el profesional actual
    const leadsReceived = leads.length; // Por ahora, todos los leads disponibles
    const leadsAccepted = acceptedLeads.length;
    const acceptanceRate =
      leadsReceived > 0 ? Math.round((leadsAccepted / leadsReceived) * 100) : 0;

    // Calcular tasa de finalización (leads completados / leads aceptados)
    const completionRate =
      leadsAccepted > 0
        ? Math.round((completedLeads.length / leadsAccepted) * 100)
        : 0;

    // Calcular tiempo de respuesta promedio (mock por ahora, se puede mejorar con timestamps)
    const responseTime = "2.5 horas";

    // Calcular ganancias del mes
    // Estimación conservadora: promedio de $1,200 MXN por trabajo completado
    // Esto se puede mejorar cuando se agregue tracking de precios reales
    const averageEarningPerJob = 1200;
    const monthlyEarnings = completedLeads.length * averageEarningPerJob;

    // Calcular ganancias solo del mes actual
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const completedThisMonth = completedLeads.filter((lead) => {
      if (!lead.fecha_creacion) return false;
      const leadDate = new Date(lead.fecha_creacion);
      return (
        leadDate.getMonth() === currentMonth &&
        leadDate.getFullYear() === currentYear
      );
    });
    const monthlyEarningsActual =
      completedThisMonth.length * averageEarningPerJob;

    // Todos los profesionales parten con 5 estrellas por defecto
    const rating = profesional.calificacion_promedio ?? 5;
    const hasRating = true; // Todos tienen calificación (5 por defecto)

    return {
      totalLeads: allLeads.length,
      completedLeads: completedLeads.length,
      acceptedLeads: leadsAccepted,
      activeLeads: activeLeads.length,
      newLeads: newLeads.length,
      rating,
      hasRating,
      responseTime,
      completionRate,
      acceptanceRate,
      monthlyEarnings: monthlyEarningsActual, // Ganancias del mes actual
      totalEarnings: monthlyEarnings, // Ganancias totales (todos los completados)
      yearsExperience: profesional.años_experiencia_uber || 0,
      isEmpty: allLeads.length === 0,
    };
  }, [leads, profesional]);

  // Empty state: cuando no hay leads
  if (stats.isEmpty) {
    return (
      <div className="space-y-6">
        {/* Header motivacional */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">
                ¡Bienvenido a tu Dashboard!
              </h3>
              <p className="text-blue-100 text-sm">
                Empieza a trabajar y verás tus métricas aquí
              </p>
            </div>
            <FontAwesomeIcon
              icon={faRocket}
              className="text-3xl text-blue-200"
            />
          </div>
        </div>

        {/* Métricas vacías con incentivos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-2">
              <FontAwesomeIcon
                icon={faDollarSign}
                className="text-lg text-gray-400"
              />
              <span className="text-xs font-medium text-gray-500">
                Ganancias del Mes
              </span>
            </div>
            <div className="text-2xl font-bold mb-1 text-gray-600">$0.00</div>
            <div className="text-sm font-medium text-gray-500">MXN</div>
            <p className="text-xs text-gray-400 mt-2">
              💡 Acepta leads y completa trabajos para generar ingresos
            </p>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-2">
              <FontAwesomeIcon
                icon={faStar}
                className="text-lg text-gray-400"
              />
              <span className="text-xs font-medium text-gray-500">
                Tu Calificación
              </span>
            </div>
            <div className="text-2xl font-bold mb-1 text-gray-600">
              <span className="text-yellow-400">★★★★★</span>
            </div>
            <div className="text-sm font-medium text-gray-500">
              5.0 / 5.0 (Por defecto)
            </div>
            <p className="text-xs text-gray-400 mt-2">
              ⭐ Mantén tus reseñas positivas para conservar tu calificación
            </p>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-2">
              <FontAwesomeIcon
                icon={faTrophy}
                className="text-lg text-gray-400"
              />
              <span className="text-xs font-medium text-gray-500">
                Leads Completados
              </span>
            </div>
            <div className="text-2xl font-bold mb-1 text-gray-600">0</div>
            <div className="text-sm font-medium text-gray-500">
              Trabajos finalizados
            </div>
            <p className="text-xs text-gray-400 mt-2">
              🎯 Cada trabajo completado mejora tu reputación
            </p>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-2">
              <FontAwesomeIcon
                icon={faChartLine}
                className="text-lg text-gray-400"
              />
              <span className="text-xs font-medium text-gray-500">
                Tasa de Aceptación
              </span>
            </div>
            <div className="text-2xl font-bold mb-1 text-gray-600">N/A</div>
            <div className="text-sm font-medium text-gray-500">
              Sin datos aún
            </div>
            <p className="text-xs text-gray-400 mt-2">
              📊 Se calcula cuando aceptes tus primeros leads
            </p>
          </div>
        </div>

        {/* Mensaje motivacional */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-start space-x-4">
            <FontAwesomeIcon
              icon={faRocket}
              className="text-2xl text-green-600 mt-1"
            />
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">
                ¡Comienza ahora!
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  ✅ Activa tu estado de disponibilidad para recibir leads
                </li>
                <li>✅ Acepta leads que coincidan con tu perfil</li>
                <li>✅ Completa trabajos para generar ingresos</li>
                <li>✅ Obtén reseñas de clientes satisfechos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderizado normal con métricas
  const statCards = [
    {
      title: "Leads Totales",
      value: stats.totalLeads,
      icon: faUsers,
      color: "blue",
      description: "Oportunidades recibidas",
    },
    {
      title: "Trabajos Completados",
      value: stats.completedLeads,
      icon: faTrophy,
      color: "green",
      description: "Proyectos finalizados",
    },
    {
      title: "Calificación Promedio",
      value: `${stats.rating.toFixed(1)}/5.0`,
      icon: faStar,
      color: "yellow",
      description: "Basada en reseñas y acciones",
      showStars: false, // Ya no necesitamos mostrar estrellas aquí porque siempre hay calificación
    },
    {
      title: "Tasa de Aceptación",
      value: `${stats.acceptanceRate}%`,
      icon: faCheckCircle,
      color: "indigo",
      description: "Leads aceptados vs recibidos",
    },
    {
      title: "Tasa de Finalización",
      value: `${stats.completionRate}%`,
      icon: faChartLine,
      color: "purple",
      description: "Proyectos completados vs aceptados",
    },
    {
      title: "Ganancias del Mes",
      value: `$${stats.monthlyEarnings.toLocaleString()} MXN`,
      icon: faDollarSign,
      color: "emerald",
      description: "Ingresos del mes actual",
      subtitle:
        stats.totalEarnings > stats.monthlyEarnings
          ? `Total: $${stats.totalEarnings.toLocaleString()} MXN`
          : undefined,
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-50 border-blue-200 text-blue-600",
      green: "bg-green-50 border-green-200 text-green-600",
      yellow: "bg-yellow-50 border-yellow-200 text-yellow-600",
      purple: "bg-purple-50 border-purple-200 text-purple-600",
      indigo: "bg-indigo-50 border-indigo-200 text-indigo-600",
      emerald: "bg-emerald-50 border-emerald-200 text-emerald-600",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header de Estadísticas */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">
              Tu Rendimiento Profesional
            </h3>
            <p className="text-blue-100 text-sm">
              {stats.yearsExperience > 0
                ? `${stats.yearsExperience} años de experiencia`
                : "Profesional certificado"}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {stats.rating.toFixed(1)}
            </div>
            <div className="text-blue-100 text-sm">Calificación</div>
          </div>
        </div>
      </div>

      {/* Grid de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${getColorClasses(stat.color)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <FontAwesomeIcon icon={stat.icon} className="text-lg" />
              <span className="text-xs font-medium opacity-75">
                {stat.description}
              </span>
            </div>
            <div className="text-2xl font-bold mb-1">
              {stat.showStars ? (
                <span className="text-yellow-400">★★★★★</span>
              ) : (
                stat.value
              )}
            </div>
            <div className="text-sm font-medium">{stat.title}</div>
            {stat.subtitle && (
              <div className="text-xs opacity-75 mt-1">{stat.subtitle}</div>
            )}
          </div>
        ))}
      </div>

      {/* Insights y Recomendaciones */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
          <FontAwesomeIcon
            icon={faChartLine}
            className="mr-2 text-indigo-600"
          />
          Insights de Rendimiento
        </h4>
        <div className="space-y-3">
          {stats.completionRate >= 80 && (
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <FontAwesomeIcon icon={faThumbsUp} className="text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  ¡Excelente rendimiento!
                </p>
                <p className="text-xs text-green-600">
                  Tu tasa de finalización es superior al promedio
                </p>
              </div>
            </div>
          )}

          {stats.acceptanceRate < 50 && stats.totalLeads > 0 && (
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <FontAwesomeIcon icon={faClock} className="text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Oportunidad de mejora
                </p>
                <p className="text-xs text-yellow-600">
                  Acepta más leads para aumentar tus oportunidades de trabajo
                </p>
              </div>
            </div>
          )}

          {stats.hasRating && stats.rating >= 4.5 && (
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <FontAwesomeIcon icon={faStar} className="text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Calificación destacada
                </p>
                <p className="text-xs text-yellow-600">
                  Los clientes están muy satisfechos con tu trabajo
                </p>
              </div>
            </div>
          )}

          {!stats.hasRating && stats.completedLeads > 0 && (
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <FontAwesomeIcon icon={faStar} className="text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  ¡Solicita reseñas!
                </p>
                <p className="text-xs text-blue-600">
                  Pide a tus clientes que te califiquen para mejorar tu perfil
                </p>
              </div>
            </div>
          )}

          {stats.newLeads > 0 && (
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Nuevas oportunidades
                </p>
                <p className="text-xs text-blue-600">
                  {stats.newLeads} leads nuevos esperando tu respuesta
                </p>
              </div>
            </div>
          )}

          {stats.monthlyEarnings === 0 && stats.totalLeads > 0 && (
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <FontAwesomeIcon icon={faDollarSign} className="text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Completa trabajos para generar ingresos
                </p>
                <p className="text-xs text-green-600">
                  Cada trabajo completado se suma a tus ganancias del mes
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
