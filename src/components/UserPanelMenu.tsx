'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronDown, 
  faUser, 
  faChartBar, 
  faCog, 
  faSignOutAlt,
  faBell,
  faQuestionCircle,
  faCrown,
  faListAlt
} from '@fortawesome/free-solid-svg-icons';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/lib/supabase/client';

interface UserPanelMenuProps {
  user: any;
  onClose?: () => void;
}

export default function UserPanelMenu({ user, onClose }: UserPanelMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      if (onClose) onClose();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const closeMenu = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  // Determinar el rol del usuario
  const userRole = user?.role || 'client';
  const isProfessional = userRole === 'profesional';

  return (
    <div className="relative">
      {/* Botón del menú */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition flex items-center space-x-2"
      >
        <FontAwesomeIcon icon={faUser} />
        <span>Mi Panel</span>
        <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* Información del usuario */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{user?.email}</p>
            <p className="text-xs text-gray-500">
              {isProfessional ? 'Panel de Profesional' : 'Panel de Cliente'}
            </p>
          </div>
          
          {/* Opciones de navegación */}
          <div className="py-1">
            {isProfessional ? (
              <>
                <Link 
                  href="/professional-dashboard" 
                  onClick={closeMenu}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FontAwesomeIcon icon={faChartBar} className="mr-3 text-gray-400" />
                  Dashboard Profesional
                </Link>
                <Link 
                  href="/dashboard" 
                  onClick={closeMenu}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FontAwesomeIcon icon={faListAlt} className="mr-3 text-gray-400" />
                  Mis Leads
                </Link>
                <Link 
                  href="/membresia" 
                  onClick={closeMenu}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FontAwesomeIcon icon={faCrown} className="mr-3 text-gray-400" />
                  Membresía
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/dashboard/client" 
                  onClick={closeMenu}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FontAwesomeIcon icon={faChartBar} className="mr-3 text-gray-400" />
                  Mis Solicitudes
                </Link>
                <Link 
                  href="/client-dashboard" 
                  onClick={closeMenu}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FontAwesomeIcon icon={faUser} className="mr-3 text-gray-400" />
                  Buscar Profesionales
                </Link>
                <Link 
                  href="/membresia" 
                  onClick={closeMenu}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FontAwesomeIcon icon={faCrown} className="mr-3 text-gray-400" />
                  Membresía
                </Link>
              </>
            )}
          </div>

          {/* Opciones generales */}
          <div className="py-1 border-t border-gray-100">
            <Link 
              href="/help" 
              onClick={closeMenu}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <FontAwesomeIcon icon={faQuestionCircle} className="mr-3 text-gray-400" />
              Ayuda
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-3 text-gray-400" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}

      {/* Overlay para cerrar el menú */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
