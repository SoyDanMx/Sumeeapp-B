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
      .select('full_name, profession, avatar_url')
      .eq('user_id', id)
      .single();

    const { data: stats } = await supabase
      .from('professional_stats')
      .select('average_rating, total_reviews_count, jobs_completed_count')
      .eq('user_id', id)
      .single();

    if (!profile) {
      return {
        title: 'Profesional no encontrado | Sumee',
        description: 'El profesional que buscas no está disponible.',
      };
    }

    const title = `${profile.full_name} - Profesional Verificado | Sumee`;
    const description = `${profile.full_name} es un ${profile.profession} verificado en Sumee. ${(stats?.average_rating || 0).toFixed(1)}⭐ de calificación con ${stats?.total_reviews_count || 0} reseñas. ${stats?.jobs_completed_count || 0} trabajos completados.`;
    const image = profile.avatar_url || 'https://www.sumeeapp.com/og-default.png';
    const url = `https://www.sumeeapp.com/verify/${id}`;

    return {
      title,
      description,
      openGraph: {
        type: 'profile',
        url,
        title,
        description,
        images: [{ url: image }],
        siteName: 'Sumee',
        locale: 'es_MX',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
        site: '@sumeeapp',
        creator: '@sumeeapp',
      },
      alternates: {
        canonical: url,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Verificación de Profesional | Sumee',
      description: 'Verifica la identidad y credenciales de profesionales en Sumee',
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
