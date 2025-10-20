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
    profession: string | null; // Añadido para consistencia con ProfessionalDashboard
    membership_status?: 'free' | 'basic'; // Opcional por si no todos lo tienen
    status?: 'active' | 'inactive'; // Opcional por si no todos lo tienen
    bio?: string | null; // Opcional
    avatar_url?: string | null; // Opcional
    work_zones?: string[] | null; // Opcional
    work_photos_urls?: string[] | null; // Opcional
    whatsapp: string | null;
    numero_imss: string | null;
    descripcion_perfil: string | null;
    experiencia_uber: boolean;
    años_experiencia_uber: number | null;
    areas_servicio: string[] | null;
  
    // --- CAMPOS AÑADIDOS PARA SOLUCIONAR EL ÚLTIMO ERROR ---
    ubicacion_lat: number | null;
    ubicacion_lng: number | null;
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