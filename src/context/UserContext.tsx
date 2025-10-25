'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useUser } from '@/hooks/useUser';
import { useProfesionalData } from '@/hooks/useProfesionalData';
import { AppUser, Profesional } from '@/types/supabase';

interface UserContextType {
  user: AppUser | null;
  profile: Profesional | null;
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
  const { profesional, isLoading: profileLoading } = useProfesionalData();
  
  const isLoading = userLoading || profileLoading;
  const isProfessional = user?.role === 'profesional';
  const hasActiveMembership = user?.role === 'profesional' 
    ? profesional?.membership_status === 'basic' || profesional?.membership_status === 'premium'
    : false; // Los clientes no tienen membresía por defecto

  const value: UserContextType = {
    user,
    profile: profesional,
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
