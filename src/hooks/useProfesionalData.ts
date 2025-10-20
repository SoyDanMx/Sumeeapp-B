// src/hooks/useProfesionalData.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client'; // Asegúrate de que esta ruta sea correcta
import { Profesional, Lead } from '@/types/supabase'; // Asumiendo que definiste estos tipos

// Define un tipo de retorno completo incluyendo la función de refresco
interface ProfesionalData {
  profesional: Profesional | null;
  leads: Lead[] | null;
  isLoading: boolean;
  error: any;
  refetchData: () => void; // Función para recargar los datos
}

export function useProfesionalData(): ProfesionalData {
  const [data, setData] = useState<Omit<ProfesionalData, 'refetchData'>>({
    profesional: null,
    leads: null,
    isLoading: true,
    error: null,
  });

  // Usamos un estado para almacenar el ID del usuario autenticado
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Función principal para obtener y establecer los datos
  const fetchData = useCallback(async (userId: string) => {
    setData((prev) => ({ ...prev, isLoading: true, error: null }));
    
    // 1. Obtener el perfil COMPLETO del profesional
    const { data: profesional, error: profError } = await supabase
      .from('profiles')
      .select(`
        user_id, 
        full_name, 
        email, 
        role,
        experiencia_uber, 
        años_experiencia_uber, 
        areas_servicio, 
        ubicacion_lat, 
        ubicacion_lng,
        whatsapp,
        numero_imss,
        calificacion_promedio,
        descripcion_perfil
      `)
      .eq('user_id', userId)
      .single();

    if (profError) {
      setData((prev) => ({ ...prev, isLoading: false, error: profError }));
      return;
    }

    // 2. Obtener los leads asignados a este profesional
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .eq('profesional_asignado_id', userId) // Usamos el ID de autenticación (UUID)
      .order('fecha_creacion', { ascending: false });

    if (leadsError) {
      setData((prev) => ({ ...prev, isLoading: false, error: leadsError }));
      return;
    }

    // 3. Actualizar el estado con los datos obtenidos
    setData({
      profesional: profesional as Profesional,
      leads: leads as Lead[],
      isLoading: false,
      error: null,
    });
  }, []); // Dependencia vacía

  // Función envoltorio para el refetch
  const refetchData = useCallback(() => {
    if (currentUserId) {
        fetchData(currentUserId);
    }
  }, [currentUserId, fetchData]);


  // ----------------------------------------------------
  // Implementación de useEffect (Carga Inicial y Realtime)
  // ----------------------------------------------------

  useEffect(() => {
    let leadsChannel: any = null;
    
    // 1. Obtener usuario y establecer currentUserId
    const getInitialUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        fetchData(user.id);
      } else {
        setData({ profesional: null, leads: null, isLoading: false, error: 'User not authenticated' });
      }
    };
    getInitialUser();

    // 2. Realtime (solo si el usuario está autenticado)
    if (currentUserId) {
        // Suscribirse a cambios en los leads ASIGNADOS A ESTE USUARIO
        leadsChannel = supabase
          .channel('leads_changes')
          .on(
            'postgres_changes',
            { 
                event: '*', 
                schema: 'public', 
                table: 'leads',
                // 💡 CORRECCIÓN: Filtrar solo los cambios del profesional actual
                filter: `profesional_asignado_id=eq.${currentUserId}` 
            }, 
            () => {
              // Recargar los datos cuando haya un cambio relevante
              console.log('Realtime change detected. Refetching data...');
              fetchData(currentUserId); 
            }
          )
          .subscribe();
    }
      
    // Función de limpieza
    return () => {
        if (leadsChannel) {
            supabase.removeChannel(leadsChannel);
        }
    };
  }, [currentUserId, fetchData]); // Dependencia en currentUserId para iniciar Realtime


  // Retornamos los datos y la función de refresco
  return { ...data, refetchData };
}