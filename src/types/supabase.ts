// src/types/supabase.ts
export interface Profesional {
    user_id: string; // UUID
    full_name: string;
    email: string;
    experiencia_uber: boolean;
    años_experiencia_uber: number;
    areas_servicio: string[];
    ubicacion_lat: number;
    ubicacion_lng: number;
    // ... otros campos
  }
  
  export interface Lead {
    id: string; // UUID
    nombre_cliente: string;
    whatsapp: string;
    descripcion_proyecto: string;
    ubicacion_lat: number;
    ubicacion_lng: number;
    estado: 'Nuevo' | 'Contactado' | 'En Proceso' | 'Cerrado';
    profesional_asignado_id: string; // UUID
  }