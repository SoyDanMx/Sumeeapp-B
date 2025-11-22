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
  // LÓGICA DE OBTENCIÓN DE PERFIL (OPTIMIZADA PARA EVITAR LOOPS)
  // =========================================================================
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    let isMounted = true;

    const updateProfile = () => {
      // Si aún está cargando el usuario, esperar
      if (userLoading) {
        setIsLoading(true);
        return;
      }

      if (!user) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      // CRÍTICO: Para clientes, IGNORAR completamente professionalLoading
      // Para profesionales, solo esperar professionalLoading
      const isClient = user.role === 'client';
      const isProfessional = user.role === 'profesional';
      
      if (isClient) {
        // Para clientes: solo esperar clientLoading, ignorar professionalLoading
        if (clientLoading) {
          setIsLoading(true);
          return;
        }
        // Cliente: establecer perfil y finalizar (ignorar professionalLoading)
        setProfile(clientProfile);
        setIsLoading(false);
        return;
      }

      if (isProfessional) {
        // Para profesionales: esperar professionalLoading
        if (professionalLoading) {
          setIsLoading(true);
          return;
        }
        setProfile(profesional);
        setIsLoading(false);
        return;
      }

      // Rol desconocido
      setProfile(null);
      setIsLoading(false);
    };

    // Ejecutar actualización
    updateProfile();

    // ✅ FIX: Timeout de seguridad aumentado a 10 segundos para manejar latencia de Supabase
    // Durante mantenimiento de Supabase, las operaciones pueden tardar más tiempo
    timeoutId = setTimeout(() => {
      if (isMounted && isLoading) {
        console.warn('⚠️ AuthContext - Timeout de seguridad: forzando isLoading=false (puede deberse a latencia de Supabase)');
        setIsLoading(false);
      }
    }, 10000); // Aumentado de 5s a 10s para manejar latencia durante mantenimiento

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [
    user?.id, // Solo usar user.id para evitar re-renders por cambios en el objeto user
    user?.role, // Solo usar role para detectar cambios de rol
    profesional?.id, // Solo usar id para evitar re-renders por cambios en el objeto
    clientProfile?.id, // Solo usar id para evitar re-renders por cambios en el objeto
    userLoading,
    // IMPORTANTE: Solo incluir professionalLoading si el usuario ES profesional
    // Usar una condición para evitar que afecte a clientes
    user?.role === 'profesional' ? professionalLoading : false,
    // IMPORTANTE: Solo incluir clientLoading si el usuario ES cliente
    user?.role === 'client' ? clientLoading : false,
  ]);

  // =========================================================================
  // CÁLCULO DE PROPIEDADES DERIVADAS
  // =========================================================================
  const isAuthenticated = !!user;
  const isProfessional = user?.role === 'profesional';
  const isClient = user?.role === 'client';

  // =========================================================================
  // VALOR DEL CONTEXTO
  // =========================================================================
  const value: AuthContextType = {
    user,
    profile,
    isLoading,
    isAuthenticated,
    isProfessional,
    isClient
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
