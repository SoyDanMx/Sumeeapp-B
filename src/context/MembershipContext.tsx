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
    if (profile?.requests_used) {
      setRequestsUsed(profile.requests_used);
    } else {
      // Fallback a localStorage para desarrollo
      const stored = localStorage.getItem('sumee_requests_used');
      if (stored) {
        setRequestsUsed(parseInt(stored));
      }
    }
  }, [profile]);

  // Calcular permisos basados en el membership_status
  const permissions: MembershipPermissions = {
    canRequestUnlimited: profile?.membership_status === 'premium',
    maxRequests: profile?.membership_status === 'basic' ? 5 : 
                 profile?.membership_status === 'premium' ? 999 : 1,
    canSeeFullProfile: profile?.membership_status !== 'free',
    canUseConcierge: profile?.membership_status === 'premium',
    canSeeAllTechnicians: profile?.membership_status !== 'free',
    maxTechniciansVisible: profile?.membership_status === 'free' ? 5 : 999,
    canUsePrioritySupport: profile?.membership_status === 'premium',
    canUseAdvancedFilters: profile?.membership_status !== 'free',
    canSeeRatings: profile?.membership_status !== 'free',
    canSeeReviews: profile?.membership_status !== 'free',
    canUseWhatsAppDirect: profile?.membership_status !== 'free',
    canUseAIAssistant: profile?.membership_status !== 'free',
    canUseEmergencyService: profile?.membership_status === 'premium',
    canUseScheduledService: profile?.membership_status !== 'free',
    canUsePhotoUpload: profile?.membership_status !== 'free',
    canUseVideoCall: profile?.membership_status === 'premium',
  };

  const isFreeUser = profile?.membership_status === 'free' || !profile?.membership_status;
  const isBasicUser = profile?.membership_status === 'basic';
  const isPremiumUser = profile?.membership_status === 'premium';

  const requestsRemaining = Math.max(0, permissions.maxRequests - requestsUsed);
  const upgradeUrl = '/membresia';

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
