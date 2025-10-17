// src/types/index.ts

/**
 * @file Centralized TypeScript definitions for the entire Sumee application.
 * This file serves as the single source of truth for our data structures.
 */

/**
 * Represents the core user profile structure in our database.
 * This applies to both regular users and professionals.
 * A professional is identified by having a non-null 'profession' field.
 */
export interface Profile {
    id: string; // El ID único de la fila en la tabla de perfiles
    user_id: string; // El UUID que viene de Supabase Auth
    full_name: string;
    email: string;
    profession: string | null; // Clave para diferenciar profesionales de clientes
    membership_status: 'free' | 'basic'; // Tipo estricto para evitar errores
    status: 'active' | 'inactive';
    bio: string | null;
    avatar_url: string | null;
    work_zones: string[] | null; // Array para múltiples zonas, mucho más flexible
    work_photos_urls: string[] | null;
    stripe_customer_id?: string; // Opcional, para la integración con Stripe
  
    // Estructura para almacenar coordenadas geográficas, compatible con PostGIS y fácil de usar en mapas
    location: {
      lat: number;
      lng: number;
    } | null;
  }
  
  
  /**
   * Represents a single service offered, useful for landing pages or search categories.
   */
  export interface Service {
    id: string;
    name: string;
    description?: string;
    image_url: string;
  }
  
  
  /**
   * Represents a location selected by a user on a map, often for searching.
   */
  export interface SelectedLocation {
    lat: number;
    lng: number; // Estandarizado a 'lng' para compatibilidad con librerías de mapas
    address: string;
  }
  
  // Puedes seguir añadiendo más tipos centralizados aquí a medida que tu aplicación crezca.
  // Por ejemplo: Review, Project, Lead, etc.