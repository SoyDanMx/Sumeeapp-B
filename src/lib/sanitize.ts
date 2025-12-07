import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitiza HTML permitiendo solo tags seguros
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitiza input de texto removiendo caracteres peligrosos
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remover < y >
    .replace(/javascript:/gi, '') // Remover javascript: protocol
    .replace(/on\w+=/gi, '') // Remover event handlers
    .slice(0, 500); // Limitar longitud
}

/**
 * Sanitiza número de teléfono
 */
export function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, '').slice(0, 15);
}

/**
 * Sanitiza email
 */
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase().slice(0, 254);
}




