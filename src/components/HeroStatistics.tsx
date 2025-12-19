"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { formatLargeNumber } from "@/hooks/useServiceStatistics";

export default function HeroStatistics() {
  const [stats, setStats] = useState({
    totalServices: 50000,
    avgResponseTime: "2h",
    rating: 4.8,
    electricidad: 0,
    plomeria: 0,
    montajeArmado: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatistics() {
      try {
        // Obtener total de servicios completados
        const { count: totalCount, error: totalError } = await supabase
          .from("leads")
          .select("*", { count: "exact", head: true })
          .eq("estado", "completado");

        if (!totalError && totalCount) {
          setStats((prev) => ({ ...prev, totalServices: totalCount }));
        }

        // Obtener estadísticas por disciplina
        const { data: leadsData, error: leadsError } = await supabase
          .from("leads")
          .select("disciplina_ia, servicio_solicitado, estado")
          .eq("estado", "completado");

        if (!leadsError && leadsData) {
          const disciplineCounts: Record<string, number> = {};
          
          leadsData.forEach((lead: any) => {
            const discipline = lead.disciplina_ia || lead.servicio_solicitado || "otros";
            disciplineCounts[discipline] = (disciplineCounts[discipline] || 0) + 1;
          });

          setStats((prev) => ({
            ...prev,
            electricidad: disciplineCounts["electricidad"] || 0,
            plomeria: disciplineCounts["plomeria"] || 0,
            montajeArmado: disciplineCounts["montaje-armado"] || 0,
          }));
        }

        // Calcular tiempo promedio de respuesta (mock por ahora)
        // TODO: Implementar cálculo real basado en timestamps

        // Calcular rating promedio
        const { data: reviewsData, error: reviewsError } = await supabase
          .from("lead_reviews")
          .select("rating");

        if (!reviewsError && reviewsData && reviewsData.length > 0) {
          const avgRating =
            reviewsData.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) /
            reviewsData.length;
          setStats((prev) => ({ ...prev, rating: Math.round(avgRating * 10) / 10 }));
        }
      } catch (err) {
        console.error("Error fetching statistics:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStatistics();
  }, []);

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 mt-6 sm:mt-8 md:mt-10 pt-5 sm:pt-6 md:pt-8 border-t border-white/20">
      <div className="text-center">
        <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-yellow-400 mb-1.5 sm:mb-2 drop-shadow-lg">
          {loading ? "..." : formatLargeNumber(stats.totalServices)}
        </div>
        <div className="text-xs sm:text-sm md:text-base text-blue-100 font-medium">
          Servicios Completados
        </div>
        {!loading && (stats.electricidad > 0 || stats.plomeria > 0) && (
          <div className="text-xs text-blue-200 mt-1">
            {stats.electricidad > 0 && `${formatLargeNumber(stats.electricidad)} Eléctricos`}
            {stats.electricidad > 0 && stats.plomeria > 0 && " • "}
            {stats.plomeria > 0 && `${formatLargeNumber(stats.plomeria)} Plomería`}
          </div>
        )}
      </div>
      <div className="text-center">
        <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-green-400 mb-1.5 sm:mb-2 drop-shadow-lg">
          {stats.avgResponseTime}
        </div>
        <div className="text-xs sm:text-sm md:text-base text-blue-100 font-medium">
          Tiempo Promedio
        </div>
      </div>
      <div className="text-center">
        <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-purple-400 mb-1.5 sm:mb-2 drop-shadow-lg">
          {stats.rating}
        </div>
        <div className="text-xs sm:text-sm md:text-base text-blue-100 font-medium">
          Calificación
        </div>
      </div>
    </div>
  );
}

