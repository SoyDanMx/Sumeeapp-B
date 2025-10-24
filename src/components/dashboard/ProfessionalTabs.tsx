'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faBriefcase, 
  faQuestionCircle, 
  faSignOutAlt,
  faChartBar,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabase/client';
import { Profesional } from '@/types/supabase';

interface ProfessionalTabsProps {
  profesional: Profesional;
  onClose?: () => void;
}

type TabType = 'profile' | 'leads' | 'help' | 'logout';

export default function ProfessionalTabs({ profesional, onClose }: ProfessionalTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      if (onClose) onClose();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const tabs = [
    {
      id: 'profile' as TabType,
      label: 'Perfil Profesional',
      icon: faUser,
      href: '/professional-dashboard',
      description: 'Gestiona tu información profesional'
    },
    {
      id: 'leads' as TabType,
      label: 'Mis Leads',
      icon: faBriefcase,
      href: '/dashboard',
      description: 'Gestiona tus oportunidades de trabajo'
    },
    {
      id: 'help' as TabType,
      label: 'Centro de Ayuda',
      icon: faQuestionCircle,
      href: '/help',
      description: 'Soporte y documentación'
    },
    {
      id: 'logout' as TabType,
      label: 'Cerrar Sesión',
      icon: faSignOutAlt,
      action: handleSignOut,
      description: 'Salir de tu cuenta'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header del Profesional */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <FontAwesomeIcon icon={faUser} className="text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-bold">{profesional.full_name}</h3>
            <p className="text-blue-100 text-sm">{profesional.profession}</p>
            <p className="text-blue-200 text-xs">{profesional.email}</p>
          </div>
        </div>
      </div>

      {/* Pestañas de Navegación */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {tabs.map((tab) => (
            <div key={tab.id}>
              {tab.href ? (
                <Link
                  href={tab.href}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <FontAwesomeIcon 
                    icon={tab.icon} 
                    className={`text-2xl mb-2 ${
                      activeTab === tab.id ? 'text-indigo-600' : 'text-gray-500'
                    }`} 
                  />
                  <span className="text-sm font-medium text-center">{tab.label}</span>
                  <span className="text-xs text-gray-500 text-center mt-1">{tab.description}</span>
                </Link>
              ) : (
                <button
                  onClick={tab.action}
                  disabled={isLoggingOut}
                  className={`w-full flex flex-col items-center p-4 rounded-lg border-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-red-500 bg-red-50 text-red-700 shadow-md'
                      : 'border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <FontAwesomeIcon 
                    icon={tab.icon} 
                    className={`text-2xl mb-2 ${
                      activeTab === tab.id ? 'text-red-600' : 'text-gray-500'
                    }`} 
                  />
                  <span className="text-sm font-medium text-center">
                    {isLoggingOut ? 'Cerrando...' : tab.label}
                  </span>
                  <span className="text-xs text-gray-500 text-center mt-1">{tab.description}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Información Adicional */}
      <div className="px-4 pb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Estado:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              profesional.status === 'active' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {profesional.status === 'active' ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600">Miembro desde:</span>
            <span className="text-gray-800 font-medium">
              {new Date(profesional.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
