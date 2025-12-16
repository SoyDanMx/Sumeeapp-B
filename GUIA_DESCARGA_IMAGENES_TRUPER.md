# 📥 Guía para Descargar Imágenes de TRUPER

**Banco de Contenido Digital:** https://www.truper.com/BancoContenidoDigital/index.php?r=site/index

---

## 🎯 Estado Actual

- **Imágenes existentes:** ~970 imágenes ya descargadas
- **Productos en CSV:** 15,758 productos
- **Productos con imágenes:** ~970 productos
- **Productos sin imágenes:** ~14,788 productos

---

## 🚀 Opción 1: Descarga Automática (Recomendada - Más Rápida)

### Script Optimizado (URLs Directas)

El script `scripts/download_truper_images_optimized.py` intenta descargar directamente desde:
```
https://www.truper.com/media/import/imagenes/{codigo}.jpg
```

**Ejecutar:**
```bash
# Procesar todos los productos
python3 scripts/download_truper_images_optimized.py

# O procesar un lote específico (ej: primeros 5000)
python3 scripts/download_truper_images_optimized.py 5000
```

**Ventajas:**
- ✅ Muy rápido (descargas paralelas, ~20 simultáneas)
- ✅ No requiere navegador
- ✅ Procesa miles de productos en minutos
- ✅ Respeta rate limiting automáticamente

**Limitaciones:**
- Solo funciona si TRUPER tiene las imágenes en la URL directa
- Algunos productos pueden no tener imagen disponible en URL directa

**Resultado esperado:** Descarga ~60-70% de las imágenes disponibles

---

## 🌐 Opción 2: Descarga con Navegador (Banco de Contenido - Más Completa)

### Script con Playwright

El script `scripts/download_truper_from_bank.py` usa Playwright para interactuar con el banco oficial de imágenes.

**Ejecutar:**
```bash
# Procesar todos los productos faltantes
python3 scripts/download_truper_from_bank.py

# O procesar un lote específico
python3 scripts/download_truper_from_bank.py 0 1000
# (start_index, limit)
```

**Ventajas:**
- ✅ Accede al banco completo oficial de TRUPER
- ✅ Puede encontrar imágenes que no están en URL directa
- ✅ Respeta el sistema de búsqueda oficial
- ✅ Guarda progreso automáticamente

**Limitaciones:**
- ⏱️ Más lento (3 segundos entre búsquedas para respetar servidor)
- 💻 Requiere más recursos (navegador)
- ⏰ Tiempo estimado: ~13 horas para 15,000 productos

**Resultado esperado:** Encuentra imágenes adicionales que no están en URLs directas

---

## 📋 Proceso Recomendado

### Paso 1: Descarga Masiva (URLs Directas) - ⚡ RÁPIDO
```bash
# Intentar descargar todos desde URLs directas (paralelo, rápido)
python3 scripts/download_truper_images_optimized.py
```

Esto procesará todos los 15,758 productos en paralelo y descargará las que estén disponibles directamente.

**Tiempo estimado:** 10-20 minutos para todos los productos

### Paso 2: Verificar Resultados
```bash
# Ver estadísticas
cat scripts/truper_download_log.json | python3 -m json.tool

# Contar imágenes descargadas
ls public/images/marketplace/truper/*.jpg | wc -l
ls public/images/marketplace/truper/*.webp | wc -l
```

### Paso 3: Descarga Complementaria (Banco) - 🌐 COMPLETO
Si quedan productos sin imagen, usar el script del navegador para los faltantes:
```bash
# Procesar productos que no se encontraron (en lotes para no sobrecargar)
python3 scripts/download_truper_from_bank.py 0 1000  # Primeros 1000
# Luego continuar con más lotes según necesidad
```

**Nota:** Este proceso es más lento pero encuentra más imágenes. Puedes ejecutarlo en segundo plano o en lotes pequeños.

### Paso 4: Regenerar SQL de Importación
Una vez descargadas las imágenes nuevas, regenerar el SQL:
```bash
python3 scripts/import_truper_fast.py
```

Esto actualizará el archivo SQL con todas las imágenes disponibles.

### Paso 5: Ejecutar SQL en Supabase
Ejecutar el SQL generado en Supabase Dashboard → SQL Editor:
```sql
-- El archivo está en:
-- supabase/migrations/20250120_import_truper_full_catalog.sql
```

**Estado actual:** Ya hay 13,226 productos con imágenes en el SQL generado.

---

## 🔍 Verificación Manual en el Banco

Si necesitas buscar imágenes manualmente:

1. **Acceder al banco:**
   https://www.truper.com/BancoContenidoDigital/index.php?r=site/index

2. **Buscar por código o clave:**
   - Ingresa el código (ej: `100048`) o clave (ej: `PET-15X`)
   - Haz clic en buscar
   - Descarga la imagen si está disponible

3. **Descarga rápida por catálogo:**
   - Usa la opción "Descarga rápida de imágenes por catálogo"
   - Selecciona "Nacional 2025"
   - Descarga todas las imágenes de una página

---

## 📊 Estadísticas Actuales

Ejecuta para ver el progreso:
```bash
python3 scripts/download_truper_images_optimized.py 100
```

Esto mostrará:
- Total procesados
- Descargadas nuevas
- Ya existían
- No encontradas

---

## ⚠️ Notas Importantes

1. **Rate Limiting:** TRUPER puede limitar requests si se hacen demasiadas muy rápido
2. **Formato de Imágenes:** Las imágenes se guardan como `.jpg` por defecto
3. **Nombres de Archivo:** Se usa la `clave` del producto como nombre (ej: `PET-15X.jpg`)
4. **Progreso:** El log se guarda en `scripts/truper_download_log.json` para poder reanudar

---

## 🐛 Solución de Problemas

### Error: "Playwright no está instalado"
```bash
pip install playwright
playwright install chromium
```

### Error: "No se encontraron imágenes"
- Verificar que el código/clave sea correcto
- Intentar buscar manualmente en el banco
- Algunos productos pueden no tener imagen disponible

### Proceso muy lento
- Reducir `MAX_WORKERS` en el script
- Procesar en lotes más pequeños
- Usar el script optimizado en lugar del del navegador

---

## ✅ Checklist

- [x] Scripts de descarga creados
- [x] Script de importación actualizado
- [ ] Descargar imágenes faltantes (en progreso)
- [ ] Regenerar SQL con todas las imágenes
- [ ] Ejecutar SQL en Supabase
- [ ] Verificar productos en la aplicación

