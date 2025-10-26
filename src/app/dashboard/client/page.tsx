'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getClientLeads } from '@/lib/supabase/data';
import { Lead } from '@/types/supabase';
import { useAuth } from '@/context/AuthContext';
import { useMembership } from '@/context/MembershipContext';
import RequestServiceModal from '@/components/client/RequestServiceModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faClock, 
  faCheckCircle, 
  faSpinner,
  faMapMarkerAlt,
  faPhone,
  faExclamationTriangle,
  faPlus,
  faWrench
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

export default function ClientDashboardPage() {
  const { user, isLoading: userLoading, isAuthenticated } = useAuth();
  const { 
    permissions, 
    isFreeUser, 
    isBasicUser, 
    isPremiumUser, 
    requestsUsed, 
    requestsRemaining, 
    upgradeUrl 
  } = useMembership();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Función para refrescar los leads
  const refreshLeads = async () => {
    if (!user) return;
    
    try {
      console.log('🔍 Dashboard - Refrescando leads...');
      const userLeads = await getClientLeads(user.id);
      console.log('🔍 Dashboard - Leads refrescados:', userLeads.length);
      setLeads(userLeads);
    } catch (error) {
      console.error('Error refreshing leads:', error);
    }
  };

  useEffect(() => {
    const fetchLeads = async () => {
      // Esperar a que termine de cargar la autenticación
      if (userLoading) {
        setLoading(true);
        return;
      }
      
      // Si no hay usuario después de cargar, mostrar error
      if (!user) {
        setError('Usuario no autenticado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('🔍 Dashboard - Obteniendo leads para usuario:', user.id);
        const userLeads = await getClientLeads(user.id);
        console.log('🔍 Dashboard - Leads obtenidos:', userLeads.length);
        setLeads(userLeads);
      } catch (leadError) {
        console.error('Error fetching client leads:', leadError);
        setLeads([]);
        setError('Error al cargar los leads');
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [user, userLoading]);

  const getStatusBadge = (estado: string | null) => {
    switch (estado?.toLowerCase()) {
      case 'nuevo':
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full flex items-center">
            <FontAwesomeIcon icon={faClock} className="mr-1" />
            Pendiente
          </span>
        );
      case 'contactado':
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center">
            <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
            Contactado
          </span>
        );
      case 'en_progreso':
        return (
          <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full flex items-center">
            <FontAwesomeIcon icon={faSpinner} className="mr-1" />
            En Progreso
          </span>
        );
      case 'completado':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center">
            <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
            Completado
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
            {estado || 'Nuevo'}
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-blue-600 mb-4" />
          <p className="text-gray-600">Cargando tus solicitudes...</p>
          {/* DEBUG: Mostrar información de autenticación */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
              <p>DEBUG: userLoading={userLoading ? 'YES' : 'NO'}</p>
              <p>DEBUG: isAuthenticated={isAuthenticated ? 'YES' : 'NO'}</p>
              <p>DEBUG: user={user ? 'YES' : 'NO'}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl text-red-600 mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          {/* DEBUG: Mostrar información de autenticación en error */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-4 bg-red-100 rounded-lg text-sm text-red-600">
              <p>DEBUG: userLoading={userLoading ? 'YES' : 'NO'}</p>
              <p>DEBUG: isAuthenticated={isAuthenticated ? 'YES' : 'NO'}</p>
              <p>DEBUG: user={user ? 'YES' : 'NO'}</p>
              <p>DEBUG: error={error}</p>
            </div>
          )}
          <div className="space-y-2">
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mr-2"
            >
              Reintentar
            </button>
            <Link 
              href="/login" 
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 inline-block"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mis Solicitudes de Proyectos</h1>
              <p className="text-gray-600 mt-1">Gestiona y sigue el estado de tus solicitudes de servicios</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Contador de solicitudes */}
              <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                <span className="font-medium">Solicitudes este mes: {requestsUsed} / {permissions.maxRequests === 999 ? '∞' : permissions.maxRequests}</span>
              </div>
              
              {/* Botón de solicitar servicio */}
              {requestsRemaining > 0 ? (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  <span>Solicitar un Servicio</span>
                </button>
              ) : (
                <div className="text-center">
                  <button
                    disabled
                    className="bg-gray-400 text-white px-6 py-3 rounded-lg cursor-not-allowed flex items-center space-x-2"
                  >
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    <span>Límite Alcanzado</span>
                  </button>
                  <p className="text-xs text-red-600 mt-1">
                    Has alcanzado tu límite de solicitudes para este mes.{' '}
                    <Link href={upgradeUrl} className="text-blue-600 hover:underline">
                      Haz upgrade a Premium
                    </Link>{' '}
                    para solicitudes ilimitadas.
                  </p>
                </div>
              )}
              
              <Link 
                href="/tecnicos"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Buscar Profesionales
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Banner de Upgrade */}
      {isFreeUser && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FontAwesomeIcon icon={faWrench} className="text-2xl" />
                <div>
                  <h3 className="font-bold text-lg">Disfruta de solicitudes ilimitadas y soporte prioritario</h3>
                  <p className="text-blue-100">Con el Plan Premium obtienes acceso a los mejores técnicos de CDMX</p>
                </div>
              </div>
              <Link
                href={upgradeUrl}
                className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Ver Beneficios
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {leads.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FontAwesomeIcon icon={faUser} className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes solicitudes aún</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Cuando solicites un servicio a través de nuestro formulario, aparecerán aquí para que puedas seguir su estado.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <FontAwesomeIcon icon={faWrench} className="mr-2" />
              Solicitar un Servicio
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {leads.map((lead) => (
              <div key={lead.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Solicitud #{lead.id.slice(-8)}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {formatDate(lead.fecha_creacion)}
                    </p>
                  </div>
                  {getStatusBadge(lead.estado)}
                </div>

                <div className="mb-4">
                  <p className="text-gray-800 mb-2">{lead.descripcion_proyecto}</p>
                  {lead.ubicacion_lat && lead.ubicacion_lng && (
                    <div className="flex items-center text-gray-600 text-sm">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                      Ubicación especificada
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    {lead.whatsapp && (
                      <a 
                        href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-green-600 hover:text-green-700 text-sm"
                      >
                        <FontAwesomeIcon icon={faWhatsapp} className="mr-1" />
                        Contactar por WhatsApp
                      </a>
                    )}
                  </div>
                  
                  {lead.estado === 'contactado' && lead.profesional_asignado_id && (
                    <div className="text-sm text-gray-600">
                      <FontAwesomeIcon icon={faCheckCircle} className="mr-1 text-green-500" />
                      {lead.profesional_asignado_id ? 
                        `Asignado a profesional ID: ${lead.profesional_asignado_id}` : 
                        'Profesional asignado'
                      }
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Solicitud de Servicio */}
        <RequestServiceModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          onLeadCreated={refreshLeads}
        />
    </div>
  );
}
