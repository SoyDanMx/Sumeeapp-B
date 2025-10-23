'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { getRedirectUrl } from '@/lib/utils';
import { User } from '@supabase/supabase-js';

interface OAuthState {
  loading: boolean;
  error: string | null;
  user: User | null;
}

interface OAuthResult {
  success: boolean;
  user?: User;
  error?: string;
  needsRedirect?: boolean;
  redirectUrl?: string;
}

export function useOAuth() {
  const [state, setState] = useState<OAuthState>({
    loading: false,
    error: null,
    user: null
  });

  const signInWithOAuth = useCallback(async (
    provider: 'google' | 'github' | 'facebook',
    options?: {
      redirectTo?: string;
      scopes?: string;
      queryParams?: Record<string, string>;
    }
  ): Promise<OAuthResult> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log(`🔐 INICIANDO OAUTH CON ${provider.toUpperCase()}...`);
      
      // SOLUCIÓN CLAVE: URL de redirección dinámica basada en window.location.origin
      const redirectTo = options?.redirectTo || getRedirectUrl('/auth/callback');
      console.log('🔗 URL de redirección dinámica:', redirectTo);
      console.log('🌐 Origen actual:', typeof window !== 'undefined' ? window.location.origin : 'Server');

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          // Configuraciones adicionales para PKCE
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            ...options?.queryParams
          },
          // Configuración específica por proveedor
          ...(provider === 'google' && {
            scopes: options?.scopes || 'openid email profile',
          }),
          ...(provider === 'github' && {
            scopes: options?.scopes || 'user:email',
          }),
          ...(provider === 'facebook' && {
            scopes: options?.scopes || 'email',
          }),
        }
      });

      if (oauthError) {
        console.error(`❌ Error en OAuth ${provider}:`, oauthError);
        throw new Error(`Error al iniciar sesión con ${provider}: ${oauthError.message}`);
      }

      console.log(`✅ OAuth ${provider} iniciado correctamente`);
      console.log('🔗 URL de redirección:', data.url);
      
      return {
        success: true,
        needsRedirect: true,
        redirectUrl: data.url
      };

    } catch (err: any) {
      console.error(`❌ Error en OAuth ${provider}:`, err);
      const errorMessage = err.message || `Error al iniciar sesión con ${provider}`;
      
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));

      return {
        success: false,
        error: errorMessage
      };
    }
  }, []);

  const signUpWithOAuth = useCallback(async (
    provider: 'google' | 'github' | 'facebook',
    options?: {
      redirectTo?: string;
      scopes?: string;
      queryParams?: Record<string, string>;
    }
  ): Promise<OAuthResult> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log(`🔐 REGISTRO OAUTH CON ${provider.toUpperCase()}...`);
      
      // Construir URL de redirección dinámica
      const redirectTo = options?.redirectTo || getRedirectUrl('/auth/callback');
      console.log('🔗 URL de redirección:', redirectTo);

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          // Configuraciones adicionales para PKCE
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            ...options?.queryParams
          },
          // Configuración específica por proveedor
          ...(provider === 'google' && {
            scopes: options?.scopes || 'openid email profile',
          }),
          ...(provider === 'github' && {
            scopes: options?.scopes || 'user:email',
          }),
          ...(provider === 'facebook' && {
            scopes: options?.scopes || 'email',
          }),
        }
      });

      if (oauthError) {
        console.error(`❌ Error en OAuth ${provider}:`, oauthError);
        throw new Error(`Error al registrarse con ${provider}: ${oauthError.message}`);
      }

      console.log(`✅ OAuth ${provider} iniciado correctamente`);
      console.log('🔗 URL de redirección:', data.url);
      
      return {
        success: true,
        needsRedirect: true,
        redirectUrl: data.url
      };

    } catch (err: any) {
      console.error(`❌ Error en OAuth ${provider}:`, err);
      const errorMessage = err.message || `Error al registrarse con ${provider}`;
      
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));

      return {
        success: false,
        error: errorMessage
      };
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearState = useCallback(() => {
    setState({
      loading: false,
      error: null,
      user: null
    });
  }, []);

  return {
    ...state,
    signInWithOAuth,
    signUpWithOAuth,
    clearError,
    clearState
  };
}
