# Análisis Completo de la API de Syscom

**URL:** https://developers.syscom.mx/  
**Fecha de Análisis:** 2025-01-21

## ✅ Confirmación: Syscom SÍ tiene API de Catálogo

**¡Excelente noticia!** Syscom tiene una API completa de catálogo de productos disponible en [https://developers.syscom.mx/](https://developers.syscom.mx/).

## Información General de la API

### Base URL
```
https://developers.syscom.mx/api/v1/
```

**Nota importante:** La URL base termina con `/` (barra diagonal final).

### Características Generales

- **Tipo:** REST API
- **Autenticación:** OAuth 2.0
- **Formato de Respuesta:** JSON
- **Límite de Rate:** 60 peticiones por minuto por cliente
- **Vigencia de Token:** 365 días por defecto

## Autenticación

### 1. Obtener Credenciales

1. **Login en Syscom:**
   - Acceder a la cuenta regular de Syscom
   - URL de login: https://developers.syscom.mx/ (botón "Obtener Código")

2. **Crear Aplicación:**
   - Una vez logueado, crear una nueva aplicación
   - Ingresar nombre de la aplicación
   - Obtener:
     - **Client ID** (Identificador único del cliente)
     - **Client Secret** (Contraseña de acceso)

### 2. Obtener Token de Acceso

**Endpoint:**
```
POST https://developers.syscom.mx/oauth/token
```

**Request (application/x-www-form-urlencoded):**
```bash
POST https://developers.syscom.mx/oauth/token
Content-Type: application/x-www-form-urlencoded

client_id=TU_CLIENT_ID&client_secret=TU_CLIENT_SECRET&grant_type=client_credentials
```

**Ejemplo con curl:**
```bash
curl --request POST --url https://developers.syscom.mx/oauth/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data 'client_id=ID_CLIENTE&client_secret=SECRETO_CLIENTE&grant_type=client_credentials'
```

**Response:**
```json
{
  "token_type": "Bearer",
  "access_token": "VALOR_DEL_TOKEN",
  "expires_in": 31536000
}
```

### 3. Usar el Token

Agregar el token en todas las peticiones en el header:
```
Authorization: Bearer VALOR_DEL_TOKEN
```

## Endpoints Disponibles

### 1. Productos

#### Búsqueda de Productos
```
GET /api/v1/producto
```

**Parámetros de consulta:**
- `q` - Término de búsqueda (texto libre)
- `categoria` - ID de categoría
- `marca` - ID de marca
- `precio_min` - Precio mínimo
- `precio_max` - Precio máximo
- `pagina` - Número de página
- `por_pagina` - Productos por página

**Ejemplo de búsqueda de cámaras termográficas:**
```
GET /api/v1/producto?q=termografica
GET /api/v1/producto?q=camara+termica
GET /api/v1/producto?q=thermal+camera
```

#### Información de Producto Específico
```
GET /api/v1/producto/{id}
```

**Response incluye:**
- `producto_id` - ID del producto
- `modelo` - Modelo del producto
- `titulo` - Título/nombre
- `marca` - Marca del producto
- `precio` - Objeto con precios (lista, especial, descuento)
- `total_existencia` - Stock disponible
- `categoria` - Array de categorías
- `img_portada` - URL de imagen principal
- `imagenes` - Array de URLs de imágenes
- `descripcion` - Descripción completa
- `caracteristicas` - Array de características
- `link` - URL del producto en Syscom

#### Productos Relacionados
```
GET /api/v1/producto/{id}/relacionados
```

#### Accesorios de Producto
```
GET /api/v1/producto/{id}/accesorios
```

### 2. Categorías

#### Obtener Todas las Categorías
```
GET /api/v1/categoria
```

#### Buscar Categoría por ID
```
GET /api/v1/categoria/{id}
```

**Parámetros opcionales:**
- `expand=productos` - Incluir productos de la categoría

### 3. Marcas

#### Obtener Todas las Marcas
```
GET /api/v1/marca
```

#### Obtener Marca Específica
```
GET /api/v1/marca/{id}
```

#### Productos de una Marca
```
GET /api/v1/marca/{id}/producto
```

### 4. Listas Personalizadas

#### Obtener Todas las Listas
```
GET /api/v1/lista
```

#### Buscar Lista por ID
```
GET /api/v1/lista/{id}
```

#### Crear Lista
```
POST /api/v1/lista
```

#### Actualizar Lista
```
PUT /api/v1/lista/{id}
```

#### Eliminar Lista
```
DELETE /api/v1/lista/{id}
```

### 5. Carrito y Ordenes

- Generar una orden
- Obtener lista de direcciones
- Añadir nueva dirección
- Obtener países, estados, colonias
- Obtener métodos de pago
- Obtener fleteras
- Obtener sucursales
- Obtener CFDI

### 6. Facturación

- Búsqueda de factura
- Detalle de factura

## Estructura de Respuesta de Producto

```json
{
  "producto_id": 123456,
  "modelo": "DS-2TP31B-3AUF",
  "titulo": "Cámara Térmica Industrial HIKVISION",
  "marca": "HIKVISION",
  "sat_key": "ABC123",
  "img_portada": "https://syscom.mx/images/producto.jpg",
  "categoria": [
    {
      "id": 30,
      "nombre": "Seguridad y CCTV"
    }
  ],
  "marca_logo": "https://syscom.mx/images/hikvision-logo.png",
  "link": "https://www.syscom.mx/products/123456",
  "precio": {
    "precio_lista": 15000.00,
    "precio_especial": 13500.00,
    "precio_descuento": 12000.00
  },
  "existencia": {
    "almacen_1": 5,
    "almacen_2": 3
  },
  "total_existencia": 8,
  "icono": {
    "inf_izq": "nuevo",
    "inf_der": "promocion",
    "sup_izq": null,
    "sup_der": null
  },
  "caracteristicas": [
    "Resolución térmica 160x120",
    "Detección de temperatura -20°C a 150°C",
    "Alcance hasta 30 metros"
  ],
  "imagenes": [
    {
      "orden": 1,
      "url": "https://syscom.mx/images/producto-1.jpg"
    },
    {
      "orden": 2,
      "url": "https://syscom.mx/images/producto-2.jpg"
    }
  ],
  "descripcion": "Cámara térmica industrial para detección de temperatura...",
  "recursos": [
    {
      "recurso": "manual",
      "path": "https://syscom.mx/manuals/producto.pdf"
    }
  ]
}
```

## Cómo Buscar Cámaras Termográficas

### Opción 1: Búsqueda por Texto

```bash
GET /api/v1/producto?q=termografica
GET /api/v1/producto?q=camara+termica
GET /api/v1/producto?q=thermal+camera
GET /api/v1/producto?q=flir
GET /api/v1/producto?q=infrared+camera
```

### Opción 2: Búsqueda por Categoría

1. Primero obtener categorías relacionadas con seguridad/CCTV:
```bash
GET /api/v1/categoria
```

2. Filtrar por categoría específica (ej: ID 30 para "Seguridad y CCTV"):
```bash
GET /api/v1/producto?categoria=30&q=termografica
```

### Opción 3: Búsqueda por Marca

Si conoces marcas específicas (FLIR, HIKVISION, etc.):
```bash
GET /api/v1/marca
# Encontrar ID de marca FLIR o HIKVISION
GET /api/v1/marca/{id}/producto?q=termografica
```

## Implementación Recomendada

### Paso 1: Configurar Credenciales

Crear archivo `.env.local` con:
```env
SYSCOM_CLIENT_ID=tu_client_id
SYSCOM_CLIENT_SECRET=tu_client_secret
SYSCOM_API_BASE_URL=https://developers.syscom.mx/api/v1
```

### Paso 2: Crear Cliente de API

Crear `src/lib/syscom/api.ts`:
```typescript
import axios from 'axios';

const SYSCOM_API_BASE = 'https://developers.syscom.mx/api/v1';
const SYSCOM_OAUTH_URL = 'https://developers.syscom.mx/oauth/token';

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
  // Verificar si el token aún es válido
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  // Obtener nuevo token
  const response = await axios.post(SYSCOM_OAUTH_URL, {
    grant_type: 'client_credentials',
    client_id: process.env.SYSCOM_CLIENT_ID,
    client_secret: process.env.SYSCOM_CLIENT_SECRET,
  });

  accessToken = response.data.access_token;
  tokenExpiry = Date.now() + (response.data.expires_in * 1000);

  return accessToken;
}

export async function searchSyscomProducts(query: string, filters?: {
  categoria?: number;
  marca?: number;
  precio_min?: number;
  precio_max?: number;
  pagina?: number;
  por_pagina?: number;
}) {
  const token = await getAccessToken();
  
  const params = new URLSearchParams({
    q: query,
    ...(filters?.categoria && { categoria: filters.categoria.toString() }),
    ...(filters?.marca && { marca: filters.marca.toString() }),
    ...(filters?.precio_min && { precio_min: filters.preci_min.toString() }),
    ...(filters?.precio_max && { precio_max: filters.precio_max.toString() }),
    ...(filters?.pagina && { pagina: filters.pagina.toString() }),
    ...(filters?.por_pagina && { por_pagina: filters.por_pagina.toString() }),
  });

  const response = await axios.get(`${SYSCOM_API_BASE}/producto?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return response.data;
}

export async function getSyscomProduct(productId: number) {
  const token = await getAccessToken();
  
  const response = await axios.get(`${SYSCOM_API_BASE}/producto/${productId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return response.data;
}

export async function getSyscomCategories() {
  const token = await getAccessToken();
  
  const response = await axios.get(`${SYSCOM_API_BASE}/categoria`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return response.data;
}
```

### Paso 3: Crear Script de Importación

Crear `scripts/import_syscom_products.py` para importar productos específicos (como cámaras termográficas) a la base de datos.

## Próximos Pasos

1. ✅ **Obtener Credenciales:**
   - Registrarse en https://developers.syscom.mx/
   - Crear aplicación y obtener Client ID y Secret

2. 🔧 **Implementar Cliente de API:**
   - Crear funciones de búsqueda y obtención de productos
   - Implementar caché de tokens

3. 📦 **Crear Script de Importación:**
   - Buscar cámaras termográficas usando la API
   - Importar productos a la base de datos del marketplace
   - Mapear categorías de Syscom a categorías del marketplace

4. 🔄 **Sincronización Periódica:**
   - Actualizar precios y disponibilidad
   - Sincronizar nuevos productos

## Referencias

- [Portal de Desarrolladores Syscom](https://developers.syscom.mx/)
- [Documentación de la API](https://developers.syscom.mx/docs)
- [Guía de Inicio](https://developers.syscom.mx/guide)
- [Sitio Web Syscom](https://www.syscom.mx)

## Notas Importantes

- **Rate Limit:** 60 peticiones por minuto - implementar throttling
- **Token Expiry:** 365 días por defecto - manejar renovación automática
- **Categorías:** Verificar IDs de categorías relevantes (Seguridad, CCTV, etc.)
- **Precios:** Los precios pueden variar según el tipo de cuenta/cliente
- **Stock:** Verificar `total_existencia` antes de mostrar productos

