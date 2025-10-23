import { supabase } from '@/lib/supabase/client';

/**
 * Limpia completamente la sesión de autenticación
 * Útil cuando hay errores de JWT o sesiones corruptas
 */
export async function clearAuthSession(): Promise<void> {
  try {
    // Cerrar sesión en Supabase (sin esperar respuesta si hay error)
    try {
      await supabase.auth.signOut();
    } catch (signOutError) {
      console.log('Error during signOut (expected if session is already invalid):', signOutError);
    }
    
    // Limpiar localStorage de manera más robusta
    if (typeof window !== 'undefined') {
      // Limpiar todas las claves relacionadas con Supabase
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('sb-') || key.includes('auth-token')) {
          localStorage.removeItem(key);
        }
      });
      
      // Limpiar sessionStorage también
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('sb-') || key.includes('auth-token')) {
          sessionStorage.removeItem(key);
        }
      });
    }
    
    console.log('Auth session cleared successfully');
  } catch (error) {
    console.error('Error clearing auth session:', error);
  }
}

/**
 * Verifica si un error es relacionado con JWT inválido o sesión faltante
 */
export function isJWTError(error: any): boolean {
  const errorMessage = error?.message || error?.toString() || '';
  return errorMessage.includes('User from sub claim in JWT does not exist') ||
         errorMessage.includes('JWT does not exist') ||
         errorMessage.includes('Invalid JWT') ||
         errorMessage.includes('JWT expired') ||
         errorMessage.includes('Auth session missing') ||
         errorMessage.includes('AuthSessionMissingError');
}
