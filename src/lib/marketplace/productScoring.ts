/**
 * Sistema de Scoring de Productos para Tracción
 * Calcula un score basado en múltiples factores que indican tracción y rentabilidad
 */

import { MarketplaceProduct } from "@/types/supabase";

export interface ProductScore {
  product: MarketplaceProduct;
  score: number;
  factors: {
    views: number;
    likes: number;
    recency: number;
    priceCompetitiveness: number;
    completeness: number;
    condition: number;
  };
}

/**
 * Calcula el score de tracción de un producto
 * Factores considerados:
 * 1. Views count (30%): Más vistas = más interés
 * 2. Likes count (15%): Más likes = más popular
 * 3. Recency (20%): Productos nuevos tienen más tracción
 * 4. Price competitiveness (15%): Precios competitivos atraen más
 * 5. Completeness (15%): Productos con imágenes y descripción completa
 * 6. Condition (5%): Productos nuevos tienen más tracción
 */
export function calculateProductScore(product: MarketplaceProduct): ProductScore {
  const now = Date.now();
  const createdAt = new Date(product.created_at).getTime();
  const daysSinceCreation = (now - createdAt) / (1000 * 60 * 60 * 24);
  
  // Factor 1: Views (30% del score)
  // Normalizar views: log scale para evitar que productos con muchas vistas dominen
  // Si no hay vistas, usar score base basado en otros factores
  const hasViews = product.views_count > 0;
  const viewsScore = hasViews 
    ? Math.min(Math.log10(product.views_count + 1) * 10, 100)
    : 50; // Score base si no hay vistas (sistema nuevo)
  
  // Factor 2: Likes (15% del score)
  // Normalizar likes: similar a views
  const hasLikes = product.likes_count > 0;
  const likesScore = hasLikes
    ? Math.min(Math.log10(product.likes_count + 1) * 20, 100)
    : 50; // Score base si no hay likes (sistema nuevo)
  
  // Factor 3: Recency (20% del score) - Aumentado porque es importante cuando no hay métricas
  // Productos más recientes tienen más score
  // Decay exponencial: productos de hace 60 días tienen score bajo
  const recencyScore = Math.max(0, 100 * Math.exp(-daysSinceCreation / 60));
  
  // Factor 4: Price Competitiveness (15% del score) - Aumentado porque es importante
  // Precios entre $50 y $15,000 tienen mejor score (rango más amplio para marketplace)
  // Precios muy bajos o muy altos tienen menos score
  let priceScore = 60; // Score base más alto
  if (product.price > 0) {
    if (product.price >= 50 && product.price <= 15000) {
      priceScore = 100; // Rango óptimo
    } else if (product.price < 50) {
      priceScore = Math.max(40, 60 - (50 - product.price) / 5); // Muy barato puede ser sospechoso
    } else {
      priceScore = Math.max(40, 100 - (product.price - 15000) / 2000); // Muy caro tiene menos tracción
    }
  }
  
  // Factor 5: Completeness (15% del score) - Aumentado porque es crítico para conversión
  // Productos con imágenes y descripción completa tienen más score
  let completenessScore = 0;
  if (product.images && product.images.length > 0) {
    completenessScore += 60; // Tiene imágenes (más importante)
    if (product.images.length > 1) {
      completenessScore += 10; // Bonus por múltiples imágenes
    }
  }
  if (product.description && product.description.length > 50) {
    completenessScore += 25; // Descripción completa
    if (product.description.length > 200) {
      completenessScore += 5; // Bonus por descripción detallada
    }
  }
  if (product.title && product.title.length > 10) {
    completenessScore += 15; // Título descriptivo
  }
  
  // Factor 6: Condition (5% del score)
  // Productos nuevos tienen más tracción
  let conditionScore = 50; // Score base
  if (product.condition === "nuevo") {
    conditionScore = 100;
  } else if (product.condition === "usado_excelente") {
    conditionScore = 80;
  } else if (product.condition === "usado_bueno") {
    conditionScore = 60;
  } else {
    conditionScore = 40;
  }
  
  // Calcular score total con pesos ajustados
  const totalScore = 
    viewsScore * 0.30 +
    likesScore * 0.15 +
    recencyScore * 0.20 +
    priceScore * 0.15 +
    completenessScore * 0.15 +
    conditionScore * 0.05;
  
  return {
    product,
    score: Math.round(totalScore * 100) / 100, // Redondear a 2 decimales
    factors: {
      views: Math.round(viewsScore),
      likes: Math.round(likesScore),
      recency: Math.round(recencyScore),
      priceCompetitiveness: Math.round(priceScore),
      completeness: Math.round(completenessScore),
      condition: Math.round(conditionScore),
    },
  };
}

/**
 * Ordena productos por score de tracción
 */
export function sortByTractionScore(products: MarketplaceProduct[]): MarketplaceProduct[] {
  const scoredProducts = products.map(calculateProductScore);
  
  // Ordenar por score descendente
  scoredProducts.sort((a, b) => b.score - a.score);
  
  return scoredProducts.map((scored) => scored.product);
}

/**
 * Obtiene los productos con mayor tracción
 */
export function getTopTractionProducts(
  products: MarketplaceProduct[],
  limit: number = 24
): MarketplaceProduct[] {
  const sorted = sortByTractionScore(products);
  return sorted.slice(0, limit);
}

/**
 * Obtiene productos destacados basados en tracción y rentabilidad
 * Combina múltiples factores para encontrar los mejores productos
 */
export function getFeaturedProducts(
  products: MarketplaceProduct[],
  limit: number = 24
): MarketplaceProduct[] {
  if (products.length === 0) return [];
  
  // Calcular scores
  const scoredProducts = products.map(calculateProductScore);
  
  // Ordenar por score descendente
  scoredProducts.sort((a, b) => b.score - a.score);
  
  // Calcular score mínimo dinámico basado en la distribución de scores
  // Usar percentil 25 como mínimo (excluir el 25% inferior)
  const scores = scoredProducts.map(s => s.score).sort((a, b) => b - a);
  const percentile25Index = Math.floor(scores.length * 0.25);
  const minScore = scores.length > 0 ? Math.max(15, scores[percentile25Index] || 15) : 15;
  
  // Filtrar productos con score mínimo
  const filtered = scoredProducts.filter((scored) => scored.score >= minScore);
  
  // Si después del filtro tenemos menos productos que el límite, usar todos los ordenados
  const result = filtered.length >= limit 
    ? filtered.slice(0, limit)
    : scoredProducts.slice(0, limit);
  
  // Debug en desarrollo
  if (process.env.NODE_ENV === 'development' && result.length > 0) {
    console.log('🎯 [SCORING] Productos destacados seleccionados:', {
      total: products.length,
      seleccionados: result.length,
      scoreMinimo: minScore,
      scoreMaximo: result[0]?.score,
      scorePromedio: (result.reduce((sum, s) => sum + s.score, 0) / result.length).toFixed(2),
    });
  }
  
  // Devolver top productos
  return result.map((scored) => scored.product);
}

