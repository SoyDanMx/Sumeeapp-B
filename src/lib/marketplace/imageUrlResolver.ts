/**
 * Resolvedor inteligente de URLs de imágenes para productos Truper.
 * 
 * Estrategia:
 * 1. Si hay URL externa, verifica múltiples variaciones (con/sin guiones)
 * 2. Si ninguna funciona, busca imagen local basada en identificadores
 * 3. Genera múltiples variaciones de URLs para maximizar éxito
 */

import { MarketplaceProduct } from "@/types/supabase";

/**
 * Genera todas las variaciones posibles de URL de Truper para un identificador.
 * Ejemplo: "PET-15X" genera:
 * - https://www.truper.com/media/import/imagenes/PET-15X.jpg
 * - https://www.truper.com/media/import/imagenes/PET15X.jpg
 * - https://www.truper.com/media/import/imagenes/PET-15.jpg
 * - https://www.truper.com/media/import/imagenes/PET15.jpg
 */
export function generateTruperUrlVariations(identifier: string): string[] {
  const baseUrl = "https://www.truper.com/media/import/imagenes";
  const variations: string[] = [];

  // Variación original
  variations.push(`${baseUrl}/${identifier}.jpg`);

  // Sin guiones
  const sinGuion = identifier.replace(/-/g, "");
  if (sinGuion !== identifier) {
    variations.push(`${baseUrl}/${sinGuion}.jpg`);
  }

  // Sin última letra (si tiene)
  if (/[A-Z]$/.test(identifier)) {
    const sinUltimaLetra = identifier.slice(0, -1);
    variations.push(`${baseUrl}/${sinUltimaLetra}.jpg`);
    const sinUltimaLetraSinGuion = sinUltimaLetra.replace(/-/g, "");
    if (sinUltimaLetraSinGuion !== sinUltimaLetra) {
      variations.push(`${baseUrl}/${sinUltimaLetraSinGuion}.jpg`);
    }
  }

  // Solo parte numérica (si tiene guión)
  const match = identifier.match(/^([A-Z]+)-?(\d+)/);
  if (match) {
    const [, letras, numeros] = match;
    variations.push(`${baseUrl}/${letras}${numeros}.jpg`);
    variations.push(`${baseUrl}/${numeros}.jpg`);
  }

  return [...new Set(variations)]; // Eliminar duplicados
}

/**
 * Extrae identificadores mejorados del producto.
 * Mejora la extracción para capturar mejor los códigos/claves.
 */
export function extractEnhancedIdentifiers(
  product: MarketplaceProduct
): string[] {
  const title = product.title || "";
  const description = product.description || "";
  const images = product.images || [];
  const text = `${title} ${description}`.toUpperCase();
  const identifiers: Set<string> = new Set();

  // Estrategia 1: De imágenes existentes (más confiable)
  for (const img of images) {
    if (typeof img === "string") {
      // Extraer de URL de Truper
      const truperMatch = img.match(/truper\.com.*?imagenes\/([^/]+)\.(jpg|webp|png)/i);
      if (truperMatch) {
        identifiers.add(truperMatch[1].toUpperCase());
      }

      // Extraer de ruta local
      const localMatch = img.match(/\/truper\/([^/]+)\.(jpg|webp|png)/i);
      if (localMatch) {
        identifiers.add(localMatch[1].toUpperCase());
      }
    }
  }

  // Estrategia 2: Buscar clave con guión al inicio
  const claveStartMatch = text.match(/^([A-Z]{2,6}-\d{1,4}[A-Z]{0,2})(?:\s*-|\s+|$)/);
  if (claveStartMatch) {
    identifiers.add(claveStartMatch[1]);
  }

  // Estrategia 3: Buscar clave con guión en cualquier parte
  const claveMatches = text.matchAll(/\b([A-Z]{2,6}-\d{1,4}[A-Z]{0,2})\b/g);
  for (const match of claveMatches) {
    identifiers.add(match[1]);
  }

  // Estrategia 4: Buscar clave sin guión y agregar guión
  const claveNoDashMatch = text.match(/\b([A-Z]{2,6})(\d{1,4})([A-Z]{0,2})\b/);
  if (claveNoDashMatch) {
    const claveConGuion = `${claveNoDashMatch[1]}-${claveNoDashMatch[2]}${claveNoDashMatch[3]}`;
    identifiers.add(claveConGuion);
    identifiers.add(`${claveNoDashMatch[1]}${claveNoDashMatch[2]}${claveNoDashMatch[3]}`);
  }

  // Estrategia 5: Buscar código numérico (5-7 dígitos)
  const codeMatches = text.matchAll(/\b(\d{5,7})\b/g);
  for (const match of codeMatches) {
    identifiers.add(match[1]);
  }

  return Array.from(identifiers);
}

/**
 * Obtiene la mejor imagen disponible para un producto con estrategia inteligente.
 * 
 * Prioridad:
 * 1. URL externa existente que funcione
 * 2. Variaciones de URL de Truper generadas
 * 3. Imagen local basada en identificadores
 */
export function getSmartImageForProduct(
  product: MarketplaceProduct
): string | null {
  const images = product.images || [];

  // Paso 1: Verificar imágenes existentes
  for (const img of images) {
    if (!img || typeof img !== "string") continue;

    const trimmedImg = img.trim();
    if (trimmedImg.length === 0) continue;

    // URL externa válida
    if (
      (trimmedImg.startsWith("http://") || trimmedImg.startsWith("https://")) &&
      trimmedImg.length > 7
    ) {
      // URLs rotas conocidas
      const BROKEN_URLS = new Set([
        "https://www.truper.com/media/import/imagenes/SK4.jpg",
      ]);
      if (!BROKEN_URLS.has(trimmedImg)) {
        return trimmedImg; // Intentar esta primero
      }
    }

    // Ruta local válida
    if (trimmedImg.startsWith("/images/") && trimmedImg.length > 8) {
      return trimmedImg;
    }
  }

  // Paso 2: Generar variaciones de URLs de Truper basadas en identificadores
  const identifiers = extractEnhancedIdentifiers(product);
  if (identifiers.length > 0) {
    // Priorizar el primer identificador (más probable)
    const primaryIdentifier = identifiers[0];
    const truperVariations = generateTruperUrlVariations(primaryIdentifier);
    
    // Retornar la primera variación (el componente intentará cargarla)
    if (truperVariations.length > 0) {
      return truperVariations[0];
    }
  }

  // Paso 3: Buscar imagen local
  if (identifiers.length > 0) {
    for (const id of identifiers) {
      const localPath = `/images/marketplace/truper/${id}.jpg`;
      // Retornar la primera ruta local potencial
      return localPath;
    }
  }

  return null;
}

/**
 * Obtiene todas las variaciones posibles de imagen para un producto.
 * Útil para intentar múltiples URLs en caso de fallo.
 * 
 * Orden de prioridad:
 * 1. Rutas locales existentes
 * 2. Rutas locales generadas
 * 3. URLs externas existentes
 * 4. URLs de Truper generadas
 */
export function getAllImageVariations(product: MarketplaceProduct): string[] {
  const variations: string[] = [];
  const images = product.images || [];
  const identifiers = extractEnhancedIdentifiers(product);

  // Paso 1: Priorizar rutas locales existentes
  const localImages = images.filter(
    (img) => typeof img === "string" && img.trim().startsWith("/images/")
  );
  localImages.forEach((img) => {
    if (typeof img === "string" && img.trim().length > 0) {
      variations.push(img.trim());
    }
  });

  // Paso 2: Rutas locales generadas (más confiables que URLs externas)
  identifiers.forEach((id) => {
    variations.push(`/images/marketplace/truper/${id}.jpg`);
    const sinGuion = id.replace(/-/g, "");
    if (sinGuion !== id) {
      variations.push(`/images/marketplace/truper/${sinGuion}.jpg`);
    }
  });

  // Paso 3: URLs externas existentes
  const externalImages = images.filter(
    (img) =>
      typeof img === "string" &&
      (img.trim().startsWith("http://") || img.trim().startsWith("https://"))
  );
  externalImages.forEach((img) => {
    if (typeof img === "string" && img.trim().length > 0) {
      variations.push(img.trim());
    }
  });

  // Paso 4: Variaciones de URL de Truper generadas
  identifiers.forEach((id) => {
    const truperUrls = generateTruperUrlVariations(id);
    truperUrls.forEach((url) => {
      if (!variations.includes(url)) {
        variations.push(url);
      }
    });
  });

  return variations;
}

