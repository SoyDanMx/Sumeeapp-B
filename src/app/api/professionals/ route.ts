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

    // --- CONSTRUCCIÓN DE LA CONSULTA CON POSTGIS ---
    let query = supabaseAdmin
      .from('profiles')
      .select(`
        *,
        distance_meters: st_distance(location, ST_SetSRID(ST_MakePoint(${userLon}, ${userLat}), 4326))
      `);

    console.log('DEBUG: Consulta Supabase construida, filtrando por ubicación.'); // Nuevo log

    query = query.filter(
      'location',
      'rpc',
      `ST_DWithin(location, ST_SetSRID(ST_MakePoint(${userLon}, ${userLat}), 4326), ${searchRadius})`
    );

    if (profession) {
      query = query.eq('profession', profession);
    }

    if (searchQuery) {
      query = query.ilike('full_name', `%${searchQuery}%`);
    }

    query = query.order('distance_meters', { ascending: true });

    console.log('DEBUG: Ejecutando consulta a Supabase...'); // Nuevo log
    const { data: professionals, error } = await query;

    if (error) {
      console.error('ERROR EN SUPABASE:', error); // ESTO ES LO QUE NECESITAMOS VER
      return NextResponse.json(
        { message: 'Error al obtener profesionales', error: error.message },
        { status: 500 }
      );
    }

    console.log(`DEBUG: Profesionales encontrados: ${professionals ? professionals.length : 0}`); // Nuevo log

    if (!professionals || professionals.length === 0) {
      return NextResponse.json({ professionals: [] }, { status: 200 });
    }

    return NextResponse.json({ professionals }, { status: 200 });

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