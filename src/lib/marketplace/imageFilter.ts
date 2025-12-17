/**
 * Utilidades para filtrar productos con imágenes válidas.
 * Oculta productos sin imágenes del marketplace sin eliminarlos de la BD.
 */

import { MarketplaceProduct } from "@/types/supabase";

/**
 * Lista de URLs conocidas como rotas (404) que deben filtrarse.
 * Se actualiza cuando se detectan imágenes rotas.
 * 
 * NOTA: Esta lista debe mantenerse pequeña y solo incluir URLs explícitamente
 * verificadas como rotas. El sistema híbrido manejará el fallback automático.
 */
const BROKEN_IMAGE_URLS = new Set<string>([
  // Solo URLs explícitamente verificadas como rotas
  // 'https://www.truper.com/media/import/imagenes/SK4.jpg', // Comentado: dejar que el sistema híbrido maneje
]);

/**
 * Verifica si un producto tiene al menos una imagen válida.
 * Una imagen es válida si:
 * - Es una URL externa (http/https) con formato válido
 * - Es una ruta local que empieza con /images/
 * 
 * NOTA: Este filtro es menos estricto para permitir que el sistema híbrido
 * maneje el fallback. Solo filtra URLs claramente inválidas o rotas conocidas.
 * 
 * Se filtran:
 * - Arrays vacíos
 * - Strings vacíos o solo espacios
 * - Valores null/undefined
 * - URLs rotas conocidas explícitamente
 */
export function hasValidImages(product: MarketplaceProduct): boolean {
  const images = product.images;
  
  // Si no hay imágenes o es null/undefined
  if (!images || !Array.isArray(images) || images.length === 0) {
    return false;
  }
  
  // Verificar si hay al menos una imagen válida
  for (const img of images) {
    // Filtrar valores null, undefined, o no-string
    if (!img || typeof img !== 'string') {
      continue;
    }
    
    const trimmedImg = img.trim();
    
    // Filtrar strings vacíos después de trim
    if (trimmedImg.length === 0) {
      continue;
    }
    
    // URL externa válida (debe empezar con http:// o https://)
    if (trimmedImg.startsWith('http://') || trimmedImg.startsWith('https://')) {
      // Verificar que no sea solo "http://" o "https://" sin más contenido
      if (trimmedImg.length > 7) {
        // Verificar si la URL está en la lista de URLs rotas conocidas
        // Solo filtrar URLs explícitamente marcadas como rotas
        if (BROKEN_IMAGE_URLS.has(trimmedImg)) {
          continue; // Saltar esta URL rota conocida
        }
        // Aceptar cualquier URL externa válida (el sistema híbrido manejará el fallback)
        // Incluyendo URLs de Truper, Syscom, etc.
        return true;
      }
      continue;
    }
    
    // Ruta local válida (debe empezar con /images/ y tener más contenido)
    if (trimmedImg.startsWith('/images/')) {
      // Verificar que no sea solo "/images/" sin más contenido
      if (trimmedImg.length > 8) {
        return true;
      }
      continue;
    }
  }
  
  return false;
}

/**
 * Filtra un array de productos para mostrar solo aquellos con imágenes válidas.
 */
export function filterProductsWithImages(products: MarketplaceProduct[]): MarketplaceProduct[] {
  return products.filter(hasValidImages);
}

