// src/types/supabase.ts

/**
 * @file Definiciones de tipos basadas en el esquema de la base de datos de Supabase.
 * ESTA ES LA ÚNICA FUENTE DE VERDAD PARA NUESTRAS ESTRUCTURAS DE DATOS.
 */

export interface Profesional {
    id: string; 
    user_id: string;
    full_name: string | null;
    email: string | null;
    profession: string | null;
    membership_status?: 'free' | 'basic';
    status?: 'active' | 'inactive';
    bio?: string | null;
    avatar_url?: string | null;
    work_zones?: string[] | null;
    work_photos_urls?: string[] | null;
    whatsapp: string | null;
    numero_imss: string | null;
    descripcion_perfil: string | null;
    experiencia_uber: boolean;
    años_experiencia_uber: number | null;
    areas_servicio: string[] | null;
    ubicacion_lat: number | null;
    ubicacion_lng: number | null;
  
    // --- CAMPO AÑADIDO PARA SOLUCIONAR EL ÚLTIMO ERROR ---
    calificacion_promedio: number | null;
  }
  
  /**
   * Representa un Lead o solicitud de trabajo, coincidiendo 1:1 con la tabla `public.leads`.
   */
  export interface Lead {
    id: string;
    nombre_cliente: string | null;
    whatsapp: string | null;
    descripcion_proyecto: string | null;
    ubicacion_lat: number | null; 
    ubicacion_lng: number | null; 
    fecha_creacion: string; 
    estado: 'nuevo' | 'contactado' | 'en_progreso' | 'completado' | 'cancelado' | string | null;
    profesional_asignado_id: string | null;
  }