// src/types/index.ts

export interface ProfessionalProfile {
    user_id: string;
    full_name: string;
    profession: string | string[]; // Puede ser string o array de strings
    work_area: string;
    avatar_url?: string;
    rating?: number;
    review_count?: number;
    bio_short?: string;
    // Añade aquí cualquier otro campo relevante de tu tabla de perfiles de Supabase
    stripe_customer_id?: string; // Para el mapeo de Stripe Customer ID
    membership_s?: string; // Para la membresía (free/premium)
    // La columna 'location' en Supabase es tipo GEOGRAPHY, en TS la manejamos como coordenadas o no la incluimos si no se usa directamente en frontend.
    // Si la incluyeras para algo, sería: location?: { type: 'Point', coordinates: [number, number] };
  }
  
  // Puedes añadir más interfaces aquí según necesites para otros componentes
  export interface Service {
    name: string;
    rating: number;
    image: string;
    description?: string; // Por si lo añades a los datos de servicios
  }
  
  // Definimos SelectedLocation aquí también para tenerlo centralizado
  export interface SelectedLocation {
    lat: number;
    lon: number;
    address: string;
  }