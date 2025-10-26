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
      if (userLoading || professionalLoading || clientLoading) {
        setIsLoading(true);
        return;
      }

      if (!user) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      // Determinar el perfil según el rol del usuario
      if (user.role === 'profesional') {
        setProfile(profesional);
      } else if (user.role === 'client') {
        setProfile(clientProfile);
      } else {
        setProfile(null);
      }

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
