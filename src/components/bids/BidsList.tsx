/**
 * BidsList Component
 * Lista todas las ofertas de un trabajo con información del profesional
 * Implementa el sistema de calificación pre-servicio
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ProfessionalBidPreview from './ProfessionalBidPreview';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

interface Bid {
  id: string;
  job_id: string;
  professional_id: string;
  proposed_price: number;
  estimated_time?: number;
  message?: string;
  status: 'active' | 'selected' | 'rejected' | 'withdrawn';
  ranking_score?: number;
  professional_rating: number;
  professional_total_jobs: number;
  distance_km?: number;
  created_at: string;
}

interface BidsListProps {
  jobId: string;
  onBidSelected?: (bidId: string, professionalId: string) => void;
  className?: string;
}

export default function BidsList({ jobId, onBidSelected, className = '' }: BidsListProps) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBidId, setSelectedBidId] = useState<string | null>(null);

  useEffect(() => {
    if (jobId) {
      loadBids();
      
      // Suscribirse a cambios en tiempo real
      const channel = supabase
        .channel(`job_bids_${jobId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'job_bids',
            filter: `job_id=eq.${jobId}`,
          },
          () => {
            loadBids();
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    }
  }, [jobId]);

  const loadBids = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener ofertas desde la vista con ranking
      const { data, error: fetchError } = await supabase
        .from('job_bids_with_score')
        .select('*')
        .eq('job_id', jobId)
        .eq('status', 'active')
        .order('ranking_score', { ascending: false })
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('[BidsList] Error loading bids:', fetchError);
        throw fetchError;
      }

      setBids(data || []);
    } catch (err: any) {
      console.error('[BidsList] Error:', err);
      setError('No se pudieron cargar las ofertas');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBid = async (bidId: string, professionalId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('Debes iniciar sesión para seleccionar una oferta');
        return;
      }

      // Llamar a la función RPC para seleccionar la oferta
      const { data: rpcResult, error: rpcError } = await supabase.rpc('select_job_bid', {
        p_bid_id: bidId,
        p_client_id: user.id,
      } as any);

      if (rpcError) {
        console.error('[BidsList] Error selecting bid:', rpcError);
        alert('No se pudo seleccionar la oferta. Intenta nuevamente.');
        return;
      }

      if (!rpcResult || (rpcResult as any)?.success === false) {
        alert((rpcResult as any)?.error?.message || 'No se pudo seleccionar la oferta.');
        return;
      }

      setSelectedBidId(bidId);
      
      if (onBidSelected) {
        onBidSelected(bidId, professionalId);
      }

      // Recargar ofertas para actualizar estados
      loadBids();
    } catch (err: any) {
      console.error('[BidsList] Error:', err);
      alert('Ocurrió un error al seleccionar la oferta.');
    }
  };

  const handleViewProfile = (professionalId: string) => {
    // Navegar al perfil del profesional
    window.location.href = `/tecnico/${professionalId}`;
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <FontAwesomeIcon icon={faSpinner} className="text-2xl text-indigo-600 animate-spin" />
        <span className="ml-3 text-gray-600">Cargando ofertas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2 text-red-600">
          <FontAwesomeIcon icon={faExclamationCircle} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-8 text-center ${className}`}>
        <p className="text-gray-600">Aún no hay ofertas para este trabajo.</p>
        <p className="text-sm text-gray-500 mt-2">
          Los profesionales podrán hacer ofertas y aparecerán aquí.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Ofertas Disponibles ({bids.length})
        </h3>
        <span className="text-sm text-gray-500">
          Ordenadas por mejor valor
        </span>
      </div>

      {bids.map((bid, index) => (
        <div key={bid.id} className="relative">
          {/* Badge de Ranking */}
          {index < 3 && (
            <div className="absolute -top-2 -left-2 z-10">
              <span className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                #{index + 1}
              </span>
            </div>
          )}

          <ProfessionalBidPreview
            professionalId={bid.professional_id}
            bidPrice={bid.proposed_price}
            estimatedTime={bid.estimated_time || undefined}
            message={bid.message || undefined}
            onSelect={() => handleSelectBid(bid.id, bid.professional_id)}
            onViewProfile={() => handleViewProfile(bid.professional_id)}
            className={selectedBidId === bid.id ? 'ring-2 ring-indigo-500' : ''}
          />
        </div>
      ))}
    </div>
  );
}

