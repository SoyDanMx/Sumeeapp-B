/**
 * Utilidades centralizadas para manejo de URLs y redirecciones
 * Soluciona el error PKCE al construir URLs dinámicamente
 */

/**
 * Obtiene la URL base del entorno actual
 * Prioriza window.location.origin en el cliente para máxima compatibilidad
 */
export function getBaseUrl(): string {
  // En el cliente (navegador)
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // En el servidor, usar variables de entorno
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  // Fallback para desarrollo local
  return 'http://localhost:3010';
}

/**
 * Construye la URL de callback de autenticación de forma dinámica
 * Esta función es la clave para resolver el error PKCE
 */
export function getRedirectUrl(path: string = '/auth/callback'): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}${path}`;
}

/**
 * Construye la URL de confirmación de email de forma dinámica
 * Específicamente para el flujo de registro
 * IMPORTANTE: Esta URL debe estar whitelisted en Supabase Dashboard → Authentication → URL Configuration
 */
export function getEmailConfirmationUrl(): string {
  // En producción, usar siempre el dominio correcto para evitar problemas
  const isProduction = process.env.NODE_ENV === 'production';
  
  let baseUrl: string;
  
  if (isProduction) {
    // URL fija en producción - debe coincidir con la URL whitelisted en Supabase
    baseUrl = 'https://sumeeapp.com';
  } else {
    // En desarrollo, usar la función getBaseUrl() que maneja window.location.origin
    baseUrl = getBaseUrl();
  }
  
  const callbackUrl = `${baseUrl}/auth/callback`;
  
  // Validar que la URL sea válida
  try {
    const url = new URL(callbackUrl);
    // Log solo en desarrollo para debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ URL de confirmación generada:', callbackUrl);
    }
    return callbackUrl;
  } catch (error) {
    console.error('❌ URL de confirmación inválida:', callbackUrl, error);
    // Fallback seguro a producción
    return 'https://sumeeapp.com/auth/callback';
  }
}

/**
 * Normaliza un número de WhatsApp a formato estándar (52XXXXXXXXXX)
 */
export function normalizeWhatsappNumber(input: string): { normalized: string; isValid: boolean } {
  const digits = (input || "").replace(/\D/g, "");

  if (digits.length === 0) {
    return { normalized: "", isValid: false };
  }

  if (digits.startsWith("521") && digits.length === 13) {
    return { normalized: `52${digits.slice(3)}`, isValid: true };
  }

  if (digits.startsWith("52") && digits.length === 12) {
    return { normalized: digits, isValid: true };
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    const trimmed = digits.slice(1);
    return {
      normalized: trimmed.length === 10 ? `52${trimmed}` : digits,
      isValid: trimmed.length === 10,
    };
  }

  if (digits.length === 10) {
    return { normalized: `52${digits}`, isValid: true };
  }

  if (digits.length > 12 && digits.startsWith("52")) {
    const trimmed = digits.slice(0, 12);
    return { normalized: trimmed, isValid: trimmed.length === 12 };
  }

  return { normalized: digits, isValid: false };
}

/**
 * Formatea un número de WhatsApp normalizado para mostrar (XX XXXX XXXX)
 */
export function formatWhatsappForDisplay(normalized: string): string {
  if (!normalized) return "";

  const localDigits = normalized.startsWith("52")
    ? normalized.slice(2)
    : normalized;

  if (localDigits.length === 10) {
    return localDigits.replace(/(\d{2})(\d{4})(\d{4})/, "$1 $2 $3");
  }

  return normalized;
}

/**
 * Construye la URL de redirección después del login exitoso
 * Redirige al dashboard apropiado basado en el rol del usuario
 */
export function getPostLoginRedirectUrl(): string {
  return getRedirectUrl('/dashboard');
}

/**
 * Construye la URL de redirección para profesionales
 * Redirige específicamente al dashboard profesional
 */
export function getProfessionalDashboardUrl(): string {
  return getRedirectUrl('/professional-dashboard');
}

/**
 * Construye la URL de redirección para clientes
 * Redirige específicamente al dashboard de cliente
 */
export function getClientDashboardUrl(): string {
  return getRedirectUrl('/dashboard/client');
}

/**
 * Valida si una URL es segura para redirección
 * Previene ataques de redirección abierta
 */
export function isValidRedirectUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const baseUrl = getBaseUrl();
    const baseUrlObj = new URL(baseUrl);
    
    // Verificar que la URL pertenezca al mismo origen
    return urlObj.origin === baseUrlObj.origin;
  } catch {
    return false;
  }
}

/**
 * Construye URL de redirección segura
 * Solo permite redirecciones dentro del mismo dominio
 */
export function getSafeRedirectUrl(path: string): string {
  const fullUrl = getRedirectUrl(path);
  
  if (isValidRedirectUrl(fullUrl)) {
    return fullUrl;
  }
  
  // Fallback seguro
  return getPostLoginRedirectUrl();
}

/**
 * Obtiene información de debug sobre las URLs
 * Útil para debugging en desarrollo
 */
export function getUrlDebugInfo() {
  return {
    baseUrl: getBaseUrl(),
    redirectUrl: getRedirectUrl(),
    emailConfirmationUrl: getEmailConfirmationUrl(),
    postLoginUrl: getPostLoginRedirectUrl(),
    professionalDashboardUrl: getProfessionalDashboardUrl(),
    clientDashboardUrl: getClientDashboardUrl(),
    isClient: typeof window !== 'undefined',
    isServer: typeof window === 'undefined',
    environment: process.env.NODE_ENV,
    vercelUrl: process.env.VERCEL_URL,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL
  };
}
