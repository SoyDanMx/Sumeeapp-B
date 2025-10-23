'use client';

import { useEffect, useState, useCallback } from 'react';
// Usamos el cliente del NAVEGADOR
import { supabase } from '@/lib/supabase/client-new';
import { Profesional, Lead } from '@/types/supabase';
import { PostgrestError } from '@supabase/supabase-js';

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
  const [isLoading, setIsLoading] = useState(true); // Empezamos cargando por defecto
  const [error, setError] = useState<PostgrestError | string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchData = useCallback(async (currentUserId: string) => {
    // Si no hay ID, no hacemos nada.
    if (!currentUserId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const [profesionalResult, leadsResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', currentUserId)
          .single(),
        supabase
          .from('leads')
          .select('*')
          .eq('profesional_asignado_id', currentUserId)
          .order('fecha_creacion', { ascending: false })
      ]);

      if (profesionalResult.error) throw profesionalResult.error;
      if (leadsResult.error) throw leadsResult.error;

      setProfesional(profesionalResult.data as Profesional);
      setLeads(leadsResult.data as Lead[]);

    } catch (err: any) {
      console.error("Error fetching professional data:", err);
      setError(err.message || 'Error al obtener los datos.');
      setProfesional(null); // Limpiamos el perfil si hay error
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetchData = useCallback(() => {
    if (userId) {
      fetchData(userId);
    }
  }, [userId, fetchData]);

  useEffect(() => {
    // --- LA LÓGICA CLAVE ESTÁ AQUÍ ---
    // Usamos onAuthStateChange para reaccionar a los cambios de sesión.
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUserId = session?.user?.id ?? null;
      setUserId(currentUserId);

      if (currentUserId) {
        // Solo obtenemos los datos si hay un ID de usuario.
        fetchData(currentUserId);
      } else {
        // Si no hay sesión (logout), limpiamos los datos y paramos la carga.
        setProfesional(null);
        setLeads([]);
        setIsLoading(false);
      }
    });

    // Limpiamos el listener al desmontar el componente.
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchData]);

  return { profesional, leads, isLoading, error, refetchData };
}
