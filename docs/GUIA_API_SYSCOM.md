# Guía Completa de la API de Syscom

**URL:** https://developers.syscom.mx/guide  
**Documentación:** https://developers.syscom.mx/docs  
**Fecha:** 2025-01-21

## Resumen Ejecutivo

Syscom ofrece una **API REST completa** para acceder a su catálogo de productos, permitiendo:
- ✅ Búsqueda y filtrado de productos
- ✅ Consulta de información detallada de productos
- ✅ Obtención de categorías y marcas
- ✅ Creación y gestión de listas personalizadas
- ✅ Información actualizada de precios y promociones en tiempo real

## Características Generales

### URI Base
```
https://developers.syscom.mx/api/v1/
```

**⚠️ Importante:** La URL base termina con `/` (barra diagonal final).

### Limitaciones
- **Rate Limit:** 60 peticiones por minuto por cliente
- **Formato de Respuesta:** JSON
- **Autenticación:** OAuth 2.0 (Bearer Token)
- **Vigencia de Token:** 365 días por defecto

## Autenticación

### Paso 1: Obtener Credenciales

1. **Acceder a la plataforma:**
   - URL: https://developers.syscom.mx/
   - Hacer login con tu cuenta regular de Syscom

2. **Crear una aplicación:**
   - Una vez logueado, crear una nueva aplicación
   - Ingresar el nombre de la aplicación
   - Obtener:
     - **ID Client** (Identificador único del cliente)
     - **Secret Client** (Contraseña de acceso)

**⚠️ Importante:** Las credenciales son privadas y NO deben ser expuestas en el código fuente.

### Paso 2: Obtener Token de Acceso

**Endpoint:**
```
POST https://developers.syscom.mx/oauth/token
```

**Headers:**
```
Content-Type: application/x-www-form-urlencoded
```

**Body (form-urlencoded):**
```
client_id=ID_CLIENTE&client_secret=SECRETO_CLIENTE&grant_type=client_credentials
```

**Ejemplo con curl:**
```bash
curl --request POST --url https://developers.syscom.mx/oauth/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data 'client_id=TU_ID&client_secret=TU_SECRET&grant_type=client_credentials'
```

**Respuesta:**
```json
{
    "token_type": "Bearer",
    "expires_in": 31536000,
    "access_token": "VALOR_DEL_TOKEN"
}
```

**Notas:**
- `expires_in` está en segundos (31536000 = 365 días)
- El token es válido por 365 días por defecto
- Guardar el token y su fecha de expiración para reutilización

### Paso 3: Usar el Token

Agregar el token en **todas las peticiones** en el header `Authorization`:

```
Authorization: Bearer VALOR_DEL_TOKEN
```

**⚠️ Importante:** La palabra `Bearer` antes del token es **necesaria**.

**Ejemplo de petición:**
```bash
curl "https://developers.syscom.mx/api/v1/categoria" \
  -H "Authorization: Bearer VALOR_DEL_TOKEN"
```

## Endpoints Principales

### 1. Categorías

#### Obtener Todas las Categorías
```
GET /api/v1/categoria
```

**Ejemplo de respuesta:**
```json
[
    {
        "id": "22",
        "nombre": "Videovigilancia",
        "nivel": 1
    },
    {
        "id": "25",
        "nombre": "Radiocomunicación",
        "nivel": 1
    },
    {
        "id": "30",
        "nombre": "Energía",
        "nivel": 1
    }
]
```

**Categorías relevantes para cámaras termográficas:**
- `22` - Videovigilancia
- `30` - Energía (puede incluir equipos de medición térmica)
- `37` - Control de Acceso
- `38` - Detección de Fuego

#### Buscar Categoría por ID
```
GET /api/v1/categoria/{id}
```

**Parámetros opcionales:**
- `expand=productos` - Incluir productos de la categoría

### 2. Productos

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
- `pagina` - Número de página (paginación)
- `por_pagina` - Productos por página

**Ejemplos de búsqueda de cámaras termográficas:**
```bash
# Búsqueda simple
GET /api/v1/producto?q=termografica

# Búsqueda con categoría
GET /api/v1/producto?q=termografica&categoria=22

# Búsqueda con filtros de precio
GET /api/v1/producto?q=thermal+camera&precio_min=10000&precio_max=50000
```

#### Información de Producto Específico
```
GET /api/v1/producto/{id}
```

**Response incluye:**
- `producto_id` - ID único del producto
- `modelo` - Modelo del producto
- `titulo` - Título/nombre completo
- `marca` - Marca del producto
- `precio` - Objeto con precios (lista, especial, descuento)
- `total_existencia` - Stock total disponible
- `categoria` - Array de categorías
- `img_portada` - URL de imagen principal
- `imagenes` - Array de URLs de imágenes adicionales
- `descripcion` - Descripción completa del producto
- `caracteristicas` - Array de características técnicas
- `link` - URL del producto en Syscom web
- `sat_key` - Clave SAT (para facturación)

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

**Marcas relevantes para cámaras termográficas:**
- FLIR
- HIKVISION
- Hikvision (variaciones)
- Otras marcas de seguridad

### 4. Listas Personalizadas

- `GET /api/v1/lista` - Obtener todas las listas
- `GET /api/v1/lista/{id}` - Obtener lista específica
- `POST /api/v1/lista` - Crear nueva lista
- `PUT /api/v1/lista/{id}` - Actualizar lista
- `DELETE /api/v1/lista/{id}` - Eliminar lista

## Estructura de Respuesta de Producto

```json
{
  "producto_id": 123456,
  "modelo": "DS-2TP31B-3AUF",
  "titulo": "Cámara Térmica Industrial HIKVISION DS-2TP31B-3AUF",
  "marca": "HIKVISION",
  "sat_key": "ABC123",
  "img_portada": "https://syscom.mx/images/producto.jpg",
  "categoria": [
    {
      "id": 22,
      "nombre": "Videovigilancia"
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

## Estrategia de Búsqueda de Cámaras Termográficas

### Opción 1: Búsqueda por Texto Libre

```bash
GET /api/v1/producto?q=termografica
GET /api/v1/producto?q=camara+termica
GET /api/v1/producto?q=thermal+camera
GET /api/v1/producto?q=flir
GET /api/v1/producto?q=infrared+camera
```

### Opción 2: Búsqueda por Categoría + Texto

1. Primero identificar categorías relevantes:
```bash
GET /api/v1/categoria
```

2. Filtrar por categoría específica:
```bash
# Categoría 22 = Videovigilancia
GET /api/v1/producto?categoria=22&q=termografica

# Categoría 30 = Energía (puede incluir equipos de medición)
GET /api/v1/producto?categoria=30&q=termografica
```

### Opción 3: Búsqueda por Marca

1. Obtener ID de marca FLIR o HIKVISION:
```bash
GET /api/v1/marca
```

2. Buscar productos de esa marca:
```bash
GET /api/v1/marca/{id}/producto?q=termografica
```

## Implementación Recomendada

### Configuración de Variables de Entorno

Agregar a `.env.local`:
```env
SYSCOM_CLIENT_ID=tu_client_id_aqui
SYSCOM_CLIENT_SECRET=tu_client_secret_aqui
```

### Manejo de Rate Limit

**Importante:** 60 peticiones por minuto = 1 petición por segundo máximo.

Implementar throttling:
```typescript
// Ejemplo de throttling simple
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 segundo

async function throttledRequest(url: string) {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => 
      setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
    );
  }
  
  lastRequestTime = Date.now();
  return axios.get(url);
}
```

## Ejemplo de Uso Completo

### 1. Obtener Token

```typescript
const tokenResponse = await axios.post(
  'https://developers.syscom.mx/oauth/token',
  'client_id=ID&client_secret=SECRET&grant_type=client_credentials',
  {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }
);

const token = tokenResponse.data.access_token;
```

### 2. Buscar Cámaras Termográficas

```typescript
const searchResponse = await axios.get(
  'https://developers.syscom.mx/api/v1/producto',
  {
    params: { q: 'termografica' },
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
);

const productos = searchResponse.data.productos;
```

### 3. Obtener Detalle de Producto

```typescript
const productResponse = await axios.get(
  `https://developers.syscom.mx/api/v1/producto/${producto_id}`,
  {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
);

const producto = productResponse.data;
```

## Próximos Pasos

1. ✅ **Obtener Credenciales:**
   - Registrarse en https://developers.syscom.mx/
   - Crear aplicación y obtener Client ID y Secret

2. 🔧 **Configurar Variables de Entorno:**
   - Agregar `SYSCOM_CLIENT_ID` y `SYSCOM_CLIENT_SECRET` a `.env.local`

3. 📦 **Probar Búsqueda:**
   - Usar el script `scripts/import_syscom_thermal_cameras.py` en modo dry-run
   - Verificar que encuentra productos

4. 🔄 **Importar Productos:**
   - Ejecutar script con `--execute` para importar a la base de datos
   - Los productos se importarán a la categoría "sistemas"

## Referencias

- [Portal de Desarrolladores](https://developers.syscom.mx/)
- [Guía de Inicio](https://developers.syscom.mx/guide)
- [Documentación Completa](https://developers.syscom.mx/docs)
- [Sitio Web Syscom](https://www.syscom.mx)

## Notas Importantes

- ⚠️ **Content-Type:** El endpoint de token usa `application/x-www-form-urlencoded`, NO JSON
- ⚠️ **Rate Limit:** 60 peticiones/minuto - implementar throttling
- ⚠️ **Token Expiry:** 365 días - manejar renovación automática
- ⚠️ **Bearer Token:** La palabra "Bearer" es obligatoria en el header Authorization
- ⚠️ **URL Base:** Termina con `/` - incluirla en todas las rutas

