'use client';

import React, { useState, useMemo } from 'react';
import { Lead } from '@/types/supabase';
import LeadCard from '@/components/LeadCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faClock, faLightbulb, faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

interface WorkFeedProps {
  leads: Lead[];
  profesionalLat?: number;
  profesionalLng?: number;
  onLeadClick?: (leadId: string) => void;
  onLeadAccepted?: () => void;
  selectedLeadId?: string | null;
}

type TabType = 'nuevos' | 'en_progreso';

export default function WorkFeed({ 
  leads, 
  profesionalLat, 
  profesionalLng, 
  onLeadClick, 
  onLeadAccepted, 
  selectedLeadId 
}: WorkFeedProps) {
  const [activeTab, setActiveTab] = useState<TabType>('nuevos');

  // Filtrar leads por estado
  const filteredLeads = useMemo(() => {
    if (activeTab === 'nuevos') {
      return leads.filter(lead => lead.estado === 'nuevo' || lead.estado === 'pendiente');
    } else {
      return leads.filter(lead => lead.estado === 'contactado' || lead.estado === 'en_progreso');
    }
  }, [leads, activeTab]);

  // Componente para estado vacío
  const EmptyState = ({ tabType }: { tabType: TabType }) => {
    const isNewLeads = tabType === 'nuevos';
    
    return (
      <div className="text-center py-12 px-6">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FontAwesomeIcon 
            icon={isNewLeads ? faBriefcase : faClock} 
            className="text-3xl text-blue-500" 
          />
        </div>
        
        <h3 className="text-xl font-semibold text-gray-800 mb-3">
          {isNewLeads ? 'Todo tranquilo por ahora...' : 'No hay trabajos en progreso'}
        </h3>
        
        <div className="space-y-4 text-left max-w-md mx-auto">
          {isNewLeads ? (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <FontAwesomeIcon icon={faLightbulb} className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">¡Optimiza tu perfil!</h4>
                    <p className="text-sm text-blue-700">
                      Los profesionales con perfiles completos tienen 3x más probabilidades de recibir trabajos.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-green-900 mb-1">Mantén tu disponibilidad activa</h4>
                    <p className="text-sm text-green-700">
                      Asegúrate de que tu estado esté en "Disponible" para recibir notificaciones.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-purple-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-purple-900 mb-1">Actualiza tus áreas de servicio</h4>
                    <p className="text-sm text-purple-700">
                      Revisa que tus especialidades estén actualizadas para aparecer en más búsquedas.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start">
                <FontAwesomeIcon icon={faClock} className="text-gray-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">No hay trabajos activos</h4>
                  <p className="text-sm text-gray-600">
                    Cuando aceptes un lead, aparecerá aquí para que puedas hacer seguimiento.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
      {/* Header con pestañas */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('nuevos')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors duration-200 ${
              activeTab === 'nuevos'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <FontAwesomeIcon icon={faBriefcase} className="text-sm" />
              <span>Nuevos Leads</span>
              {leads.filter(lead => lead.estado === 'nuevo' || lead.estado === 'pendiente').length > 0 && (
                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                  {leads.filter(lead => lead.estado === 'nuevo' || lead.estado === 'pendiente').length}
                </span>
              )}
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('en_progreso')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors duration-200 ${
              activeTab === 'en_progreso'
                ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <FontAwesomeIcon icon={faClock} className="text-sm" />
              <span>En Progreso</span>
              {leads.filter(lead => lead.estado === 'contactado' || lead.estado === 'en_progreso').length > 0 && (
                <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                  {leads.filter(lead => lead.estado === 'contactado' || lead.estado === 'en_progreso').length}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Contenido de las pestañas */}
      <div className="flex-1 overflow-y-auto">
        {filteredLeads.length > 0 ? (
          <div className="p-4 space-y-4">
            {filteredLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                profesionalLat={profesionalLat}
                profesionalLng={profesionalLng}
                isSelected={lead.id === selectedLeadId}
                onSelect={() => onLeadClick?.(lead.id)}
                onLeadAccepted={onLeadAccepted}
              />
            ))}
          </div>
        ) : (
          <EmptyState tabType={activeTab} />
        )}
      </div>
    </div>
  );
}
