"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { Profesional, Lead } from "@/types/supabase";
import { PostgrestError, User } from "@supabase/supabase-js";

type UseProfesionalDataReturn = {
  profesional: Profesional | null;
  leads: Lead[];
  isLoading: boolean;
  error: PostgrestError | string | null;
  refetchData: () => void;
};

export function useProfesionalData(): UseProfesionalDataReturn {
  const [profesional, setProfesional] = useState<Profesional | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const fetchData = useCallback(async (currentUserId: string) => {
    if (!currentUserId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("🔍 Buscando datos para usuario:", currentUserId);

      const [profesionalResult, leadsResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("user_id", currentUserId)
          .single(),
        supabase
          .from("leads")
          .select("*")
          .eq("profesional_asignado_id", currentUserId)
          .order("fecha_creacion", { ascending: false }),
      ]);

      if (profesionalResult.error) {
        console.error("❌ Error obteniendo perfil:", profesionalResult.error);
        throw profesionalResult.error;
      }
      if (leadsResult.error) {
        console.error("❌ Error obteniendo leads:", leadsResult.error);
        throw leadsResult.error;
      }

      console.log("✅ Datos obtenidos:", {
        profesional: profesionalResult.data,
        leadsCount: leadsResult.data?.length || 0,
      });

      setProfesional(profesionalResult.data as Profesional);
      setLeads(leadsResult.data as Lead[]);
    } catch (err) {
      console.error("❌ Error fetching professional data:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error al obtener los datos.";
      setError(errorMessage);
      setProfesional(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetchData = useCallback(() => {
    if (user?.id) {
      fetchData(user.id);
    }
  }, [user?.id, fetchData]);

  useEffect(() => {
    console.log("🚀 Iniciando useProfesionalData hook");
    let isMounted = true;
    let authListener: { subscription: { unsubscribe: () => void } } | null =
      null;
    let timeoutId: NodeJS.Timeout | null = null;

    // Timeout de seguridad para evitar que se quede cargando indefinidamente
    timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn(
          "⚠️ Timeout: El hook lleva mucho tiempo cargando, estableciendo isLoading = false"
        );
        setIsLoading(false);
        setError("Tiempo de espera agotado. Por favor, recarga la página.");
      }
    }, 10000); // 10 segundos máximo

    // Obtener sesión inicial
    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        if (!isMounted) return;

        if (timeoutId) clearTimeout(timeoutId);

        const currentUser = session?.user ?? null;
        console.log(
          "🔍 Sesión obtenida:",
          currentUser ? `Usuario: ${currentUser.id}` : "Sin sesión"
        );
        setUser(currentUser);

        if (currentUser) {
          console.log(
            "👤 Usuario encontrado en sesión inicial:",
            currentUser.id
          );
          await fetchData(currentUser.id);
        } else {
          console.log(
            "❌ No hay usuario en sesión inicial - finalizando carga"
          );
          setProfesional(null);
          setLeads([]);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error("❌ Error obteniendo sesión:", error);
        if (isMounted) {
          setError("Error al obtener la sesión de usuario");
          setIsLoading(false);
        }
        if (timeoutId) clearTimeout(timeoutId);
      });

    // Escuchar cambios de autenticación
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        console.log("🔄 Auth state change:", event, session?.user?.id);

        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          console.log("👤 Usuario autenticado, obteniendo datos...");
          await fetchData(currentUser.id);
        } else {
          console.log("🚪 Usuario desautenticado, limpiando datos...");
          setProfesional(null);
          setLeads([]);
          setIsLoading(false);
        }
      }
    );

    authListener = listener;

    return () => {
      console.log("🧹 Limpiando auth listener");
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (authListener) {
        authListener.subscription.unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array vacío - solo ejecutar una vez al montar

  return { profesional, leads, isLoading, error, refetchData };
}
