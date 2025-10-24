'use client';

import React, { useState } from 'react';
import { Profesional, Lead } from '@/types/supabase';
import ProfileChecklist from './ProfileChecklist';
import ProfessionalStats from './ProfessionalStats';
import ProfessionalTools from './ProfessionalTools';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faMapMarkerAlt, faStar, faEdit, faCheckCircle, faChartLine, faWrench } from '@fortawesome/free-solid-svg-icons';
import dynamic from 'next/dynamic';

// Importar el mapa dinámicamente
const DynamicMapComponent = dynamic(
  () => import('@/components/MapComponent'),
  {
    loading: () => (
      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Cargando mapa...</div>
      </div>
    ),
    ssr: false
  }
);

interface ControlPanelProps {
  profesional: Profesional;
  leads: Lead[];
  onEditClick: () => void;
  onLeadClick?: (leadId: string) => void;
  selectedLeadId?: string | null;
}

export default function ControlPanel({ 
  profesional, 
  leads, 
  onEditClick, 
  onLeadClick, 
  selectedLeadId 
}: ControlPanelProps) {
  const [showMap, setShowMap] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'stats' | 'tools'>('profile');

  // Calcular estadísticas básicas
  const stats = {
    totalLeads: leads.length,
    completedLeads: leads.filter(lead => lead.estado === 'completado').length,
    activeLeads: leads.filter(lead => lead.estado === 'contactado' || lead.estado === 'en_progreso').length,
    newLeads: leads.filter(lead => lead.estado === 'nuevo').length
  };

  // Determinar el estado de disponibilidad basado en el status
  const isAvailable = profesional.status === 'active';
  const availabilityColor = isAvailable ? 'text-green-600' : 'text-red-600';
  const availabilityBg = isAvailable ? 'bg-green-100' : 'bg-red-100';

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'profile'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FontAwesomeIcon icon={faUser} className="mr-2" />
            Perfil
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'stats'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FontAwesomeIcon icon={faChartLine} className="mr-2" />
            Estadísticas
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'tools'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FontAwesomeIcon icon={faWrench} className="mr-2" />
            Herramientas
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <>
          {/* Resumen del Perfil */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Mi Perfil</h3>
          <button
            onClick={onEditClick}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faEdit} className="text-sm" />
            <span>Editar</span>
          </button>
        </div>

        {/* Avatar y nombre */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {profesional.full_name?.charAt(0) || 'P'}
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900">
              {profesional.full_name || 'Profesional'}
            </h4>
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-sm" />
              <span className="text-sm text-green-600 font-medium">Verificado</span>
            </div>
          </div>
        </div>

        {/* Calificación */}
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
            <span className="text-sm font-medium text-gray-700">
              {profesional.calificacion_promedio ? 
                `${profesional.calificacion_promedio.toFixed(1)}/5.0` : 
                'Sin calificaciones aún'
              }
            </span>
          </div>
          {!profesional.calificacion_promedio && (
            <p className="text-xs text-gray-500 mt-1">
              Completa tu primer trabajo para recibir calificaciones
            </p>
          )}
        </div>

        {/* Disponibilidad */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium text-gray-700">Disponibilidad</span>
          </div>
          <span className={`text-sm font-medium ${availabilityColor}`}>
            {isAvailable ? 'Disponible' : 'No disponible'}
          </span>
        </div>

        {/* Especialidades */}
        <div className="mt-4">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Especialidades</h5>
          <div className="flex flex-wrap gap-2">
            {profesional.areas_servicio && profesional.areas_servicio.length > 0 && profesional.areas_servicio[0] !== 'Sin definir' ? (
              profesional.areas_servicio.map((area, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full"
                >
                  {area}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-500 italic">Sin definir</span>
            )}
          </div>
        </div>
      </div>

          {/* Checklist de Perfil */}
          <ProfileChecklist 
            profesional={profesional} 
            onEditClick={onEditClick} 
          />

          {/* Estadísticas Rápidas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.totalLeads}</div>
                <div className="text-xs text-blue-700">Total Leads</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.completedLeads}</div>
                <div className="text-xs text-green-700">Completados</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{stats.activeLeads}</div>
                <div className="text-xs text-yellow-700">Activos</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.newLeads}</div>
                <div className="text-xs text-purple-700">Nuevos</div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'stats' && (
        <ProfessionalStats profesional={profesional} leads={leads} />
      )}

      {activeTab === 'tools' && (
        <ProfessionalTools profesional={profesional} />
      )}

      {/* Mapa Pequeño */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Ubicación</h3>
          <button
            onClick={() => setShowMap(!showMap)}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
          >
            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-sm" />
            <span>{showMap ? 'Ocultar' : 'Mostrar'}</span>
          </button>
        </div>
        
        {showMap && (
          <div className="h-64 rounded-lg overflow-hidden">
            <DynamicMapComponent
              leads={leads}
              profesional={profesional}
              selectedLeadId={selectedLeadId ?? null}
              onLeadClick={onLeadClick || (() => {})}
            />
          </div>
        )}
      </div>
    </div>
  );
}
