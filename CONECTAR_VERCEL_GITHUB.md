# 🔗 Conectar Vercel con GitHub para Auto-Deploy

## 🔍 Problema Identificado

El proyecto `sumeeapp-b` está desplegado manualmente en Vercel, pero **no está conectado a GitHub** para auto-deploy. Por eso no ves las actualizaciones automáticas cuando haces push.

## ✅ Solución: Conectar GitHub a Vercel

### Opción 1: Desde el Dashboard de Vercel (Recomendado)

1. **Ve a Vercel Dashboard**: https://vercel.com/daniel-nunos-projects/sumeeapp-b/settings

2. **Ve a la sección "Git"** en el menú lateral

3. **Click en "Connect Git Repository"** o "Connect GitHub"

4. **Autoriza Vercel** para acceder a tu cuenta de GitHub si es necesario

5. **Selecciona el repositorio**: `SoyDanMx/Sumeeapp-B`

6. **Configura el proyecto**:
   - **Framework Preset**: Next.js (debería detectarse automáticamente)
   - **Root Directory**: `./` (raíz del proyecto)
   - **Build Command**: `npm run build` (automático)
   - **Output Directory**: `.next` (automático)
   - **Install Command**: `npm install` (automático)

7. **Click en "Deploy"**

### Opción 2: Desde GitHub (Alternativa)

1. **Ve a tu repositorio**: https://github.com/SoyDanMx/Sumeeapp-B

2. **Ve a Settings** > **Integrations** > **Vercel**

3. **Click en "Configure"** o "Add Vercel"

4. **Autoriza** y selecciona el proyecto `sumeeapp-b`

5. **Confirma la conexión**

## 🔄 Después de Conectar

Una vez conectado:

- ✅ Cada `git push` a `main` → Deploy automático en Production
- ✅ Cada `git push` a otras ramas → Deploy automático en Preview
- ✅ Pull Requests → Deploy de preview automático

## 🧪 Verificar la Conexión

1. **En Vercel Dashboard** > **Settings** > **Git**:
   - Deberías ver: `Connected to GitHub: SoyDanMx/Sumeeapp-B`
   - Branch: `main`
   - Production Branch: `main`

2. **Haz un pequeño cambio y push**:
   ```bash
   echo "# Test" >> README.md
   git add README.md
   git commit -m "test: Verificar auto-deploy"
   git push origin main
   ```

3. **Verifica en Vercel**: Deberías ver un nuevo deployment automático

## ⚠️ Si Ya Existe un Proyecto Manual

Si el proyecto ya existe (como parece ser el caso):

1. **Opción A: Reconectar el proyecto existente**
   - Ve a Settings > Git
   - Click en "Connect Git Repository"
   - Selecciona `SoyDanMx/Sumeeapp-B`
   - Vercel detectará que ya existe y lo conectará

2. **Opción B: Crear nuevo proyecto desde GitHub**
   - Ve a: https://vercel.com/new
   - Importa `SoyDanMx/Sumeeapp-B`
   - Esto creará un nuevo proyecto conectado a GitHub
   - Puedes eliminar el proyecto manual después

## 📋 Estado Actual

- ✅ Proyecto desplegado manualmente: `sumeeapp-b`
- ⏳ **Falta**: Conexión con GitHub para auto-deploy
- 🔧 **Solución**: Conectar repositorio en Settings > Git

## 🎯 Después de Conectar

Una vez conectado, verás en cada deployment:
- **Source**: `GitHub` (en lugar de `CLI`)
- **Branch**: `main`
- **Commit**: El mensaje del commit de GitHub
- **Autor**: El autor del commit de GitHub

