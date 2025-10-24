'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Profesional, Lead } from '@/types/supabase';
import { PostgrestError, User } from '@supabase/supabase-js';

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
      console.log('🔍 Buscando datos para usuario:', currentUserId);
      
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

      if (profesionalResult.error) {
        console.error('❌ Error obteniendo perfil:', profesionalResult.error);
        throw profesionalResult.error;
      }
      if (leadsResult.error) {
        console.error('❌ Error obteniendo leads:', leadsResult.error);
        throw leadsResult.error;
      }

      console.log('✅ Datos obtenidos:', { 
        profesional: profesionalResult.data, 
        leadsCount: leadsResult.data?.length || 0 
      });

      setProfesional(profesionalResult.data as Profesional);
      setLeads(leadsResult.data as Lead[]);

    } catch (err: any) {
      console.error("❌ Error fetching professional data:", err);
      setError(err.message || 'Error al obtener los datos.');
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
    console.log('🚀 Iniciando useProfesionalData hook');
    
    // Obtener sesión inicial
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        console.log('👤 Usuario encontrado en sesión inicial:', currentUser.id);
        fetchData(currentUser.id);
      } else {
        console.log('❌ No hay usuario en sesión inicial');
        setProfesional(null);
        setLeads([]);
        setIsLoading(false);
      }
    });

    // Escuchar cambios de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event, session?.user?.id);
      
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        console.log('👤 Usuario autenticado, obteniendo datos...');
        fetchData(currentUser.id);
      } else {
        console.log('🚪 Usuario desautenticado, limpiando datos...');
        setProfesional(null);
        setLeads([]);
        setIsLoading(false);
      }
    });

    return () => {
      console.log('🧹 Limpiando auth listener');
      authListener.subscription.unsubscribe();
    };
  }, [fetchData]);

  return { profesional, leads, isLoading, error, refetchData };
}