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
 */
export function getEmailConfirmationUrl(): string {
  return getRedirectUrl('/auth/callback');
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
