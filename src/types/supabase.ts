// src/types/supabase.ts

/**
 * @file Definiciones de tipos basadas en el esquema de la base de datos de Supabase.
 * ESTA ES LA ÚNICA FUENTE DE VERDAD PARA LA ESTRUCTURA DEL PERFIL PROFESIONAL.
 */

// Si tienes más tipos generados por Supabase, déjalos, pero asegúrate
// de que la interfaz Profesional quede como se muestra a continuación.
export interface Profesional {
    // --- Campos básicos que probablemente ya tenías ---
    id: string; // O number, dependiendo de tu BD
    user_id: string;
    full_name: string | null;
    email: string | null;
    // ... cualquier otro campo que ya tuvieras ...
  
    // --- CAMPOS NECESARIOS PARA EditProfileModal.tsx ---
    // Estos son los campos que estaban causando el error de compilación.
    
    whatsapp: string | null;
    numero_imss: string | null;
    descripcion_perfil: string | null;
    experiencia_uber: boolean;
    años_experiencia_uber: number | null;
    areas_servicio: string[] | null;
  }
  
  // Si tienes otras interfaces en este archivo, puedes dejarlas.
  // Lo crucial es que la interfaz 'Profesional' esté completa.