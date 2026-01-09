'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShieldAlt,
  faCheckCircle,
  faStar,
  faBriefcase,
  faShare,
  faMessage,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { QRCodeSVG } from 'qrcode.react';

const SUMEE_PURPLE = '#7C3AED';
const SUMEE_GREEN = '#10B981';
const SUMEE_AMBER = '#F59E0B';
const DEFAULT_AVATAR = '/default-avatar.png';

interface VerificationProfile {
  id: string;
  full_name: string;
  profession: string;
  avatar_url: string | null;
  bio: string | null;
  areas_servicio: string[];
  work_zones: string[];
  city: string | null;
  whatsapp: string | null;
  verified: boolean;
  expediente_status: string | null;
  created_at: string;
}

interface VerificationStats {
  jobs_completed: number;
  rating: number;
  review_count: number;
  current_level: number;
  level_name: string;
}

interface VerificationStatus {
  identity_verified: boolean;
  profile_complete: boolean;
  expediente_approved: boolean;
  reputation_validated: boolean;
}

interface VerificationData {
  profile: VerificationProfile;
  stats: VerificationStats;
  badges: Array<{
    id: string;
    name: string;
    icon: string;
    level: 'bronze' | 'silver' | 'gold' | 'diamond';
  }>;
  verification_status: VerificationStatus;
}

async function getVerificationData(professionalId: string): Promise<VerificationData | null> {
  try {
    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        user_id,
        full_name,
        profession,
        avatar_url,
        bio,
        descripcion_perfil,
        areas_servicio,
        work_zones,
        city,
        whatsapp,
        verified,
        expediente_status,
        created_at
      `)
      .eq('user_id', professionalId)
      .single();

    if (profileError || !profile) {
      console.error('[Verification] Profile error:', profileError);
      return null;
    }

    // Get stats from professional_stats
    const { data: stats, error: statsError } = await supabase
      .from('professional_stats')
      .select(`
        jobs_completed_count,
        average_rating,
        total_reviews_count,
        current_level_id,
        total_points
      `)
      .eq('user_id', professionalId)
      .single();

    // Get review stats
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewee_id', professionalId)
      .eq('status', 'published');

    const reviewStats = {
      total_reviews: reviews?.length || 0,
      average_rating: reviews?.length
        ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
        : 0,
    };

    // Calculate verification status
    const verification_status: VerificationStatus = {
      identity_verified: profile.verified === true,
      profile_complete: Boolean(
        profile.full_name &&
        profile.profession &&
        profile.avatar_url &&
        (profile.bio || profile.descripcion_perfil) &&
        profile.areas_servicio?.length > 0 &&
        profile.work_zones?.length > 0
      ),
      expediente_approved: profile.expediente_status === 'approved' || profile.expediente_status === 'aprobado',
      reputation_validated: (reviewStats.average_rating >= 4.0 && reviewStats.total_reviews >= 5)
    };

    // Build stats object
    const verificationStats: VerificationStats = {
      jobs_completed: stats?.jobs_completed_count || 0,
      rating: stats?.average_rating || reviewStats.average_rating || 0,
      review_count: stats?.total_reviews_count || reviewStats.total_reviews || 0,
      current_level: stats?.current_level_id || 1,
      level_name: getLevelName(stats?.current_level_id || 1)
    };

    // Get unlocked badges (simplified - you may want to fetch from user_badges table)
    const unlockedBadges: Array<{ id: string; name: string; icon: string; level: 'bronze' | 'silver' | 'gold' | 'diamond' }> = [];

    return {
      profile: {
        id: profile.user_id,
        full_name: profile.full_name,
        profession: profile.profession || 'Profesional',
        avatar_url: profile.avatar_url,
        bio: profile.bio || profile.descripcion_perfil || null,
        areas_servicio: profile.areas_servicio || [],
        work_zones: profile.work_zones || [],
        city: profile.city,
        whatsapp: profile.whatsapp || null,
        verified: profile.verified || false,
        expediente_status: profile.expediente_status,
        created_at: profile.created_at
      },
      stats: verificationStats,
      badges: unlockedBadges,
      verification_status
    };
  } catch (error) {
    console.error('[Verification] Error getting verification data:', error);
    return null;
  }
}

function getLevelName(level: number): string {
  if (level >= 5) return 'Maestro Sumee';
  if (level === 4) return 'Técnico Platino';
  if (level === 3) return 'Técnico Oro';
  if (level === 2) return 'Técnico Plata';
  return 'Técnico Bronce';
}

export default function VerifyPage() {
  const params = useParams();
  const id = params?.id as string;
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadVerificationData();
    }
  }, [id]);

  const loadVerificationData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getVerificationData(id);
      if (data) {
        setVerificationData(data);
      } else {
        setError('Profesional no encontrado');
      }
    } catch (err) {
      console.error('Error loading verification data:', err);
      setError('Error al cargar los datos de verificación');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!verificationData) return;
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      await navigator.share({
        title: `Verifica a ${verificationData.profile.full_name} en Sumee`,
        text: `Conoce a ${verificationData.profile.full_name}, ${verificationData.profile.profession} verificado en Sumee`,
        url: url,
      });
    } catch (err) {
      // Fallback: copy to clipboard
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        alert('Enlace copiado al portapapeles');
      }
    }
  };

  const handleWhatsApp = () => {
    if (!verificationData?.profile.whatsapp) return;
    const phone = verificationData.profile.whatsapp.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phone}`, '_blank');
  };

  const verificationUrl = typeof window !== 'undefined' ? window.location.href : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-purple-600 mb-4" />
          <p className="text-gray-600">Cargando verificación...</p>
        </div>
      </div>
    );
  }

  if (error || !verificationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">{error || 'Profesional no encontrado'}</h2>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const { profile, stats, badges, verification_status } = verificationData;
  const verifiedDate = new Date(profile.created_at).toLocaleDateString('es-MX');

  return (
    <>
      {/* Schema.org JSON-LD - Enhanced */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            '@id': `https://www.sumeeapp.com/verify/${id}`,
            name: profile.full_name,
            jobTitle: profile.profession,
            image: profile.avatar_url || 'https://www.sumeeapp.com/default-avatar.png',
            url: typeof window !== 'undefined' ? window.location.href : `https://www.sumeeapp.com/verify/${id}`,
            sameAs: [
              // Agregar redes sociales si están disponibles
            ],
            address: profile.city ? {
              '@type': 'PostalAddress',
              addressLocality: profile.city,
              addressCountry: 'MX',
            } : undefined,
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: stats.rating,
              reviewCount: stats.review_count,
              bestRating: 5,
              worstRating: 1,
            },
            knowsAbout: profile.areas_servicio || [],
            memberOf: {
              '@type': 'Organization',
              name: 'Sumee App',
              url: 'https://www.sumeeapp.com',
            },
            worksFor: {
              '@type': 'Organization',
              name: 'Sumee App',
              url: 'https://www.sumeeapp.com',
            },
          }),
        }}
      />
      
      {/* LocalBusiness Schema (si aplica) */}
      {profile.city && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              '@id': `https://www.sumeeapp.com/verify/${id}#business`,
              name: `${profile.full_name} - ${profile.profession}`,
              image: profile.avatar_url || 'https://www.sumeeapp.com/default-avatar.png',
              address: {
                '@type': 'PostalAddress',
                addressLocality: profile.city,
                addressCountry: 'MX',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: stats.rating,
                reviewCount: stats.review_count,
                bestRating: 5,
                worstRating: 1,
              },
              priceRange: '$$',
              areaServed: profile.work_zones || [],
            }),
          }}
        />
      )}
      
      {/* Service Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            '@id': `https://www.sumeeapp.com/verify/${id}#service`,
            name: `Servicios de ${profile.profession} - ${profile.full_name}`,
            provider: {
              '@type': 'Person',
              name: profile.full_name,
              jobTitle: profile.profession,
            },
            areaServed: profile.work_zones || [],
            serviceType: profile.areas_servicio || [profile.profession],
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: stats.rating,
              reviewCount: stats.review_count,
            },
          }),
        }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-8">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FontAwesomeIcon icon={faShieldAlt} className="text-2xl" />
              <h1 className="text-2xl font-bold">Verificado por Sumee</h1>
            </div>
            <p className="text-purple-100">Verificado el {verifiedDate}</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          {/* Profile Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-6">
              <Image
                src={profile.avatar_url || DEFAULT_AVATAR}
                alt={profile.full_name}
                width={100}
                height={100}
                className="rounded-full"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">{profile.full_name}</h2>
                <p className="text-gray-600 mb-2">{profile.profession}</p>
                <div className="flex items-center gap-2 mb-2">
                  <FontAwesomeIcon icon={faStar} className="text-amber-500" />
                  <span className="font-semibold">
                    {stats.rating.toFixed(1)} ({stats.review_count} reseñas)
                  </span>
                </div>
                {verification_status.identity_verified && (
                  <div className="flex items-center gap-2 text-green-600">
                    <FontAwesomeIcon icon={faShieldAlt} />
                    <span className="font-semibold">Super PRO</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Verification Multi-Layer */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Verificación Multi-Capa</h3>
            <div className="space-y-4">
              <VerificationItem
                label="Identidad Verificada"
                verified={verification_status.identity_verified}
                description="INE/Pasaporte validado"
              />
              <VerificationItem
                label="Perfil Completo"
                verified={verification_status.profile_complete}
                description="100% de información"
              />
              <VerificationItem
                label="Expediente Aprobado"
                verified={verification_status.expediente_approved}
                description="Documentos revisados"
              />
              <VerificationItem
                label="Reputación Validada"
                verified={verification_status.reputation_validated}
                description="Calificaciones verificadas"
              />
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <h3 className="text-xl font-bold mb-4">Verificación Instantánea</h3>
              <div className="flex justify-center mb-4">
              <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG value={verificationUrl} size={200} />
              </div>
            </div>
            <p className="text-gray-600">Escanea para verificar</p>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Estadísticas</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <FontAwesomeIcon icon={faBriefcase} className="text-purple-600 text-2xl mb-2" />
                <p className="text-2xl font-bold">{stats.jobs_completed}</p>
                <p className="text-sm text-gray-600">Trabajos</p>
              </div>
              <div>
                <FontAwesomeIcon icon={faStar} className="text-amber-500 text-2xl mb-2" />
                <p className="text-2xl font-bold">{stats.rating.toFixed(1)}</p>
                <p className="text-sm text-gray-600">Calificación</p>
              </div>
              <div>
                <FontAwesomeIcon icon={faShieldAlt} className="text-green-600 text-2xl mb-2" />
                <p className="text-2xl font-bold">{stats.level_name}</p>
                <p className="text-sm text-gray-600">Nivel</p>
              </div>
            </div>
          </div>

          {/* Service Areas */}
          {profile.areas_servicio.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Áreas de Servicio</h3>
              <div className="flex flex-wrap gap-2">
                {profile.areas_servicio.map((area, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-md p-6 space-y-3">
            {profile.whatsapp && (
              <button
                onClick={handleWhatsApp}
                className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faMessage} />
                Contactar por WhatsApp
              </button>
            )}
            <button
              onClick={handleShare}
              className="w-full bg-gray-100 text-purple-600 py-3 rounded-lg font-semibold hover:bg-gray-200 flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faShare} />
              Compartir Verificación
            </button>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-500 text-sm py-4">
            Esta verificación es generada automáticamente por Sumee
          </div>
        </div>
      </div>
    </>
  );
}

function VerificationItem({
  label,
  verified,
  description,
}: {
  label: string;
  verified: boolean;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3">
      {verified ? (
        <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-2xl" />
      ) : (
        <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
      )}
      <div>
        <p className="font-semibold">{label}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}
