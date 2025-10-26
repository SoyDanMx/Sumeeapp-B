import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Función para calcular distancia entre dos puntos (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distancia en km
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '19.4326');
    const lon = parseFloat(searchParams.get('lon') || '-99.1332');
    const radius = parseFloat(searchParams.get('radius') || '10000') / 1000; // Convertir metros a km
    const profession = searchParams.get('profession') || '';
    const query = searchParams.get('query') || '';

    // Construir consulta base
    let supabaseQuery = supabase
      .from('profiles')
      .select('*')
      .eq('role', 'profesional')
      .not('profession', 'is', null)
      .not('profession', 'eq', '');

    // Aplicar filtros
    if (profession) {
      supabaseQuery = supabaseQuery.eq('profession', profession);
    }

    if (query) {
      supabaseQuery = supabaseQuery.ilike('full_name', `%${query}%`);
    }

    const { data: professionals, error } = await supabaseQuery;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Error al obtener profesionales', message: error.message },
        { status: 500 }
      );
    }

    if (!professionals) {
      return NextResponse.json({ professionals: [] });
    }

    // Filtrar por distancia si tenemos coordenadas
    let filteredProfessionals = professionals;
    
    if (lat && lon) {
      filteredProfessionals = professionals
        .filter(prof => {
          if (!prof.lat || !prof.lon) return true; // Incluir si no tiene coordenadas
          const distance = calculateDistance(lat, lon, prof.lat, prof.lon);
          return distance <= radius;
        })
        .map(prof => ({
          ...prof,
          distance: prof.lat && prof.lon ? calculateDistance(lat, lon, prof.lat, prof.lon) : null
        }))
        .sort((a, b) => {
          // Ordenar por distancia si está disponible, sino por calificación
          if (a.distance !== null && b.distance !== null) {
            return a.distance - b.distance;
          }
          return (b.calificacion_promedio || 0) - (a.calificacion_promedio || 0);
        });
    }

    // Limitar resultados
    const limitedResults = filteredProfessionals.slice(0, 20);

    return NextResponse.json({
      professionals: limitedResults,
      total: filteredProfessionals.length,
      filters: {
        lat,
        lon,
        radius: radius * 1000, // Devolver en metros
        profession,
        query
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', message: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
