# Integración con API de Syscom

## Estado Actual

**❌ No hay integración activa con la API de Syscom**

Actualmente, el marketplace solo tiene productos de:
- **Truper** (importados desde CSV)
- Productos manuales agregados por usuarios

## Problema Reportado

**Cámaras termográficas no aparecen en la API de Syscom**

## Solución Propuesta

### Opción 1: Verificar Catálogo Web de Syscom

1. **Buscar en el sitio web de Syscom:**
   - URL: https://www.syscom.mx/search?q=termografica
   - Verificar si tienen productos disponibles

2. **Categorías relevantes en Syscom:**
   - Seguridad y CCTV
   - Cámaras de seguridad
   - Equipos de monitoreo
   - Sistemas de seguridad

### Opción 2: Contactar Soporte de Syscom

**Información de contacto:**
- **Email:** soporte@syscom.mx
- **Teléfono:** +52 55 5000 1000
- **Sitio web:** https://www.syscom.mx

**Preguntas clave:**
1. ¿Tienen API disponible para integración?
2. ¿Cómo acceder a productos de cámaras termográficas?
3. ¿Qué categoría o filtros usar para buscar estos productos?
4. ¿Requieren credenciales especiales para acceder a ciertos productos?

### Opción 3: Crear Script de Importación Manual

Si Syscom tiene productos pero no están disponibles vía API, se puede:

1. **Web Scraping (con permiso):**
   - Obtener lista de productos desde el sitio web
   - Importar a la base de datos del marketplace

2. **Importación CSV:**
   - Solicitar a Syscom un export CSV de productos
   - Crear script de importación similar al de Truper

### Opción 4: Agregar Productos Manualmente

Para productos específicos y de alto valor:

1. Agregar productos manualmente desde el dashboard
2. Usar imágenes y descripciones de Syscom
3. Vincular con `external_code` o `sku` de Syscom

## Scripts Disponibles

### Buscar Cámaras Termográficas

```bash
python3 scripts/search_thermal_cameras.py
```

Este script:
- Busca productos existentes en la base de datos
- Verifica si hay productos de Syscom
- Proporciona recomendaciones

## Estructura de Datos

### Campos Relevantes en `marketplace_products`

```sql
- external_code TEXT  -- Código de producto en Syscom
- sku TEXT           -- SKU del producto
- title TEXT         -- Nombre del producto
- description TEXT   -- Descripción
- category_id TEXT   -- Categoría del marketplace
- images TEXT[]      -- Array de URLs de imágenes
```

## Categorías Sugeridas para Cámaras Termográficas

- `seguridad` - Si existe esta categoría
- `sistemas` - Categoría general de sistemas
- `varios` - Categoría por defecto

## Próximos Pasos Recomendados

1. ✅ **Ejecutar script de búsqueda:**
   ```bash
   python3 scripts/search_thermal_cameras.py
   ```

2. 🔍 **Verificar en Syscom web:**
   - Buscar manualmente en https://www.syscom.mx
   - Verificar disponibilidad y precios

3. 📧 **Contactar Syscom:**
   - Solicitar información sobre API
   - Preguntar sobre productos específicos

4. 🔧 **Si hay API disponible:**
   - Crear script de integración similar a Truper
   - Implementar búsqueda por categoría/filtros

5. 📝 **Si no hay API:**
   - Considerar importación manual
   - O web scraping con permiso

## Referencias

- [Análisis de Ingram Micro API](./ANALISIS_INGRAM_MICRO_API.md)
- [Importación Truper](./IMPORTACION_TRUPER_COMPLETA.md)
- [Syscom México](https://www.syscom.mx)

