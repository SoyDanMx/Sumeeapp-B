# Instrucciones: Política de Devoluciones

## ✅ Página Creada

La política de devoluciones ha sido creada en:
- **Ruta:** `src/app/politica-devoluciones/page.tsx`
- **URL:** `http://localhost:3002/politica-devoluciones` (desarrollo)
- **URL Producción:** `https://sumeeapp.com/politica-devoluciones`

## 🔧 Solución al Error 404

Si ves un error 404, **reinicia el servidor de desarrollo**:

```bash
# Detener el servidor actual (Ctrl+C)
# Luego reiniciar:
npm run dev
```

Next.js necesita reiniciar para reconocer nuevas rutas en el App Router.

## 📋 Verificación

Una vez reiniciado el servidor, verifica que la página funcione:

1. **Abrir en navegador:**
   ```
   http://localhost:3002/politica-devoluciones
   ```

2. **Verificar que muestre:**
   - Header con título "Política de Devoluciones y Reembolsos"
   - Todas las secciones de la política
   - Enlace de vuelta al marketplace

## 🔗 Enlaces Configurados

- ✅ Footer actualizado con enlace a `/politica-devoluciones`
- ✅ Metadata SEO configurada
- ✅ URL canónica: `https://sumeeapp.com/politica-devoluciones`

## 📝 Para Google Merchant Center

Cuando la página esté funcionando en producción:

1. Ir a Google Merchant Center
2. Configuración → Información de la cuenta
3. Agregar URL: `https://sumeeapp.com/politica-devoluciones`
4. Verificar que la URL sea accesible públicamente

## 🚀 Despliegue

Una vez verificado en desarrollo:

```bash
git add src/app/politica-devoluciones/
git commit -m "feat: Agregar página de política de devoluciones"
git push origin main
vercel --prod
```

La página estará disponible en producción después del despliegue.


