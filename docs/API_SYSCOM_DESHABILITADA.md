# API de Syscom Temporalmente Deshabilitada

## ⚠️ Estado Actual

La API de Syscom está **completamente deshabilitada** temporalmente hasta encontrar una solución para los problemas de precios.

## Archivos Modificados

### 1. Endpoints API
- ✅ `src/app/api/marketplace/price/route.ts` - Deshabilitado
- ✅ `src/app/api/marketplace/price/sync/route.ts` - Deshabilitado

### 2. Hooks React
- ✅ `src/hooks/useProductPrice.ts` - Deshabilitado (no hace peticiones)
- ✅ `src/hooks/useSyncProductPrice.ts` - Deshabilitado (no hace peticiones)

## Comportamiento Actual

### Endpoints
- **GET `/api/marketplace/price`**: Retorna `null` inmediatamente sin llamar a Syscom
- **POST `/api/marketplace/price/sync`**: Retorna `success: false` inmediatamente sin llamar a Syscom

### Hooks
- **`useProductPrice`**: No hace peticiones, solo usa el precio de la BD
- **`useSyncProductPrice`**: Retorna error inmediatamente sin hacer peticiones

## Impacto

- ✅ No se harán peticiones a la API de Syscom
- ✅ No se actualizarán precios $0 desde Syscom
- ✅ El frontend mostrará "Consultar precio" para productos sin precio
- ✅ Los productos con precio > 0 en la BD seguirán mostrando su precio

## Para Reactivar

Cuando se encuentre la solución a los precios:

1. Descomentar el código marcado con `/* CÓDIGO DESHABILITADO TEMPORALMENTE */`
2. Eliminar el `return` temprano que deshabilita la API
3. Cerrar el comentario `*/ // FIN DE CÓDIGO DESHABILITADO`

## Problemas que se Intentan Resolver

1. **Precios $0**: Productos mostrando precio cero debido a `precio_especial` faltante o 0
2. **Conversión de Moneda**: Precios de Syscom (USD) siendo mostrados como MXN sin conversión
3. **Precios Incorrectos**: Ejemplo: $40 USD mostrándose como $40 MXN en lugar de ~$800 MXN

