'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/lib/supabase/client';

interface MembershipPermissions {
  canRequestUnlimited: boolean;
  maxRequests: number;
  canSeeFullProfile: boolean;
  canUseConcierge: boolean;
  canSeeAllTechnicians: boolean;
  maxTechniciansVisible: number;
  canUsePrioritySupport: boolean;
  canUseAdvancedFilters: boolean;
  canSeeRatings: boolean;
  canSeeReviews: boolean;
  canUseWhatsAppDirect: boolean;
  canUseAIAssistant: boolean;
  canUseEmergencyService: boolean;
  canUseScheduledService: boolean;
  canUsePhotoUpload: boolean;
  canUseVideoCall: boolean;
}

interface MembershipContextType {
  profile: any;
  permissions: MembershipPermissions;
  isLoading: boolean;
  isFreeUser: boolean;
  isBasicUser: boolean;
  isPremiumUser: boolean;
  requestsUsed: number;
  requestsRemaining: number;
  upgradeUrl: string;
}

const MembershipContext = createContext<MembershipContextType | undefined>(undefined);

export function MembershipProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  const [profile, setProfile] = useState<any>(null);
  const [requestsUsed, setRequestsUsed] = useState(0);

  // Obtener perfil del usuario
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
          setProfile(data);
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    };
    fetchProfile();
  }, [user]);

  // Obtener solicitudes usadas del perfil o localStorage
  useEffect(() => {
    console.log('🔍 MembershipContext - Actualizando requestsUsed');
    console.log('🔍 MembershipContext - profile:', profile?.id || 'No hay perfil');
    console.log('🔍 MembershipContext - profile.requests_used:', profile?.requests_used);
    
    if (profile?.requests_used !== undefined) {
      console.log('🔍 MembershipContext - Usando requests_used del perfil:', profile.requests_used);
      setRequestsUsed(profile.requests_used);
    } else {
      console.log('🔍 MembershipContext - No hay requests_used en perfil, usando localStorage');
      // Fallback a localStorage para desarrollo
      const stored = localStorage.getItem('sumee_requests_used');
      if (stored) {
        console.log('🔍 MembershipContext - Valor de localStorage:', stored);
        setRequestsUsed(parseInt(stored));
      } else {
        console.log('🔍 MembershipContext - No hay valor en localStorage, estableciendo 0');
        setRequestsUsed(0);
      }
    }
  }, [profile]);

  // Calcular permisos basados en el plan (express_free o pro_annual)
  // Si no hay plan, usar membership_status como fallback para compatibilidad
  const userPlan = profile?.plan || (profile?.membership_status === 'premium' ? 'pro_annual' : 'express_free');
  
  const permissions: MembershipPermissions = {
    canRequestUnlimited: userPlan === 'pro_annual',
    maxRequests: userPlan === 'pro_annual' ? 999 : 
                 userPlan === 'express_free' ? 3 : 1,
    canSeeFullProfile: userPlan === 'pro_annual',
    canUseConcierge: userPlan === 'pro_annual',
    canSeeAllTechnicians: userPlan === 'pro_annual',
    maxTechniciansVisible: userPlan === 'express_free' ? 5 : 999,
    canUsePrioritySupport: userPlan === 'pro_annual',
    canUseAdvancedFilters: userPlan === 'pro_annual',
    canSeeRatings: userPlan === 'pro_annual',
    canSeeReviews: userPlan === 'pro_annual',
    canUseWhatsAppDirect: true, // Todos pueden usar WhatsApp
    canUseAIAssistant: true, // Todos pueden usar el asistente de texto
    canUseEmergencyService: userPlan === 'pro_annual',
    canUseScheduledService: true, // Todos pueden agendar servicios
    canUsePhotoUpload: userPlan === 'pro_annual',
    canUseVideoCall: userPlan === 'pro_annual',
  };

  const isFreeUser = userPlan === 'express_free' || !profile?.plan;
  const isBasicUser = false; // Ya no usamos basic, solo express_free y pro_annual
  const isPremiumUser = userPlan === 'pro_annual';

  const requestsRemaining = Math.max(0, permissions.maxRequests - requestsUsed);
  const upgradeUrl = '/membresia';

  // DEBUG: Logging del cálculo de requests
  console.log('🔍 MembershipContext - Cálculo de requests:');
  console.log('🔍 MembershipContext - profile?.membership_status:', profile?.membership_status);
  console.log('🔍 MembershipContext - permissions.maxRequests:', permissions.maxRequests);
  console.log('🔍 MembershipContext - requestsUsed:', requestsUsed);
  console.log('🔍 MembershipContext - requestsRemaining:', requestsRemaining);

  const value: MembershipContextType = {
    profile,
    permissions,
    isLoading,
    isFreeUser,
    isBasicUser,
    isPremiumUser,
    requestsUsed,
    requestsRemaining,
    upgradeUrl,
  };

  return (
    <MembershipContext.Provider value={value}>
      {children}
    </MembershipContext.Provider>
  );
}

export function useMembership() {
  const context = useContext(MembershipContext);
  if (context === undefined) {
    throw new Error('useMembership must be used within a MembershipProvider');
  }
  return context;
}
