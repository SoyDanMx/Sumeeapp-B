/**
 * Resolvedor inteligente de URLs de imágenes para productos Truper y Syscom.
 * 
 * Estrategia:
 * 1. Si hay URL externa, verifica múltiples variaciones (con/sin guiones)
 * 2. Si ninguna funciona, busca imagen local basada en identificadores
 * 3. Genera múltiples variaciones de URLs para maximizar éxito
 * 4. Soporta productos de Syscom usando external_code
 */

import { MarketplaceProduct } from "@/types/supabase";

// URLs rotas conocidas - evitar generar o usar estas URLs
const BROKEN_TRUPER_URLS = new Set([
  "https://www.truper.com/media/import/imagenes/SK4.jpg",
  "https://www.truper.com/media/import/imagenes/SK2.jpg",
  "https://www.truper.com/media/import/imagenes/SK-4.jpg",
  "https://www.truper.com/media/import/imagenes/SK-2.jpg",
  "https://www.truper.com/media/import/imagenes/4.jpg",
  "https://www.truper.com/media/import/imagenes/2.jpg",
  "https://www.truper.com/media/import/imagenes/MOT5020.jpg",
]);

/**
 * Genera URL de imagen para productos Syscom basada en el external_code.
 * Syscom provee imágenes en: https://www.syscom.mx/img-prod/{external_code}.jpg
 */
export function generateSyscomImageUrl(externalCode: string): string | null {
  if (!externalCode || typeof externalCode !== "string") {
    return null;
  }
  
  const cleanCode = externalCode.trim();
  if (cleanCode.length === 0) {
    return null;
  }
  
  // Syscom usa FTP3 para imágenes
  return `https://ftp3.syscom.mx/IMG/img_prod/${cleanCode}.jpg`;
}

/**
 * Genera todas las variaciones posibles de URL de Truper para un identificador.
 * Ejemplo: "PET-15X" genera:
 * - https://www.truper.com/media/import/imagenes/PET-15X.jpg
 * - https://www.truper.com/media/import/imagenes/PET15X.jpg
 * - https://www.truper.com/media/import/imagenes/PET-15.jpg
 * - https://www.truper.com/media/import/imagenes/PET15.jpg
 * 
 * Filtra automáticamente URLs rotas conocidas.
 */
export function generateTruperUrlVariations(identifier: string): string[] {
  const baseUrl = "https://www.truper.com/media/import/imagenes";
  const variations: string[] = [];

  // Variación original
  const original = `${baseUrl}/${identifier}.jpg`;
  if (!BROKEN_TRUPER_URLS.has(original)) {
    variations.push(original);
  }

  // Sin guiones
  const sinGuion = identifier.replace(/-/g, "");
  if (sinGuion !== identifier) {
    const urlSinGuion = `${baseUrl}/${sinGuion}.jpg`;
    if (!BROKEN_TRUPER_URLS.has(urlSinGuion)) {
      variations.push(urlSinGuion);
    }
  }

  // Sin última letra (si tiene)
  if (/[A-Z]$/.test(identifier)) {
    const sinUltimaLetra = identifier.slice(0, -1);
    const urlSinUltimaLetra = `${baseUrl}/${sinUltimaLetra}.jpg`;
    if (!BROKEN_TRUPER_URLS.has(urlSinUltimaLetra)) {
      variations.push(urlSinUltimaLetra);
    }
    const sinUltimaLetraSinGuion = sinUltimaLetra.replace(/-/g, "");
    if (sinUltimaLetraSinGuion !== sinUltimaLetra) {
      const urlSinUltimaLetraSinGuion = `${baseUrl}/${sinUltimaLetraSinGuion}.jpg`;
      if (!BROKEN_TRUPER_URLS.has(urlSinUltimaLetraSinGuion)) {
        variations.push(urlSinUltimaLetraSinGuion);
      }
    }
  }

  // Solo parte numérica (si tiene guión) - solo si el número es > 2 dígitos para evitar URLs genéricas rotas
  const match = identifier.match(/^([A-Z]+)-?(\d+)/);
  if (match) {
    const [, letras, numeros] = match;
    const urlLetrasNumeros = `${baseUrl}/${letras}${numeros}.jpg`;
    if (!BROKEN_TRUPER_URLS.has(urlLetrasNumeros)) {
      variations.push(urlLetrasNumeros);
    }
    // Solo agregar variación numérica si tiene más de 2 dígitos (evitar "4.jpg", "2.jpg" que están rotas)
    if (numeros.length > 2) {
      const urlSoloNumeros = `${baseUrl}/${numeros}.jpg`;
      if (!BROKEN_TRUPER_URLS.has(urlSoloNumeros)) {
        variations.push(urlSoloNumeros);
      }
    }
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
 * 1. Imagen de Syscom (si tiene external_code)
 * 2. URL externa existente que funcione
 * 3. Variaciones de URL de Truper generadas
 * 4. Imagen local basada en identificadores
 */
export function getSmartImageForProduct(
  product: MarketplaceProduct
): string | null {
  const images = product.images || [];

  // Paso 0: Si el producto tiene external_code, intentar imagen de Syscom primero
  if (product.external_code) {
    const syscomUrl = generateSyscomImageUrl(product.external_code);
    if (syscomUrl) {
      return syscomUrl;
    }
  }

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
      // URLs rotas conocidas - usar la constante compartida
      if (!BROKEN_TRUPER_URLS.has(trimmedImg)) {
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
 * 1. Imagen de Syscom (si aplica)
 * 2. Rutas locales existentes
 * 3. Rutas locales generadas
 * 4. URLs externas existentes
 * 5. URLs de Truper generadas
 */
export function getAllImageVariations(product: MarketplaceProduct): string[] {
  const variations: string[] = [];
  const images = product.images || [];
  const identifiers = extractEnhancedIdentifiers(product);

  // Paso 0: Priorizar imagen de Syscom si existe external_code
  if (product.external_code) {
    const syscomUrl = generateSyscomImageUrl(product.external_code);
    if (syscomUrl) {
      variations.push(syscomUrl);
    }
  }

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

  // Paso 3: URLs externas existentes (filtrar URLs rotas conocidas)
  const externalImages = images.filter(
    (img) =>
      typeof img === "string" &&
      (img.trim().startsWith("http://") || img.trim().startsWith("https://")) &&
      !BROKEN_TRUPER_URLS.has(img.trim())
  );
  externalImages.forEach((img) => {
    if (typeof img === "string" && img.trim().length > 0) {
      variations.push(img.trim());
    }
  });

  // Paso 4: Variaciones de URL de Truper generadas (ya filtradas por generateTruperUrlVariations)
  identifiers.forEach((id) => {
    const truperUrls = generateTruperUrlVariations(id);
    truperUrls.forEach((url) => {
      // Verificar doblemente que no esté en la lista de rotas y no esté duplicada
      if (!BROKEN_TRUPER_URLS.has(url) && !variations.includes(url)) {
        variations.push(url);
      }
    });
  });

  return variations;
}

