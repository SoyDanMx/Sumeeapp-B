"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export interface ServiceStatistics {
  discipline: string;
  total_completed: number;
  total_professionals: number;
  average_rating?: number;
}

export interface DetailedServiceStats {
  service_name: string;
  discipline: string;
  total_completed: number;
  price_type: "fixed" | "range" | "starting_at";
  min_price: number;
}

/**
 * Hook para obtener estadísticas específicas por servicio/disciplina
 */
export function useServiceStatistics() {
  const [stats, setStats] = useState<ServiceStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStatistics() {
      try {
        setLoading(true);
        setError(null);

        // Query para obtener estadísticas por disciplina desde leads completados
        const { data: leadsData, error: leadsError } = await supabase
          .from("leads")
          .select("servicio_solicitado, disciplina_ia, estado, profesional_asignado_id")
          .eq("estado", "completado");

        if (leadsError) throw leadsError;

        // Agrupar por disciplina
        const disciplineMap = new Map<string, {
          total_completed: number;
          professionals: Set<string>;
        }>();

        leadsData?.forEach((lead: any) => {
          // Usar disciplina_ia si existe, sino servicio_solicitado
          const discipline = lead.disciplina_ia || lead.servicio_solicitado || "otros";
          
          if (!disciplineMap.has(discipline)) {
            disciplineMap.set(discipline, {
              total_completed: 0,
              professionals: new Set(),
            });
          }

          const stats = disciplineMap.get(discipline)!;
          stats.total_completed++;
          
          if (lead.profesional_asignado_id) {
            stats.professionals.add(lead.profesional_asignado_id);
          }
        });

        // Convertir a array de ServiceStatistics
        const statistics: ServiceStatistics[] = Array.from(disciplineMap.entries()).map(
          ([discipline, data]) => ({
            discipline,
            total_completed: data.total_completed,
            total_professionals: data.professionals.size,
          })
        );

        // Ordenar por total_completed descendente
        statistics.sort((a, b) => b.total_completed - a.total_completed);

        setStats(statistics);
      } catch (err: any) {
        console.error("Error fetching service statistics:", err);
        setError(err.message || "Error al cargar estadísticas");
      } finally {
        setLoading(false);
      }
    }

    fetchStatistics();
  }, []);

  return { stats, loading, error };
}

/**
 * Hook para obtener estadísticas detalladas por servicio específico
 */
export function useDetailedServiceStatistics() {
  const [stats, setStats] = useState<DetailedServiceStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetailedStatistics() {
      try {
        setLoading(true);
        setError(null);

        // Obtener servicios del catálogo con precio fijo
        const { data: catalogData, error: catalogError } = await supabase
          .from("service_catalog")
          .select("service_name, discipline, price_type, min_price")
          .eq("is_active", true)
          .eq("price_type", "fixed")
          .order("min_price", { ascending: true });

        if (catalogError) throw catalogError;

        // Obtener leads completados
        const { data: leadsData, error: leadsError } = await supabase
          .from("leads")
          .select("servicio_solicitado, disciplina_ia, estado")
          .eq("estado", "completado");

        if (leadsError) throw leadsError;

        // Contar completados por servicio
        const serviceCounts = new Map<string, number>();

        leadsData?.forEach((lead: any) => {
          const serviceName = lead.servicio_solicitado || lead.disciplina_ia;
          if (serviceName) {
            serviceCounts.set(
              serviceName,
              (serviceCounts.get(serviceName) || 0) + 1
            );
          }
        });

        // Combinar datos del catálogo con estadísticas
        const detailedStats: DetailedServiceStats[] = (catalogData || []).map(
          (service: any) => ({
            service_name: service.service_name,
            discipline: service.discipline,
            total_completed: serviceCounts.get(service.service_name) || 0,
            price_type: service.price_type as "fixed" | "range" | "starting_at",
            min_price: service.min_price,
          })
        );

        // Ordenar por total_completed descendente, luego por precio
        detailedStats.sort((a, b) => {
          if (b.total_completed !== a.total_completed) {
            return b.total_completed - a.total_completed;
          }
          return a.min_price - b.min_price;
        });

        setStats(detailedStats);
      } catch (err: any) {
        console.error("Error fetching detailed service statistics:", err);
        setError(err.message || "Error al cargar estadísticas detalladas");
      } finally {
        setLoading(false);
      }
    }

    fetchDetailedStatistics();
  }, []);

  return { stats, loading, error };
}

/**
 * Función helper para obtener estadísticas de una disciplina específica
 */
export function getStatsForDiscipline(
  stats: ServiceStatistics[],
  discipline: string
): ServiceStatistics | null {
  return stats.find((s) => s.discipline === discipline) || null;
}

/**
 * Función helper para formatear números grandes (ej: 2500 -> "2.5K+")
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1000) {
    const thousands = num / 1000;
    return `${thousands.toFixed(thousands % 1 === 0 ? 0 : 1)}K+`;
  }
  return `${num}+`;
}

