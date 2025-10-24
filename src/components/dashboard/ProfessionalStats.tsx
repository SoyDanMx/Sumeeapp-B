// src/components/dashboard/ProfessionalStats.tsx
'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, 
  faStar, 
  faClock, 
  faDollarSign, 
  faUsers, 
  faThumbsUp,
  faCalendarAlt,
  faTrophy
} from '@fortawesome/free-solid-svg-icons';
import { Profesional, Lead } from '@/types/supabase';

interface ProfessionalStatsProps {
  profesional: Profesional;
  leads: Lead[];
}

export default function ProfessionalStats({ profesional, leads }: ProfessionalStatsProps) {
  // Calcular estadísticas
  const stats = {
    totalLeads: leads.length,
    completedLeads: leads.filter(lead => lead.estado === 'completado').length,
    activeLeads: leads.filter(lead => lead.estado === 'contactado' || lead.estado === 'en_progreso').length,
    newLeads: leads.filter(lead => lead.estado === 'nuevo').length,
    rating: profesional.calificacion_promedio || 0,
    responseTime: '2.5 horas', // Mock data - se puede calcular con timestamps reales
    completionRate: leads.length > 0 ? Math.round((leads.filter(lead => lead.estado === 'completado').length / leads.length) * 100) : 0,
    monthlyEarnings: leads.filter(lead => lead.estado === 'completado').length * 1500, // Mock calculation
    yearsExperience: profesional.años_experiencia_uber || 0
  };

  const statCards = [
    {
      title: 'Leads Totales',
      value: stats.totalLeads,
      icon: faUsers,
      color: 'blue',
      description: 'Oportunidades recibidas'
    },
    {
      title: 'Trabajos Completados',
      value: stats.completedLeads,
      icon: faTrophy,
      color: 'green',
      description: 'Proyectos finalizados'
    },
    {
      title: 'Calificación Promedio',
      value: `${stats.rating.toFixed(1)}/5.0`,
      icon: faStar,
      color: 'yellow',
      description: 'Basada en reseñas'
    },
    {
      title: 'Tasa de Finalización',
      value: `${stats.completionRate}%`,
      icon: faChartLine,
      color: 'purple',
      description: 'Eficiencia en proyectos'
    },
    {
      title: 'Tiempo de Respuesta',
      value: stats.responseTime,
      icon: faClock,
      color: 'indigo',
      description: 'Promedio de respuesta'
    },
    {
      title: 'Ganancias del Mes',
      value: `$${stats.monthlyEarnings.toLocaleString()} MXN`,
      icon: faDollarSign,
      color: 'emerald',
      description: 'Ingresos estimados'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-600',
      green: 'bg-green-50 border-green-200 text-green-600',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600',
      purple: 'bg-purple-50 border-purple-200 text-purple-600',
      indigo: 'bg-indigo-50 border-indigo-200 text-indigo-600',
      emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header de Estadísticas */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Tu Rendimiento Profesional</h3>
            <p className="text-blue-100 text-sm">
              {stats.yearsExperience > 0 
                ? `${stats.yearsExperience} años de experiencia`
                : 'Profesional certificado'
              }
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{stats.rating.toFixed(1)}</div>
            <div className="text-blue-100 text-sm">Calificación</div>
          </div>
        </div>
      </div>

      {/* Grid de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg border ${getColorClasses(stat.color)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <FontAwesomeIcon icon={stat.icon} className="text-lg" />
              <span className="text-xs font-medium opacity-75">{stat.description}</span>
            </div>
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm font-medium">{stat.title}</div>
          </div>
        ))}
      </div>

      {/* Insights y Recomendaciones */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
          <FontAwesomeIcon icon={faChartLine} className="mr-2 text-indigo-600" />
          Insights de Rendimiento
        </h4>
        <div className="space-y-3">
          {stats.completionRate >= 80 && (
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <FontAwesomeIcon icon={faThumbsUp} className="text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">¡Excelente rendimiento!</p>
                <p className="text-xs text-green-600">Tu tasa de finalización es superior al promedio</p>
              </div>
            </div>
          )}
          
          {stats.rating >= 4.5 && (
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <FontAwesomeIcon icon={faStar} className="text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Calificación destacada</p>
                <p className="text-xs text-yellow-600">Los clientes están muy satisfechos con tu trabajo</p>
              </div>
            </div>
          )}

          {stats.newLeads > 0 && (
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">Nuevas oportunidades</p>
                <p className="text-xs text-blue-600">{stats.newLeads} leads nuevos esperando tu respuesta</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
