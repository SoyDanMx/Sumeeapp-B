// src/lib/calculateDistance.ts
// Utilidad para calcular la distancia entre dos coordenadas (lat/lng) usando la fórmula de Haversine.

/**
 * Convierte grados a radianes.
 * @param degrees Valor en grados.
 * @returns Valor en radianes.
 */
function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Calcula la distancia entre dos coordenadas geográficas (lat, lng) en kilómetros.
 * Se utiliza la fórmula de Haversine.
 * * @param lat1 Latitud del punto 1 (Profesional)
 * @param lng1 Longitud del punto 1 (Profesional)
 * @param lat2 Latitud del punto 2 (Lead)
 * @param lng2 Longitud del punto 2 (Lead)
 * @returns Distancia en kilómetros.
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    
    // Si alguna coordenada es inválida o nula, devuelve 0 para evitar errores.
    if (lat1 === undefined || lng1 === undefined || lat2 === undefined || lng2 === undefined) {
        return 0;
    }

    const R = 6371; // Radio promedio de la Tierra en kilómetros

    // Diferencia de latitudes y longitudes en radianes
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    
    // Conversión de latitudes a radianes para la función Math.cos()
    const lat1Rad = toRadians(lat1);
    const lat2Rad = toRadians(lat2);

    // Fórmula de Haversine
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    const distance = R * c; // Distancia en km
    
    // Retorna la distancia redondeada a 1 decimal para mayor legibilidad en la UX.
    return parseFloat(distance.toFixed(1));
}