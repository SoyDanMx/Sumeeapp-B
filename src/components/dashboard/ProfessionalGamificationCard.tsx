import React, { useMemo } from "react";
import { Profesional, Lead } from "@/types/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faFireAlt,
  faMedal,
  faTrophy,
  faClock,
  faStar,
} from "@fortawesome/free-solid-svg-icons";

interface ProfessionalGamificationCardProps {
  profesional: Profesional;
  leads: Lead[];
}

export default function ProfessionalGamificationCard({
  profesional,
  leads,
}: ProfessionalGamificationCardProps) {
  const metrics = useMemo(() => {
    const assigned = leads.filter(
      (lead) => lead.profesional_asignado_id === profesional.user_id
    );

    const contacted = assigned.filter((lead) => lead.contacted_at != null);
    const completed = assigned.filter(
      (lead) => (lead.estado || "").toLowerCase() === "completado"
    );

    const totalPoints = assigned.reduce(
      (sum, lead) => sum + (lead.engagement_points ?? 0),
      0
    );

    const contactRate =
      assigned.length > 0
        ? Math.round((contacted.length / assigned.length) * 100)
        : 0;

    const completionRate =
      assigned.length > 0
        ? Math.round((completed.length / assigned.length) * 100)
        : 0;

    const averageResponseMinutes = (() => {
      const diffs = assigned
        .filter((lead) => lead.contacted_at && lead.fecha_asignacion)
        .map((lead) => {
          const contactedAt = new Date(lead.contacted_at as string).getTime();
          const assignedAt = new Date(lead.fecha_asignacion as string).getTime();
          return Math.max(0, contactedAt - assignedAt) / (1000 * 60);
        });
      if (diffs.length === 0) return null;
      const average = diffs.reduce((sum, value) => sum + value, 0) / diffs.length;
      return Math.round(average);
    })();

    const badges: { label: string; description: string }[] = [];

    if (totalPoints >= 150) {
      badges.push({ label: "Leyenda Sumee", description: "Más de 150 puntos acumulados" });
    } else if (totalPoints >= 80) {
      badges.push({ label: "Experto", description: "Más de 80 puntos" });
    } else if (totalPoints >= 40) {
      badges.push({ label: "Constante", description: "Más de 40 puntos" });
    }

    if (contactRate >= 90 && assigned.length >= 5) {
      badges.push({ label: "Relámpago", description: "Contactos en menos de 2 horas" });
    }

    if (completionRate >= 80 && completed.length >= 5) {
      badges.push({ label: "Garantía", description: "Cumples las citas programadas" });
    }

    return {
      totalPoints,
      contactRate,
      completionRate,
      averageResponseMinutes,
      badges,
      assignedTotal: assigned.length,
      awaitingContact: assigned.filter((lead) => !lead.contacted_at).length,
    };
  }, [leads, profesional.user_id]);

  const progressToNextBadge = (() => {
    if (metrics.totalPoints >= 150) return 100;
    if (metrics.totalPoints >= 80) return Math.min(100, Math.round((metrics.totalPoints / 150) * 100));
    if (metrics.totalPoints >= 40)
      return Math.min(100, Math.round((metrics.totalPoints / 80) * 100));
    return Math.min(100, Math.round((metrics.totalPoints / 40) * 100));
  })();

  const nextBadgeLabel = (() => {
    if (metrics.totalPoints >= 150) return "¡Alcanzaste el máximo nivel!";
    if (metrics.totalPoints >= 80) return "Siguiente medalla: Leyenda Sumee (150 pts)";
    if (metrics.totalPoints >= 40) return "Siguiente medalla: Experto (80 pts)";
    return "Siguiente medalla: Constante (40 pts)";
  })();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6 space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FontAwesomeIcon icon={faBolt} className="text-indigo-500" />
            Nivel Sumee Pro
          </h3>
          <p className="text-sm text-gray-600">
            Suma puntos completando acciones clave para desbloquear beneficios.
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-indigo-600">
            {metrics.totalPoints} pts
          </p>
          <p className="text-xs text-gray-500">Puntos acumulados</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="w-full h-3 rounded-full bg-indigo-100 overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all"
            style={{ width: `${progressToNextBadge}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 font-medium">{nextBadgeLabel}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 border border-indigo-100 rounded-lg bg-indigo-50">
          <p className="text-xs text-indigo-700 font-semibold uppercase mb-1">
            Contacto a tiempo
          </p>
          <p className="text-xl font-bold text-indigo-700">
            {metrics.contactRate}%
          </p>
          <p className="text-xs text-indigo-600">
            {metrics.awaitingContact > 0
              ? `${metrics.awaitingContact} trabajos necesitan contacto`
              : "¡Excelente! Todos tus clientes fueron contactados"}
          </p>
        </div>
        <div className="p-3 border border-emerald-100 rounded-lg bg-emerald-50">
          <p className="text-xs text-emerald-700 font-semibold uppercase mb-1">
            Citas cumplidas
          </p>
          <p className="text-xl font-bold text-emerald-700">
            {metrics.completionRate}%
          </p>
          <p className="text-xs text-emerald-600">
            {metrics.completionRate >= 80
              ? "Tus clientes confían en tu puntualidad"
              : "Cumple tus citas para subir de nivel"}
          </p>
        </div>
        <div className="p-3 border border-orange-100 rounded-lg bg-orange-50">
          <p className="text-xs text-orange-700 font-semibold uppercase mb-1">
            Tiempo de respuesta
          </p>
          <p className="text-xl font-bold text-orange-700">
            {metrics.averageResponseMinutes != null
              ? `${metrics.averageResponseMinutes} min`
              : "Sin datos"}
          </p>
          <p className="text-xs text-orange-600">
            Contacta a cada cliente en menos de 120 minutos.
          </p>
        </div>
      </div>

      {metrics.badges.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 space-y-2">
          <p className="text-xs font-semibold text-indigo-700 uppercase flex items-center gap-2">
            <FontAwesomeIcon icon={faMedal} />
            Medallas obtenidas
          </p>
          <ul className="space-y-2">
            {metrics.badges.map((badge, idx) => (
              <li
                key={`${badge.label}-${idx}`}
                className="flex items-center gap-3 text-sm text-indigo-800"
              >
                <FontAwesomeIcon icon={faTrophy} className="text-indigo-500" />
                <span>
                  <strong>{badge.label}</strong>
                  <span className="block text-xs text-indigo-600">
                    {badge.description}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-start gap-3 text-xs text-gray-500">
        <FontAwesomeIcon icon={faStar} className="text-yellow-400 mt-1" />
        <p>
          Aumenta tus puntos contactando clientes antes de 2 horas, confirmando citas y completando trabajos. Las reseñas positivas te ayudarán a destacar en Sumee.
        </p>
      </div>
    </div>
  );
}
