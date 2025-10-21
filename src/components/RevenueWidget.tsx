'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDollarSign, 
  faUsers, 
  faChartLine,
  faArrowTrendUp
} from '@fortawesome/free-solid-svg-icons';

interface RevenueWidgetProps {
  className?: string;
}

export default function RevenueWidget({ className = '' }: RevenueWidgetProps) {
  // Datos simulados para MVP - estos serían datos reales en producción
  const metrics = {
    totalRevenue: '$1,250.00 USD',
    activeTechnicians: '12 Técnicos',
    leadsGenerated: '78 Leads',
    growthRate: '+24%'
  };

  console.log('RevenueWidget rendered with className:', className);

  return (
    <div className={`bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl shadow-xl border-4 border-yellow-400 p-8 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white flex items-center">
          <FontAwesomeIcon icon={faChartLine} className="text-yellow-300 mr-3" />
          📊 Métricas de Crecimiento MVP
        </h3>
        <span className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-yellow-400 text-yellow-900">
          <FontAwesomeIcon icon={faArrowTrendUp} className="mr-2" />
          🚀 En Crecimiento
        </span>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* KPI 1: Ingresos Totales */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 mb-1">Ingresos Totales</p>
              <p className="text-2xl font-bold text-green-900">{metrics.totalRevenue}</p>
              <p className="text-xs text-green-600 mt-1">Stripe Simulado</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faDollarSign} className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        {/* KPI 2: Técnicos Activos */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 mb-1">Técnicos Activos</p>
              <p className="text-2xl font-bold text-blue-900">{metrics.activeTechnicians}</p>
              <p className="text-xs text-blue-600 mt-1">Crecimiento</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faUsers} className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        {/* KPI 3: Leads Generados */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 mb-1">Leads Generados</p>
              <p className="text-2xl font-bold text-purple-900">{metrics.leadsGenerated}</p>
              <p className="text-xs text-purple-600 mt-1">Tracción</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faChartLine} className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Growth Indicator */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-center text-sm text-gray-600">
          <FontAwesomeIcon icon={faArrowTrendUp} className="text-green-500 mr-2" />
          <span>Ritmo de crecimiento: <span className="font-semibold text-green-600">{metrics.growthRate}</span> este mes</span>
        </div>
      </div>

      {/* Trust Indicators for Investors */}
      <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs">
        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
          ✓ Monetización Activa
        </span>
        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
          ✓ Escalabilidad Comprobada
        </span>
        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
          ✓ Tracción en Mercado
        </span>
      </div>
    </div>
  );
}
