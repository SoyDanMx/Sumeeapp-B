import { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}): Promise<Metadata> {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, profession, avatar_url, city, areas_servicio, verified, expediente_status')
      .eq('user_id', id)
      .single();

    const { data: stats } = await supabase
      .from('professional_stats')
      .select('average_rating, total_reviews_count, jobs_completed_count, current_level_id')
      .eq('user_id', id)
      .single();

    if (!profile) {
      return {
        title: 'Profesional no encontrado | Sumee',
        description: 'El profesional que buscas no está disponible.',
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const title = `${profile.full_name} - ${profile.profession} Verificado | Sumee`;
    const rating = (stats?.average_rating || 0).toFixed(1);
    const reviewCount = stats?.total_reviews_count || 0;
    const jobsCompleted = stats?.jobs_completed_count || 0;
    const city = profile.city ? ` en ${profile.city}` : '';
    const areas = profile.areas_servicio?.slice(0, 3).join(', ') || profile.profession;
    
    const description = `${profile.full_name} es un ${profile.profession} verificado${city} en Sumee. ${rating}⭐ de calificación con ${reviewCount} reseñas. ${jobsCompleted} trabajos completados. Especializado en ${areas}.`;
    
    // Optimizar imagen para Open Graph
    const avatarUrl = profile.avatar_url || 'https://www.sumeeapp.com/og-default.png';
    const ogImage = avatarUrl.startsWith('http') 
      ? avatarUrl 
      : `https://www.sumeeapp.com${avatarUrl}`;
    
    const url = `https://www.sumeeapp.com/verify/${id}`;
    const keywords = [
      profile.full_name,
      profile.profession,
      'profesional verificado',
      'técnico verificado',
      'sumee',
      profile.city || '',
      ...(profile.areas_servicio || []),
    ].filter(Boolean).join(', ');

    return {
      title,
      description,
      keywords,
      authors: [{ name: 'Sumee App' }],
      creator: 'Sumee App',
      publisher: 'Sumee App',
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      openGraph: {
        type: 'profile',
        url,
        title,
        description,
        siteName: 'Sumee App',
        locale: 'es_MX',
        alternateLocale: ['es_ES', 'en_US'],
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: `${profile.full_name} - Profesional Verificado en Sumee`,
          },
          {
            url: 'https://www.sumeeapp.com/og-default.png',
            width: 1200,
            height: 630,
            alt: 'Sumee - Profesionales Verificados',
          },
        ],
        profile: {
          firstName: profile.full_name.split(' ')[0],
          lastName: profile.full_name.split(' ').slice(1).join(' '),
          username: id,
        },
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImage],
        site: '@sumeeapp',
        creator: '@sumeeapp',
      },
      alternates: {
        canonical: url,
      },
      other: {
        'og:verified': profile.verified ? 'true' : 'false',
        'og:profession': profile.profession,
        'og:rating': rating,
        'og:review_count': reviewCount.toString(),
        'og:jobs_completed': jobsCompleted.toString(),
      },
      verification: {
        // Agregar si tienes verificación de Google Search Console
        // google: 'tu-codigo-de-verificacion',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Verificación de Profesional | Sumee',
      description: 'Verifica la identidad y credenciales de profesionales en Sumee',
      robots: {
        index: true,
        follow: true,
      },
    };
  }
}

export default function VerifyIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
