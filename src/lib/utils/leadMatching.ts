import { Lead, Profesional } from "@/types/supabase";
import { calculateDistance } from "@/lib/calculateDistance";

/**
 * Verifica si un lead coincide con el perfil del profesional
 * @param lead El lead a verificar
 * @param profesional El perfil del profesional
 * @param profesionalLat Latitud actual del profesional (opcional)
 * @param profesionalLng Longitud actual del profesional (opcional)
 * @param maxDistanceKm Distancia máxima en km (default: 20km)
 * @returns true si el lead coincide con el perfil
 */
export function matchesProfessionalProfile(
  lead: Lead,
  profesional: Profesional,
  profesionalLat?: number,
  profesionalLng?: number,
  maxDistanceKm: number = 20
): boolean {
  // 1. Verificar que el lead esté en estado "nuevo"
  if (lead.estado?.toLowerCase() !== "nuevo") {
    return false;
  }

  // 2. Verificar que el profesional esté disponible
  if (profesional.disponibilidad?.toLowerCase() !== "disponible") {
    return false;
  }

  // 3. Verificar coincidencia de servicio/especialidad (si aplica)
  if (lead.servicio_solicitado && profesional.areas_servicio && profesional.areas_servicio.length > 0) {
    const servicioLead = lead.servicio_solicitado.toLowerCase();
    const especialidades = profesional.areas_servicio.map(area => area.toLowerCase());
    
    // Verificar si alguna especialidad coincide con el servicio solicitado
    const matchesService = especialidades.some(especialidad => {
      // Coincidencia exacta o parcial
      return servicioLead.includes(especialidad) || especialidad.includes(servicioLead);
    });

    // Si el profesional tiene especialidades definidas y ninguna coincide, rechazar
    // Pero si no tiene especialidades definidas, permitir (flexibilidad)
    if (profesional.areas_servicio[0] !== "Sin definir" && !matchesService) {
      return false;
    }
  }

  // 4. Verificar distancia (si tenemos ubicación del profesional y del lead)
  if (
    profesionalLat &&
    profesionalLng &&
    lead.ubicacion_lat != null &&
    lead.ubicacion_lng != null
  ) {
    const distance = calculateDistance(
      profesionalLat,
      profesionalLng,
      lead.ubicacion_lat,
      lead.ubicacion_lng
    );

    if (distance > maxDistanceKm) {
      return false;
    }
  } else if (lead.ubicacion_lat == null || lead.ubicacion_lng == null) {
    // Si el lead no tiene ubicación, no podemos determinar si es cercano
    // Por ahora, permitimos el lead (se puede ajustar según necesidades)
    // return false; // Descomentar si queremos rechazar leads sin ubicación
  }

  // 5. Verificar zonas de trabajo (si están definidas)
  // TODO: Implementar verificación de polígonos GeoJSON cuando se implemente esa funcionalidad
  // Por ahora, si tiene work_zones definidas, se puede hacer match básico
  if (profesional.work_zones && profesional.work_zones.length > 0) {
    // Por ahora, si tiene zonas definidas, permitir el lead
    // En el futuro, verificar si el lead está dentro de alguna zona
  }

  // Si pasa todas las verificaciones, el lead coincide
  return true;
}

/**
 * Obtiene la distancia del lead al profesional en formato legible
 */
export function getLeadDistanceText(
  lead: Lead,
  profesionalLat?: number,
  profesionalLng?: number
): string {
  if (
    !profesionalLat ||
    !profesionalLng ||
    lead.ubicacion_lat == null ||
    lead.ubicacion_lng == null
  ) {
    return "Distancia desconocida";
  }

  const distance = calculateDistance(
    profesionalLat,
    profesionalLng,
    lead.ubicacion_lat,
    lead.ubicacion_lng
  );

  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  } else {
    return `${distance.toFixed(1)} km`;
  }
}
