// src/types/supabase.ts

import { User } from "@supabase/supabase-js";

/**
 * @file Definiciones de tipos basadas en el esquema de la base de datos de Supabase.
 * Compatible con el esquema de 3 tablas: profiles, profesionales, leads
 */

// =========================================================================
// TIPOS BASE
// =========================================================================

export type UserRole = "client" | "profesional";

export type LeadEstado =
  | "buscando"
  | "aceptado"
  | "nuevo"
  | "contactado"
  | "en_progreso"
  | "en_camino"
  | "completado"
  | "cancelado";

export type LeadAppointmentStatus =
  | "pendiente_contacto"
  | "contactado"
  | "pendiente_confirmacion"
  | "confirmada"
  | "completado"
  | "no_show_profesional"
  | "no_show_cliente"
  | "cancelada";

export interface LeadReview {
  id: string;
  lead_id: string;
  rating: number;
  comment?: string | null;
  created_at: string;
  created_by: string;
}

export type ServiceCategory =
  | "Urgencias"
  | "Mantenimiento"
  | "Tecnología"
  | "Especializado"
  | "Construcción";

// =========================================================================
// INTERFAZ PARA ITEMS DE PORTFOLIO
// =========================================================================
/**
 * Representa un item del portfolio de un profesional
 */
export interface PortfolioItem {
  url: string; // URL de la imagen en Supabase Storage
  description: string; // Descripción del trabajo (ej: "Instalación de bombas hidroneumáticas")
  type?: string; // Tipo de trabajo (opcional, para categorización)
}

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
  portfolio?: PortfolioItem[] | null; // Array de objetos con url, description, type
  certificaciones_urls?: string[] | null; // Array de URLs a certificaciones
  antecedentes_no_penales_url?: string | null; // URL a constancia de antecedentes
  stripe_customer_id?: string | null;
  status: "active" | "inactive";
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
  city?: string | null;
  sub_city_zone?: string | null; // Delegación, alcaldía o zona específica (ej: Coyoacán, Benito Juárez)
  postal_code?: string | null; // Código postal del usuario
  onboarding_status?:
    | "approved"
    | "pending_review"
    | "waitlist_other_city"
    | "rejected";
  disponibilidad?: "disponible" | "no_disponible" | "ocupado" | null;
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
  ubicacion_direccion?: string | null;
  fecha_creacion: string;
  fecha_asignacion?: string | null;
  estado: LeadEstado;
  profesional_asignado_id?: string | null;
  imagen_url?: string | null;
  servicio_solicitado?: string | null;
  servicio?: string | null; // Campo alternativo para servicio
  urgencia?: string | null;
  cliente_id?: string | null;
  photos_urls?: string[] | null;
  contact_deadline_at?: string | null;
  contacted_at?: string | null;
  contact_method?: string | null;
  contact_notes?: string | null;
  appointment_at?: string | null;
  appointment_confirmed_at?: string | null;
  appointment_status?: LeadAppointmentStatus | null;
  appointment_notes?: string | null;
  work_completed_at?: string | null;
  work_completion_notes?: string | null;
  engagement_points?: number | null;
  lead_review?: LeadReview | null;
  disciplina_ia?: string | null;
  urgencia_ia?: number | null;
  diagnostico_ia?: string | null;
  // Campos de confirmación de acuerdo final
  agreed_price?: number | null;
  agreed_scope?: string | null;
  negotiation_status?: 'asignado' | 'propuesta_enviada' | 'propuesta_aceptada' | 'acuerdo_confirmado' | 'cancelado_pro' | 'cancelado_cliente' | 'rechazado_cliente' | null;
  agreed_at?: string | null;
  agreed_by?: string | null;
  // Campos de cotización con partidas
  quote_items?: Array<{
    concepto: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
  }> | null;
  quote_sent_at?: string | null;
  quote_sent_by?: string | null;
  quote_accepted_at?: string | null;
  quote_accepted_by?: string | null;
  // Campos de control de precios (sugerencia por IA)
  ai_suggested_price_min?: number | null;
  ai_suggested_price_max?: number | null;
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
  // disponibilidad ya está definido en Profile, pero lo overrideamos aquí si es necesario
  disponibilidad?: "disponible" | "no_disponible" | "ocupado" | null;
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
  city?: string;
  work_zones_other?: string;
  locationAddress?: string;
  ubicacionLat?: number;
  ubicacionLng?: number;
  experience?: number; // Años de experiencia profesional
  areas_servicio?: string[]; // Especialidades/áreas de servicio
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
  city?: string;
  location?: string;
  experience?: string; // Años de experiencia
  areas_servicio?: string; // Áreas de servicio
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
    environment: "development" | "production" | "test";
  };
}

// =========================================================================
// TIPOS PARA EVENTOS
// =========================================================================

/**
 * Eventos del sistema
 */
export type SystemEvent =
  | "user_registered"
  | "user_verified"
  | "lead_created"
  | "lead_assigned"
  | "lead_completed"
  | "profesional_updated";

/**
 * Payload de eventos
 */
export interface EventPayload {
  event: SystemEvent;
  user_id?: string;
  data?: any;
  timestamp: string;
}
