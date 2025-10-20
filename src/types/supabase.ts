// src/types/supabase.ts

/**
 * @file Definiciones de tipos basadas en el esquema de la base de datos de Supabase.
 * ESTA ES LA ÚNICA FUENTE DE VERDAD PARA NUESTRAS ESTRUCTURAS DE DATOS.
 */

export interface Profesional {
    // ... Tu interfaz Profesional completa y ya corregida ...
    id: string; 
    user_id: string;
    full_name: string | null;
    email: string | null;
    whatsapp: string | null;
    numero_imss: string | null;
    descripcion_perfil: string | null;
    experiencia_uber: boolean;
    años_experiencia_uber: number | null;
    areas_servicio: string[] | null;
    // ... etc ...
  }
  
  // --- INTERFAZ 'LEAD' FINAL, BASADA EN LA ESTRUCTURA EXACTA DE TU TABLA ---
  
  /**
   * Representa un Lead o solicitud de trabajo, coincidiendo 1:1 con la tabla `public.leads`.
   */
  export interface Lead {
    id: string; // Corresponde a `uuid`
    nombre_cliente: string | null; // Corresponde a `text`
    whatsapp: string | null; // Corresponde a `text`
    descripcion_proyecto: string | null; // Corresponde a `text`
    
    // `double precision` en PostgreSQL se representa como `number` en TypeScript.
    ubicacion_lat: number | null; 
    ubicacion_lng: number | null; 
    
    // `timestamp with time zone` se recibe como un string en formato ISO.
    fecha_creacion: string; 
    
    // `estado` es de tipo `text`, pero podemos hacerlo más seguro en el frontend.
    estado: 'nuevo' | 'contactado' | 'en_progreso' | 'completado' | 'cancelado' | string | null;
    
    // `profesional_asignado_id` es una clave foránea a la tabla de usuarios.
    profesional_asignado_id: string | null;
  }