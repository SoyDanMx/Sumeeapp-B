'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { getRedirectUrl } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faGithub, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

interface OAuthLoginProps {
  onError?: (error: string) => void;
  onSuccess?: () => void;
  className?: string;
}

export function OAuthLogin({ onError, onSuccess, className = '' }: OAuthLoginProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOAuthLogin = async (provider: 'google' | 'github' | 'facebook') => {
    setLoading(provider);
    setError(null);

    try {
      console.log(`🔐 INICIANDO OAUTH CON ${provider.toUpperCase()}...`);
      
      // SOLUCIÓN CLAVE: URL de redirección dinámica basada en window.location.origin
      const redirectTo = getRedirectUrl('/auth/callback');
      console.log('🔗 URL de redirección dinámica:', redirectTo);
      console.log('🌐 Origen actual:', typeof window !== 'undefined' ? window.location.origin : 'Server');

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          // URL dinámica que se adapta automáticamente al entorno
          redirectTo,
          // Configuraciones adicionales para PKCE
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          // Configuración específica por proveedor
          ...(provider === 'google' && {
            scopes: 'openid email profile',
          }),
          ...(provider === 'github' && {
            scopes: 'user:email',
          }),
          ...(provider === 'facebook' && {
            scopes: 'email',
          }),
        }
      });

      if (oauthError) {
        console.error(`❌ Error en OAuth ${provider}:`, oauthError);
        throw new Error(`Error al iniciar sesión con ${provider}: ${oauthError.message}`);
      }

      console.log(`✅ OAuth ${provider} iniciado correctamente`);
      console.log('🔗 URL de redirección:', data.url);
      
      // La redirección se maneja automáticamente por Supabase
      if (data.url) {
        window.location.href = data.url;
      }

    } catch (err: any) {
      console.error(`❌ Error en OAuth ${provider}:`, err);
      const errorMessage = err.message || `Error al iniciar sesión con ${provider}`;
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(null);
    }
  };

  const providers = [
    {
      id: 'google',
      name: 'Google',
      icon: faGoogle,
      color: 'bg-red-600 hover:bg-red-700',
      textColor: 'text-white'
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: faGithub,
      color: 'bg-gray-800 hover:bg-gray-900',
      textColor: 'text-white'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: faFacebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-white'
    }
  ] as const;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 mr-2" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* OAuth Providers */}
      <div className="space-y-3">
        {providers.map((provider) => (
          <button
            key={provider.id}
            onClick={() => handleOAuthLogin(provider.id)}
            disabled={loading !== null}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-3 ${
              loading === provider.id
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : `${provider.color} ${provider.textColor} hover:shadow-md transform hover:-translate-y-0.5`
            }`}
          >
            {loading === provider.id ? (
              <FontAwesomeIcon icon={faSpinner} spin className="text-lg" />
            ) : (
              <FontAwesomeIcon icon={provider.icon} className="text-lg" />
            )}
            <span>
              {loading === provider.id 
                ? `Conectando con ${provider.name}...` 
                : `Continuar con ${provider.name}`
              }
            </span>
          </button>
        ))}
      </div>

      {/* Información de Debug (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">🔍 Debug Info</h4>
          <div className="text-xs text-blue-700 space-y-1">
            <p><strong>Redirect URL:</strong> {getRedirectUrl('/auth/callback')}</p>
            <p><strong>Base URL:</strong> {typeof window !== 'undefined' ? window.location.origin : 'Server'}</p>
            <p><strong>PKCE Flow:</strong> Enabled</p>
            <p><strong>Session Storage:</strong> localStorage</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default OAuthLogin;
