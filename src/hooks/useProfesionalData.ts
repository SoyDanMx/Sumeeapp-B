// src/hooks/useProfesionalData.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
// 1. IMPORTAMOS los tipos centralizados. Ya no definimos nada localmente.
import { Profesional, Lead } from '@/types/supabase';
import { PostgrestError } from '@supabase/supabase-js'; // Tipo oficial para errores de Supabase

// 2. DEFINIMOS el tipo del valor de retorno del hook de forma más limpia.
// Esto describe lo que el hook devuelve, sin necesidad de una interfaz interna.
type UseProfesionalDataReturn = {
  profesional: Profesional | null;
  leads: Lead[]; // Inicializamos como array vacío en lugar de null para evitar comprobaciones.
  isLoading: boolean;
  error: PostgrestError | string | null;
  refetchData: () => void;
};

// El hook ahora se declara que devuelve el tipo que acabamos de definir.
export function useProfesionalData(): UseProfesionalDataReturn {
  const [profesional, setProfesional] = useState<Profesional | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchData = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Usamos Promise.all para ejecutar ambas consultas en paralelo, es más eficiente.
      const [profesionalResult, leadsResult] = await Promise.all([
        supabase
          .from('profiles') // Asumiendo que tu tabla de profesionales es 'profiles'
          .select('*') // Seleccionamos todo para que coincida con la interfaz completa
          .eq('user_id', userId)
          .single(),
        supabase
          .from('leads')
          .select('*')
          .eq('profesional_asignado_id', userId)
          .order('fecha_creacion', { ascending: false })
      ]);

      if (profesionalResult.error) throw profesionalResult.error;
      if (leadsResult.error) throw leadsResult.error;

      // Actualizamos los estados con los datos obtenidos
      setProfesional(profesionalResult.data as Profesional);
      setLeads(leadsResult.data as Lead[]);

    } catch (err: any) {
      console.error("Error fetching professional data:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetchData = useCallback(() => {
    if (currentUserId) {
      fetchData(currentUserId);
    } else {
      console.warn("refetchData called without a current user.");
    }
  }, [currentUserId, fetchData]);

  useEffect(() => {
    let leadsChannel: ReturnType<typeof supabase.channel> | null = null;
    
    const initialize = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        fetchData(user.id);
      } else {
        setIsLoading(false);
        setError('User not authenticated');
      }
    };
    initialize();

    // El listener de Realtime se activa una vez que tenemos el ID del usuario
    if (currentUserId) {
      leadsChannel = supabase
        .channel(`leads_changes_for_${currentUserId}`)
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'leads',
            filter: `profesional_asignado_id=eq.${currentUserId}` 
          }, 
          (payload) => {
            console.log('Realtime change detected:', payload);
            refetchData();
          }
        )
        .subscribe();
    }
      
    return () => {
      if (leadsChannel) {
        supabase.removeChannel(leadsChannel);
      }
    };
  }, [currentUserId, fetchData, refetchData]);

  // Retornamos un objeto con una estructura clara y bien tipada.
  return { profesional, leads, isLoading, error, refetchData };
}