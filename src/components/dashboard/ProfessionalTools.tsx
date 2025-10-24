// src/components/dashboard/ProfessionalTools.tsx
'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalculator, 
  faFileInvoice, 
  faCalendarAlt, 
  faMapMarkerAlt, 
  faClock, 
  faDollarSign,
  faDownload,
  faPrint,
  faShare,
  faEdit,
  faSave,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import { Profesional } from '@/types/supabase';

interface ProfessionalToolsProps {
  profesional: Profesional;
}

export default function ProfessionalTools({ profesional }: ProfessionalToolsProps) {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const tools = [
    {
      id: 'calculator',
      name: 'Calculadora de Precios',
      icon: faCalculator,
      description: 'Calcula precios justos para tus servicios',
      color: 'blue'
    },
    {
      id: 'invoice',
      name: 'Generador de Facturas',
      icon: faFileInvoice,
      description: 'Crea facturas profesionales',
      color: 'green'
    },
    {
      id: 'schedule',
      name: 'Planificador de Horarios',
      icon: faCalendarAlt,
      description: 'Organiza tu agenda de trabajo',
      color: 'purple'
    },
    {
      id: 'routes',
      name: 'Optimizador de Rutas',
      icon: faMapMarkerAlt,
      description: 'Encuentra la ruta más eficiente',
      color: 'orange'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100',
      green: 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100',
      purple: 'bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100',
      orange: 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const renderCalculator = () => (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-800 mb-4">Calculadora de Precios</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Servicio</label>
          <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option>Instalación básica</option>
            <option>Reparación</option>
            <option>Mantenimiento</option>
            <option>Consulta técnica</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Horas estimadas</label>
          <input 
            type="number" 
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Materiales (MXN)</label>
          <input 
            type="number" 
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tarifa por hora (MXN)</label>
          <input 
            type="number" 
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="300"
          />
        </div>
      </div>
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-800">Precio Total Estimado:</span>
          <span className="text-xl font-bold text-blue-600">$1,100 MXN</span>
        </div>
      </div>
    </div>
  );

  const renderInvoice = () => (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-800 mb-4">Generador de Facturas</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
          <input 
            type="text" 
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="Nombre del cliente"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
          <input 
            type="date" 
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Descripción del servicio</label>
          <textarea 
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            rows={3}
            placeholder="Detalle del trabajo realizado..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subtotal</label>
          <input 
            type="number" 
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="1000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">IVA (16%)</label>
          <input 
            type="number" 
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="160"
          />
        </div>
      </div>
      <div className="flex space-x-2">
        <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
          <FontAwesomeIcon icon={faDownload} className="mr-2" />
          Generar PDF
        </button>
        <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
          <FontAwesomeIcon icon={faPrint} className="mr-2" />
          Imprimir
        </button>
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-800 mb-4">Planificador de Horarios</h4>
      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
            {day}
          </div>
        ))}
        {Array.from({ length: 35 }, (_, i) => (
          <div 
            key={i} 
            className="h-12 border border-gray-200 rounded-lg flex items-center justify-center text-sm hover:bg-blue-50 cursor-pointer"
          >
            {i + 1}
          </div>
        ))}
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <h5 className="font-medium text-gray-800 mb-2">Próximas citas</h5>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-white rounded border">
            <div>
              <span className="font-medium">Reparación de grifo</span>
              <span className="text-sm text-gray-600 ml-2">9:00 AM</span>
            </div>
            <FontAwesomeIcon icon={faClock} className="text-blue-600" />
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded border">
            <div>
              <span className="font-medium">Instalación eléctrica</span>
              <span className="text-sm text-gray-600 ml-2">2:00 PM</span>
            </div>
            <FontAwesomeIcon icon={faClock} className="text-green-600" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderRoutes = () => (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-800 mb-4">Optimizador de Rutas</h4>
      <div className="space-y-3">
        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
          <div>
            <p className="font-medium text-blue-800">Casa del Cliente A</p>
            <p className="text-sm text-blue-600">Calle Principal 123 - 15 min</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
          <div>
            <p className="font-medium text-green-800">Oficina del Cliente B</p>
            <p className="text-sm text-green-600">Av. Central 456 - 8 min</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
          <div>
            <p className="font-medium text-purple-800">Residencia del Cliente C</p>
            <p className="text-sm text-purple-600">Col. Norte 789 - 12 min</p>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-800">Tiempo total estimado:</span>
          <span className="text-lg font-bold text-indigo-600">35 minutos</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="font-medium text-gray-800">Distancia total:</span>
          <span className="text-lg font-bold text-indigo-600">12.5 km</span>
        </div>
      </div>
    </div>
  );

  const renderToolContent = () => {
    switch (activeTool) {
      case 'calculator':
        return renderCalculator();
      case 'invoice':
        return renderInvoice();
      case 'schedule':
        return renderSchedule();
      case 'routes':
        return renderRoutes();
      default:
        return (
          <div className="text-center py-8">
            <FontAwesomeIcon icon={faPlus} className="text-4xl text-gray-400 mb-4" />
            <p className="text-gray-600">Selecciona una herramienta para comenzar</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-2">Herramientas Profesionales</h3>
        <p className="text-purple-100 text-sm">
          Utiliza estas herramientas para optimizar tu trabajo y mejorar tu productividad
        </p>
      </div>

      {/* Tool Selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`p-4 rounded-lg border transition-all duration-200 ${
              activeTool === tool.id 
                ? 'ring-2 ring-indigo-500 shadow-lg' 
                : getColorClasses(tool.color)
            }`}
          >
            <FontAwesomeIcon icon={tool.icon} className="text-2xl mb-2" />
            <h4 className="font-semibold text-sm mb-1">{tool.name}</h4>
            <p className="text-xs opacity-75">{tool.description}</p>
          </button>
        ))}
      </div>

      {/* Tool Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {renderToolContent()}
      </div>
    </div>
  );
}
