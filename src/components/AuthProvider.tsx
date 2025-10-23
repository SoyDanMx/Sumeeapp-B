'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { AppUser } from '@/types/supabase';
import { clearAuthSession, isJWTError } from '@/lib/auth-utils';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        setLoading(true);
        
        console.log('🔍 AuthProvider: Starting authentication check...');
        
        // Primero verificamos si hay una sesión activa
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('🔍 AuthProvider: Session check result:', { 
          hasSession: !!session, 
          sessionError: sessionError?.message,
          userId: session?.user?.id 
        });
        
        if (sessionError) {
          console.error('❌ AuthProvider: Error getting session:', sessionError);
          setUser(null);
          return;
        }
        
        if (!session) {
          console.log('❌ AuthProvider: No active session found');
          setUser(null);
          return;
        }
        
        // Obtenemos el usuario de la sesión de Supabase
        const { data: { user: authUser }, error } = await supabase.auth.getUser();

        if (error) {
          console.error('Error getting user:', error);
          
          // Si el error es relacionado con JWT inválido, limpiar sesión y redirigir
          if (isJWTError(error) || error.message?.includes('Auth session missing')) {
            console.log('Auth session error detected, clearing session...');
            await clearAuthSession();
            if (typeof window !== 'undefined') {
              window.location.href = '/auth-error';
            }
            return;
          }
          
          setUser(null);
          return;
        }

        if (authUser) {
          console.log('✅ AuthProvider: User authenticated:', authUser.id);
          
          // Si hay un usuario autenticado, buscamos su perfil para obtener el rol
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role, full_name, email')
            .eq('user_id', authUser.id)
            .single();

          console.log('🔍 AuthProvider: Profile query result:', { 
            profile, 
            profileError: profileError?.message,
            userEmail: authUser.email 
          });

          // Construimos el objeto AppUser correctamente
          const appUser: AppUser = {
            ...authUser,
            role: profile?.role || 'client',
          };
          
          console.log('✅ AuthProvider: Setting user with role:', appUser.role);
          setUser(appUser);
        } else {
          console.log('❌ AuthProvider: No authenticated user found');
          setUser(null);
        }
      } catch (error: any) {
        console.error('Error in fetchUserAndProfile:', error);
        
        // Si el error es relacionado con JWT inválido o sesión faltante, limpiar y redirigir
        if (isJWTError(error) || error.message?.includes('Auth session missing')) {
          console.log('Auth session error detected in catch block, clearing session...');
          await clearAuthSession();
          if (typeof window !== 'undefined') {
            window.location.href = '/auth-error';
          }
          return;
        }
        
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndProfile();

    // Escuchamos cambios en la autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        fetchUserAndProfile();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
