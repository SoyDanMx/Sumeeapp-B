/**
 * Cliente de API de Syscom
 * Documentación: https://developers.syscom.mx/docs
 */

import axios, { AxiosInstance } from 'axios';

const SYSCOM_API_BASE = 'https://developers.syscom.mx/api/v1';
const SYSCOM_OAUTH_URL = 'https://developers.syscom.mx/oauth/token';

// Rate limit: 60 peticiones por minuto
const RATE_LIMIT = 60;
const RATE_WINDOW = 60000; // 1 minuto en milisegundos

// Cache de token
let accessToken: string | null = null;
let tokenExpiry: number = 0;

interface SyscomTokenResponse {
  token_type: string;
  access_token: string;
  expires_in: number;
}

interface SyscomProduct {
  producto_id: number;
  modelo: string;
  titulo: string;
  marca: string;
  sat_key?: string;
  img_portada: string;
  categoria: Array<{ id: number; nombre: string }>;
  marca_logo?: string;
  link: string;
  precio: {
    precio_lista: number;
    precio_especial: number;
    precio_descuento: number;
  } | null | number; // Puede ser null o número directo
  existencia: Record<string, number>;
  total_existencia: number;
  icono?: {
    inf_izq?: string;
    inf_der?: string;
    sup_izq?: string;
    sup_der?: string;
  };
  caracteristicas: string[];
  imagenes: Array<{ orden: number; url: string }>;
  descripcion: string;
  recursos?: Array<{ recurso: string; path: string }>;
}

interface SyscomSearchFilters {
  categoria?: number;
  marca?: number;
  precio_min?: number;
  precio_max?: number;
  pagina?: number;
  por_pagina?: number;
}

interface SyscomSearchResponse {
  productos: SyscomProduct[];
  cantidad: number; // Total de productos encontrados
  pagina: number; // Página actual
  paginas: number; // Total de páginas
  todo: number; // Total general
}

/**
 * Obtiene un token de acceso válido (con caché)
 */
async function getAccessToken(): Promise<string> {
  // Verificar si el token aún es válido (con margen de 1 hora)
  if (accessToken && Date.now() < tokenExpiry - 3600000) {
    return accessToken;
  }

  const clientId = process.env.SYSCOM_CLIENT_ID;
  const clientSecret = process.env.SYSCOM_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('SYSCOM_CLIENT_ID y SYSCOM_CLIENT_SECRET deben estar configurados en .env.local');
  }

  try {
    // Syscom usa application/x-www-form-urlencoded, no JSON
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    });

    const response = await axios.post<SyscomTokenResponse>(
      SYSCOM_OAUTH_URL,
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000);

    return accessToken;
  } catch (error: any) {
    console.error('Error obteniendo token de Syscom:', error.response?.data || error.message);
    throw new Error(`Error de autenticación con Syscom: ${error.response?.data?.error || error.message}`);
  }
}

/**
 * Crea una instancia de axios configurada con el token
 */
async function createAuthenticatedClient(): Promise<AxiosInstance> {
  const token = await getAccessToken();

  return axios.create({
    baseURL: SYSCOM_API_BASE,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Busca productos en Syscom
 */
export async function searchSyscomProducts(
  query: string,
  filters?: SyscomSearchFilters
): Promise<SyscomSearchResponse> {
  const client = await createAuthenticatedClient();

  const params = new URLSearchParams({
    busqueda: query, // Syscom usa 'busqueda' no 'q'
  });

  if (filters?.categoria) {
    params.append('categoria', filters.categoria.toString());
  }
  if (filters?.marca) {
    params.append('marca', filters.marca.toString());
  }
  if (filters?.precio_min) {
    params.append('precio_min', filters.precio_min.toString());
  }
  if (filters?.precio_max) {
    params.append('precio_max', filters.precio_max.toString());
  }
  if (filters?.pagina) {
    params.append('pagina', filters.pagina.toString());
  }
  if (filters?.por_pagina) {
    params.append('por_pagina', filters.por_pagina.toString());
  }

  try {
    const response = await client.get<SyscomSearchResponse>(`/productos?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error('Error buscando productos en Syscom:', error.response?.data || error.message);
    throw new Error(`Error buscando productos: ${error.response?.data?.error || error.message}`);
  }
}

/**
 * Obtiene información detallada de un producto específico
 */
export async function getSyscomProduct(productId: number): Promise<SyscomProduct> {
  const client = await createAuthenticatedClient();

  try {
    const response = await client.get<SyscomProduct>(`/productos/${productId}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error obteniendo producto ${productId} de Syscom:`, error.response?.data || error.message);
    throw new Error(`Error obteniendo producto: ${error.response?.data?.error || error.message}`);
  }
}

/**
 * Obtiene todas las categorías disponibles
 */
export async function getSyscomCategories(): Promise<any[]> {
  const client = await createAuthenticatedClient();

  try {
    const response = await client.get('/categorias');
    return response.data;
  } catch (error: any) {
    console.error('Error obteniendo categorías de Syscom:', error.response?.data || error.message);
    throw new Error(`Error obteniendo categorías: ${error.response?.data?.error || error.message}`);
  }
}

/**
 * Obtiene todas las marcas disponibles
 */
export async function getSyscomBrands(): Promise<any[]> {
  const client = await createAuthenticatedClient();

  try {
    const response = await client.get('/marcas');
    return response.data;
  } catch (error: any) {
    console.error('Error obteniendo marcas de Syscom:', error.response?.data || error.message);
    throw new Error(`Error obteniendo marcas: ${error.response?.data?.error || error.message}`);
  }
}

/**
 * Busca específicamente cámaras termográficas
 */
export async function searchThermalCameras(filters?: Omit<SyscomSearchFilters, 'q'>): Promise<SyscomSearchResponse> {
  // Intentar múltiples términos de búsqueda
  const searchTerms = ['termografica', 'cámara térmica', 'thermal camera', 'flir'];
  
  const allResults: SyscomProduct[] = [];
  const seenIds = new Set<number>();

  for (const term of searchTerms) {
    try {
      const results = await searchSyscomProducts(term, filters);
      
      for (const product of results.productos || []) {
        if (!seenIds.has(product.producto_id)) {
          allResults.push(product);
          seenIds.add(product.producto_id);
        }
      }
    } catch (error) {
      console.warn(`Error buscando con término "${term}":`, error);
    }
  }

  return {
    productos: allResults,
    cantidad: allResults.length,
    pagina: 1,
    paginas: 1,
    todo: allResults.length,
  };
}

export type { SyscomProduct, SyscomSearchFilters, SyscomSearchResponse };

