"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { formatLargeNumber } from "@/hooks/useServiceStatistics";

export default function HeroStatistics() {
  const [stats, setStats] = useState({ totalServices: 50000, avgResponseTime: "2h", rating: 4.8 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatistics() {
      try {
        // Total de servicios completados
        const { count: totalCount } = await supabase.from("leads").select("*", { count: "exact", head: true }).eq("estado", "completado");
        if (totalCount) setStats((prev) => ({ ...prev, totalServices: totalCount }));

        // Rating promedio
        const { data: reviewsData } = await supabase.from("lead_reviews").select("rating");
        if (reviewsData && reviewsData.length > 0) {
          const avgRating = reviewsData.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviewsData.length;
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
    <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4 md:pt-5 border-t border-gray-200">
      <div className="text-center">
        <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-orange-500 mb-0.5 sm:mb-1">
          {loading ? "..." : formatLargeNumber(stats.totalServices)}
        </div>
        <div className="text-[10px] sm:text-xs text-gray-500 font-medium">
          Servicios Completados
        </div>
      </div>
      <div className="text-center">
        <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-green-500 mb-0.5 sm:mb-1">
          {stats.avgResponseTime}
        </div>
        <div className="text-[10px] sm:text-xs text-gray-500 font-medium">
          Tiempo Promedio
        </div>
      </div>
      <div className="text-center">
        <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-purple-400 mb-0.5 sm:mb-1">
          {stats.rating}
        </div>
        <div className="text-[10px] sm:text-xs text-gray-500 font-medium">
          Calificación
        </div>
      </div>
    </div>
  );
}

