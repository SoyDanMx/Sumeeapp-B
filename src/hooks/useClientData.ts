'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Profile } from '@/types/supabase';

export function useClientData() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getClientProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user && user.role === 'client') {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (error) {
            console.error('Error fetching client profile:', error);
            setProfile(null);
          } else {
            setProfile(data);
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('Error in getClientProfile:', error);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    getClientProfile();
  }, []);

  return { profile, isLoading };
}
