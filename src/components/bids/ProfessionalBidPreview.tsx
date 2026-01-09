/**
 * ProfessionalBidPreview Component
 * Muestra información del profesional antes de que el cliente acepte una oferta
 * Implementa el sistema de calificación pre-servicio inspirado en inDrive
 */

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar,
  faCheckCircle,
  faClock,
  faTrophy,
  faBolt,
  faShieldAlt,
  faUser,
} from '@fortawesome/free-solid-svg-icons';

interface ProfessionalBidPreviewProps {
  professionalId: string;
  bidPrice: number;
  estimatedTime?: number;
  message?: string;
  onSelect?: () => void;
  onViewProfile?: () => void;
  className?: string;
}

interface ProfessionalData {
  full_name: string;
  avatar_url: string | null;
  average_rating: number;
  total_jobs_completed: number;
  expediente_status: string;
  areas_servicio: string[];
  profession: string;
  verified: boolean;
  response_time_avg?: number; // minutos promedio de respuesta
  badges: string[];
}

export default function ProfessionalBidPreview({
  professionalId,
  bidPrice,
  estimatedTime,
  message,
  onSelect,
  onViewProfile,
  className = '',
}: ProfessionalBidPreviewProps) {
  const [professional, setProfessional] = useState<ProfessionalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfessionalData();
  }, [professionalId]);

  const loadProfessionalData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Importar supabase client
      const { supabase } = await import('@/lib/supabase');

      // Obtener datos del profesional desde professional_stats
      const { data: stats, error: statsError } = await supabase
        .from('professional_stats')
        .select('*')
        .eq('user_id', professionalId)
        .single();
      
      // Type assertion para stats (alineado con estructura de app de profesionales)
      type ProfessionalStats = {
        average_rating?: number;
        total_jobs_completed?: number;
        expediente_status?: string;
        response_time_avg?: number;
        full_name?: string;
        avatar_url?: string | null;
        areas_servicio?: string[];
        profession?: string;
        verified?: boolean;
      } | null;
      const statsData = stats as ProfessionalStats;

      if (statsError) {
        console.error('[ProfessionalBidPreview] Error loading stats:', statsError);
        throw statsError;
      }

      // Obtener datos del perfil desde profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', professionalId)
        .single();

      // Calcular badges basados en estadísticas
      const badges: string[] = [];
      if (statsData?.average_rating && statsData.average_rating >= 4.5) badges.push('Top Rated');
      if (statsData?.total_jobs_completed && statsData.total_jobs_completed >= 50) badges.push('Experienced');
      if (statsData?.total_jobs_completed && statsData.total_jobs_completed >= 100) badges.push('Expert');
      if (statsData?.expediente_status === 'approved') badges.push('Verified');
      if (statsData?.response_time_avg && statsData.response_time_avg <= 5) badges.push('Fast Response');

      // Calcular tiempo promedio de respuesta (si está disponible)
      // Esto se puede calcular desde la tabla de mensajes o quotes
      const responseTime = statsData?.response_time_avg || null;

      setProfessional({
        full_name: statsData?.full_name || profile?.full_name || 'Profesional Sumee',
        avatar_url: statsData?.avatar_url || profile?.avatar_url || null,
        average_rating: statsData?.average_rating || 5.0,
        total_jobs_completed: statsData?.total_jobs_completed || 0,
        expediente_status: statsData?.expediente_status || 'pending',
        areas_servicio: statsData?.areas_servicio || profile?.areas_servicio || [],
        profession: statsData?.profession || profile?.profession || 'Técnico Especializado',
        verified: statsData?.expediente_status === 'approved',
        response_time_avg: responseTime,
        badges,
      });
    } catch (err: any) {
      console.error('[ProfessionalBidPreview] Error:', err);
      setError('No se pudo cargar la información del profesional');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !professional) {
    return (
      <div className={`bg-white rounded-lg border border-red-200 p-4 ${className}`}>
        <p className="text-red-600 text-sm">{error || 'Profesional no encontrado'}</p>
      </div>
    );
  }

  const rating = professional.average_rating || 5.0;
  const totalJobs = professional.total_jobs_completed || 0;
  const responseTimeText = professional.response_time_avg
    ? `Responde en ${Math.round(professional.response_time_avg)} min promedio`
    : null;

  return (
    <div
      className={`bg-white rounded-lg border-2 border-gray-200 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md ${className}`}
    >
      <div className="p-5">
        {/* Header: Avatar + Info Básica */}
        <div className="flex items-start space-x-4 mb-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {professional.avatar_url ? (
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200">
                <Image
                  src={professional.avatar_url}
                  alt={professional.full_name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border-2 border-gray-200">
                <FontAwesomeIcon icon={faUser} className="text-2xl text-indigo-600" />
              </div>
            )}
            {professional.verified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                <FontAwesomeIcon icon={faCheckCircle} className="text-white text-xs" />
              </div>
            )}
          </div>

          {/* Info Principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {professional.full_name}
              </h3>
              {professional.verified && (
                <span className="text-xs text-blue-600 font-medium">Verificado</span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">{professional.profession}</p>

            {/* Rating y Trabajos */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-sm" />
                <span className="text-sm font-semibold text-gray-900">
                  {rating.toFixed(1)}
                </span>
                <span className="text-xs text-gray-500">({totalJobs})</span>
              </div>
              {responseTimeText && (
                <div className="flex items-center space-x-1 text-xs text-gray-600">
                  <FontAwesomeIcon icon={faClock} className="text-gray-400" />
                  <span>{responseTimeText}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Badges */}
        {professional.badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {professional.badges.map((badge, index) => (
              <span
                key={index}
                className="inline-flex items-center space-x-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium"
              >
                {badge === 'Top Rated' && <FontAwesomeIcon icon={faTrophy} className="text-xs" />}
                {badge === 'Fast Response' && <FontAwesomeIcon icon={faBolt} className="text-xs" />}
                {badge === 'Verified' && <FontAwesomeIcon icon={faShieldAlt} className="text-xs" />}
                <span>{badge}</span>
              </span>
            ))}
          </div>
        )}

        {/* Especialidades */}
        {professional.areas_servicio && professional.areas_servicio.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1">Especialidades:</p>
            <div className="flex flex-wrap gap-1.5">
              {professional.areas_servicio.slice(0, 3).map((area, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                >
                  {area}
                </span>
              ))}
              {professional.areas_servicio.length > 3 && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                  +{professional.areas_servicio.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Oferta */}
        <div className="bg-indigo-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-600">Oferta:</span>
            <span className="text-xl font-bold text-indigo-600">
              ${bidPrice.toLocaleString('es-MX')}
            </span>
          </div>
          {estimatedTime && (
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <FontAwesomeIcon icon={faClock} className="text-gray-400" />
              <span>Tiempo estimado: {estimatedTime} minutos</span>
            </div>
          )}
          {message && (
            <p className="text-sm text-gray-700 mt-2 italic">"{message}"</p>
          )}
        </div>

        {/* Acciones */}
        <div className="flex space-x-2">
          {onSelect && (
            <button
              onClick={onSelect}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
            >
              Seleccionar Oferta
            </button>
          )}
          {onViewProfile && (
            <button
              onClick={onViewProfile}
              className="px-4 py-2.5 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition-colors text-sm"
            >
              Ver Perfil
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

