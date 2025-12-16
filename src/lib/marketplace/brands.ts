/**
 * Sistema de Marcas del Marketplace
 * Extrae y gestiona marcas de productos basándose en títulos y descripciones
 */

// Marcas conocidas comunes por categoría
export const KNOWN_BRANDS: Record<string, string[]> = {
  sistemas: [
    "AUFIT",
    "EZVIZ",
    "HIKVISION",
    "AX PRO",
    "KLEIN",
    "CONDUMEX",
    "SECURITHOR",
    "VISTA",
    "UGREEN",
    "TP-LINK",
    "D-LINK",
    "CISCO",
    "NETGEAR",
    "LINKSYS",
    "ASUS",
    "HP",
    "DELL",
    "LENOVO",
    "SAMSUNG",
    "LG",
    "SONY",
    "PANASONIC",
    "INTEL",
    "AMD",
    "NVIDIA",
    "WESTERN DIGITAL",
    "SEAGATE",
    "KINGSTON",
    "SANDISK",
    "CRUCIAL",
    "CORSAIR",
    "THERMALTAKE",
    "COOLER MASTER",
    "MICROSOFT",
    "APPLE",
    "GOOGLE",
    "AMAZON",
    "RING",
    "ARLO",
    "NEST",
    "PHILIPS",
    "XIAOMI",
    "HUAWEI",
    "ZTE",
    "NOKIA",
    "MOTOROLA",
  ],
  electricidad: [
    "TRUPER",
    "DEWALT",
    "BOSCH",
    "MAKITA",
    "BLACK+DECKER",
    "MILWAUKEE",
    "RYOBI",
    "HITACHI",
    "METABO",
    "FEIN",
    "SKIL",
    "PORTER CABLE",
    "RIDGID",
    "CRAFTSMAN",
  ],
  plomeria: [
    "TRUPER",
    "MOEN",
    "DELTA",
    "KOHLER",
    "AMERICAN STANDARD",
    "GROHE",
    "HANSGROHE",
    "TOTO",
    "GERBER",
    "PEERLESS",
  ],
  construccion: [
    "TRUPER",
    "DEWALT",
    "BOSCH",
    "MAKITA",
    "MILWAUKEE",
    "HILTI",
    "STANLEY",
    "CRAFTSMAN",
    "RIDGID",
  ],
  mecanica: [
    "TRUPER",
    "SNAP-ON",
    "CRAFTSMAN",
    "DEWALT",
    "GEARWRENCH",
    "TEKTON",
    "HUSKY",
    "KOBALT",
  ],
  pintura: [
    "SHERWIN-WILLIAMS",
    "BEHR",
    "VALSPAR",
    "BENJAMIN MOORE",
    "PPG",
    "GLIDDEN",
    "RUST-OLEUM",
  ],
  jardineria: [
    "TRUPER",
    "BLACK+DECKER",
    "RYOBI",
    "HUSQVARNA",
    "STIHL",
    "ECHO",
    "TORO",
    "SCOTTS",
  ],
};

/**
 * Extrae marcas de una lista de productos
 */
export function extractBrandsFromProducts<T extends { title: string; description?: string }>(
  products: T[],
  categoryId?: string | null
): string[] {
  const brands = new Set<string>();
  
  // Obtener marcas conocidas para la categoría
  const categorySlug = categoryId || "sistemas"; // Default a sistemas
  const knownBrands = KNOWN_BRANDS[categorySlug] || KNOWN_BRANDS.sistemas;
  
  // Buscar marcas en títulos y descripciones
  for (const product of products) {
    const titleUpper = (product.title || "").toUpperCase();
    const descUpper = (product.description || "").toUpperCase();
    const combinedText = `${titleUpper} ${descUpper}`;
    
    // Buscar marcas conocidas
    for (const brand of knownBrands) {
      const brandUpper = brand.toUpperCase();
      // Búsqueda más flexible: buscar la marca completa o variaciones
      if (combinedText.includes(brandUpper) || 
          combinedText.includes(brandUpper.replace(/\s+/g, "")) ||
          combinedText.includes(brandUpper.replace(/-/g, ""))) {
        brands.add(brand);
      }
    }
  }
  
  // Si no encontramos marcas en los productos cargados, pero hay marcas conocidas,
  // incluir las marcas conocidas más comunes para que siempre aparezcan opciones
  if (brands.size === 0 && knownBrands.length > 0) {
    // Incluir las primeras 10 marcas conocidas como fallback
    knownBrands.slice(0, 10).forEach(brand => brands.add(brand));
  }
  
  return Array.from(brands).sort();
}

/**
 * Obtiene marcas disponibles para una categoría
 */
export function getAvailableBrands(categoryId?: string | null): string[] {
  const categorySlug = categoryId || "sistemas";
  return KNOWN_BRANDS[categorySlug] || KNOWN_BRANDS.sistemas || [];
}

/**
 * Normaliza el nombre de una marca para búsqueda
 */
export function normalizeBrandName(brand: string): string {
  return brand
    .toUpperCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, "");
}

