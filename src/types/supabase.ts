// src/types/supabase.ts

import { User } from '@supabase/supabase-js';

/**
 * @file Definiciones de tipos basadas en el esquema de la base de datos de Supabase.
 * Compatible con el esquema de 3 tablas: profiles, profesionales, leads
 */

// =========================================================================
// TIPOS BASE
// =========================================================================

export type UserRole = 'client' | 'profesional';

export type LeadEstado = 'buscando' | 'aceptado' | 'nuevo' | 'contactado' | 'en_progreso' | 'completado' | 'cancelado';

export type ServiceCategory = 'Urgencias' | 'Mantenimiento' | 'Tecnología' | 'Especializado' | 'Construcción';

// =========================================================================
// INTERFAZ PARA SERVICES (NUEVA TABLA)
// =========================================================================
/**
 * Representa un servicio disponible en la plataforma
 * Corresponde a la tabla public.services
 */
export interface Service {
  id: string; 
  created_at: string;
  updated_at: string;
  name: string;
  slug: string;
  description: string | null;
  icon_name: string;
  is_popular: boolean;
  category: ServiceCategory;
  hero_image_url: string | null;
  thumbnail_image_url: string | null;
  background_color: string | null;
}

// =========================================================================
// INTERFAZ PARA PROFILES (ESQUEMA REAL)
// =========================================================================
/**
 * Representa un perfil de usuario (tanto clientes como profesionales)
 * Corresponde a la tabla public.profiles del esquema real
 */
export interface Profile {
  id: number;
  created_at: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  profession?: string | null;
  experience?: number | null;
  avatar_url?: string | null;
  bio?: string | null;
  work_photos_urls?: string | null;
  membership_status: 'free' | 'basic' | 'premium';
  stripe_customer_id?: string | null;
  status: 'active' | 'inactive';
  work_zones?: string[] | null;
  experiencia_uber: boolean;
  años_experiencia_uber: number;
  areas_servicio?: string[] | null;
  ubicacion_lat?: number | null;
  ubicacion_lng?: number | null;
  whatsapp?: string | null;
  numero_imss?: string | null;
  calificacion_promedio: number;
  review_count?: number | null;
  descripcion_perfil?: string | null;
  role: UserRole;
  requests_used?: number | null;
  last_free_request_date?: string | null;
}

// =========================================================================
// INTERFAZ PARA PROFESIONALES (ALIAS DE PROFILE)
// =========================================================================
/**
 * Representa un profesional (alias de Profile con role 'profesional')
 * En el esquema real, los profesionales son profiles con role 'profesional'
 */
export interface Profesional extends Profile {
  // Los profesionales tienen todos los campos de Profile
  // pero con role = 'profesional' y campos específicos llenos
}

// =========================================================================
// INTERFAZ PARA LEADS (ESQUEMA REAL)
// =========================================================================
/**
 * Representa un lead o solicitud de servicio
 * Corresponde a la tabla public.leads del esquema real
 */
export interface Lead {
  id: string;
  nombre_cliente: string;
  whatsapp?: string | null;
  descripcion_proyecto: string;
  ubicacion_lat: number;
  ubicacion_lng: number;
  fecha_creacion: string; 
  estado: LeadEstado;
  profesional_asignado_id?: string | null;
  imagen_url?: string | null;
  servicio_solicitado?: string | null;
  urgencia?: string | null;
  cliente_id?: string | null;
  // Propiedad para datos del profesional asignado (obtenida via JOIN)
  profiles?: Partial<Profile> | null;
  profesional_asignado?: Partial<Profile> | null;
}

// =========================================================================
// INTERFAZ COMBINADA PARA PROFESIONAL COMPLETO
// =========================================================================
/**
 * Representa un profesional completo con datos de ambas tablas
 * Útil para consultas que necesitan información completa
 */
export interface ProfesionalCompleto extends Profile {
  // Datos específicos de profesionales
  profesional_id: string;
    profession: string;
  specialties: string[];
  experience_years: number;
    calificacion_promedio: number;
  ubicacion_lat?: number | null;
  ubicacion_lng?: number | null;
  ubicacion_direccion?: string | null;
  whatsapp?: string | null;
  descripcion_perfil?: string | null;
  certificaciones: string[];
  disponibilidad: string;
}

// =========================================================================
// INTERFAZ COMBINADA PARA LEAD COMPLETO
// =========================================================================
/**
 * Representa un lead completo con información de cliente y profesional
 * Útil para consultas que necesitan información completa
 */
export interface LeadCompleto extends Lead {
  // Información del cliente
  cliente_nombre?: string | null;
  cliente_email?: string | null;
  
  // Información del profesional asignado
  profesional_nombre?: string | null;
  profesional_email?: string | null;
  profesional_profesion?: string | null;
  profesional_whatsapp?: string | null;
}

// =========================================================================
// INTERFAZ PARA USUARIO DE LA APLICACIÓN
// =========================================================================
/**
 * Representa al usuario autenticado DENTRO de nuestra aplicación.
 * Combina el objeto User de Supabase con nuestro perfil personalizado.
 */
export interface AppUser extends User {
  profile?: Profile;
  profesional?: Profesional;
}

// =========================================================================
// TIPOS PARA FORMULARIOS
// =========================================================================

/**
 * Datos del formulario de registro de profesionales
 */
export interface ProfesionalRegistrationData {
  fullName: string;
  profession: string;
  phone: string;
  email: string;
  password: string;
  bio?: string;
  workZones?: string[];
}

/**
 * Datos del formulario de registro de clientes
 */
export interface ClienteRegistrationData {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

// =========================================================================
// TIPOS PARA CONSULTAS
// =========================================================================

/**
 * Parámetros para búsqueda de profesionales
 */
export interface ProfesionalSearchParams {
  profession?: string;
  ubicacion_lat?: number;
  ubicacion_lng?: number;
  radio_km?: number;
  disponibilidad?: string;
  calificacion_minima?: number;
  limit?: number;
  offset?: number;
}

/**
 * Parámetros para búsqueda de leads
 */
export interface LeadSearchParams {
  cliente_id?: string;
  profesional_asignado_id?: string;
  estado?: LeadEstado;
  servicio?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  limit?: number;
  offset?: number;
}

// =========================================================================
// TIPOS PARA RESPUESTAS DE API
// =========================================================================

/**
 * Respuesta estándar para operaciones de base de datos
 */
export interface DatabaseResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

/**
 * Respuesta para listas paginadas
 */
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
}

// =========================================================================
// TIPOS PARA ESTADOS DE COMPONENTES
// =========================================================================

/**
 * Estado de carga para hooks y componentes
 */
export interface LoadingState {
  loading: boolean;
  error: string | null;
}

/**
 * Estado extendido con datos
 */
export interface DataState<T> extends LoadingState {
  data: T | null;
}

// =========================================================================
// TIPOS PARA VALIDACIÓN
// =========================================================================

/**
 * Errores de validación de formularios
 */
export interface ValidationErrors {
  fullName?: string;
  profession?: string;
  phone?: string;
  email?: string;
  password?: string;
  bio?: string;
  workZones?: string;
}

// =========================================================================
// TIPOS PARA CONFIGURACIÓN
// =========================================================================

/**
 * Configuración de la aplicación
 */
export interface AppConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  app: {
    name: string;
    version: string;
    environment: 'development' | 'production' | 'test';
  };
}

// =========================================================================
// TIPOS PARA EVENTOS
// =========================================================================

/**
 * Eventos del sistema
 */
export type SystemEvent = 
  | 'user_registered'
  | 'user_verified'
  | 'lead_created'
  | 'lead_assigned'
  | 'lead_completed'
  | 'profesional_updated';

/**
 * Payload de eventos
 */
export interface EventPayload {
  event: SystemEvent;
  user_id?: string;
  data?: any;
  timestamp: string;
}