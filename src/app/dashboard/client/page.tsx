'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { getClientLeads } from '@/lib/supabase/data';
import { Lead } from '@/types/supabase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faClock, 
  faCheckCircle, 
  faSpinner,
  faMapMarkerAlt,
  faPhone,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

export default function ClientDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndLeads = async () => {
      try {
        // Obtener usuario actual
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error('Error getting user:', userError);
          setError('Error al cargar los datos del usuario');
          setLoading(false);
          return;
        }

        setUser(user);
        
        if (user) {
          // Obtener leads del usuario
          try {
            const userLeads = await getClientLeads(user.id);
            setLeads(userLeads);
          } catch (leadError) {
            console.error('Error fetching client leads:', leadError);
            // Si no hay leads o hay error, mostrar lista vacía
            setLeads([]);
          }
        } else {
          setLeads([]);
        }
      } catch (error: any) {
        console.error('Error fetching user data:', error);
        setError('Error al cargar los datos del usuario');
      } finally {
        setLoading(false);
      }
    };

    // Solo ejecutar en el cliente
    if (typeof window !== 'undefined') {
      fetchUserAndLeads();
    } else {
      setLoading(false);
    }
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-blue-600 mb-4" />
          <p className="text-gray-600">Cargando tus solicitudes...</p>
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
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
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
              <Link 
                href="/client-dashboard"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Buscar Profesionales
              </Link>
            </div>
          </div>
        </div>
      </div>

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
            <Link 
              href="/"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <FontAwesomeIcon icon={faUser} className="mr-2" />
              Solicitar un Servicio
            </Link>
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
                      Profesional asignado
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
