"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { Profesional, Lead } from "@/types/supabase";
import { PostgrestError, User } from "@supabase/supabase-js";
import { useUser } from "./useUser"; // ✅ OPTIMIZACIÓN: Usar hook useUser en lugar de consultas separadas

type UseProfesionalDataReturn = {
  profesional: Profesional | null;
  leads: Lead[];
  isLoading: boolean;
  error: PostgrestError | string | null;
  refetchData: () => void;
};

export function useProfesionalData(): UseProfesionalDataReturn {
  // ✅ OPTIMIZACIÓN: Usar useUser hook en lugar de manejar usuario separadamente
  const { user, isLoading: userLoading } = useUser();
  const [profesional, setProfesional] = useState<Profesional | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | string | null>(null);

  const cacheKey = "sumeeapp/professional-dashboard";

  const normalizeLead = useCallback((lead: Lead): Lead => {
    if (!lead) return lead;
    const estado = (lead.estado || "").toLowerCase();
    // ✅ Normalizar estados: "aceptado" y "asignado" → "en_progreso"
    if (estado === "aceptado" || estado === "asignado") {
      return { ...lead, estado: "en_progreso" };
    }
    return lead;
  }, []);

  const fetchData = useCallback(
    async (currentUserId: string) => {
      if (!currentUserId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // ✅ OPTIMIZACIÓN: Obtener perfil completo directamente (ya sabemos que es profesional)
        const profesionalResult = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", currentUserId)
          .single();

        if (profesionalResult.error) {
          // Si el perfil no existe, es un error crítico
          if (profesionalResult.error.code === "PGRST116") {
            // Si no hay perfil, retornar sin error (puede ser cliente)
            console.warn("⚠️ useProfesionalData - No se encontró perfil, puede ser cliente");
            setProfesional(null);
            setLeads([]);
            setIsLoading(false);
            return;
          }
          throw profesionalResult.error;
        }

        let profesionalData = profesionalResult.data as Profesional;
        
        // IMPORTANTE: Si el usuario es cliente, retornar inmediatamente sin hacer más queries
        if (profesionalData.role === 'client') {
          console.log("ℹ️ useProfesionalData - Usuario es cliente, retornando sin datos de profesional");
          setProfesional(null);
          setLeads([]);
          setIsLoading(false);
          return;
        }

        // Verificar que el usuario tiene rol de profesional
        // Si no tiene el rol correcto, intentar corregirlo automáticamente
        if (profesionalData.role !== "profesional") {
          // Si el rol es null o undefined, intentar actualizarlo automáticamente
          if (!profesionalData.role || profesionalData.role === null) {
            console.warn("⚠️ Perfil sin rol asignado, intentando actualizar a 'profesional'...");
            try {
              const { error: updateError } = await (supabase
                .from("profiles") as any)
                .update({ role: "profesional" })
                .eq("user_id", currentUserId);

              if (updateError) {
                console.error("❌ Error al actualizar rol:", updateError);
                // Continuar de todas formas, el usuario puede completar su perfil
              } else {
                // Recargar el perfil con el rol actualizado
                const { data: updatedProfile } = await supabase
                  .from("profiles")
                  .select("*")
                  .eq("user_id", currentUserId)
                  .single();
                
                if (updatedProfile) {
                  profesionalData = updatedProfile as Profesional;
                }
              }
            } catch (updateErr) {
              console.error("❌ Error al actualizar rol:", updateErr);
              // Continuar de todas formas
            }
          } else if (profesionalData.role === "client") {
            // Si el usuario es cliente, no es un error crítico, solo mostrar mensaje
            console.warn("⚠️ Usuario con rol 'client' intentando acceder al dashboard profesional");
            // Permitir acceso pero el dashboard mostrará un mensaje apropiado
            // No lanzar error, permitir que el usuario vea el dashboard
          }
        }

        // Intentar obtener los leads usando la función RPC
        let leadsData: Lead[] = [];
        const openLeadsResult = await (supabase.rpc as any)(
          "get_open_leads_for_professional",
          {
            professional_id: currentUserId,
          }
        );

        if (openLeadsResult.error) {
          // Si la función RPC falla, intentar obtener leads directamente
          console.warn(
            "⚠️ Error al obtener leads con RPC, intentando método alternativo:",
            openLeadsResult.error
          );

          // Método alternativo: obtener leads directamente
          const directLeadsResult = await supabase
            .from("leads")
            .select("*")
            .or(
              `profesional_asignado_id.is.null,profesional_asignado_id.eq.${currentUserId}`
            )
            .order("fecha_creacion", { ascending: false });

          if (directLeadsResult.error) {
            console.error(
              "❌ Error al obtener leads directamente:",
              directLeadsResult.error
            );
            // Continuar sin leads, pero mostrar el perfil
            leadsData = [];
          } else {
            leadsData = ((directLeadsResult.data as Lead[]) || []).map(
              normalizeLead
            );
          }
        } else {
          leadsData = ((openLeadsResult.data as Lead[]) || []).map(
            normalizeLead
          );
        }

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
            await (supabase
              .from("profiles") as any)
              .update({ disponibilidad: "disponible" })
              .eq("user_id", currentUserId)
              .throwOnError();
          } catch {
            /* ignore availability updates that fail */
          }
        }
      } catch (err) {
        console.error("❌ Error en useProfesionalData:", err);
        
        let errorMessage = "Error al obtener los datos.";
        
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (typeof err === "object" && err !== null) {
          // Manejar PostgrestError
          const postgresError = err as PostgrestError;
          if (postgresError.message) {
            errorMessage = postgresError.message;
          } else if (postgresError.code) {
            switch (postgresError.code) {
              case "PGRST116":
                errorMessage =
                  "No se encontró tu perfil. Por favor, completa tu registro.";
                break;
              case "42501":
                errorMessage =
                  "No tienes permisos para acceder a estos datos. Por favor, contacta al soporte.";
                break;
              default:
                errorMessage = `Error de base de datos: ${postgresError.code}`;
            }
          }
        } else if (typeof err === "string") {
          errorMessage = err;
        }

        setError(errorMessage);
        setProfesional(null);
        setLeads([]);
      } finally {
        setIsLoading(false);
      }
    },
    [cacheKey, normalizeLead]
  );

  const refetchData = useCallback(() => {
    // ✅ FIX: Invalidar caché antes de refetch para evitar datos obsoletos
    try {
      sessionStorage.removeItem(cacheKey);
    } catch {
      /* ignore cache removal failures */
    }
    if (user?.id) {
      fetchData(user.id);
    }
  }, [user?.id, fetchData, cacheKey]);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    // ✅ OPTIMIZACIÓN: Timeout más inteligente - solo si realmente está bloqueado
    timeoutId = setTimeout(() => {
      if (isMounted && isLoading) {
        if (!user) {
          console.warn("⚠️ useProfesionalData - Timeout: sin usuario después de 5s");
          setIsLoading(false);
        } else {
          // Si hay usuario pero aún carga, dar 3s más
          setTimeout(() => {
            if (isMounted && isLoading) {
              console.warn("⚠️ useProfesionalData - Timeout extendido: forzando setIsLoading(false) después de 8s");
              setIsLoading(false);
            }
          }, 3000);
        }
      }
    }, 5000); // Reducido de 15s a 5s inicial + 3s extendido

    // ✅ OPTIMIZACIÓN: Usar el hook useUser en lugar de getSession
    if (userLoading) {
      setIsLoading(true);
      return () => {
        isMounted = false;
        if (timeoutId) clearTimeout(timeoutId);
      };
    }

    if (!user) {
      // No hay usuario, no cargar datos
      setProfesional(null);
      setLeads([]);
      setIsLoading(false);
      if (timeoutId) clearTimeout(timeoutId);
      return () => {
        isMounted = false;
        if (timeoutId) clearTimeout(timeoutId);
      };
    }

    // ✅ OPTIMIZACIÓN: Usar el rol del hook useUser (ya viene del caché)
    // @ts-ignore - Supabase types inference issue
    const userRole = (user as any)?.role;
    
    if (userRole === 'client') {
      // Usuario es cliente, no cargar datos de profesional
      setProfesional(null);
      setLeads([]);
      setIsLoading(false);
      if (timeoutId) clearTimeout(timeoutId);
      return () => {
        isMounted = false;
        if (timeoutId) clearTimeout(timeoutId);
      };
    }

    // Verificar caché primero
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as {
          updatedAt: number;
          profesional: Profesional;
          leads: Lead[];
        };
        const cacheAge = Date.now() - parsed.updatedAt;
        const MAX_CACHE_AGE = 2 * 60 * 1000; // 2 minutos
        
        if (cacheAge < MAX_CACHE_AGE) {
          setProfesional(parsed.profesional);
          setLeads(parsed.leads.map(normalizeLead));
          setIsLoading(false);
          if (timeoutId) clearTimeout(timeoutId);
          // Fetch en background para actualizar si hay cambios
          fetchData(user.id).catch(() => {
            // Si falla, mantener el caché
          });
          return () => {
            isMounted = false;
            if (timeoutId) clearTimeout(timeoutId);
          };
        } else {
          sessionStorage.removeItem(cacheKey);
        }
      }
    } catch {
      /* ignore cache read failures */
    }

    // Usuario es profesional, cargar datos
    setIsLoading(true);
    fetchData(user.id);

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
    // ✅ OPTIMIZACIÓN: Depender de user y userLoading del hook useUser
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, userLoading]); // Ejecutar cuando cambie el usuario o su estado de carga

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`professional-leads-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leads" },
        (payload) => {
          const newRecord = payload.new as Lead | null;
          const oldRecord = payload.old as Lead | null;

          setLeads((previous) => {
            let next = [...previous];

            const removeLead = (id?: string | null) => {
              if (!id) return;
              next = next.filter((lead) => lead.id !== id);
            };

            const upsertLead = (lead: Lead) => {
              const index = next.findIndex((item) => item.id === lead.id);
              if (index >= 0) {
                next[index] = lead;
              } else {
                next.push(lead);
              }
            };

            const shouldInclude = (lead: Lead | null) => {
              if (!lead) return false;
              const assignedToUser =
                lead.profesional_asignado_id === user.id ||
                lead.profesional_asignado_id === user.id?.toString();
              return assignedToUser || lead.profesional_asignado_id === null;
            };

            switch (payload.eventType) {
              case "INSERT": {
                if (shouldInclude(newRecord)) {
                  upsertLead(normalizeLead(newRecord as Lead));
                }
                break;
              }
              case "UPDATE": {
                const includeNew = shouldInclude(newRecord);
                const includeOld = shouldInclude(oldRecord);

                if (includeNew) {
                  upsertLead(normalizeLead(newRecord as Lead));
                } else {
                  removeLead(newRecord?.id);
                }

                if (!includeNew && includeOld) {
                  removeLead(oldRecord?.id);
                }

                break;
              }
              case "DELETE": {
                removeLead(oldRecord?.id);
                break;
              }
              default:
                break;
            }

            return next;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [normalizeLead, user?.id]);

  return { profesional, leads, isLoading, error, refetchData };
}
