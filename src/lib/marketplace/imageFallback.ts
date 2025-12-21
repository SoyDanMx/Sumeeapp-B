/**
 * Utilidades para manejar fallback de imágenes híbridas.
 * Si una URL externa falla, intenta cargar la imagen local correspondiente.
 */

import { MarketplaceProduct } from "@/types/supabase";

/**
 * Extrae posibles identificadores (código/clave) del título del producto
 * para buscar imágenes locales como respaldo.
 */
export function extractProductIdentifiers(
  title: string,
  description?: string | null
): string[] {
  const text = (title + " " + (description || "")).toUpperCase();
  const identifiers: string[] = [];

  // Estrategia 1: Buscar clave con guión al inicio (ej: "RMAX-7NX -")
  const claveStartMatch = text.match(/^([A-Z]{2,6}-\d{1,4}[A-Z]{0,2})(?:\s*-|\s+|$)/);
  if (claveStartMatch) {
    identifiers.push(claveStartMatch[1]);
  }

  // Estrategia 2: Buscar clave con guión en cualquier parte
  const claveMatch = text.match(/\b([A-Z]{2,6}-\d{1,4}[A-Z]{0,2})\b/);
  if (claveMatch && !identifiers.includes(claveMatch[1])) {
    identifiers.push(claveMatch[1]);
  }

  // Estrategia 3: Buscar clave sin guión y agregar guión
  const claveNoDashMatch = text.match(/\b([A-Z]{2,6})(\d{1,4})([A-Z]{0,2})\b/);
  if (claveNoDashMatch) {
    const claveConGuion = `${claveNoDashMatch[1]}-${claveNoDashMatch[2]}${claveNoDashMatch[3]}`;
    if (!identifiers.includes(claveConGuion)) {
      identifiers.push(claveConGuion);
    }
  }

  // Estrategia 4: Buscar código numérico (5-7 dígitos)
  const codeMatch = text.match(/\b(\d{5,7})\b/);
  if (codeMatch) {
    identifiers.push(codeMatch[1]);
  }

  // Estrategia 5: Variaciones sin guión
  identifiers.forEach((id) => {
    const sinGuion = id.replace(/-/g, "");
    if (!identifiers.includes(sinGuion)) {
      identifiers.push(sinGuion);
    }
  });

  return identifiers;
}

/**
 * Genera posibles rutas de imágenes locales basadas en identificadores del producto.
 */
export function getLocalImagePaths(identifiers: string[]): string[] {
  const paths: string[] = [];

  identifiers.forEach((id) => {
    // Formato directo: /images/marketplace/truper/{id}.jpg
    paths.push(`/images/marketplace/truper/${id}.jpg`);

    // Variaciones comunes
    if (id.includes("-")) {
      const sinGuion = id.replace(/-/g, "");
      paths.push(`/images/marketplace/truper/${sinGuion}.jpg`);
    }

    // Prefijos comunes
    const prefixes = ["INT-", "CB-", "REP-", "CJ-"];
    prefixes.forEach((prefix) => {
      if (!id.startsWith(prefix)) {
        paths.push(`/images/marketplace/truper/${prefix}${id}.jpg`);
      }
    });
  });

  return [...new Set(paths)]; // Eliminar duplicados
}

/**
 * Obtiene la mejor imagen disponible para un producto.
 * Prioriza: URL externa válida > Imagen local > null
 */
export function getBestImageForProduct(
  product: MarketplaceProduct
): string | null {
  const images = product.images;

  if (!images || !Array.isArray(images) || images.length === 0) {
    return null;
  }

  // Primero, buscar URLs externas válidas
  for (const img of images) {
    if (!img || typeof img !== "string") continue;

    const trimmedImg = img.trim();
    if (trimmedImg.length === 0) continue;

    // Si es URL externa válida, usarla
    if (
      (trimmedImg.startsWith("http://") || trimmedImg.startsWith("https://")) &&
      trimmedImg.length > 7
    ) {
      // Verificar que no esté en la lista de URLs rotas conocidas
      const BROKEN_URLS = new Set([
        "https://www.truper.com/media/import/imagenes/SK4.jpg",
        "https://www.truper.com/media/import/imagenes/SK2.jpg",
        "https://www.truper.com/media/import/imagenes/SK-4.jpg",
        "https://www.truper.com/media/import/imagenes/SK-2.jpg",
        "https://www.truper.com/media/import/imagenes/4.jpg",
        "https://www.truper.com/media/import/imagenes/2.jpg",
        "https://www.truper.com/media/import/imagenes/MOT5020.jpg",
      ]);
      if (!BROKEN_URLS.has(trimmedImg)) {
        return trimmedImg;
      }
    }

    // Si es ruta local válida, usarla
    if (trimmedImg.startsWith("/images/") && trimmedImg.length > 8) {
      return trimmedImg;
    }
  }

  // Si no hay imágenes válidas, intentar generar rutas locales basadas en identificadores
  const identifiers = extractProductIdentifiers(
    product.title,
    product.description
  );
  if (identifiers.length > 0) {
    const localPaths = getLocalImagePaths(identifiers);
    // Retornar la primera ruta local potencial (el componente verificará si existe)
    return localPaths[0] || null;
  }

  return null;
}

/**
 * Obtiene la imagen de fallback local si la URL externa falla.
 * Esta función se usa en el handler onError de los componentes Image.
 */
export function getLocalFallbackImage(
  product: MarketplaceProduct,
  failedUrl: string
): string | null {
  // Solo intentar fallback si la URL que falló es externa
  if (!failedUrl.startsWith("http")) {
    return null;
  }

  const identifiers = extractProductIdentifiers(
    product.title,
    product.description
  );
  if (identifiers.length > 0) {
    const localPaths = getLocalImagePaths(identifiers);
    // Retornar la primera ruta local potencial
    return localPaths[0] || null;
  }

  return null;
}

