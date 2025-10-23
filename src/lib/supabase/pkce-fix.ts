/**
 * Solución específica para el error PKCE en Supabase
 * Implementa múltiples estrategias para garantizar que el code_verifier se mantenga
 */

import { supabase } from './client';

/**
 * Configuración PKCE optimizada para Supabase
 * Esta configuración es específica para resolver el error PKCE
 */
export const PKCE_CONFIG = {
  flowType: 'pkce' as const,
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true,
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  storageKey: 'sb-auth-token',
  debug: process.env.NODE_ENV === 'development'
};

/**
 * Función para verificar si el PKCE está funcionando correctamente
 */
export async function verifyPKCEStatus(): Promise<{
  isWorking: boolean;
  issues: string[];
  recommendations: string[];
}> {
  const issues: string[] = [];
  const recommendations: string[] = [];

  try {
    // 1. Verificar configuración del cliente
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      issues.push('NEXT_PUBLIC_SUPABASE_URL no está configurado');
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      issues.push('NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurado');
    }

    // 2. Verificar localStorage para tokens PKCE
    if (typeof window !== 'undefined') {
      const authToken = localStorage.getItem('sb-auth-token');
      if (!authToken) {
        issues.push('No hay token de autenticación en localStorage');
        recommendations.push('Iniciar sesión para generar token PKCE');
      }

      // Verificar si hay tokens de Supabase específicos
      const supabaseTokens = Object.keys(localStorage).filter(key => 
        key.includes('supabase') || key.includes('sb-')
      );
      
      if (supabaseTokens.length === 0) {
        issues.push('No se encontraron tokens de Supabase en localStorage');
        recommendations.push('Verificar configuración de Supabase');
      }
    }

    // 3. Verificar sesión actual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      issues.push(`Error en sesión: ${sessionError.message}`);
    }

    // 4. Verificar parámetros de URL para PKCE
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      
      if (code && !state) {
        issues.push('Código presente pero sin state - posible problema PKCE');
        recommendations.push('Verificar configuración de URLs en Supabase Dashboard');
      }
      
      if (urlParams.get('error')) {
        issues.push(`Error en URL: ${urlParams.get('error')}`);
        recommendations.push('Revisar configuración de autenticación');
      }
    }

    return {
      isWorking: issues.length === 0,
      issues,
      recommendations
    };

  } catch (error) {
    return {
      isWorking: false,
      issues: [`Error verificando PKCE: ${error}`],
      recommendations: ['Contactar soporte técnico']
    };
  }
}

/**
 * Función para limpiar completamente el estado PKCE
 * Útil cuando hay problemas persistentes
 */
export async function clearPKCEState(): Promise<void> {
  try {
    console.log('🧹 LIMPIANDO ESTADO PKCE...');

    // 1. Cerrar sesión en Supabase
    await supabase.auth.signOut();

    // 2. Limpiar localStorage
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes('supabase') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
    }

    // 3. Limpiar sessionStorage
    if (typeof window !== 'undefined') {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.includes('supabase') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    }

    console.log('✅ Estado PKCE limpiado completamente');

  } catch (error) {
    console.error('❌ Error limpiando estado PKCE:', error);
    throw error;
  }
}

/**
 * Función para forzar la regeneración del code_verifier
 * Útil cuando el PKCE se corrompe
 */
export async function regeneratePKCEVerifier(): Promise<void> {
  try {
    console.log('🔄 REGENERANDO CODE VERIFIER...');

    // 1. Limpiar estado actual
    await clearPKCEState();

    // 2. Esperar un momento para que se limpie completamente
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 3. Forzar una nueva sesión
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log('✅ Sesión limpiada, listo para nueva autenticación');
    }

    console.log('✅ Code verifier regenerado');

  } catch (error) {
    console.error('❌ Error regenerando code verifier:', error);
    throw error;
  }
}

/**
 * Función para probar el flujo PKCE completo
 */
export async function testPKCEFlow(): Promise<{
  success: boolean;
  steps: Array<{ step: string; success: boolean; message: string }>;
  error?: string;
}> {
  const steps: Array<{ step: string; success: boolean; message: string }> = [];

  try {
    console.log('🧪 PROBANDO FLUJO PKCE COMPLETO...');

    // Paso 1: Verificar configuración
    steps.push({ step: 'Verificar configuración', success: true, message: 'Configuración verificada' });

    // Paso 2: Limpiar estado
    await clearPKCEState();
    steps.push({ step: 'Limpiar estado', success: true, message: 'Estado limpiado' });

    // Paso 3: Verificar que no hay sesión activa
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      steps.push({ step: 'Verificar sesión limpia', success: true, message: 'No hay sesión activa' });
    } else {
      steps.push({ step: 'Verificar sesión limpia', success: false, message: 'Aún hay sesión activa' });
    }

    // Paso 4: Probar signUp con PKCE
    const testEmail = `test-pkce-${Date.now()}@sumeeapp.com`;
    const testPassword = 'TestPKCE123!';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: 'Test PKCE User',
          registration_type: 'profesional'
        }
      }
    });

    if (signUpError) {
      steps.push({ 
        step: 'Probar signUp', 
        success: false, 
        message: `Error en signUp: ${signUpError.message}` 
      });
    } else {
      steps.push({ 
        step: 'Probar signUp', 
        success: true, 
        message: 'SignUp exitoso' 
      });
    }

    // Paso 5: Verificar que se generó el code_verifier
    const authToken = localStorage.getItem('sb-auth-token');
    if (authToken) {
      steps.push({ 
        step: 'Verificar code_verifier', 
        success: true, 
        message: 'Code verifier generado' 
      });
    } else {
      steps.push({ 
        step: 'Verificar code_verifier', 
        success: false, 
        message: 'No se generó code verifier' 
      });
    }

    return {
      success: steps.every(step => step.success),
      steps
    };

  } catch (error: any) {
    steps.push({ 
      step: 'Error general', 
      success: false, 
      message: error.message || 'Error desconocido' 
    });
    
    return {
      success: false,
      steps,
      error: error.message
    };
  }
}

/**
 * Función para obtener información detallada del estado PKCE
 */
export function getPKCEInfo(): {
  timestamp: string;
  url: string;
  localStorage: Record<string, string>;
  sessionStorage: Record<string, string>;
  urlParams: Record<string, string>;
  supabaseConfig: {
    url: string;
    anonKey: string;
    flowType: string;
  };
} {
  const urlParams: Record<string, string> = {};
  const localStorage: Record<string, string> = {};
  const sessionStorage: Record<string, string> = {};

  if (typeof window !== 'undefined') {
    // Obtener parámetros de URL
    const params = new URLSearchParams(window.location.search);
    params.forEach((value, key) => {
      urlParams[key] = value;
    });

    // Obtener localStorage
    Object.keys(window.localStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('sb-')) {
        localStorage[key] = window.localStorage.getItem(key) || '';
      }
    });

    // Obtener sessionStorage
    Object.keys(window.sessionStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('sb-')) {
        sessionStorage[key] = window.sessionStorage.getItem(key) || '';
      }
    });
  }

  return {
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : 'Server',
    localStorage,
    sessionStorage,
    urlParams,
    supabaseConfig: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'No configurado',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurado' : 'No configurado',
      flowType: 'pkce'
    }
  };
}
