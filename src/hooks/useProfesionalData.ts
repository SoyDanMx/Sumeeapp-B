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

  const cacheKey = "sumeeapp/professional-dashboard";

  const fetchData = useCallback(
    async (currentUserId: string) => {
      if (!currentUserId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const [profesionalResult, openLeadsResult] = await Promise.all([
          supabase
            .from("profiles")
            .select("*")
            .eq("user_id", currentUserId)
            .single(),
          supabase.rpc("get_open_leads_for_professional", {
            professional_id: currentUserId,
          }),
        ]);

        if (profesionalResult.error) {
          throw profesionalResult.error;
        }
        if (openLeadsResult.error) {
          throw openLeadsResult.error;
        }

        const profesionalData = profesionalResult.data as Profesional;
        const leadsData = (openLeadsResult.data as Lead[]) || [];

        setProfesional(profesionalData);
        setLeads(leadsData);

        try {
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({
              updatedAt: Date.now(),
              profesional: profesionalData,
              leads: leadsData,
            })
          );
        } catch {
          /* ignore cache write failures */
        }

        if (profesionalData?.disponibilidad !== "disponible") {
          try {
            await supabase
              .from("profiles")
              .update({ disponibilidad: "disponible" })
              .eq("user_id", currentUserId)
              .throwOnError();
          } catch {
            /* ignore availability updates that fail */
          }
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al obtener los datos.";
        setError(errorMessage);
        setProfesional(null);
      } finally {
        setIsLoading(false);
      }
    },
    [cacheKey]
  );

  const refetchData = useCallback(() => {
    if (user?.id) {
      fetchData(user.id);
    }
  }, [user?.id, fetchData]);

  useEffect(() => {
    let isMounted = true;
    let authListener: { subscription: { unsubscribe: () => void } } | null =
      null;
    let timeoutId: NodeJS.Timeout | null = null;

    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as {
          updatedAt: number;
          profesional: Profesional;
          leads: Lead[];
        };
        setProfesional(parsed.profesional);
        setLeads(parsed.leads);
        setIsLoading(false);
      }
    } catch {
      /* ignore cache read failures */
    }

    // Timeout de seguridad para evitar que se quede cargando indefinidamente
    timeoutId = setTimeout(() => {
      if (isMounted) {
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
        setUser(currentUser);

        if (currentUser) {
          await fetchData(currentUser.id);
        } else {
          setProfesional(null);
          setLeads([]);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Error al obtener la sesión de usuario");
          setIsLoading(false);
        }
        if (timeoutId) clearTimeout(timeoutId);
      });

    // Escuchar cambios de autenticación
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return;

        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await fetchData(currentUser.id);
        } else {
          setProfesional(null);
          setLeads([]);
          setIsLoading(false);
        }
      }
    );

    authListener = listener;

    return () => {
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
