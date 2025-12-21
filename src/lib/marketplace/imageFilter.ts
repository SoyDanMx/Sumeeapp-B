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
 * Verifica si un producto tiene al menos una imagen válida O puede tener una imagen local.
 * 
 * NOTA CRÍTICA: Este filtro es MUY permisivo porque:
 * 1. El sistema híbrido manejará automáticamente el fallback a imágenes locales
 * 2. No queremos ocultar productos que pueden tener imágenes locales disponibles
 * 3. Solo filtramos productos que claramente NO tienen ninguna posibilidad de imagen
 * 
 * Se filtran SOLO:
 * - Arrays completamente vacíos o null/undefined
 * - Productos sin título (no podemos extraer código para buscar imagen local)
 * 
 * NO se filtran:
 * - URLs externas (aunque puedan fallar, el sistema híbrido las manejará)
 * - Productos con título (pueden tener imagen local disponible)
 */
export function hasValidImages(product: MarketplaceProduct): boolean {
  const images = product.images;
  
  // Si no hay imágenes en absoluto Y no tenemos título para buscar imagen local
  if ((!images || !Array.isArray(images) || images.length === 0)) {
    // Si el producto tiene título, permitirlo (el sistema híbrido buscará imagen local)
    if (product.title && product.title.trim().length > 0) {
      return true; // Permitir productos con título aunque no tengan imágenes (fallback local)
    }
    return false; // Solo filtrar si no hay imágenes NI título
  }
  
  // Si hay imágenes, verificar que al menos una tenga formato válido
  for (const img of images) {
    if (!img || typeof img !== 'string') {
      continue;
    }
    
    const trimmedImg = img.trim();
    
    if (trimmedImg.length === 0) {
      continue;
    }
    
    // Cualquier URL externa o ruta local es válida
    if (trimmedImg.startsWith('http://') || trimmedImg.startsWith('https://') || trimmedImg.startsWith('/images/')) {
      // Solo filtrar URLs explícitamente marcadas como rotas
      if (BROKEN_IMAGE_URLS.has(trimmedImg)) {
        continue;
      }
      return true;
    }
  }
  
  // Si llegamos aquí pero el producto tiene título, permitirlo (fallback local)
  if (product.title && product.title.trim().length > 0) {
    return true;
  }
  
  return false;
}

/**
 * Filtra un array de productos para mostrar solo aquellos con imágenes válidas.
 * ⚠️ También excluye productos con precio 0 como medida de seguridad adicional.
 */
export function filterProductsWithImages(products: MarketplaceProduct[]): MarketplaceProduct[] {
  return products.filter((product) => {
    // ⚠️ FILTRO CRÍTICO: Excluir productos con precio 0 (medida de seguridad adicional)
    if (product.price <= 0) {
      return false;
    }
    return hasValidImages(product);
  });
}

