'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faClock, 
  faUser, 
  faStar, 
  faPhone, 
  faMapMarkerAlt,
  faSpinner,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { getLeadById } from '@/lib/supabase/data';
import { Lead } from '@/types/supabase';


export default function ClientStatusPage() {
  const params = useParams();
  const leadId = params.leadId as string;
  
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchLead = async () => {
      if (!leadId) return;
      
      try {
        setLoading(true);
        const leadData = await getLeadById(leadId);
        setLead(leadData);
      } catch (err: any) {
        console.error('Error fetching lead:', err);
        setError(err.message || 'Error al cargar el estado de tu solicitud');
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [leadId]);

  const getStatusInfo = () => {
    if (!lead) return { icon: faClock, text: 'Cargando...', color: 'text-gray-500' };

    const estado = lead.estado?.toLowerCase();
    
    switch (estado) {
      case 'nuevo':
        return {
          icon: faClock,
          text: 'En espera de técnico',
          description: 'Tu solicitud está siendo revisada por nuestros técnicos verificados.',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case 'contactado':
        return {
          icon: faCheckCircle,
          text: 'Técnico asignado',
          description: '¡Un técnico verificado ya está en contacto contigo!',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'en_progreso':
        return {
          icon: faCheckCircle,
          text: 'Trabajo en progreso',
          description: 'El técnico está trabajando en tu proyecto.',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'completado':
        return {
          icon: faCheckCircle,
          text: 'Trabajo completado',
          description: 'El proyecto ha sido terminado exitosamente.',
          color: 'text-green-700',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-300'
        };
      default:
        return {
          icon: faClock,
          text: lead.estado || 'En proceso',
          description: 'Tu solicitud está siendo gestionada.',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const statusInfo = getStatusInfo();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-blue-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Cargando estado de tu solicitud...</h2>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-5xl text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error al cargar</h2>
          <p className="text-gray-600 mb-4">{error || 'No se pudo encontrar tu solicitud'}</p>
          <button 
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Estado de tu Solicitud</h1>
          <p className="text-gray-600">ID de solicitud: #{leadId.slice(0, 8)}...</p>
        </div>

        {/* Status Card */}
        <div className={`${statusInfo.bgColor} ${statusInfo.borderColor} border rounded-xl p-6 mb-6`}>
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${statusInfo.bgColor} border ${statusInfo.borderColor}`}>
              <FontAwesomeIcon icon={statusInfo.icon} className={`text-2xl ${statusInfo.color}`} />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${statusInfo.color}`}>
                {statusInfo.text}
              </h2>
              <p className="text-gray-700">{statusInfo.description}</p>
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FontAwesomeIcon icon={faUser} className="mr-3 text-gray-500" />
            Detalles del Proyecto
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Cliente</label>
              <p className="text-gray-900">{lead.nombre_cliente || 'Cliente'}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Descripción</label>
              <p className="text-gray-900">{lead.descripcion_proyecto}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Fecha de solicitud</label>
              <p className="text-gray-900">
                {new Date(lead.fecha_creacion).toLocaleDateString('es-MX', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Professional Assignment */}
        {lead.profesional_asignado && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FontAwesomeIcon icon={faUser} className="mr-3 text-blue-500" />
              Técnico Asignado
            </h3>
            
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {lead.profesional_asignado.avatar_url ? (
                  <img 
                    src={lead.profesional_asignado.avatar_url} 
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FontAwesomeIcon icon={faUser} className="text-2xl text-gray-500" />
                )}
              </div>
              
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-lg">
                  {lead.profesional_asignado.full_name || 'Técnico Verificado'}
                </h4>
                <p className="text-blue-600 font-medium">
                  {lead.profesional_asignado.profession || 'Profesional'}
                </p>
                
                {lead.profesional_asignado.calificacion_promedio && (
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }, (_, i) => (
                        <FontAwesomeIcon 
                          key={i}
                          icon={faStar} 
                          className={`${i < Math.floor(lead.profesional_asignado!.calificacion_promedio || 0) 
                            ? 'text-yellow-400' 
                            : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      ({lead.profesional_asignado.calificacion_promedio?.toFixed(1)} / 5.0)
                    </span>
                  </div>
                )}

                {lead.profesional_asignado.whatsapp && (
                  <a
                    href={`https://wa.me/${lead.profesional_asignado.whatsapp.replace(/[^\d]/g, '')}?text=Hola, te contacté por el servicio a través de Sumee App.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <FontAwesomeIcon icon={faWhatsapp} className="mr-2" />
                    Contactar por WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contact Information */}
        {lead.whatsapp && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
            
            <div className="flex items-center space-x-4">
              <FontAwesomeIcon icon={faPhone} className="text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">WhatsApp registrado</p>
                <p className="text-gray-900">{lead.whatsapp}</p>
              </div>
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="text-center mt-8">
          <button 
            onClick={() => window.history.back()}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            ← Volver
          </button>
        </div>
      </div>
    </div>
  );
}
