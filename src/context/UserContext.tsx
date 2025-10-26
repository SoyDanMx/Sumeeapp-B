'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useUser } from '@/hooks/useUser';
import { useProfesionalData } from '@/hooks/useProfesionalData';
import { useClientData } from '@/hooks/useClientData';
import { AppUser, Profesional, Profile } from '@/types/supabase';

interface UserContextType {
  user: AppUser | null;
  profile: Profile | null;
  isLoading: boolean;
  isProfessional: boolean;
  hasActiveMembership: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const { user, isLoading: userLoading } = useUser();
  const { profesional, isLoading: professionalLoading } = useProfesionalData();
  const { profile: clientProfile, isLoading: clientLoading } = useClientData();
  
  const isLoading = userLoading || professionalLoading || clientLoading;
  const isProfessional = user?.role === 'profesional';
  
  // Obtener perfil del usuario (cliente o profesional)
  const profile = user?.role === 'profesional' ? profesional : clientProfile;
  
  const hasActiveMembership = profile?.membership_status === 'basic' || profile?.membership_status === 'premium';

  const value: UserContextType = {
    user,
    profile,
    isLoading,
    isProfessional,
    hasActiveMembership
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}
