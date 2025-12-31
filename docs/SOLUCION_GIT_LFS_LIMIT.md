# Solución: Límite de Git LFS Excedido

## Problema
El repositorio excedió su límite de Git LFS (12,801 archivos de imágenes de Truper).

## Solución Aplicada

### 1. Remover imágenes de Truper de Git LFS
- Las imágenes están en `.vercelignore` y ahora también en `.gitignore`
- Actualizado `.gitattributes` para no usar LFS para estas imágenes
- Las imágenes se mantienen localmente pero no se suben al repositorio

### 2. Próximos Pasos (Requeridos)

Para remover completamente las imágenes del historial de Git LFS:

```bash
# 1. Remover archivos del índice de Git
git rm --cached -r public/images/marketplace/truper/

# 2. Hacer commit de la remoción
git commit -m "[fix] Remover imágenes de Truper de Git LFS - excedieron límite"

# 3. Remover del historial de LFS (requiere reescribir historial)
git lfs migrate export --include="public/images/marketplace/truper/**" --everything

# 4. Force push (CUIDADO: esto reescribe el historial)
git push origin main --force
```

### 3. Alternativa Sin Reescribir Historial

Si no quieres reescribir el historial completo:

1. Las imágenes ya están en `.gitignore` y `.vercelignore`
2. Los nuevos builds no descargarán las imágenes (están ignoradas)
3. Las imágenes seguirán en el historial pero no se usarán

### 4. Migrar Imágenes a Supabase Storage

**Recomendación:** Migrar las imágenes de Truper a Supabase Storage:

```bash
# Las imágenes están en: public/images/marketplace/truper/
# Subirlas a Supabase Storage usando el dashboard o API
```

## Estado Actual

- ✅ `.gitignore` actualizado - imágenes ignoradas
- ✅ `.gitattributes` actualizado - no usa LFS para Truper
- ✅ `.vercelignore` ya tenía las imágenes ignoradas
- ⚠️ Las imágenes aún están en el historial de Git LFS

## Nota Importante

Los builds de Netlify/Vercel fallarán si intentan descargar archivos LFS del historial existente. 

**Solución temporal:** Los builds deberían funcionar ahora porque:
- Las imágenes están en `.vercelignore` (no se incluyen en el build)
- Las imágenes están en `.gitignore` (no se trackean)
- `.gitattributes` ya no las marca para LFS

Si el build sigue fallando, será necesario reescribir el historial de Git LFS.

