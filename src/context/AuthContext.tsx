'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useUser } from '@/hooks/useUser';
import { useProfesionalData } from '@/hooks/useProfesionalData';
import { useClientData } from '@/hooks/useClientData';
import { AppUser, Profile } from '@/types/supabase';

// =========================================================================
// INTERFAZ DEL CONTEXTO DE AUTENTICACIÓN
// =========================================================================
interface AuthContextType {
  user: AppUser | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isProfessional: boolean;
  isClient: boolean;
  hasActiveMembership: boolean;
}

// =========================================================================
// CREAR EL CONTEXTO
// =========================================================================
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =========================================================================
// INTERFAZ DEL PROVEEDOR
// =========================================================================
interface AuthProviderProps {
  children: ReactNode;
}

// =========================================================================
// PROVEEDOR DE AUTENTICACIÓN (AUTH PROVIDER)
// =========================================================================
export function AuthProvider({ children }: AuthProviderProps) {
  // Hooks para obtener datos del usuario
  const { user, isLoading: userLoading } = useUser();
  const { profesional, isLoading: professionalLoading } = useProfesionalData();
  const { profile: clientProfile, isLoading: clientLoading } = useClientData();
  
  // Estados locales
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // =========================================================================
  // LÓGICA DE OBTENCIÓN DE PERFIL
  // =========================================================================
  useEffect(() => {
    const updateProfile = async () => {
      console.log('🔍 AuthContext - updateProfile iniciado');
      console.log('🔍 AuthContext - userLoading:', userLoading);
      console.log('🔍 AuthContext - professionalLoading:', professionalLoading);
      console.log('🔍 AuthContext - clientLoading:', clientLoading);
      console.log('🔍 AuthContext - user:', user?.id || 'No hay usuario');
      
      if (userLoading || professionalLoading || clientLoading) {
        console.log('🔍 AuthContext - Aún cargando, estableciendo isLoading=true');
        setIsLoading(true);
        return;
      }

      if (!user) {
        console.log('🔍 AuthContext - No hay usuario, estableciendo profile=null');
        setProfile(null);
        setIsLoading(false);
        return;
      }

      // Determinar el perfil según el rol del usuario
      if (user.role === 'profesional') {
        console.log('🔍 AuthContext - Usuario es profesional, profile:', profesional?.id || 'No hay perfil');
        setProfile(profesional);
      } else if (user.role === 'client') {
        console.log('🔍 AuthContext - Usuario es cliente, profile:', clientProfile?.id || 'No hay perfil');
        setProfile(clientProfile);
      } else {
        console.log('🔍 AuthContext - Rol desconocido:', user.role);
        setProfile(null);
      }

      console.log('🔍 AuthContext - Finalizando carga, estableciendo isLoading=false');
      setIsLoading(false);
    };

    updateProfile();
  }, [user, profesional, clientProfile, userLoading, professionalLoading, clientLoading]);

  // =========================================================================
  // CÁLCULO DE PROPIEDADES DERIVADAS
  // =========================================================================
  const isAuthenticated = !!user;
  const isProfessional = user?.role === 'profesional';
  const isClient = user?.role === 'client';
  const hasActiveMembership = profile?.membership_status === 'basic' || profile?.membership_status === 'premium';

  // =========================================================================
  // VALOR DEL CONTEXTO
  // =========================================================================
  const value: AuthContextType = {
    user,
    profile,
    isLoading,
    isAuthenticated,
    isProfessional,
    isClient,
    hasActiveMembership
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// =========================================================================
// HOOK PERSONALIZADO PARA USAR EL CONTEXTO
// =========================================================================
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// =========================================================================
// HOOK ALTERNATIVO PARA COMPATIBILIDAD
// =========================================================================
export function useAuthContext() {
  return useAuth();
}
