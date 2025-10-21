// src/app/api/professionals/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// --- Variables de Entorno ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// AÑADIR ESTOS CONSOLE.LOGS TEMPORALES
console.log('--- API Route /api/professionals START ---');
console.log('DEBUG: SUPABASE_URL cargada:', !!SUPABASE_URL);
console.log('DEBUG: SUPABASE_SERVICE_ROLE_KEY cargada:', !!SUPABASE_SERVICE_ROLE_KEY);

// Cliente de Supabase con la clave de rol de servicio (admin)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
console.log('DEBUG: Supabase Admin client inicializado.');


export const config = {
  api: {
    bodyParser: false,
  },
};

export async function GET(req: Request) {
  console.log('DEBUG: Solicitud GET recibida en /api/professionals'); // Nuevo log

  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const radius = searchParams.get('radius');
    const profession = searchParams.get('profession');
    const searchQuery = searchParams.get('query');

    console.log('DEBUG: Parámetros recibidos:', { lat, lon, radius, profession, searchQuery }); // Nuevo log

    if (!lat || !lon) {
      console.log('DEBUG: Lat/Lon faltantes, devolviendo 400.'); // Nuevo log
      return NextResponse.json(
        { message: 'Latitud y longitud son requeridas para la búsqueda de ubicación.' },
        { status: 400 }
      );
    }

    const userLat = parseFloat(lat);
    const userLon = parseFloat(lon);
    const searchRadius = radius ? parseFloat(radius) : 10000;

    console.log('DEBUG: Consulta Supabase construida, obteniendo profesionales disponibles.');

    // Construir consulta base sin funciones PostGIS complejas
    let query = supabaseAdmin
      .from('profiles')
      .select('*')
      .not('profession', 'is', null)
      .not('profession', 'eq', '');

    if (profession) {
      query = query.eq('profession', profession);
    }

    if (searchQuery) {
      query = query.ilike('full_name', `%${searchQuery}%`);
    }

    // Limitar resultados y ordenar por calificación promedio
    query = query
      .order('calificacion_promedio', { ascending: false })
      .limit(50);

    console.log('DEBUG: Ejecutando consulta a Supabase...'); // Nuevo log
    const { data: professionals, error } = await query;

    if (error) {
      console.error('ERROR EN SUPABASE:', error); // ESTO ES LO QUE NECESITAMOS VER
      return NextResponse.json(
        { message: 'Error al obtener profesionales', error: error.message },
        { status: 500 }
      );
    }

    console.log(`DEBUG: Profesionales encontrados: ${professionals ? professionals.length : 0}`);

    if (!professionals || professionals.length === 0) {
      return NextResponse.json({ professionals: [] }, { status: 200 });
    }

    // Función para calcular distancia aproximada en metros (Haversine)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371000; // Radio de la Tierra en metros
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    // Filtrar por distancia y agregar información de distancia
    const professionalsWithDistance = professionals
      .map(prof => {
        if (prof.ubicacion_lat && prof.ubicacion_lng) {
          const distance = calculateDistance(userLat, userLon, prof.ubicacion_lat, prof.ubicacion_lng);
          return { ...prof, distance_meters: Math.round(distance) };
        }
        return { ...prof, distance_meters: null };
      })
      .filter(prof => prof.distance_meters === null || prof.distance_meters <= searchRadius)
      .sort((a, b) => {
        // Primero por distancia, luego por calificación
        if (a.distance_meters === null && b.distance_meters === null) {
          return (b.calificacion_promedio || 0) - (a.calificacion_promedio || 0);
        }
        if (a.distance_meters === null) return 1;
        if (b.distance_meters === null) return -1;
        if (a.distance_meters === b.distance_meters) {
          return (b.calificacion_promedio || 0) - (a.calificacion_promedio || 0);
        }
        return a.distance_meters - b.distance_meters;
      })
      .slice(0, 20); // Limitar a 20 resultados

    return NextResponse.json({ professionals: professionalsWithDistance }, { status: 200 });

  } catch (error: any) {
    console.error('ERROR INESPERADO EN LA API ROUTE:', error); // ESTO ES LO QUE NECESITAMOS VER
    return NextResponse.json(
      { message: 'Error interno del servidor', error: error.message },
      { status: 500 }
    );
  } finally {
    console.log('--- API Route /api/professionals END ---'); // Nuevo log
  }
}