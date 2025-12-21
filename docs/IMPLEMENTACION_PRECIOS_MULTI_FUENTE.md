# Implementación de Sistema Multi-Fuente para Precios

## 🎯 Objetivo
Resolver el problema de productos sin precio implementando un sistema híbrido que combina múltiples fuentes de datos para obtener precios de manera confiable.

## 🏗️ Arquitectura de la Solución

### Fuentes de Precios (en orden de prioridad):

1. **API de Syscom** (Fuente Primaria)
   - Endpoint: `/api/v1/productos/{id}`
   - Ventaja: Datos estructurados y oficiales
   - Limitación: Puede requerir permisos específicos

2. **Web Scraping de Syscom.com.mx** (Fuente Secundaria)
   - URL: `https://www.syscom.mx/products/{id}`
   - Ventaja: Acceso público a precios
   - Limitación: Requiere mantenimiento si cambia estructura HTML

3. **Comparación con Cyberpuerta.mx** (Fuente Terciaria)
   - Búsqueda por SKU o título del producto
   - Ventaja: Precio de referencia del mercado
   - Limitación: Puede no encontrar todos los productos

## 📋 Componentes del Sistema

### 1. `PriceScraper` (`scripts/price_scraper.py`)

**Funcionalidades:**
- `get_price_from_api()`: Obtiene precio desde API de Syscom
- `get_price_from_syscom_web()`: Scraping de página web de Syscom
- `search_product_in_cyberpuerta()`: Búsqueda y comparación con Cyberpuerta
- `get_product_price()`: Orquesta las fuentes en orden de prioridad

**Características:**
- ✅ Fallback automático entre fuentes
- ✅ Rate limiting respetuoso (2 segundos entre requests)
- ✅ Manejo robusto de errores
- ✅ Soporte para precio_lista y precio_especial
- ✅ Cache inteligente (preparado para implementar)

### 2. Integración con Base de Datos

El script actualiza directamente la tabla `marketplace_products`:
- `price`: Precio actual (precio_especial si existe, sino precio_lista)
- `original_price`: Precio original cuando hay descuento

## 🚀 Uso

### Modo Dry-Run (sin cambios):
```bash
python3 scripts/price_scraper.py --limit 50
```

### Ejecutar actualización:
```bash
python3 scripts/price_scraper.py --execute --limit 100
```

### Parámetros:
- `--execute`: Ejecutar actualización (sin esto es dry-run)
- `--limit N`: Procesar máximo N productos (default: 100)

## 📊 Flujo de Ejecución

```
1. Obtener productos sin precio (price = 0 o null)
   ↓
2. Para cada producto:
   ├─ Intentar API de Syscom
   │  └─ Si éxito → Usar precio
   ├─ Si falla → Intentar scraping Syscom web
   │  └─ Si éxito → Usar precio
   └─ Si falla → Buscar en Cyberpuerta
      └─ Si éxito → Usar precio como referencia
   ↓
3. Actualizar base de datos
4. Generar reporte
```

## 🔧 Mejoras Futuras

### 1. Cache Inteligente
- Almacenar precios obtenidos con TTL (Time To Live)
- Evitar scraping repetitivo del mismo producto
- Actualizar solo productos con precio antiguo (>7 días)

### 2. Comparación de Precios
- Comparar precios de múltiples fuentes
- Calcular precio promedio
- Detectar discrepancias significativas

### 3. Actualización Automática
- Cron job para actualizar precios periódicamente
- Webhook para actualización en tiempo real
- Notificaciones cuando cambian precios significativamente

### 4. Machine Learning
- Predecir precios basado en historial
- Detectar anomalías en precios
- Optimizar estrategia de pricing

## ⚠️ Consideraciones Legales

### Web Scraping
- ✅ Respetar `robots.txt`
- ✅ Rate limiting (no sobrecargar servidores)
- ✅ Headers de navegador reales
- ⚠️ Revisar términos de servicio de cada sitio

### Recomendaciones:
1. Contactar a Syscom para acceso oficial a precios
2. Considerar API de terceros para comparación de precios
3. Implementar cache para reducir requests

## 📈 Métricas de Éxito

- **Tasa de éxito**: % de productos con precio obtenido
- **Fuente más efectiva**: Qué fuente obtiene más precios
- **Tiempo promedio**: Tiempo por producto procesado
- **Precisión**: Comparación con precios reales

## 🔐 Seguridad

- Variables de entorno para credenciales
- Rate limiting para evitar bloqueos
- Manejo de errores robusto
- Logging de actividades

## 📝 Ejemplo de Uso

```python
from scripts.price_scraper import get_product_price, PriceInfo

# Obtener precio de un producto
price_info = get_product_price(
    producto_id="218051",
    product_title="UPS de 1000 VA",
    sku="UPS-1000VA"
)

if price_info:
    print(f"Precio: ${price_info.precio_actual}")
    print(f"Fuente: {price_info.fuente}")
    print(f"Original: ${price_info.precio_lista}")
```

## 🎓 Referencias

- [Syscom Developer API](https://developers.syscom.mx/)
- [BeautifulSoup Documentation](https://www.crummy.com/software/BeautifulSoup/bs4/doc/)
- [Cyberpuerta.mx](https://www.cyberpuerta.mx/)

