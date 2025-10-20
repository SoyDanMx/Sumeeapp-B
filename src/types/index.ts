// src/types/index.ts

/**
 * Este es el tipo que debes usar en todo tu proyecto.
 * Si en tu modal lo llamas 'Profesional', considera renombrarlo a 'Profile'
 * para mantener la consistencia, o renombra esta interfaz a 'Profesional'.
 * Lo importante es que haya UNA SOLA definición.
 */
export interface Profile { // O 'Profesional' si prefieres ese nombre
    id: string;
    user_id: string;
    full_name: string;
    email: string;
    profession: string | null;
    membership_status: 'free' | 'basic';
    status: 'active' | 'inactive';
    bio: string | null;
    avatar_url: string | null;
    work_zones: string[] | null;
    work_photos_urls: string[] | null;
    stripe_customer_id?: string;
    location: {
      lat: number;
      lng: number;
    } | null;
    
    // --- CAMPOS REQUERIDOS POR EditProfileModal.tsx ---
    
    whatsapp: string | null;
    numero_imss: string | null;
    descripcion_perfil: string | null;
    
    // `experiencia_uber` es un booleano (true/false)
    experiencia_uber: boolean;
  
    // `años_experiencia_uber` es un número
    años_experiencia_uber: number | null;
  
    // `areas_servicio` es un array de strings
    areas_servicio: string[] | null;
  }
  
  // ... (El resto de tus interfaces)